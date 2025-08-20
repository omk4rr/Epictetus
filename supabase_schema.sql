-- Supabase/Postgres schema for MarketSentinel

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlist_tickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id UUID REFERENCES watchlists(id),
    ticker TEXT NOT NULL,
    exchange TEXT,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS raw_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    raw_json JSONB NOT NULL,
    source_id TEXT,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker TEXT NOT NULL,
    title TEXT,
    url TEXT,
    text TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    source_trust FLOAT,
    embedding VECTOR(384),
    -- 384 dims for MiniLM; adjust as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nlp_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES raw_items(id),
    ticker_candidates TEXT[],
    summary TEXT,
    sentiment_score FLOAT,
    event_type TEXT,
    llm_response JSONB,
    confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker TEXT NOT NULL,
    signal_type TEXT,
    score FLOAT,
    confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    evidence_ids UUID[]
);

CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker TEXT NOT NULL,
    entry_time TIMESTAMP WITH TIME ZONE,
    entry_price FLOAT,
    exit_time TIMESTAMP WITH TIME ZONE,
    exit_price FLOAT,
    pnl FLOAT
);
