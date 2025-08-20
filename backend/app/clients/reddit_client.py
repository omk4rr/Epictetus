"""
Reddit Client for MarketSentinel
Fetches Reddit posts for a given ticker or list of tickers using PRAW or Pushshift and dumps to data/raw/.
"""
import os
import logging
import requests
from pathlib import Path
from typing import List

logger = logging.getLogger("reddit_client")
RAW_DATA_DIR = Path(__file__).parent.parent / "data" / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

class RedditClient:
    def __init__(self):
        self.client_id = os.getenv("REDDIT_CLIENT_ID")
        self.client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        self.user_agent = os.getenv("REDDIT_USER_AGENT", "MarketSentinelBot/0.1")

    def fetch_posts(self, ticker: str, max_results: int = 100) -> List[dict]:
        output_file = RAW_DATA_DIR / f"{ticker}_reddit.json"
        posts = []
        if self.client_id and self.client_secret:
            try:
                import praw
                reddit = praw.Reddit(
                    client_id=self.client_id,
                    client_secret=self.client_secret,
                    user_agent=self.user_agent
                )
                for submission in reddit.subreddit("all").search(ticker, limit=max_results):
                    posts.append({
                        "title": submission.title,
                        "selftext": submission.selftext,
                        "url": submission.url,
                        "created_utc": submission.created_utc,
                        "score": submission.score
                    })
            except Exception as e:
                logger.error(f"PRAW fetch failed: {e}")
        else:
            url = f"https://api.pushshift.io/reddit/search/submission/?q={ticker}&size={max_results}"
            try:
                resp = requests.get(url, timeout=30)
                resp.raise_for_status()
                posts = resp.json().get("data", [])
            except Exception as e:
                logger.error(f"Pushshift fetch failed: {e}")
        try:
            with open(output_file, "w") as f:
                import json
                json.dump(posts, f)
        except Exception as e:
            logger.error(f"Failed to write Reddit posts: {e}")
        return posts

    def fetch_posts_for_tickers(self, tickers: List[str], max_results: int = 100) -> List[dict]:
        all_posts = []
        for ticker in tickers:
            all_posts.extend(self.fetch_posts(ticker, max_results=max_results))
        return all_posts
