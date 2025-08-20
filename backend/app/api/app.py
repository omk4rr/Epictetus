"""
MarketSentinel FastAPI Application
Exposes REST and GraphQL endpoints for ingestion, signals, watchlist, live feed, backtest, explainability, and settings.
"""
import os
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, APIRouter, Query, Request, WebSocket, WebSocketDisconnect, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import asyncio
import time
from collections import defaultdict
from uuid import uuid4
from datetime import datetime, timezone
import re
from backend.app.clients.web_search_client import WebSearchClient
from backend.app.clients.fourchan_client import FourChanClient
from backend.app.preproc.cleaner import DataCleaner
from backend.app.nlp.sentiment import SentimentEnsemble
from backend.app.clients.reddit_client import RedditClient
from backend.app.clients.x_client import XClient
from backend.app.clients.slack_client import SlackClient
from backend.app.clients.openrouter_client import OpenRouterClient
from backend.app.nlp.llm_prompts import SYSTEM_PROMPT
import httpx
from backend.app.services.supabase_store import get_watchlist as sb_get_watchlist, add_ticker as sb_add_ticker, remove_ticker as sb_remove_ticker, store_signals as sb_store_signals
from backend.app.rag.langchain_rag import RAGPipeline

app = FastAPI(
    title="MarketSentinel API",
    description="Production-oriented prototype for multi-source market sentiment, event extraction, and backtesting.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS for frontend integration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
FRONTEND_ORIGINS = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL.strip()] + [o.strip() for o in FRONTEND_ORIGINS if o.strip()],
    allow_origin_regex=r"http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory rate limiting (for demo only; replace with Supabase-based for production)
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "100"))
RATE_PERIOD = int(os.getenv("RATE_PERIOD", "60"))  # seconds
rate_limit_store = defaultdict(list)
NEWS_CACHE_TTL = int(os.getenv("NEWS_CACHE_TTL", "60"))
_news_cache = {"ts": 0.0, "items": []}

def check_rate_limit(ip: str, endpoint: str) -> bool:
    now = time.time()
    window = now - RATE_PERIOD
    rate_limit_store[(ip, endpoint)] = [t for t in rate_limit_store[(ip, endpoint)] if t > window]
    if len(rate_limit_store[(ip, endpoint)]) >= RATE_LIMIT:
        return False
    rate_limit_store[(ip, endpoint)].append(now)
    return True

api_router = APIRouter(prefix="/v1")

@api_router.get("/health", tags=["Health"])
def health_check(request: Request):
    """Health check endpoint."""
    return {"status": "ok"}

TICKERS_DEFAULT = ["AAPL", "TSLA", "MSFT", "RELIANCE.NS"]

# Helper aggregation

def aggregate_signals_from_items(analyzed_items, tickers):
    per_ticker = {t: {"score_sum": 0.0, "count": 0} for t in tickers}
    for item in analyzed_items:
        text = item.get("text", "")
        for t in tickers:
            if re.search(rf"\b{re.escape(t.split('.')[0])}\b", text, flags=re.IGNORECASE):
                per_ticker[t]["score_sum"] += float(item.get("sentiment", 0.0))
                per_ticker[t]["count"] += 1
    signals = []
    now = datetime.now(timezone.utc).isoformat()
    for t, agg in per_ticker.items():
        count = max(agg["count"], 1)
        score = agg["score_sum"] / count
        signal_type = "bullish" if score > 0.6 else ("bearish" if score < 0.4 else "neutral")
        confidence = abs(score - 0.5) * 2  # 0 to 1
        signals.append({
            "id": str(uuid4()),
            "ticker": t,
            "type": signal_type,
            "score": round(score, 2),
            "confidence": round(confidence, 2),
            "action": "buy" if signal_type == "bullish" else ("short" if signal_type == "bearish" else "hold"),
            "timestamp": now,
            "evidenceCount": agg["count"],
        })
    return signals


def get_latest_signals_from_sources(tickers):
    fourchan = FourChanClient()
    reddit = RedditClient()
    use_x = os.getenv("USE_X_SCRAPE", "false").lower() == "true"
    xclient = XClient() if use_x else None
    slack = SlackClient()
    websearch = WebSearchClient()
    cleaner = DataCleaner()
    sentiment = SentimentEnsemble()

    # 4chan
    catalog = fourchan.fetch_board_catalog("biz")
    posts = []
    for page in catalog[:1]:
        for thread in page.get("threads", []):
            posts += fourchan.fetch_thread_posts("biz", thread.get("no"))
    fourchan_items = [{**p, "text": p.get("com", ""), "source": "4chan"} for p in posts if p.get("com")]

    # Reddit (fallback if Pushshift 403)
    try:
        reddit_items_raw = reddit.fetch_posts_for_tickers(tickers, max_results=20)
        reddit_items = [{"text": p.get("title", "") + " " + p.get("selftext", ""), "source": "reddit"} for p in reddit_items_raw]
    except Exception:
        reddit_items = []

    # X.com (optional)
    x_items = []
    if use_x and xclient is not None:
        try:
            x_items_raw = xclient.fetch_tweets_for_tickers(tickers, max_results=20)
            x_items = [{"text": t.get("content", ""), "source": "x.com"} for t in x_items_raw]
        except Exception:
            x_items = []

    # Slack
    slack_items = []
    for ticker in tickers:
        try:
            slack_items += [{"text": m.get("text", ""), "source": "slack"} for m in slack.fetch_messages_for_tickers("general", [ticker], max_results=10)]
        except Exception:
            pass

    # Google News
    news_items = [{"text": n.get("title", "") + " " + n.get("summary", ""), "source": "news"} for n in websearch.fetch_news_for_tickers(tickers, max_results=10)]

    all_items = fourchan_items + reddit_items + x_items + slack_items + news_items
    cleaned = cleaner.clean(all_items)
    analyzed = sentiment.compute_sentiment(cleaned)
    return analyzed

@api_router.get("/signals", tags=["Signals"])
def get_signals(request: Request, watchlist_id: str = Query("demo", description="Watchlist ID")):
    ip = request.client.host
    if not check_rate_limit(ip, "/signals"):
        return JSONResponse(status_code=429, content={"error": "Rate limit exceeded"})
    tickers = TICKERS_DEFAULT
    analyzed = get_latest_signals_from_sources(tickers)
    signals = aggregate_signals_from_items(analyzed, tickers)
    sample_response = {
        "disclaimer": "This is a research prototype — not financial advice.",
        "watchlist_id": watchlist_id,
        "ranked_tickers": signals,
        "global_confidence": sum(s["confidence"] for s in signals) / len(signals) if signals else 0.0,
        "explainability": {
            "ensemble_weights": {"finbert": 0.5, "llm": 0.3, "lexicon": 0.2},
            "top_sentences": [],
            "agreement_score": 0.0
        }
    }
    return JSONResponse(content=sample_response)

@api_router.get("/web_search", tags=["Web Search"])
def web_search(request: Request, query: str, max_results: int = 5):
    ip = request.client.host
    if not check_rate_limit(ip, "/web_search"):
        return JSONResponse(status_code=429, content={"error": "Rate limit exceeded"})
    web_search_client = WebSearchClient()
    results = web_search_client.search(query, max_results)
    sample_response = {
        "query": query,
        "results": results[:max_results],
        "provider": getattr(web_search_client, "provider", "google")
    }
    return JSONResponse(content=sample_response)

ALERT_WEBHOOK_URL = os.getenv("ALERT_WEBHOOK_URL")

# Watchlist endpoints (in-memory demo)
user_watchlists = {}

@api_router.get("/watchlist", tags=["Watchlist"])
def get_watchlist(user_id: str = "demo"):
    return {"watchlist": sb_get_watchlist(user_id)}

@api_router.post("/watchlist/add", tags=["Watchlist"])
def add_to_watchlist(payload: dict = Body(...), user_id: str = "demo"):
    ticker = payload.get("ticker")
    if not ticker:
        return {"success": False, "message": "ticker is required"}
    new_list = sb_add_ticker(user_id, ticker)
    return {"watchlist": new_list, "success": True}

@api_router.post("/watchlist/remove", tags=["Watchlist"])
def remove_from_watchlist(payload: dict = Body(...), user_id: str = "demo"):
    ticker = payload.get("ticker")
    if not ticker:
        return {"success": False, "message": "ticker is required"}
    new_list = sb_remove_ticker(user_id, ticker)
    return {"watchlist": new_list, "success": True}

@api_router.options("/chat")
def chat_options():
    return JSONResponse(content={"ok": True})

@api_router.post("/chat", tags=["Chat"])
def chat_endpoint(payload: dict = Body(...)):
    query = payload.get("query", "").strip()
    tickers = payload.get("tickers") or TICKERS_DEFAULT
    if not query:
        return JSONResponse(status_code=400, content={"error": "query is required"})
    # Build context from current analyzed items
    analyzed = get_latest_signals_from_sources(tickers)
    # Add web search context (real-time)
    websearch = WebSearchClient()
    web_docs = websearch.search(query, max_results=5)
    citations = [
        {"title": d.get("title"), "url": d.get("url"), "snippet": d.get("snippet", d.get("summary", ""))}
        for d in (web_docs or [])
    ]
    news_ctx = "\n".join([f"- {c['title']} ({c['url']}): {c['snippet']}" for c in citations[:3]])

    context = "\n".join([item.get("text", "") for item in analyzed[:20]])
    prompt = (
        f"User query: {query}\n\nRecent market chatter/news context:\n{context}\n\n"
        f"Top web results (include citations in your reasoning):\n{news_ctx}\n\n"
        f"Return a concise summary and trade ideas (JSON)."
    )
    llm = OpenRouterClient()
    llm_response = llm.summarize(prompt, SYSTEM_PROMPT)
    summary = None
    if isinstance(llm_response, dict) and "choices" in llm_response:
        summary = llm_response.get("choices", [{}])[0].get("message", {}).get("content")
    if not summary:
        agg = aggregate_signals_from_items(analyzed, tickers)
        ranked = sorted(agg, key=lambda x: x["score"], reverse=True)[:3]
        summary = "; ".join([f"{r['ticker']}: {r['type']} ({r['score']})" for r in ranked]) or "No data"
    response = {
        "chat_id": str(uuid4()),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "query": query,
        "summary": summary,
        "disclaimer": "This is a research prototype — not financial advice.",
        "recommendations": [
            {
                "ticker": s["ticker"],
                "action": "buy" if s["type"] == "bullish" else ("short" if s["type"] == "bearish" else "hold"),
                "score": s["score"],
                "confidence": s["confidence"],
                "rationale": f"Aggregated sentiment {s['type']} with score {s['score']}",
                "drivers": citations[:3],
                "llm_json": llm_response,
            }
            for s in aggregate_signals_from_items(analyzed, tickers)[:6]
        ],
        "global_confidence": 0.0,
        "explainability": {
            "ensemble": {"finbert": 0.5, "llm": 0.3, "lexicon": 0.2},
            "top_contributing_sentences": [],
        },
        "notes": {
            "politician_claims_policy": "verify with official filings",
            "data_retention_hint": "posts summarized and anonymized",
        },
    }
    return response

@api_router.post("/rag_chat", tags=["Chat"])
def rag_chat(payload: dict = Body(...)):
    query = payload.get("query", "").strip()
    tickers = payload.get("tickers") or TICKERS_DEFAULT
    use_web = bool(payload.get("web_search", False))
    if not query:
        return JSONResponse(status_code=400, content={"error": "query is required"})
    # Gather recent items + web docs
    analyzed = []
    try:
        analyzed = get_latest_signals_from_sources(tickers)
    except Exception as e:
        analyzed = []
    web_docs = []
    if use_web:
        websearch = WebSearchClient()
        try:
            web_docs = websearch.search(query, max_results=5) or []
        except Exception:
            web_docs = []
    # Build RAG index
    rag = RAGPipeline()
    indexed = rag.index((analyzed or []) + (web_docs or []))
    if not indexed:
        return {"result": "No context available", "sources": []}
    ok = rag.make_chain(temperature=0.0)
    if not ok:
        return {"result": "RAG model unavailable", "sources": []}
    try:
        res = rag.answer(query)
    except Exception as e:
        # Never let this crash the API; return graceful error to avoid frontend blank
        res = {"result": f"RAG error: {str(e)}", "sources": []}
    # Normalize to ChatResponse-like shape expected by the frontend
    summary = res.get("result") if isinstance(res, dict) else str(res)
    # Fallback: if RAG failed or provided empty/diagnostic text, synthesize a summary from aggregates
    if not summary or str(summary).lower().startswith("rag error") or str(summary).lower().startswith("rag model"):
        agg = aggregate_signals_from_items(analyzed or [], tickers)
        ranked = sorted(agg, key=lambda x: x["score"], reverse=True)[:3]
        summary = "; ".join([f"{r['ticker']}: {r['type']} ({r['score']})" for r in ranked]) or "No data"
    normalized = {
        "chat_id": str(uuid4()),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "query": query,
        "summary": summary or "No answer",
        "disclaimer": "This is a research prototype — not financial advice.",
        "recommendations": [],
        "global_confidence": 0.0,
        "explainability": {
            "ensemble": {"finbert": 0.5, "llm": 0.3, "lexicon": 0.2},
            "top_contributing_sentences": [],
        },
        "notes": {
            "politician_claims_policy": "verify with official filings",
            "data_retention_hint": "posts summarized and anonymized",
        },
        "sources": res.get("sources", []) if isinstance(res, dict) else [],
    }
    return normalized

@api_router.get("/llm_diagnostics", tags=["Health"])
def llm_diagnostics():
    """Quick check that the backend has LLM credentials and base URL configured."""
    from backend.app.clients.openrouter_client import OPENROUTER_MODEL
    return {
        "has_api_key": bool(os.getenv("OPENROUTER_API_KEY")),
        "base_url": os.getenv("OPENROUTER_BASE_URL") or os.getenv("OPENROUTER_URL"),
        "model": os.getenv("OPENROUTER_MODEL", OPENROUTER_MODEL),
    }

@api_router.get("/feed", tags=["Feed"])
def get_feed(tickers: Optional[str] = None, limit: int = 30, fast: bool = True):
    tickers_list = (tickers.split(",") if tickers else TICKERS_DEFAULT)[:6]
    websearch = WebSearchClient()
    # Use a small in-memory cache to speed up repeated requests
    now_ts = time.time()
    news: list = []
    if _news_cache["items"] and (now_ts - _news_cache["ts"]) < NEWS_CACHE_TTL:
        news = _news_cache["items"]
    else:
        news = websearch.fetch_news_for_tickers(tickers_list, max_results=10)
    # Fallback: if RSS returns nothing (network/country constraints), use web search per ticker
    if not news:
        try:
            fallback_news = []
            for t in tickers_list:
                q = f"{t} stock latest"
                docs = websearch.search(q, max_results=5) or []
                for d in docs:
                    fallback_news.append({
                        "title": d.get("title", ""),
                        "url": d.get("url", ""),
                        "published": datetime.now(timezone.utc).isoformat(),
                        "summary": d.get("snippet", d.get("summary", ""))
                    })
            news = fallback_news
        except Exception:
            news = []
    # Last resort: general market headlines so UI isn't empty
    if not news:
        try:
            general_queries = ["stock market", "finance news", "global markets"]
            general_news = []
            for q in general_queries:
                for d in websearch.fetch_google_news_by_query(q, max_results=5) or []:
                    general_news.append(d)
            news = general_news
        except Exception:
            news = []
    analyzed = []
    if not fast:
        try:
            analyzed = get_latest_signals_from_sources(tickers_list)
        except Exception:
            analyzed = []
    # Normalize
    items = []
    for n in news:
        items.append({
            "id": str(uuid4()),
            "source": "news",
            "title": n.get("title", ""),
            "summary": n.get("summary", ""),
            "sentiment": "neutral",
            "confidence": 0.5,
            "timestamp": n.get("published", datetime.now(timezone.utc).isoformat()),
            "url": n.get("url", ""),
            "entities": [],
            "trustScore": "high",
        })
    for a in analyzed:
        src = a.get("source", "news")
        # Normalize source keys for frontend filters
        if src in ["x.com", "x", "twitter", "tweet"]:
            src = "twitter"
        elif src in ["yt", "youtube", "video"]:
            src = "youtube"
        elif src in ["reddit", "r/"]:
            src = "reddit"
        items.append({
            "id": str(uuid4()),
            "source": src,
            "title": a.get("text", "")[0:120] or "Market item",
            "summary": a.get("text", "")[0:240],
            "sentiment": "positive" if a.get("sentiment", 0.5) > 0.6 else ("negative" if a.get("sentiment", 0.5) < 0.4 else "neutral"),
            "confidence": float(a.get("sentiment", 0.5)),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "url": a.get("url", ""),
            "entities": a.get("entities", []),
            "trustScore": "medium",
        })
    # Sort by timestamp desc and trim
    try:
        items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    except Exception:
        pass
    # update cache
    _news_cache["items"] = news
    _news_cache["ts"] = now_ts
    return items[:limit]

app.include_router(api_router)

# Realtime websockets
@app.websocket("/ws/signals")
async def websocket_signals(websocket: WebSocket):
    await websocket.accept()
    last_sent = None
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            while True:
                tickers = TICKERS_DEFAULT
                try:
                    analyzed = get_latest_signals_from_sources(tickers)
                except Exception:
                    analyzed = []
                signals = aggregate_signals_from_items(analyzed, tickers)
                # persist
                try:
                    sb_store_signals(signals)
                except Exception:
                    pass
                await websocket.send_json(signals)
                # Optional webhook alerts
                if ALERT_WEBHOOK_URL:
                    high_conf = [s for s in signals if s["confidence"] >= 0.7]
                    payload = {"type": "signals_alert", "signals": high_conf}
                    try:
                        if high_conf and payload != last_sent:
                            await client.post(ALERT_WEBHOOK_URL, json=payload)
                            last_sent = payload
                    except Exception:
                        pass
                await asyncio.sleep(15)
    except WebSocketDisconnect:
        pass
    except Exception:
        # Prevent crashing the connection on unexpected errors
        try:
            await websocket.close()
        except Exception:
            pass

@app.websocket("/ws/insights")
async def websocket_insights(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Fetch and preprocess data from all sources
            tickers = TICKERS_DEFAULT
            try:
                analyzed = get_latest_signals_from_sources(tickers)
            except Exception:
                analyzed = []
            # LLM summary using OpenRouter, with fallback if unauthorized
            llm = OpenRouterClient()
            context = "\n".join([item.get("text", "") for item in analyzed[:20]])
            prompt = f"Summarize the current market sentiment and key events based on the following posts:\n{context}"
            try:
                llm_response = llm.summarize(prompt, SYSTEM_PROMPT)
            except Exception:
                llm_response = {"error": "llm call failed"}
            summary = None
            if isinstance(llm_response, dict) and "choices" in llm_response:
                summary = llm_response.get("choices", [{}])[0].get("message", {}).get("content")
            if not summary:
                # Fallback summary from aggregates
                agg = aggregate_signals_from_items(analyzed, tickers)
                ranked = sorted(agg, key=lambda x: x["score"], reverse=True)[:3]
                summary = "; ".join([f"{r['ticker']}: {r['type']} ({r['score']})" for r in ranked]) or "No data"
            insights = {
                "summary": summary,
                "top_sentiments": aggregate_signals_from_items(analyzed, tickers)[:5],
                "sources": list({item.get("source", "unknown") for item in analyzed[:5]}),
            }
            try:
                await websocket.send_json(insights)
            except Exception:
                pass
            await asyncio.sleep(15)
    except WebSocketDisconnect:
        pass
    except Exception:
        try:
            await websocket.close()
        except Exception:
            pass

# Note: Add webhook posting inside websocket loops when ALERT_WEBHOOK_URL is set to broadcast high-confidence signals.
# Note: X/Twitter scraping is disabled by default via USE_X_SCRAPE=false.
