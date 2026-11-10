variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "telegram_bot_token" {
  description = "Telegram Bot Token for visitor alerts"
  type        = string
  sensitive   = true
  default     = ""
}

variable "telegram_chat_id" {
  description = "Telegram Chat ID for visitor alerts"
  type        = string
  sensitive   = true
  default     = ""
}

