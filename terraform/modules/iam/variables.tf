variable "name_prefix" {
  description = "Prefix for naming resources"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for Laravel storage"
  type        = string
}

variable "tags" {
  description = "A map of tags to assign to the resource"
  type        = map(string)
  default     = {}
}