# Terraform configuration for AWS infrastructure
# OpenTofu compatible

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "semiconductor_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "semiconductor-vpc"
    Project = "NanoChip"
  }
}

# Subnets
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.semiconductor_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = var.availability_zone_1
  map_public_ip_on_launch = true

  tags = {
    Name = "semiconductor-public-subnet-1"
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.semiconductor_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = var.availability_zone_2
  map_public_ip_on_launch = true

  tags = {
    Name = "semiconductor-public-subnet-2"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "semiconductor_igw" {
  vpc_id = aws_vpc.semiconductor_vpc.id

  tags = {
    Name = "semiconductor-igw"
  }
}

# Route Table
resource "aws_route_table" "semiconductor_rt" {
  vpc_id = aws_vpc.semiconductor_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.semiconductor_igw.id
  }

  tags = {
    Name = "semiconductor-rt"
  }
}

resource "aws_route_table_association" "subnet_1_association" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.semiconductor_rt.id
}

resource "aws_route_table_association" "subnet_2_association" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.semiconductor_rt.id
}

# Security Groups
resource "aws_security_group" "semiconductor_sg" {
  name        = "semiconductor-sg"
  description = "Security group for semiconductor platform"
  vpc_id      = aws_vpc.semiconductor_vpc.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "API"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "semiconductor-sg"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "semiconductor_db" {
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "15.5"
  instance_class         = var.db_instance_class
  db_name                = "semiconductor"
  username               = var.db_username
  password               = var.db_password
  parameter_group_name   = "default.postgres15"
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.semiconductor_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.semiconductor_subnet_group.name

  tags = {
    Name = "semiconductor-db"
  }
}

resource "aws_db_subnet_group" "semiconductor_subnet_group" {
  name       = "semiconductor-subnet-group"
  subnet_ids = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "semiconductor-subnet-group"
  }
}

# EKS Cluster (Kubernetes)
resource "aws_eks_cluster" "semiconductor_cluster" {
  name     = "semiconductor-cluster"
  role_arn = aws_iam_role.eks_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
  }

  tags = {
    Name = "semiconductor-cluster"
  }
}

resource "aws_iam_role" "eks_role" {
  name = "semiconductor-eks-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eks_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_role.name
}

# Outputs
output "vpc_id" {
  value = aws_vpc.semiconductor_vpc.id
}

output "db_endpoint" {
  value = aws_db_instance.semiconductor_db.endpoint
}

output "eks_cluster_endpoint" {
  value = aws_eks_cluster.semiconductor_cluster.endpoint
}
