variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "laravel-app"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "owner" {
  description = "Owner of the resources"
  type        = string
  default     = "devops-team"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
  validation {
    condition     = var.az_count >= 2
    error_message = "At least 2 availability zones are required for high availability."
  }
}

variable "domain_name" {
  description = "Domain name for the application (for ACM certificate)"
  type        = string
}

variable "app_instance_type" {
  description = "EC2 instance type for Laravel application"
  type        = string
  default     = "t3.medium"
}

variable "db_instance_type" {
  description = "EC2 instance type for PostgreSQL database"
  type        = string
  default     = "t3.large"
}

variable "db_volume_size" {
  description = "Size of the EBS volume for database (GB)"
  type        = number
  default     = 100
}

variable "asg_min_size" {
  description = "Minimum number of instances in Auto Scaling Group"
  type        = number
  default     = 2
}

variable "asg_max_size" {
  description = "Maximum number of instances in Auto Scaling Group"
  type        = number
  default     = 10
}

variable "asg_desired_capacity" {
  description = "Desired number of instances in Auto Scaling Group"
  type        = number
  default     = 2
}

variable "backup_retention_days" {
  description = "Number of days to retain database backups"
  type        = number
  default     = 7
}