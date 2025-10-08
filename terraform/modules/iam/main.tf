data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "app_instance" {
  name               = "${var.name_prefix}-app-instance-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = var.tags
}

resource "aws_iam_role" "database_instance" {
  name               = "${var.name_prefix}-database-instance-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = var.tags
}

data "aws_iam_policy_document" "app_s3_policy" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]
    resources = [
      "arn:aws:s3:::${var.s3_bucket_name}",
      "arn:aws:s3:::${var.s3_bucket_name}/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "s3:GetBucketLocation",
      "s3:ListAllMyBuckets"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "app_s3_policy" {
  name        = "${var.name_prefix}-app-s3-policy"
  description = "IAM policy for Laravel app to access S3 bucket"
  policy      = data.aws_iam_policy_document.app_s3_policy.json

  tags = var.tags
}

data "aws_iam_policy_document" "database_backup_policy" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]
    resources = [
      "arn:aws:s3:::${var.s3_bucket_name}",
      "arn:aws:s3:::${var.s3_bucket_name}/backups/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "ec2:CreateSnapshot",
      "ec2:DescribeSnapshots",
      "ec2:DescribeInstances",
      "ec2:DescribeVolumes",
      "ec2:CreateTags"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "database_backup_policy" {
  name        = "${var.name_prefix}-database-backup-policy"
  description = "IAM policy for database instance to create backups"
  policy      = data.aws_iam_policy_document.database_backup_policy.json

  tags = var.tags
}

data "aws_iam_policy_document" "cloudwatch_logs_policy" {
  statement {
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams"
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "cloudwatch_logs_policy" {
  name        = "${var.name_prefix}-cloudwatch-logs-policy"
  description = "IAM policy for CloudWatch logs access"
  policy      = data.aws_iam_policy_document.cloudwatch_logs_policy.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "app_s3" {
  role       = aws_iam_role.app_instance.name
  policy_arn = aws_iam_policy.app_s3_policy.arn
}

resource "aws_iam_role_policy_attachment" "app_cloudwatch" {
  role       = aws_iam_role.app_instance.name
  policy_arn = aws_iam_policy.cloudwatch_logs_policy.arn
}

resource "aws_iam_role_policy_attachment" "app_ssm" {
  role       = aws_iam_role.app_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "database_backup" {
  role       = aws_iam_role.database_instance.name
  policy_arn = aws_iam_policy.database_backup_policy.arn
}

resource "aws_iam_role_policy_attachment" "database_cloudwatch" {
  role       = aws_iam_role.database_instance.name
  policy_arn = aws_iam_policy.cloudwatch_logs_policy.arn
}

resource "aws_iam_role_policy_attachment" "database_ssm" {
  role       = aws_iam_role.database_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "app_instance" {
  name = "${var.name_prefix}-app-instance-profile"
  role = aws_iam_role.app_instance.name

  tags = var.tags
}

resource "aws_iam_instance_profile" "database_instance" {
  name = "${var.name_prefix}-database-instance-profile"
  role = aws_iam_role.database_instance.name

  tags = var.tags
}