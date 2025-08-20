"""
Web Search and News Client for MarketSentinel
Supports Google Custom Search API and Google News RSS feeds for news ingestion.
"""
import os
import logging
from typing import List, Dict
import requests
import feedparser

logger = logging.getLogger("web_search_client")

class WebSearchClient:
    def __init__(self):
        self.google_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        self.google_cse_id = os.getenv("GOOGLE_CSE_ID")
        self.provider = "google"

    def search(self, query: str, max_results: int = 5) -> List[Dict]:
        """Search the web using Google CSE; fall back to Google News RSS if CSE is not configured or fails."""
        try:
            if self.google_key and self.google_cse_id:
                return self._search_google(query, max_results)
            # Fallback when CSE is not configured
            return self.fetch_google_news_by_query(query, max_results=max_results)
        except Exception as e:
            logger.error(f"Web search failed: {e}")
            # Fallback on any error
            try:
                return self.fetch_google_news_by_query(query, max_results=max_results)
            except Exception as e2:
                logger.error(f"RSS fallback also failed: {e2}")
                return []

    def _search_google(self, query, max_results):
        url = "https://www.googleapis.com/customsearch/v1"
        params = {"q": query, "key": self.google_key, "cx": self.google_cse_id, "num": max_results}
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return [{"title": item["title"], "url": item["link"], "snippet": item.get("snippet", "")} for item in data.get("items", [])]

    def fetch_google_news(self, ticker: str, max_results: int = 10) -> List[Dict]:
        """
        Fetches news articles for a ticker using Google News RSS feed.
        """
        url = f"https://news.google.com/rss/search?q={ticker}+stock&hl=en-US&gl=US&ceid=US:en"
        feed = feedparser.parse(url)
        articles = []
        for entry in feed.entries[:max_results]:
            articles.append({
                "title": getattr(entry, "title", ""),
                "url": getattr(entry, "link", ""),
                "published": getattr(entry, "published", ""),
                "summary": getattr(entry, "summary", "")
            })
        return articles

    def fetch_google_news_by_query(self, query: str, max_results: int = 10) -> List[Dict]:
        """Fetch Google News RSS by free-form query as a fallback to CSE."""
        q = requests.utils.quote(query)
        url = f"https://news.google.com/rss/search?q={q}&hl=en-US&gl=US&ceid=US:en"
        feed = feedparser.parse(url)
        articles = []
        for entry in feed.entries[:max_results]:
            articles.append({
                "title": getattr(entry, "title", ""),
                "url": getattr(entry, "link", ""),
                "published": getattr(entry, "published", ""),
                "summary": getattr(entry, "summary", "")
            })
        return articles

    def fetch_news_for_tickers(self, tickers: List[str], max_results: int = 10) -> List[Dict]:
        all_news = []
        for ticker in tickers:
            all_news.extend(self.fetch_google_news(ticker, max_results=max_results))
        return all_news
