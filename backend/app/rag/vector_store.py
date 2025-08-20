"""
Vector Store for MarketSentinel
Stores and retrieves document embeddings using FAISS or Chroma.
"""
import logging
from typing import List

logger = logging.getLogger("vector_store")

class VectorStore:
    def __init__(self, dim: int = 384):
        try:
            import faiss
            self.index = faiss.IndexFlatL2(dim)
            self.docs = []
        except Exception as e:
            logger.error(f"Failed to initialize FAISS: {e}")
            self.index = None
            self.docs = []

    def add(self, embeddings: List[list], docs: List[dict]):
        if not self.index:
            return
        import numpy as np
        self.index.add(np.array(embeddings).astype('float32'))
        self.docs.extend(docs)

    def query(self, embedding: list, top_k: int = 3) -> List[dict]:
        if not self.index or not self.docs:
            return []
        import numpy as np
        D, I = self.index.search(np.array([embedding]).astype('float32'), top_k)
        return [self.docs[i] for i in I[0] if i < len(self.docs)]
