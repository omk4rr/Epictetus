import pytest
from backend.app.clients.openrouter_client import OpenRouterClient

def test_openrouter_cache(monkeypatch):
    client = OpenRouterClient(api_key="demo-key")
    # Patch call_llm to simulate cache
    monkeypatch.setattr(client, "call_llm", lambda *a, **kw: {"result": "ok"})
    result = client.classify("prompt", "system", cache_key="foo")
    assert result["result"] == "ok"

def test_openrouter_error(monkeypatch):
    client = OpenRouterClient(api_key="demo-key")
    monkeypatch.setattr(client, "call_llm", lambda *a, **kw: {"error": "fail"})
    result = client.classify("prompt", "system", cache_key="bar")
    assert "error" in result
