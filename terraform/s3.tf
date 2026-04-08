resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "allow_access_from_vpc_only" {
  bucket = aws_s3_bucket.main.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowVPCPointAccessOnly"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource = [
          aws_s3_bucket.main.arn,
          "${aws_s3_bucket.main.arn}/*"
        ]
        Condition = {
          StringNotEquals = {
            "aws:sourceVpce" = aws_vpc_endpoint.s3.id
          }
        }
      }
    ]
  })
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.eu-central-1.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.main.id]
}

resource "aws_s3_bucket" "main" {
  bucket = "my-portfolio-app-data-2026" # Buckets must be globally unique
}