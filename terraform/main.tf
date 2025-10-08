terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = var.owner
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = var.owner
  }
}

module "vpc" {
  source = "./modules/vpc"
  
  name_prefix          = local.name_prefix
  vpc_cidr            = var.vpc_cidr
  availability_zones  = slice(data.aws_availability_zones.available.names, 0, var.az_count)
  
  tags = local.common_tags
}

module "security" {
  source = "./modules/security"
  
  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  vpc_cidr    = var.vpc_cidr
  
  tags = local.common_tags
}

module "iam" {
  source = "./modules/iam"
  
  name_prefix = local.name_prefix
  s3_bucket_name = "${local.name_prefix}-laravel-storage"
  
  tags = local.common_tags
}

module "storage" {
  source = "./modules/storage"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

module "database" {
  source = "./modules/database"
  
  name_prefix           = local.name_prefix
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  database_sg_id       = module.security.database_sg_id
  instance_profile_name = module.iam.database_instance_profile_name
  db_instance_type     = var.db_instance_type
  db_volume_size       = var.db_volume_size
  
  tags = local.common_tags
}

module "load_balancer" {
  source = "./modules/load-balancer"
  
  name_prefix        = local.name_prefix
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
  domain_name       = var.domain_name
  
  tags = local.common_tags
}

module "compute" {
  source = "./modules/compute"
  
  name_prefix           = local.name_prefix
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  app_sg_id            = module.security.app_sg_id
  instance_profile_name = module.iam.app_instance_profile_name
  target_group_arn     = module.load_balancer.target_group_arn
  s3_bucket_name       = module.storage.s3_bucket_name
  database_host        = module.database.database_private_ip
  app_instance_type    = var.app_instance_type
  min_size             = var.asg_min_size
  max_size             = var.asg_max_size
  desired_capacity     = var.asg_desired_capacity
  
  tags = local.common_tags
}