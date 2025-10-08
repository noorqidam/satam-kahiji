#!/bin/bash
set -e

# Variables from Terraform
S3_BUCKET_NAME="${s3_bucket_name}"
DATABASE_HOST="${database_host}"

# Update system
apt-get update
apt-get upgrade -y

# Install required packages
apt-get install -y \
    nginx \
    php8.2-fpm \
    php8.2-cli \
    php8.2-common \
    php8.2-mysql \
    php8.2-zip \
    php8.2-gd \
    php8.2-mbstring \
    php8.2-curl \
    php8.2-xml \
    php8.2-bcmath \
    php8.2-pgsql \
    php8.2-redis \
    redis-server \
    supervisor \
    unzip \
    curl \
    git \
    awscli \
    amazon-cloudwatch-agent

# Install Composer
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"

# Configure PHP-FPM
sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' /etc/php/8.2/fpm/php.ini
sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 64M/' /etc/php/8.2/fpm/php.ini
sed -i 's/post_max_size = 8M/post_max_size = 64M/' /etc/php/8.2/fpm/php.ini
sed -i 's/max_execution_time = 30/max_execution_time = 300/' /etc/php/8.2/fpm/php.ini
sed -i 's/memory_limit = 128M/memory_limit = 512M/' /etc/php/8.2/fpm/php.ini

# Configure Nginx
cat > /etc/nginx/sites-available/laravel << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/laravel/public;
    index index.php index.html index.htm;

    access_log /var/log/nginx/laravel-access.log;
    error_log /var/log/nginx/laravel-error.log;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable Laravel site
ln -sf /etc/nginx/sites-available/laravel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Create Laravel directory
mkdir -p /var/www/laravel
chown -R www-data:www-data /var/www/laravel

# Create a basic Laravel application structure for health checks
mkdir -p /var/www/laravel/public
cat > /var/www/laravel/public/index.php << 'EOF'
<?php
// Basic health check endpoint
if ($_SERVER['REQUEST_URI'] === '/health') {
    http_response_code(200);
    echo "healthy\n";
    exit;
}

// Placeholder for Laravel application
echo "Laravel application placeholder - ready for deployment";
EOF

# Set proper permissions
chown -R www-data:www-data /var/www/laravel
chmod -R 755 /var/www/laravel

# Configure Redis
systemctl enable redis-server
systemctl start redis-server

# Configure Supervisor for Laravel Queue Workers
cat > /etc/supervisor/conf.d/laravel-worker.conf << 'EOF'
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/laravel/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/supervisor/laravel-worker.log
stopwaitsecs=3600
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
                        "file_path": "/var/log/nginx/laravel-access.log",
                        "log_group_name": "/aws/ec2/laravel-app/app",
                        "log_stream_name": "{instance_id}/nginx-access",
                        "timezone": "UTC"
                    },
                    {
                        "file_path": "/var/log/nginx/laravel-error.log",
                        "log_group_name": "/aws/ec2/laravel-app/app",
                        "log_stream_name": "{instance_id}/nginx-error",
                        "timezone": "UTC"
                    },
                    {
                        "file_path": "/var/log/supervisor/laravel-worker.log",
                        "log_group_name": "/aws/ec2/laravel-app/app",
                        "log_stream_name": "{instance_id}/queue-worker",
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
                    "io_time"
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

# Start services
systemctl enable nginx
systemctl enable php8.2-fpm
systemctl enable supervisor
systemctl enable amazon-cloudwatch-agent

systemctl start nginx
systemctl start php8.2-fpm
systemctl start supervisor
systemctl start amazon-cloudwatch-agent

# Create deployment script
cat > /opt/deploy-laravel.sh << 'EOF'
#!/bin/bash
set -e

REPO_URL=${1:-""}
BRANCH=${2:-"main"}
APP_DIR="/var/www/laravel"
BACKUP_DIR="/var/www/backup"

if [ -z "$REPO_URL" ]; then
    echo "Usage: $0 <repository_url> [branch]"
    exit 1
fi

echo "Starting Laravel deployment..."

# Create backup
if [ -d "$APP_DIR" ]; then
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$APP_DIR" "$BACKUP_DIR/laravel-$(date +%Y%m%d-%H%M%S)" || true
fi

# Clone or update repository
if [ ! -d "$APP_DIR/.git" ]; then
    sudo rm -rf "$APP_DIR"
    sudo git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
    sudo git checkout "$BRANCH"
else
    cd "$APP_DIR"
    sudo git fetch origin
    sudo git checkout "$BRANCH"
    sudo git pull origin "$BRANCH"
fi

# Set permissions
sudo chown -R www-data:www-data "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"

# Install dependencies
sudo -u www-data composer install --no-dev --optimize-autoloader

# Set up environment
if [ ! -f "$APP_DIR/.env" ]; then
    sudo -u www-data cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    sudo -u www-data php "$APP_DIR/artisan" key:generate
fi

# Configure environment variables
sudo -u www-data sed -i "s/DB_HOST=.*/DB_HOST=${DATABASE_HOST}/" "$APP_DIR/.env"
sudo -u www-data sed -i "s/AWS_BUCKET=.*/AWS_BUCKET=${S3_BUCKET_NAME}/" "$APP_DIR/.env"
sudo -u www-data sed -i "s/REDIS_HOST=.*/REDIS_HOST=127.0.0.1/" "$APP_DIR/.env"

# Run Laravel commands
sudo -u www-data php "$APP_DIR/artisan" config:cache
sudo -u www-data php "$APP_DIR/artisan" route:cache
sudo -u www-data php "$APP_DIR/artisan" view:cache

# Restart services
sudo systemctl reload nginx
sudo systemctl restart php8.2-fpm
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart laravel-worker:*

echo "Deployment completed successfully!"
EOF

chmod +x /opt/deploy-laravel.sh

echo "Laravel application server initialization completed!"