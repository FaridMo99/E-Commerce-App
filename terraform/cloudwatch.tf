resource "aws_cloudwatch_metric_alarm" "billing_alarm" {
  alarm_name          = "over-1-dollar"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "21600"
  statistic           = "Maximum"
  threshold           = "1"
  alarm_description   = "Alarm for more than 1 dollar spend"
}