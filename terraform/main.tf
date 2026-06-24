terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# 1. Set the AWS Region
provider "aws" {
  region = "us-east-1"
}

# 2. Database: Create the DynamoDB Table
resource "aws_dynamodb_table" "visitor_count" {
  name         = "cloud-resume-stats"
  billing_mode = "PAY_PER_REQUEST" # Serverless billing (you only pay per read/write)
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

# 3. Security: IAM Role & Least-Privilege Policy for Lambda
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_exec_role" {
  name               = "serverless_portfolio_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

data "aws_iam_policy_document" "lambda_dynamodb_policy" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:UpdateItem",
      "dynamodb:GetItem"
    ]
    # Restrict Lambda so it can ONLY touch this specific table
    resources = [aws_dynamodb_table.visitor_count.arn] 
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

resource "aws_iam_role_policy" "lambda_policy_attachment" {
  name   = "lambda_dynamodb_logging_policy"
  role   = aws_iam_role.lambda_exec_role.id
  policy = data.aws_iam_policy_document.lambda_dynamodb_policy.json
}

# 4. Compute: Package and Deploy the Python Script
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "../backend/counter.py" # Looks in your backend folder
  output_path = "lambda_function.zip"
}

resource "aws_lambda_function" "api_handler" {
  filename         = "lambda_function.zip"
  function_name    = "PortfolioCounter"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "counter.lambda_handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.10"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.visitor_count.name
    }
  }
}

# 5. Routing: API Gateway (HTTP API)
resource "aws_apigatewayv2_api" "http_api" {
  name          = "portfolio-api"
  protocol_type = "HTTP"
  
  # CORS Configuration (Allows your frontend to talk to the API)
  cors_configuration {
    allow_origins = ["*"] # We will lock this down to your specific domain later
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api_handler.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /count"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "prod"
  auto_deploy = true
}

# Give API Gateway permission to trigger your Lambda
resource "aws_lambda_permission" "api_gw_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

# 6. Output: The URL we need for the frontend JS
output "api_endpoint" {
  description = "The URL to trigger the Lambda function"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}/prod/count"
}