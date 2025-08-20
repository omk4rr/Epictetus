"""
Embeddings for MarketSentinel
Generates text embeddings using sentence-transformers.
"""
import logging
from typing import List

logger = logging.getLogger("embeddings")

class EmbeddingGenerator:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(model_name)
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            self.model = None

    def embed(self, texts: List[str]) -> List[list]:
        if not self.model:
            return [[] for _ in texts]
        return self.model.encode(texts, show_progress_bar=False).tolist()
