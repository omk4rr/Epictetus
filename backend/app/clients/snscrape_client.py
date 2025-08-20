"""
Snscrape Client for MarketSentinel
Fetches tweets for a given ticker using snscrape and dumps to data/raw/.
"""
import subprocess
import json
import logging
from pathlib import Path
from typing import List

logger = logging.getLogger("snscrape_client")
RAW_DATA_DIR = Path(__file__).parent.parent / "data" / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

class SnscrapeClient:
    def fetch_tweets(self, ticker: str, max_results: int = 100) -> List[dict]:
        """
        Fetches recent tweets for a ticker using snscrape.
        Dumps results to data/raw/{ticker}_tweets.json.
        """
        output_file = RAW_DATA_DIR / f"{ticker}_tweets.json"
        cmd = [
            "snscrape",
            "--jsonl",
            f"twitter-search",
            f"{ticker} lang:en",
        ]
        try:
            with open(output_file, "w") as f:
                proc = subprocess.Popen(cmd, stdout=f, stderr=subprocess.PIPE)
                _, err = proc.communicate(timeout=60)
                if proc.returncode != 0:
                    logger.error(f"snscrape failed: {err}")
            # Read back results
            with open(output_file) as f:
                tweets = [json.loads(line) for line in f][:max_results]
            return tweets
        except Exception as e:
            logger.error(f"Failed to fetch tweets for {ticker}: {e}")
            return []
