.PHONY: help init plan apply destroy bootstrap clean validate format

# Default environment
ENV ?= dev

# Colors for output
RED    := \033[31m
GREEN  := \033[32m
YELLOW := \033[33m
BLUE   := \033[34m
RESET  := \033[0m

help: ## Show this help message
	@echo "$(BLUE)Laravel AWS Infrastructure - Terraform Commands$(RESET)"
	@echo ""
	@echo "$(YELLOW)Usage:$(RESET)"
	@echo "  make <target> [ENV=<environment>]"
	@echo ""
	@echo "$(YELLOW)Targets:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Examples:$(RESET)"
	@echo "  make plan ENV=dev"
	@echo "  make apply ENV=prod"
	@echo "  make destroy ENV=staging"

bootstrap: ## Bootstrap Terraform state backend
	@echo "$(BLUE)Bootstrapping Terraform state backend...$(RESET)"
	cd bootstrap && terraform init
	cd bootstrap && terraform plan
	@echo "$(YELLOW)Review the plan above and run 'cd bootstrap && terraform apply' to continue$(RESET)"

init: ## Initialize Terraform
	@echo "$(BLUE)Initializing Terraform for $(ENV) environment...$(RESET)"
	terraform init
	@if [ ! -f "terraform.tfvars" ]; then \
		echo "$(YELLOW)Creating terraform.tfvars from example...$(RESET)"; \
		cp environments/$(ENV)/terraform.tfvars.example terraform.tfvars; \
		echo "$(RED)Please edit terraform.tfvars before proceeding$(RESET)"; \
	fi

validate: ## Validate Terraform configuration
	@echo "$(BLUE)Validating Terraform configuration...$(RESET)"
	terraform validate
	terraform fmt -check=true

format: ## Format Terraform files
	@echo "$(BLUE)Formatting Terraform files...$(RESET)"
	terraform fmt -recursive

plan: init validate ## Plan Terraform deployment
	@echo "$(BLUE)Planning Terraform deployment for $(ENV) environment...$(RESET)"
	terraform plan -var-file="environments/$(ENV)/terraform.tfvars.example" -out=tfplan

apply: ## Apply Terraform configuration
	@echo "$(BLUE)Applying Terraform configuration for $(ENV) environment...$(RESET)"
	@if [ ! -f "tfplan" ]; then \
		echo "$(YELLOW)No plan file found. Running plan first...$(RESET)"; \
		$(MAKE) plan ENV=$(ENV); \
	fi
	terraform apply tfplan
	@echo "$(GREEN)Deployment completed!$(RESET)"
	@echo "$(BLUE)Outputs:$(RESET)"
	terraform output

destroy: ## Destroy Terraform-managed infrastructure
	@echo "$(RED)WARNING: This will destroy all infrastructure for $(ENV) environment!$(RESET)"
	@echo "$(YELLOW)Are you sure? Type 'yes' to continue:$(RESET)"
	@read confirm && [ "$$confirm" = "yes" ]
	terraform destroy -var-file="environments/$(ENV)/terraform.tfvars.example"

clean: ## Clean up local files
	@echo "$(BLUE)Cleaning up local files...$(RESET)"
	rm -f tfplan
	rm -f terraform.tfstate.backup
	rm -rf .terraform/

outputs: ## Show Terraform outputs
	@echo "$(BLUE)Terraform outputs:$(RESET)"
	terraform output

deploy-app: ## Deploy Laravel application (requires target instance)
	@echo "$(BLUE)Deploying Laravel application...$(RESET)"
	@if [ -z "$(REPO)" ]; then \
		echo "$(RED)Error: REPO variable is required$(RESET)"; \
		echo "$(YELLOW)Usage: make deploy-app REPO=https://github.com/user/repo.git [BRANCH=main]$(RESET)"; \
		exit 1; \
	fi
	@INSTANCE_ID=$$(aws ec2 describe-instances \
		--filters "Name=tag:Project,Values=laravel-app" "Name=tag:Environment,Values=$(ENV)" "Name=instance-state-name,Values=running" \
		--query 'Reservations[0].Instances[0].InstanceId' --output text); \
	if [ "$$INSTANCE_ID" = "None" ]; then \
		echo "$(RED)No running instances found for environment $(ENV)$(RESET)"; \
		exit 1; \
	fi; \
	echo "$(BLUE)Deploying to instance: $$INSTANCE_ID$(RESET)"; \
	aws ssm send-command \
		--instance-ids "$$INSTANCE_ID" \
		--document-name "AWS-RunShellScript" \
		--parameters "commands=['/opt/deploy-laravel.sh $(REPO) $(or $(BRANCH),main)']"

backup-db: ## Create database backup
	@echo "$(BLUE)Creating database backup for $(ENV) environment...$(RESET)"
	@INSTANCE_ID=$$(aws ec2 describe-instances \
		--filters "Name=tag:Project,Values=laravel-app" "Name=tag:Environment,Values=$(ENV)" "Name=tag:Type,Values=database" "Name=instance-state-name,Values=running" \
		--query 'Reservations[0].Instances[0].InstanceId' --output text); \
	if [ "$$INSTANCE_ID" = "None" ]; then \
		echo "$(RED)No running database instance found for environment $(ENV)$(RESET)"; \
		exit 1; \
	fi; \
	echo "$(BLUE)Creating backup on instance: $$INSTANCE_ID$(RESET)"; \
	aws ssm send-command \
		--instance-ids "$$INSTANCE_ID" \
		--document-name "AWS-RunShellScript" \
		--parameters "commands=['/opt/backup-database.sh']"

status: ## Show infrastructure status
	@echo "$(BLUE)Infrastructure status for $(ENV) environment:$(RESET)"
	@echo ""
	@echo "$(YELLOW)Load Balancer:$(RESET)"
	@aws elbv2 describe-load-balancers \
		--names "laravel-app-$(ENV)-alb" \
		--query 'LoadBalancers[0].[State.Code,DNSName]' \
		--output table 2>/dev/null || echo "  Not found"
	@echo ""
	@echo "$(YELLOW)Auto Scaling Group:$(RESET)"
	@aws autoscaling describe-auto-scaling-groups \
		--auto-scaling-group-names "laravel-app-$(ENV)-app-asg" \
		--query 'AutoScalingGroups[0].[MinSize,DesiredCapacity,MaxSize]' \
		--output table 2>/dev/null || echo "  Not found"
	@echo ""
	@echo "$(YELLOW)Running Instances:$(RESET)"
	@aws ec2 describe-instances \
		--filters "Name=tag:Project,Values=laravel-app" "Name=tag:Environment,Values=$(ENV)" "Name=instance-state-name,Values=running" \
		--query 'Reservations[].Instances[].[InstanceId,InstanceType,Tags[?Key==`Name`].Value|[0],PrivateIpAddress]' \
		--output table 2>/dev/null || echo "  No running instances"

logs: ## Show CloudWatch logs (requires LOG_GROUP parameter)
	@if [ -z "$(LOG_GROUP)" ]; then \
		echo "$(YELLOW)Available log groups:$(RESET)"; \
		aws logs describe-log-groups \
			--log-group-name-prefix "/aws/ec2/laravel-app-$(ENV)" \
			--query 'logGroups[].logGroupName' \
			--output table; \
		echo "$(YELLOW)Usage: make logs LOG_GROUP=/aws/ec2/laravel-app-$(ENV)/app$(RESET)"; \
	else \
		echo "$(BLUE)Recent logs from $(LOG_GROUP):$(RESET)"; \
		aws logs tail "$(LOG_GROUP)" --follow; \
	fi