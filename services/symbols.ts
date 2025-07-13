import { Symbol } from "@/types";

// Mock symbols data
const mockSymbols: Symbol[] = [
  {
    id: "1",
    user_id: "user-1",
    ticker: "ES",
    market: "FUT",
    is_active: true,
  },
  {
    id: "2",
    user_id: "user-1",
    ticker: "NQ",
    market: "FUT",
    is_active: true,
  },
  {
    id: "3",
    user_id: "user-1",
    ticker: "BTC",
    market: "CRYPTO",
    is_active: true,
  },
  {
    id: "4",
    user_id: "user-1",
    ticker: "AAPL",
    market: "STOCK",
    is_active: true,
  },
  {
    id: "5",
    user_id: "user-1",
    ticker: "EURUSD",
    market: "FOREX",
    is_active: true,
  },
];

// Fetch symbols for a user
export async function fetchSymbols(userId?: string): Promise<Symbol[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!userId) return [];
  
  // In a real app, this would query Supabase
  return mockSymbols.filter(s => s.is_active);
}

// Create a new symbol
export async function createSymbol(symbol: Omit<Symbol, "id">): Promise<Symbol> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would insert into Supabase
  const newSymbol: Symbol = {
    ...symbol,
    id: `mock-${Date.now()}`,
  };
  
  mockSymbols.push(newSymbol);
  return newSymbol;
}

// Update a symbol
export async function updateSymbol(symbol: Symbol): Promise<Symbol> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would update in Supabase
  const index = mockSymbols.findIndex(s => s.id === symbol.id);
  if (index !== -1) {
    mockSymbols[index] = symbol;
  }
  
  return symbol;
}

// Delete a symbol
export async function deleteSymbol(id: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would delete from Supabase
  const index = mockSymbols.findIndex(s => s.id === id);
  if (index !== -1) {
    mockSymbols.splice(index, 1);
  }
}