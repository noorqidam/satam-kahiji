# Example Terraform Variables Configuration
# Copy this file to terraform.tfvars and customize for your deployment

# Required Variables
domain_name = "example.com"  # Must have ACM certificate

# Project Configuration
project_name = "laravel-app"
environment  = "dev"
owner        = "devops-team"

# AWS Configuration
aws_region = "us-west-2"

# Network Configuration
vpc_cidr = "10.0.0.0/16"
az_count = 2

# Instance Configuration
app_instance_type = "t3.medium"
db_instance_type  = "t3.large"
db_volume_size    = 100

# Auto Scaling Configuration
asg_min_size         = 2
asg_max_size         = 10
asg_desired_capacity = 2

# Backup Configuration
backup_retention_days = 7