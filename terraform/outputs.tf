output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "load_balancer_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.load_balancer.alb_dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.load_balancer.alb_zone_id
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for Laravel storage"
  value       = module.storage.s3_bucket_name
}

output "s3_bucket_domain_name" {
  description = "Domain name of the S3 bucket"
  value       = module.storage.s3_bucket_domain_name
}

output "database_private_ip" {
  description = "Private IP address of the database instance"
  value       = module.database.database_private_ip
}

output "auto_scaling_group_arn" {
  description = "ARN of the Auto Scaling Group"
  value       = module.compute.auto_scaling_group_arn
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = module.load_balancer.certificate_arn
}