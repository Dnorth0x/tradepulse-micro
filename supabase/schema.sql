-- Create tables for TradePulse Micro

-- Users table is handled by Supabase Auth

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  size NUMERIC NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  pnl NUMERIC,
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX trades_user_id_idx ON trades(user_id);
CREATE INDEX trades_symbol_idx ON trades(symbol);
CREATE INDEX trades_opened_at_idx ON trades(opened_at);

-- Symbols table
CREATE TABLE symbols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  market TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, ticker)
);

-- Create index on user_id for faster queries
CREATE INDEX symbols_user_id_idx ON symbols(user_id);

-- Macro news table
CREATE TABLE macro_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  headline TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  symbols TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on published_at for faster queries
CREATE INDEX macro_news_published_at_idx ON macro_news(published_at);

-- AI signals table
CREATE TABLE ai_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  rsi NUMERIC NOT NULL,
  macd NUMERIC NOT NULL,
  stoch NUMERIC NOT NULL,
  composite TEXT NOT NULL,
  gpt_summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on symbol and created_at for faster queries
CREATE INDEX ai_signals_symbol_idx ON ai_signals(symbol);
CREATE INDEX ai_signals_created_at_idx ON ai_signals(created_at);

-- Macro digest table
CREATE TABLE macro_digest (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  digest TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX macro_digest_created_at_idx ON macro_digest(created_at);

-- User profiles table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  disclaimer_agreed_at TIMESTAMPTZ,
  polygon_api_key TEXT,
  finnhub_api_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  plan TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);

-- Row Level Security Policies

-- Trades: Users can only access their own trades
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- Symbols: Users can only access their own symbols
ALTER TABLE symbols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own symbols"
  ON symbols FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symbols"
  ON symbols FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symbols"
  ON symbols FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symbols"
  ON symbols FOR DELETE
  USING (auth.uid() = user_id);

-- Macro news: Public read access
ALTER TABLE macro_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view macro news"
  ON macro_news FOR SELECT
  TO PUBLIC
  USING (true);

-- AI signals: Public read access
ALTER TABLE ai_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view AI signals"
  ON ai_signals FOR SELECT
  TO PUBLIC
  USING (true);

-- Macro digest: Public read access
ALTER TABLE macro_digest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view macro digest"
  ON macro_digest FOR SELECT
  TO PUBLIC
  USING (true);

-- User profiles: Users can only access their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Subscriptions: Users can only access their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);