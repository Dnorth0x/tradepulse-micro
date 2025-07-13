import { Trade } from "@/types";

// In a real app, these would use Supabase queries
// For demo purposes, we'll use mock data and localStorage

// Mock trades data
const mockTrades: Trade[] = [
  {
    id: "1",
    user_id: "user-1",
    symbol: "ES",
    side: "BUY",
    size: 2,
    entry_price: 4180.25,
    exit_price: 4195.50,
    pnl: 30.50,
    opened_at: "2023-07-10T09:30:00Z",
    closed_at: "2023-07-10T11:45:00Z",
    notes: "Bought on support level, sold at resistance. Market showed strong momentum after Fed announcement.",
  },
  {
    id: "2",
    user_id: "user-1",
    symbol: "NQ",
    side: "SELL",
    size: 1,
    entry_price: 14520.75,
    exit_price: 14480.25,
    pnl: 40.50,
    opened_at: "2023-07-11T10:15:00Z",
    closed_at: "2023-07-11T12:30:00Z",
    notes: "Shorted at daily high, covered near VWAP.",
  },
  {
    id: "3",
    user_id: "user-1",
    symbol: "BTC",
    side: "BUY",
    size: 0.5,
    entry_price: 34800.00,
    exit_price: 34750.00,
    pnl: -25.00,
    opened_at: "2023-07-12T14:00:00Z",
    closed_at: "2023-07-12T16:30:00Z",
    notes: "Stopped out on false breakout.",
  },
];

// Fetch trades for a user
export async function fetchTrades(userId?: string): Promise<Trade[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!userId) return [];
  
  // In a real app, this would query Supabase
  return mockTrades;
}

// Fetch a single trade by ID
export async function fetchTrade(id: string): Promise<Trade | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In a real app, this would query Supabase
  const trade = mockTrades.find(t => t.id === id);
  return trade || null;
}

// Create a new trade
export async function createTrade(trade: Omit<Trade, "id">): Promise<Trade> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would insert into Supabase
  const newTrade: Trade = {
    ...trade,
    id: `mock-${Date.now()}`,
  };
  
  mockTrades.push(newTrade);
  return newTrade;
}

// Update an existing trade
export async function updateTrade(trade: Trade): Promise<Trade> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would update in Supabase
  const index = mockTrades.findIndex(t => t.id === trade.id);
  if (index !== -1) {
    mockTrades[index] = trade;
  }
  
  return trade;
}

// Delete a trade
export async function deleteTrade(id: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would delete from Supabase
  const index = mockTrades.findIndex(t => t.id === id);
  if (index !== -1) {
    mockTrades.splice(index, 1);
  }
}

// Bulk import trades
export async function bulkImportTrades(trades: Omit<Trade, "id">[]): Promise<Trade[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would bulk insert into Supabase
  const newTrades: Trade[] = trades.map(trade => ({
    ...trade,
    id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  }));
  
  mockTrades.push(...newTrades);
  return newTrades;
}