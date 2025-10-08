variable "aws_region" {
  description = "AWS region for the backend resources"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "laravel-app"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "shared"
}