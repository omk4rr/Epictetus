"""
OpenRouter LLM Client for MarketSentinel
Handles LLM calls for classification and summarization with system prompts and caching.
"""
import os
import logging
import requests
from cachetools import TTLCache
from typing import Any, Dict

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
# Support both OPENROUTER_BASE_URL and OPENROUTER_URL. If a /chat/completions endpoint is provided,
# keep it as-is; otherwise append the correct path when calling.
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL") or os.getenv("OPENROUTER_URL") or "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")

logger = logging.getLogger("openrouter_client")
cache = TTLCache(maxsize=128, ttl=60*60*24)  # 24h cache

class OpenRouterClient:
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or OPENROUTER_API_KEY
        self.model = model or OPENROUTER_MODEL

    def call_llm(self, prompt: str, system_prompt: str = None, temperature: float = 0.0, cache_key: str = None) -> Dict[str, Any]:
        """
        Calls OpenRouter LLM with prompt and system message. Caches response for efficiency.
        """
        if cache_key and cache_key in cache:
            return cache[cache_key]
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            # OpenRouter recommends these headers but they are optional for basic use
            "HTTP-Referer": os.getenv("OPENROUTER_REFERRER", "http://localhost"),
            "X-Title": os.getenv("OPENROUTER_X_TITLE", "MarketSentinel"),
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt or ""},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature,
            # Ask OpenRouter to include token/cost accounting when available
            "usage": {"include": True},
            # Provide a stable user identifier for better caching/analytics (optional)
            "user": os.getenv("OPENROUTER_USER", "marketsentinel-demo")
        }
        try:
            url = OPENROUTER_BASE_URL.rstrip("/")
            if not url.endswith("/chat/completions"):
                url = f"{url}/chat/completions"
            resp = requests.post(url, json=payload, headers=headers, timeout=30)
            resp.raise_for_status()
            result = resp.json()
            if cache_key:
                cache[cache_key] = result
            return result
        except Exception as e:
            logger.error(f"OpenRouter LLM call failed: {e}")
            return {"error": str(e)}

    def classify(self, prompt: str, system_prompt: str, cache_key: str = None) -> Dict[str, Any]:
        return self.call_llm(prompt, system_prompt, temperature=0.0, cache_key=cache_key)

    def summarize(self, prompt: str, system_prompt: str, cache_key: str = None) -> Dict[str, Any]:
        return self.call_llm(prompt, system_prompt, temperature=0.2, cache_key=cache_key)
