terraform {
  backend "s3" {
    # Uncomment and configure these values before running terraform init
    # bucket         = "your-terraform-state-bucket"
    # key            = "laravel-app/terraform.tfstate"
    # region         = "us-west-2"
    # dynamodb_table = "terraform-state-lock"
    # encrypt        = true
  }
}