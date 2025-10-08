# Laravel AWS Infrastructure with Terraform

This Terraform project deploys a production-ready Laravel application infrastructure on AWS using EC2, PostgreSQL, S3, and Application Load Balancer.

## Architecture Overview

- **Compute**: EC2 instances in Auto Scaling Groups across multiple AZs
- **Database**: PostgreSQL on dedicated EC2 instance with EBS storage
- **Load Balancing**: Application Load Balancer with HTTPS termination
- **Storage**: S3 bucket for Laravel file storage
- **Networking**: VPC with public/private subnets and NAT gateways
- **Monitoring**: CloudWatch logging and metrics
- **Backup**: Automated EBS snapshots and PostgreSQL dumps

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.6 installed
3. **Domain name** and **ACM certificate** in AWS (for HTTPS)
4. **S3 bucket** for Terraform state (optional, but recommended)

## Quick Start

### 1. Bootstrap Terraform State Backend (Optional)

```bash
cd bootstrap
cp variables.tf.example variables.tf
# Edit variables.tf with your values
terraform init
terraform plan
terraform apply
# Note the outputs for backend configuration
```

### 2. Configure Backend

Update `backend.tf` with your S3 bucket and DynamoDB table:

```hcl
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket"
    key            = "laravel-app/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

### 3. Configure Variables

```bash
# Copy and customize for your environment
cp environments/dev/terraform.tfvars.example terraform.tfvars

# Required variables to set:
# - domain_name (must have ACM certificate)
# - aws_region
# - project_name
```

### 4. Deploy Infrastructure

```bash
terraform init
terraform plan
terraform apply
```

## Configuration

### Environment-Specific Configurations

Example configurations are provided for different environments:

- `environments/dev/` - Development environment
- `environments/staging/` - Staging environment  
- `environments/prod/` - Production environment

### Key Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `domain_name` | Domain for ACM certificate | **Required** |
| `aws_region` | AWS region | `us-west-2` |
| `project_name` | Project name prefix | `laravel-app` |
| `app_instance_type` | EC2 type for app servers | `t3.medium` |
| `db_instance_type` | EC2 type for database | `t3.large` |
| `asg_min_size` | Min ASG instances | `2` |
| `asg_max_size` | Max ASG instances | `10` |

## Post-Deployment

### 1. Deploy Laravel Application

SSH into an application instance and run:

```bash
sudo /opt/deploy-laravel.sh https://github.com/your-username/your-laravel-repo.git main
```

### 2. Database Setup

The database is automatically configured with:
- Database: `laravel_production`
- User: `laravel_user`
- Password: `laravel_secure_password_123!`

### 3. Configure DNS

Point your domain to the ALB DNS name:

```bash
# Get ALB DNS name
terraform output load_balancer_dns_name

# Create CNAME record:
# your-domain.com -> alb-dns-name
```

### 4. Laravel Environment Configuration

Update your Laravel `.env` file with:

```env
# Database
DB_CONNECTION=pgsql
DB_HOST={database_private_ip}
DB_PORT=5432
DB_DATABASE=laravel_production
DB_USERNAME=laravel_user
DB_PASSWORD=laravel_secure_password_123!

# S3 Storage
FILESYSTEM_DISK=s3
AWS_BUCKET={s3_bucket_name}
AWS_DEFAULT_REGION={aws_region}
AWS_USE_PATH_STYLE_ENDPOINT=false

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Queue
QUEUE_CONNECTION=redis
```

## Operations

### Application Deployment

Use the deployment script on any app instance:

```bash
# Deploy from Git repository
sudo /opt/deploy-laravel.sh https://github.com/your-repo.git main

# The script will:
# - Pull latest code
# - Install dependencies
# - Update environment
# - Cache configurations
# - Restart services
```

### Database Backup

Automated daily backups are configured:

```bash
# Manual backup
sudo /opt/backup-database.sh

# Restore from backup
sudo /opt/restore-database.sh backup_file_name.sql.gz

# List available backups
aws s3 ls s3://your-bucket/backups/database/
```

### Scaling

```bash
# Scale application instances
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name laravel-app-dev-app-asg \
  --desired-capacity 5

# Scale database (requires downtime)
# 1. Create EBS snapshot
# 2. Stop database instance
# 3. Change instance type
# 4. Start instance
```

### Monitoring

- **CloudWatch Logs**: `/aws/ec2/{project-name}/{environment}/app` and `/aws/ec2/{project-name}/{environment}/database`
- **CloudWatch Metrics**: CPU, memory, disk utilization
- **Health Checks**: ALB health checks on `/health` endpoint

### SSL Certificate

The infrastructure expects an existing ACM certificate for your domain. To create one:

1. Request certificate in AWS Certificate Manager
2. Validate domain ownership (DNS or email)
3. Ensure certificate is in the same region as your deployment

## Security Features

- **VPC**: Isolated network with public/private subnets
- **Security Groups**: Least-privilege access controls
- **IAM Roles**: Instance roles with minimal required permissions
- **EBS Encryption**: All volumes encrypted at rest
- **S3 Security**: Bucket policies enforce HTTPS and private access
- **HTTPS Only**: HTTP redirects to HTTPS, TLS 1.2+

## Cost Optimization

- **Instance Types**: Right-sized for workload (configurable)
- **Storage**: GP3 volumes with optimized IOPS/throughput
- **Auto Scaling**: Scales down during low usage
- **S3 Lifecycle**: Automatic transition to cheaper storage classes
- **Spot Instances**: Can be enabled for non-production environments

## Troubleshooting

### Common Issues

1. **ACM Certificate Not Found**
   ```
   Error: no matching ACM certificate found
   ```
   - Ensure certificate exists in the deployment region
   - Verify certificate status is "ISSUED"

2. **Health Check Failures**
   ```
   Target health check failed
   ```
   - Check application logs: `sudo tail -f /var/log/nginx/laravel-error.log`
   - Verify `/health` endpoint returns 200

3. **Database Connection Issues**
   - Check security group rules
   - Verify database is running: `sudo systemctl status postgresql`
   - Check database logs in CloudWatch

### Accessing Instances

```bash
# List instances
aws ec2 describe-instances --filters "Name=tag:Project,Values=laravel-app"

# Connect via Session Manager (no SSH key required)
aws ssm start-session --target i-1234567890abcdef0

# Traditional SSH (if key pair configured)
ssh -i key.pem ubuntu@private-ip
```

## Clean Up

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will permanently delete all data, including the database and S3 bucket contents.

## Module Structure

```
terraform/
├── main.tf                 # Root configuration
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── backend.tf              # Remote state configuration
├── bootstrap/              # State backend setup
├── environments/           # Environment-specific configs
├── modules/                # Reusable modules
│   ├── vpc/               # Networking
│   ├── security/          # Security groups
│   ├── iam/               # IAM roles and policies
│   ├── storage/           # S3 bucket
│   ├── database/          # PostgreSQL instance
│   ├── load-balancer/     # ALB and target groups
│   └── compute/           # Auto Scaling Groups
└── scripts/               # User data scripts
    ├── app_init.sh        # Application server setup
    └── database_init.sh   # Database server setup
```

## Support

For issues and questions:
1. Check CloudWatch logs for error details
2. Review security group and IAM permissions
3. Verify network connectivity between components
4. Check AWS service limits and quotas