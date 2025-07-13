import { AiSignal } from "@/types";

// Mock AI signals data
const mockAiSignals: Record<string, AiSignal> = {
  "ES": {
    id: "1",
    symbol: "ES",
    rsi: 58.75,
    macd: 0.35,
    stoch: 65.20,
    composite: "📈",
    gpt_summary: "ES is showing bullish momentum with RSI approaching overbought territory. MACD is positive, confirming the uptrend. Consider trailing stops to protect profits.",
    created_at: new Date().toISOString(),
  },
  "NQ": {
    id: "2",
    symbol: "NQ",
    rsi: 72.30,
    macd: 0.85,
    stoch: 82.15,
    composite: "📈",
    gpt_summary: "NQ is in overbought territory with RSI above 70 and Stochastic above 80. While trend remains bullish, be cautious of potential short-term pullbacks.",
    created_at: new Date().toISOString(),
  },
  "BTC": {
    id: "3",
    symbol: "BTC",
    rsi: 42.60,
    macd: -0.25,
    stoch: 35.80,
    composite: "📉",
    gpt_summary: "BTC is showing bearish signals with MACD below zero and RSI in neutral-bearish range. Watch for potential support levels before considering long positions.",
    created_at: new Date().toISOString(),
  },
};

// Fetch AI signals for a symbol
export async function fetchAiSignals(symbol: string): Promise<AiSignal | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // In a real app, this would query Supabase
  return mockAiSignals[symbol] || null;
}

// Refresh AI signals (call Edge Function)
export async function refreshAiSignals(symbol: string): Promise<AiSignal> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would call the Edge Function
  // For demo, we'll create a new mock signal
  const newSignal: AiSignal = {
    id: `mock-${Date.now()}`,
    symbol,
    rsi: 40 + Math.random() * 30,
    macd: -0.5 + Math.random() * 1,
    stoch: 30 + Math.random() * 50,
    composite: Math.random() > 0.6 ? "📈" : Math.random() > 0.4 ? "📉" : "➖",
    gpt_summary: `Fresh analysis for ${symbol}: Technical indicators show ${
      Math.random() > 0.5 ? "improving momentum" : "mixed signals"
    }. RSI is ${Math.random() > 0.5 ? "neutral" : "approaching oversold"} while MACD is ${
      Math.random() > 0.5 ? "bullish" : "bearish"
    }. Monitor volume for confirmation.`,
    created_at: new Date().toISOString(),
  };
  
  mockAiSignals[symbol] = newSignal;
  return newSignal;
}