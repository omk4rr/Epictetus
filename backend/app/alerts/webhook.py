"""
Webhook Alerting for MarketSentinel
Sends alerts to Slack, Telegram, or Discord webhooks.
"""
import os
import logging
import requests

logger = logging.getLogger("webhook")

class WebhookAlerter:
    def __init__(self):
        self.slack_url = os.getenv("SLACK_WEBHOOK_URL")
        self.telegram_url = os.getenv("TELEGRAM_WEBHOOK_URL")
        self.discord_url = os.getenv("DISCORD_WEBHOOK_URL")

    def send_alert(self, message: str):
        """
        Sends alert message to configured webhooks.
        """
        for url in [self.slack_url, self.telegram_url, self.discord_url]:
            if url:
                try:
                    requests.post(url, json={"text": message}, timeout=10)
                except Exception as e:
                    logger.error(f"Failed to send alert to {url}: {e}")
