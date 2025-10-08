output "app_instance_profile_name" {
  description = "Name of the app instance profile"
  value       = aws_iam_instance_profile.app_instance.name
}

output "database_instance_profile_name" {
  description = "Name of the database instance profile"
  value       = aws_iam_instance_profile.database_instance.name
}

output "app_role_arn" {
  description = "ARN of the app IAM role"
  value       = aws_iam_role.app_instance.arn
}

output "database_role_arn" {
  description = "ARN of the database IAM role"
  value       = aws_iam_role.database_instance.arn
}