import pytest
from backend.app.clients.snscrape_client import SnscrapeClient

def test_fetch_tweets(monkeypatch):
    client = SnscrapeClient()
    monkeypatch.setattr(client, "fetch_tweets", lambda ticker, max_results=100: [{"text": "tweet"}])
    tweets = client.fetch_tweets("AAPL")
    assert isinstance(tweets, list)
    assert tweets[0]["text"] == "tweet"
