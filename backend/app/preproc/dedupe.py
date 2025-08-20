"""
Deduplication for MarketSentinel
Removes duplicate items from ingested data based on text hash.
"""
import logging
from typing import List, Dict
import hashlib

logger = logging.getLogger("dedupe")

class DataDeduper:
    def dedupe(self, items: List[Dict]) -> List[Dict]:
        """
        Deduplicates a list of items based on text hash.
        """
        seen = set()
        deduped = []
        for item in items:
            text = item.get("text", "")
            h = hashlib.md5(text.encode("utf-8")).hexdigest()
            if h not in seen:
                seen.add(h)
                deduped.append(item)
        return deduped
