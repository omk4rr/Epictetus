"""
Supabase persistence helpers for MarketSentinel.
If SUPABASE_URL/KEY are not set or any call fails, functions fall back to in-memory lists.
"""
import os
import logging
from typing import List, Dict, Optional

logger = logging.getLogger("supabase_store")

_SUPABASE_URL = os.getenv("SUPABASE_URL")
_SUPABASE_KEY = os.getenv("SUPABASE_KEY")
_supabase = None

_inmem_watchlists = {"demo": []}

try:
    if _SUPABASE_URL and _SUPABASE_KEY:
        from supabase import create_client
        _supabase = create_client(_SUPABASE_URL, _SUPABASE_KEY)
except Exception as e:
    logger.warning(f"Supabase client init failed: {e}")
    _supabase = None


def _ensure_watchlist(user_id: str) -> Optional[str]:
    """Ensure a single default watchlist exists for user; return watchlist_id or None on failure."""
    if not _supabase:
        return None
    try:
        # Try to find existing
        data = _supabase.table("watchlists").select("id").eq("user_id", user_id).limit(1).execute()
        if data.data:
            return data.data[0]["id"]
        # Create new
        inserted = _supabase.table("watchlists").insert({"user_id": user_id, "name": "default"}).execute()
        return inserted.data[0]["id"] if inserted.data else None
    except Exception as e:
        logger.warning(f"_ensure_watchlist failed: {e}")
        return None


def get_watchlist(user_id: str) -> List[str]:
    if _supabase:
        try:
            wl_id = _ensure_watchlist(user_id)
            if not wl_id:
                return []
            res = _supabase.table("watchlist_tickers").select("ticker").eq("watchlist_id", wl_id).execute()
            return [row["ticker"] for row in (res.data or [])]
        except Exception as e:
            logger.warning(f"get_watchlist supabase failed: {e}")
    # Fallback
    return _inmem_watchlists.get(user_id, [])


def add_ticker(user_id: str, ticker: str) -> List[str]:
    if _supabase:
        try:
            wl_id = _ensure_watchlist(user_id)
            if wl_id:
                _supabase.table("watchlist_tickers").insert({"watchlist_id": wl_id, "ticker": ticker}).execute()
                return get_watchlist(user_id)
        except Exception as e:
            logger.warning(f"add_ticker supabase failed: {e}")
    # Fallback
    lst = _inmem_watchlists.setdefault(user_id, [])
    if ticker not in lst and len(lst) < 6:
        lst.append(ticker)
    return lst


def remove_ticker(user_id: str, ticker: str) -> List[str]:
    if _supabase:
        try:
            wl_id = _ensure_watchlist(user_id)
            if wl_id:
                _supabase.table("watchlist_tickers").delete().eq("watchlist_id", wl_id).eq("ticker", ticker).execute()
                return get_watchlist(user_id)
        except Exception as e:
            logger.warning(f"remove_ticker supabase failed: {e}")
    # Fallback
    lst = _inmem_watchlists.setdefault(user_id, [])
    if ticker in lst:
        lst.remove(ticker)
    return lst


def store_signals(signals: List[Dict]) -> None:
    if not _supabase:
        return
    try:
        rows = [
            {
                "ticker": s.get("ticker"),
                "signal_type": s.get("type"),
                "score": s.get("score"),
                "confidence": s.get("confidence"),
            }
            for s in signals
        ]
        # Insert ignoring errors
        if rows:
            _supabase.table("signals").insert(rows).execute()
    except Exception as e:
        logger.warning(f"store_signals supabase failed: {e}")
