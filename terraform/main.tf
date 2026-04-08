terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.39.0"
    }
  }
  backend "s3" {
    bucket         = "terraform-remote-backend-shoppi"
    key            = "shoppi/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true

    use_lockfile = true
  }
}

provider "aws" {
  region = "eu-central-1"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/24"
  enable_dns_hostnames = true # Important for S3 Endpoint & ECS
  enable_dns_support   = true
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.0.128/25"
  map_public_ip_on_launch = true
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public_association" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.main.id
}
