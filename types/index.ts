export interface User {
  id: string;
  email: string;
  disclaimer_agreed_at: string | null;
}

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  side: "BUY" | "SELL";
  size: number;
  entry_price: number;
  exit_price: number | null;
  pnl: number | null;
  opened_at: string;
  closed_at: string | null;
  notes?: string;
}

export interface Symbol {
  id: string;
  user_id: string;
  ticker: string;
  market: string;
  is_active: boolean;
}

export interface MacroNews {
  id: string;
  headline: string;
  url: string;
  published_at: string;
  symbols: string[];
}

export interface MacroDigest {
  id: string;
  digest: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface AiSignal {
  id: string;
  symbol: string;
  rsi: number;
  macd: number;
  stoch: number;
  composite: string;
  gpt_summary: string;
  created_at: string;
}

export interface TickerData {
  symbol: string;
  price: number;
  prevClose: number;
  volume?: number;
  high?: number;
  low?: number;
}

export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    buttonText: string;
    success: string;
    successLight: string;
    error: string;
    errorLight: string;
    warning: string;
    inputBackground: string;
    shadow: string;
  };
}