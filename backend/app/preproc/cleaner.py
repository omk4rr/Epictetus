"""
Data Cleaner for MarketSentinel
Cleans, filters, and anonymizes ingested data from all sources (including 4chan).
"""
import logging
from typing import List, Dict
import re

logger = logging.getLogger("cleaner")

class DataCleaner:
    def clean(self, items: List[Dict]) -> List[Dict]:
        """
        Cleans, filters, and anonymizes a list of ingested items.
        Removes harmful/offensive content, normalizes text, and anonymizes personal data.
        """
        cleaned = []
        for item in items:
            text = item.get("text", "")
            # Remove offensive words (simple example, expand as needed)
            text = re.sub(r"\b(fuck|shit|nigger|fag|cunt|bitch|retard|nigga|faggot)\b", "[filtered]", text, flags=re.IGNORECASE)
            # Remove emails, IPs, and doxxing info
            text = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[anon_email]", text)
            text = re.sub(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "[anon_ip]", text)
            # Normalize whitespace
            text = re.sub(r"\s+", " ", text).strip()
            item["text"] = text
            cleaned.append(item)
        return cleaned
