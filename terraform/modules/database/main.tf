data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_ebs_volume" "database" {
  availability_zone = data.aws_subnet.database.availability_zone
  size              = var.db_volume_size
  type              = "gp3"
  iops              = 3000
  throughput        = 125
  encrypted         = true

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-database-volume"
  })
}

data "aws_subnet" "database" {
  id = var.private_subnet_ids[0]
}

resource "aws_instance" "database" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.db_instance_type
  subnet_id              = var.private_subnet_ids[0]
  vpc_security_group_ids = [var.database_sg_id]
  iam_instance_profile   = var.instance_profile_name

  user_data = base64encode(templatefile("${path.module}/../../scripts/database_init.sh", {
    db_volume_device = "/dev/sdf"
    s3_bucket_name   = "${var.name_prefix}-laravel-storage"
  }))

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-database"
    Type = "database"
  })

  lifecycle {
    ignore_changes = [ami]
  }
}

resource "aws_volume_attachment" "database" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.database.id
  instance_id = aws_instance.database.id
}

resource "aws_cloudwatch_log_group" "database" {
  name              = "/aws/ec2/${var.name_prefix}/database"
  retention_in_days = 30

  tags = var.tags
}

resource "aws_ebs_snapshot" "database_initial" {
  volume_id   = aws_ebs_volume.database.id
  description = "Initial snapshot of ${var.name_prefix} database volume"

  tags = merge(var.tags, {
    Name = "${var.name_prefix}-database-initial-snapshot"
    Type = "database-snapshot"
  })

  depends_on = [aws_volume_attachment.database]
}

data "aws_iam_policy_document" "backup_lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "backup_lambda" {
  name               = "${var.name_prefix}-backup-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.backup_lambda_assume_role.json

  tags = var.tags
}

data "aws_iam_policy_document" "backup_lambda_policy" {
  statement {
    effect = "Allow"
    actions = [
      "ec2:CreateSnapshot",
      "ec2:DescribeSnapshots",
      "ec2:DescribeInstances",
      "ec2:DescribeVolumes",
      "ec2:CreateTags",
      "ec2:DeleteSnapshot"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "backup_lambda" {
  name   = "${var.name_prefix}-backup-lambda-policy"
  policy = data.aws_iam_policy_document.backup_lambda_policy.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "backup_lambda" {
  role       = aws_iam_role.backup_lambda.name
  policy_arn = aws_iam_policy.backup_lambda.arn
}

resource "aws_lambda_function" "database_backup" {
  filename         = "${path.module}/database_backup.zip"
  function_name    = "${var.name_prefix}-database-backup"
  role            = aws_iam_role.backup_lambda.arn
  handler         = "index.handler"
  runtime         = "python3.9"
  timeout         = 300

  environment {
    variables = {
      VOLUME_ID = aws_ebs_volume.database.id
      RETENTION_DAYS = var.backup_retention_days
      NAME_PREFIX = var.name_prefix
    }
  }

  tags = var.tags

  depends_on = [
    aws_iam_role_policy_attachment.backup_lambda,
    aws_cloudwatch_log_group.backup_lambda,
  ]
}

resource "aws_cloudwatch_log_group" "backup_lambda" {
  name              = "/aws/lambda/${var.name_prefix}-database-backup"
  retention_in_days = 14

  tags = var.tags
}

resource "aws_cloudwatch_event_rule" "database_backup_schedule" {
  name                = "${var.name_prefix}-database-backup-schedule"
  description         = "Trigger database backup Lambda function"
  schedule_expression = "cron(0 2 * * ? *)"

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "database_backup_target" {
  rule      = aws_cloudwatch_event_rule.database_backup_schedule.name
  target_id = "DatabaseBackupTarget"
  arn       = aws_lambda_function.database_backup.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.database_backup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.database_backup_schedule.arn
}