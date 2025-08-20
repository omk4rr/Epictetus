# Epictetus — Market Sentiment & RAG Assistant (WIP)

Epictetus is a work-in-progress prototype for multi-source market sentiment analysis, retrieval-augmented generation (RAG), and lightweight backtesting. FastAPI powers the backend; the frontend is React (Vite). Outputs are research-only — not financial advice.

## Highlights
- FastAPI backend with REST + WebSockets
- RAG via LangChain + OpenRouter (OpenAI-compatible)
- Free/open sources: Google News RSS/CSE, Reddit (optional), 4chan, Slack (optional), YouTube transcripts, optional X via snscrape
- Sentiment ensemble (FinBERT + lexicon + optional LLM)
- Local FAISS vector store (persistence planned)
- Live dashboard feed and AI Chat
- Supabase persistence with graceful fallbacks

## Structure
- `backend/` — FastAPI app, clients, NLP, RAG, alerts, backtest, hft
- `src/` — React (Vite) frontend
- `supabase_schema.sql` — DB schema
- `notebooks/` — optional demos

Key files
- `backend/app/api/app.py` — endpoints `/v1/feed`, `/v1/rag_chat`, `/ws/*`, watchlist CRUD
- `backend/app/rag/langchain_rag.py` — FAISS + LangChain
- `backend/app/clients/openrouter_client.py` — OpenRouter client

## Requirements
- Python 3.12+
- Node 18+
- OpenRouter API key (LLM)
- Supabase project (optional)

Install backend deps (CPU-only Torch pinned in `requirements.txt`).

## Environment
Create a `.env` (do not commit). See `.env.example`. Minimal:

```
VITE_BACKEND_URL=http://127.0.0.1:8000
FRONTEND_URL=http://127.0.0.1:5173
FRONTEND_ORIGINS=http://127.0.0.1:5173,http://localhost:5173

OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-oss-20b:free

# Optional Google CSE (falls back to RSS if omitted)
GOOGLE_SEARCH_API_KEY=
GOOGLE_CSE_ID=

# Optional Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

Security
- `.env` is ignored by `.gitignore`. Never commit secrets.

## Run locally
Backend:
```
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.api.app:app --reload
```
Frontend:
```
npm install
npm run dev
```
Open `http://127.0.0.1:5173`.

Sanity checks:
```
curl -s http://127.0.0.1:8000/v1/health
curl -s http://127.0.0.1:8000/v1/llm_diagnostics
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"query":"What moved AAPL today?","web_search":true}' \
  http://127.0.0.1:8000/v1/rag_chat
curl -s http://127.0.0.1:8000/v1/feed
```

## Deploy
- Backend: Render (set env vars; start: `uvicorn backend.app.api.app:app --host 0.0.0.0 --port 10000`)
- Frontend: Vercel (set `VITE_BACKEND_URL` to backend URL)
Ensure CORS envs match deployed domains.

## Roadmap (WIP)
- Persist FAISS index to disk + batch indexing
- Explain-Signal endpoint with citations
- Async Reddit client; better backoffs
- Supabase-backed rate limiting/job coordination
- Agent tools for web retrieval

## Troubleshooting
- Blank feed → check `/v1/feed` and `VITE_BACKEND_URL`
- 401 from OpenRouter → rotate key or restart after updating `.env`
- WebSocket errors → http↔ws, https↔wss scheme match

## License
MIT
