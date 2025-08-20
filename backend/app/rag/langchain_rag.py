"""
LangChain RAG Helper for MarketSentinel
Builds a FAISS vector store over provided documents and answers queries using a RetrievalQA chain.
Uses HuggingFace (sentence-transformers/all-MiniLM-L6-v2) embeddings (free) and ChatOpenAI with
OpenRouter (via OpenAI-compatible base URL).
"""
from typing import List, Dict
import os
import logging

logger = logging.getLogger("langchain_rag")

class RAGPipeline:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.vectorstore = None
        self.retriever = None
        self.chain = None

    def _to_documents(self, items: List[Dict]):
        try:
            from langchain_core.documents import Document
        except Exception:
            # older versions
            from langchain.schema import Document  # type: ignore
        docs = []
        for it in items:
            text = it.get("text") or it.get("summary") or it.get("snippet") or ""
            meta = {k: v for k, v in it.items() if k != "text"}
            if text:
                docs.append(Document(page_content=text, metadata=meta))
        return docs

    def index(self, docs_like: List[Dict]):
        try:
            try:
                from langchain_huggingface import HuggingFaceEmbeddings  # preferred
            except Exception:
                from langchain_community.embeddings import HuggingFaceEmbeddings  # fallback
            from langchain_community.vectorstores import FAISS
            from langchain.text_splitter import RecursiveCharacterTextSplitter
        except Exception as e:
            logger.error(f"LangChain not available: {e}")
            return False
        docs = self._to_documents(docs_like)
        if not docs:
            return False
        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=160)
        chunks = splitter.split_documents(docs)
        embeddings = HuggingFaceEmbeddings(model_name=self.model_name)
        self.vectorstore = FAISS.from_documents(chunks, embeddings)
        self.retriever = self.vectorstore.as_retriever()
        return True

    def make_chain(self, temperature: float = 0.0):
        try:
            # Map OpenRouter -> OpenAI-compatible env expected by langchain-openai
            # Always map when OPENROUTER_API_KEY is present to avoid misconfig
            if os.getenv("OPENROUTER_API_KEY"):
                os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY", "")
                # Prefer OPENROUTER_BASE_URL (root), fallback to trimming OPENROUTER_URL
                base = os.getenv("OPENROUTER_BASE_URL") or os.getenv("OPENROUTER_URL") or ""
                if base:
                    base = base.rstrip("/")
                    if base.endswith("/chat/completions"):
                        base = base.rsplit("/chat/completions", 1)[0]
                os.environ["OPENAI_BASE_URL"] = base or "https://openrouter.ai/api/v1"
            from langchain_openai import ChatOpenAI
            from langchain.chains import RetrievalQA
        except Exception as e:
            logger.error(f"LangChain LLM not available: {e}")
            return False
        if not self.retriever:
            return False
        model = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")
        # Pass base_url explicitly to avoid relying solely on env propagation
        base_url = os.environ.get("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
        llm = ChatOpenAI(model=model, temperature=temperature, base_url=base_url)
        self.chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=self.retriever)
        return True

    def answer(self, query: str) -> Dict:
        if not self.chain:
            return {"result": "RAG not initialized", "sources": []}
        res = self.chain.invoke({"query": query})
        # LangChain returns {"result": str, "source_documents": [...]} in some versions
        answer = res.get("result") or res
        sources = []
        for d in res.get("source_documents", []) or []:
            src = {"text": getattr(d, "page_content", ""), **(getattr(d, "metadata", {}) or {})}
            sources.append(src)
        return {"result": answer, "sources": sources}
