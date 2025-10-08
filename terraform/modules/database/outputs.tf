output "database_instance_id" {
  description = "ID of the database instance"
  value       = aws_instance.database.id
}

output "database_private_ip" {
  description = "Private IP address of the database instance"
  value       = aws_instance.database.private_ip
}

output "database_volume_id" {
  description = "ID of the database EBS volume"
  value       = aws_ebs_volume.database.id
}

output "backup_lambda_function_name" {
  description = "Name of the backup Lambda function"
  value       = aws_lambda_function.database_backup.function_name
}