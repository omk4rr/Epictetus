"""
4chan Client for MarketSentinel
Fetches posts from 4chan boards (e.g., /biz/) for sentiment analysis.
"""
import requests
import logging
from typing import List, Dict

logger = logging.getLogger("fourchan_client")

class FourChanClient:
    BASE_URL = "https://a.4cdn.org"

    def fetch_board_catalog(self, board="biz") -> List[Dict]:
        try:
            resp = requests.get(f"{self.BASE_URL}/{board}/catalog.json", timeout=10)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"Failed to fetch 4chan catalog: {e}")
            return []

    def fetch_thread_posts(self, board="biz", thread_id=None) -> List[Dict]:
        if not thread_id:
            return []
        try:
            resp = requests.get(f"{self.BASE_URL}/{board}/thread/{thread_id}.json", timeout=10)
            resp.raise_for_status()
            return resp.json().get("posts", [])
        except Exception as e:
            logger.error(f"Failed to fetch 4chan thread {thread_id}: {e}")
            return []
