# 1. S3 Bucket for Website Hosting
resource "aws_s3_bucket" "portfolio_bucket" {
  # Change this name if you want, but it MUST be globally unique across all of AWS
  bucket = "dhananjay-portfolio-bucket-2026" 
}

# Block public access to S3 (Security Best Practice - force traffic through CloudFront)
resource "aws_s3_bucket_public_access_block" "portfolio_bucket_access" {
  bucket                  = aws_s3_bucket.portfolio_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2. CloudFront Origin Access Control (OAC) - The modern, secure way to connect S3
resource "aws_cloudfront_origin_access_control" "default" {
  name                              = "OAC for Portfolio"
  description                       = "Allow CloudFront to access S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 3. S3 Bucket Policy (Allow CloudFront to read the files)
data "aws_iam_policy_document" "s3_oac_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.portfolio_bucket.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cdn.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "portfolio_bucket_policy" {
  bucket = aws_s3_bucket.portfolio_bucket.id
  policy = data.aws_iam_policy_document.s3_oac_policy.json
}

# 4. ACM Certificate (For HTTPS on your custom domain)
resource "aws_acm_certificate" "portfolio_cert" {
  domain_name               = "dhananjay.app"
  subject_alternative_names = ["www.dhananjay.app"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# 5. CloudFront Distribution (The Global CDN)
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = ["dhananjay.app", "www.dhananjay.app"]

  origin {
    domain_name              = aws_s3_bucket.portfolio_bucket.bucket_regional_domain_name
    origin_id                = "portfolio-s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.default.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "portfolio-s3-origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.portfolio_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# 6. Output the CloudFront URL so we can route Cloudflare to it
output "cloudfront_domain_name" {
  description = "The CloudFront Distribution URL"
  value       = aws_cloudfront_distribution.cdn.domain_name
}