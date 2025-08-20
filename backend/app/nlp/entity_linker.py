"""
Entity Linker for MarketSentinel
Links named entities in text to stock tickers using spaCy.
"""
import logging
from typing import List, Dict
import spacy

logger = logging.getLogger("entity_linker")

class EntityLinker:
    def __init__(self, model: str = "en_core_web_sm"):
        self.nlp = spacy.load(model)

    def link_entities(self, items: List[Dict], tickers: List[str]) -> List[Dict]:
        """
        Links entities in items to provided tickers.
        """
        for item in items:
            doc = self.nlp(item.get("text", ""))
            item["entities"] = [ent.text for ent in doc.ents if ent.label_ in ("ORG", "PRODUCT") and any(t in ent.text for t in tickers)]
        return items
