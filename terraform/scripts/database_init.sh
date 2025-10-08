#!/bin/bash
set -e

# Variables from Terraform
DB_VOLUME_DEVICE="${db_volume_device}"
S3_BUCKET_NAME="${s3_bucket_name}"

# Update system
apt-get update
apt-get upgrade -y

# Install required packages
apt-get install -y \
    postgresql-14 \
    postgresql-contrib-14 \
    postgresql-client-14 \
    awscli \
    amazon-cloudwatch-agent \
    cron

# Wait for EBS volume to be attached
while [ ! -e "$DB_VOLUME_DEVICE" ]; do
    echo "Waiting for EBS volume to be attached..."
    sleep 5
done

# Check if volume is already formatted
if ! blkid "$DB_VOLUME_DEVICE" >/dev/null 2>&1; then
    echo "Formatting EBS volume..."
    mkfs.ext4 "$DB_VOLUME_DEVICE"
fi

# Create mount point and mount volume
mkdir -p /var/lib/postgresql-data
mount "$DB_VOLUME_DEVICE" /var/lib/postgresql-data

# Add to fstab for persistent mounting
VOLUME_UUID=$(blkid -s UUID -o value "$DB_VOLUME_DEVICE")
echo "UUID=$VOLUME_UUID /var/lib/postgresql-data ext4 defaults,nofail 0 2" >> /etc/fstab

# Set ownership and permissions
chown postgres:postgres /var/lib/postgresql-data
chmod 700 /var/lib/postgresql-data

# Stop PostgreSQL service
systemctl stop postgresql

# Move PostgreSQL data directory if it exists and is not empty
if [ -d "/var/lib/postgresql/14/main" ] && [ "$(ls -A /var/lib/postgresql/14/main)" ]; then
    if [ ! -d "/var/lib/postgresql-data/14" ]; then
        mkdir -p /var/lib/postgresql-data/14
        chown postgres:postgres /var/lib/postgresql-data/14
        mv /var/lib/postgresql/14/main /var/lib/postgresql-data/14/
    fi
else
    # Initialize new database cluster
    mkdir -p /var/lib/postgresql-data/14/main
    chown postgres:postgres /var/lib/postgresql-data/14/main
    sudo -u postgres /usr/lib/postgresql/14/bin/initdb -D /var/lib/postgresql-data/14/main
fi

# Update PostgreSQL configuration
sed -i "s|#data_directory = 'ConfigDir'|data_directory = '/var/lib/postgresql-data/14/main'|" /etc/postgresql/14/main/postgresql.conf
sed -i "s|#listen_addresses = 'localhost'|listen_addresses = '*'|" /etc/postgresql/14/main/postgresql.conf
sed -i "s|#port = 5432|port = 5432|" /etc/postgresql/14/main/postgresql.conf

# Configure memory settings based on instance type
TOTAL_MEM=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
SHARED_BUFFERS=$((TOTAL_MEM / 4))
EFFECTIVE_CACHE_SIZE=$((TOTAL_MEM * 3 / 4))

cat >> /etc/postgresql/14/main/postgresql.conf << EOF

# Performance tuning
shared_buffers = ${SHARED_BUFFERS}MB
effective_cache_size = ${EFFECTIVE_CACHE_SIZE}MB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB

# Logging
log_statement = 'mod'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
logging_collector = on
log_min_duration_statement = 1000

# Connection settings
max_connections = 200
EOF

# Configure authentication
cat > /etc/postgresql/14/main/pg_hba.conf << 'EOF'
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
host    all             all             10.0.0.0/8              md5
EOF

# Start PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# Create application database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE laravel_production;
CREATE USER laravel_user WITH ENCRYPTED PASSWORD 'laravel_secure_password_123!';
GRANT ALL PRIVILEGES ON DATABASE laravel_production TO laravel_user;
ALTER USER laravel_user CREATEDB;
\q
EOF

# Configure CloudWatch Agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "agent": {
        "metrics_collection_interval": 60,
        "run_as_user": "cwagent"
    },
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/postgresql/postgresql-*.log",
                        "log_group_name": "/aws/ec2/laravel-app/database",
                        "log_stream_name": "{instance_id}/postgresql",
                        "timezone": "UTC"
                    }
                ]
            }
        }
    },
    "metrics": {
        "namespace": "CWAgent",
        "metrics_collected": {
            "cpu": {
                "measurement": [
                    "cpu_usage_idle",
                    "cpu_usage_iowait",
                    "cpu_usage_user",
                    "cpu_usage_system"
                ],
                "metrics_collection_interval": 60
            },
            "disk": {
                "measurement": [
                    "used_percent"
                ],
                "metrics_collection_interval": 60,
                "resources": [
                    "*"
                ]
            },
            "diskio": {
                "measurement": [
                    "io_time",
                    "read_bytes",
                    "write_bytes"
                ],
                "metrics_collection_interval": 60,
                "resources": [
                    "*"
                ]
            },
            "mem": {
                "measurement": [
                    "mem_used_percent"
                ],
                "metrics_collection_interval": 60
            }
        }
    }
}
EOF

# Start CloudWatch Agent
systemctl enable amazon-cloudwatch-agent
systemctl start amazon-cloudwatch-agent

# Create backup scripts
cat > /opt/backup-database.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/postgresql"
RETENTION_DAYS=7
S3_BUCKET_NAME="${S3_BUCKET_NAME}"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create logical backup
sudo -u postgres pg_dumpall > "$BACKUP_DIR/full_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/full_backup_$DATE.sql"

# Upload to S3
aws s3 cp "$BACKUP_DIR/full_backup_$DATE.sql.gz" "s3://$S3_BUCKET_NAME/backups/database/"

# Clean up old local backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Database backup completed: full_backup_$DATE.sql.gz"
EOF

chmod +x /opt/backup-database.sh

# Create restore script
cat > /opt/restore-database.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_FILE="$1"
S3_BUCKET_NAME="${S3_BUCKET_NAME}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file_name>"
    echo "Available backups:"
    aws s3 ls "s3://$S3_BUCKET_NAME/backups/database/" | grep "\.sql\.gz$"
    exit 1
fi

# Download backup from S3
aws s3 cp "s3://$S3_BUCKET_NAME/backups/database/$BACKUP_FILE" "/tmp/$BACKUP_FILE"

# Stop connections to database
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'laravel_production' AND pid <> pg_backend_pid();"

# Drop and recreate database
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS laravel_production;
CREATE DATABASE laravel_production;
\q
EOF

# Restore backup
gunzip -c "/tmp/$BACKUP_FILE" | sudo -u postgres psql laravel_production

# Clean up
rm "/tmp/$BACKUP_FILE"

echo "Database restored from: $BACKUP_FILE"
EOF

chmod +x /opt/restore-database.sh

# Set up cron job for daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-database.sh") | crontab -

echo "PostgreSQL database server initialization completed!"
echo "Database: laravel_production"
echo "User: laravel_user"
echo "Password: laravel_secure_password_123!"
echo "Backup script: /opt/backup-database.sh"
echo "Restore script: /opt/restore-database.sh"