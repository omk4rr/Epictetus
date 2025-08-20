"""
X.com (Twitter) Client for MarketSentinel
Fetches tweets for a given ticker or list of tickers using snscrape.
"""
import json
import logging
from typing import List
from pathlib import Path
import subprocess

logger = logging.getLogger("x_client")
RAW_DATA_DIR = Path(__file__).parent.parent / "data" / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

class XClient:
    def fetch_tweets(self, ticker: str, max_results: int = 100) -> List[dict]:
        # Try Python module API first (works better on Python 3.12)
        try:
            from snscrape.modules.twitter import TwitterSearchScraper
            results = []
            for i, tweet in enumerate(TwitterSearchScraper(f"{ticker} lang:en").get_items()):
                if i >= max_results:
                    break
                results.append({
                    "content": getattr(tweet, "content", ""),
                    "date": str(getattr(tweet, "date", "")),
                    "url": getattr(tweet, "url", ""),
                    "user": getattr(getattr(tweet, "user", None), "username", "")
                })
            return results
        except Exception as e:
            logger.warning(f"snscrape module fallback to CLI due to: {e}")
        # Fallback: CLI
        output_file = RAW_DATA_DIR / f"{ticker}_tweets.json"
        cmd = [
            "snscrape",
            "--jsonl",
            "twitter-search",
            f"{ticker} lang:en",
        ]
        try:
            with open(output_file, "w") as f:
                proc = subprocess.Popen(cmd, stdout=f, stderr=subprocess.PIPE)
                _, err = proc.communicate(timeout=60)
                if proc.returncode != 0:
                    logger.error(f"snscrape failed: {err}")
            with open(output_file) as f:
                tweets = [json.loads(line) for line in f][:max_results]
            return tweets
        except Exception as e:
            logger.error(f"Failed to fetch tweets for {ticker}: {e}")
            return []

    def fetch_tweets_for_tickers(self, tickers: List[str], max_results: int = 100) -> List[dict]:
        all_tweets = []
        for ticker in tickers:
            all_tweets.extend(self.fetch_tweets(ticker, max_results=max_results))
        return all_tweets
