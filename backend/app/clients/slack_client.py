"""
Slack Client for MarketSentinel
Fetches messages from public Slack channels for a given ticker or list of tickers using Slack API (if token provided).
"""
import os
import logging
from typing import List, Dict
import requests

logger = logging.getLogger("slack_client")

class SlackClient:
    def __init__(self):
        self.token = os.getenv("SLACK_API_KEY")

    def fetch_messages(self, channel: str, query: str, max_results: int = 50) -> List[Dict]:
        if not self.token:
            return []
        url = "https://slack.com/api/search.messages"
        headers = {"Authorization": f"Bearer {self.token}"}
        params = {"query": query, "count": max_results, "sort": "timestamp", "sort_dir": "desc"}
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            messages = []
            for match in data.get("messages", {}).get("matches", []):
                if match.get("channel", {}).get("name") == channel:
                    messages.append({
                        "text": match.get("text", ""),
                        "user": match.get("username", "anon"),
                        "ts": match.get("ts", "")
                    })
            return messages
        except Exception as e:
            logger.error(f"Failed to fetch Slack messages: {e}")
            return []

    def fetch_messages_for_tickers(self, channel: str, tickers: List[str], max_results: int = 50) -> List[Dict]:
        all_msgs = []
        for ticker in tickers:
            all_msgs.extend(self.fetch_messages(channel, ticker, max_results=max_results))
        return all_msgs
