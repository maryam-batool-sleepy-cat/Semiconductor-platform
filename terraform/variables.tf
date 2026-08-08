variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "availability_zone_1" {
  description = "First availability zone"
  default     = "us-east-1a"
}

variable "availability_zone_2" {
  description = "Second availability zone"
  default     = "us-east-1b"
}

variable "db_instance_class" {
  description = "RDS instance class"
  default     = "db.t3.micro"
}

variable "db_username" {
  description = "Database username"
  default     = "postgres"
}

variable "db_password" {
  description = "Database password"
  default     = "securepassword123"
  sensitive   = true
}
