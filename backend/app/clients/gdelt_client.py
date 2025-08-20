"""
GDELT Client for MarketSentinel
Fetches news articles for a given ticker using GDELT API and dumps to data/raw/.
"""
import requests
import json
import logging
from pathlib import Path
from typing import List

logger = logging.getLogger("gdelt_client")
RAW_DATA_DIR = Path(__file__).parent.parent / "data" / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

class GdeltClient:
    def fetch_news(self, ticker: str, max_results: int = 100) -> List[dict]:
        """
        Fetches recent news for a ticker using GDELT API.
        Dumps results to data/raw/{ticker}_gdelt.json.
        """
        output_file = RAW_DATA_DIR / f"{ticker}_gdelt.json"
        url = f"https://api.gdeltproject.org/api/v2/doc/doc?query={ticker}&mode=ArtList&format=json"
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            articles = resp.json().get("articles", [])[:max_results]
            with open(output_file, "w") as f:
                json.dump(articles, f)
            return articles
        except Exception as e:
            logger.error(f"Failed to fetch GDELT news for {ticker}: {e}")
            return []
