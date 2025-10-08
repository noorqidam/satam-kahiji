resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "laravel_storage" {
  bucket = "${var.name_prefix}-laravel-storage-${random_id.bucket_suffix.hex}"

  tags = merge(var.tags, {
    Name        = "${var.name_prefix}-laravel-storage"
    Purpose     = "Laravel file storage"
  })
}

resource "aws_s3_bucket_versioning" "laravel_storage" {
  bucket = aws_s3_bucket.laravel_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "laravel_storage" {
  bucket = aws_s3_bucket.laravel_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "laravel_storage" {
  bucket = aws_s3_bucket.laravel_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "laravel_storage" {
  bucket = aws_s3_bucket.laravel_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "laravel_storage" {
  bucket = aws_s3_bucket.laravel_storage.id

  rule {
    id     = "cleanup_incomplete_uploads"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }

  rule {
    id     = "transition_to_ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
  }

  rule {
    id     = "delete_old_versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

data "aws_iam_policy_document" "laravel_storage_bucket_policy" {
  statement {
    sid    = "DenyInsecureConnections"
    effect = "Deny"
    
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    
    actions = ["s3:*"]
    
    resources = [
      aws_s3_bucket.laravel_storage.arn,
      "${aws_s3_bucket.laravel_storage.arn}/*"
    ]
    
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "laravel_storage" {
  bucket = aws_s3_bucket.laravel_storage.id
  policy = data.aws_iam_policy_document.laravel_storage_bucket_policy.json
}