import { Trade } from "@/types";

export function parseCSV(csvContent: string): Trade[] {
  const lines = csvContent.split("\n");
  if (lines.length <= 1) return [];
  
  // Try to detect the CSV format
  const header = lines[0].toLowerCase();
  
  // Check if it's a TopStepX format
  if (header.includes("symbol") && header.includes("side") && header.includes("price")) {
    return parseTopStepXFormat(lines);
  }
  
  // Check if it's a NinjaTrader format
  if (header.includes("instrument") && header.includes("action") && header.includes("price")) {
    return parseNinjaTraderFormat(lines);
  }
  
  // Default generic format
  return parseGenericFormat(lines);
}

function parseTopStepXFormat(lines: string[]): Trade[] {
  const trades: Trade[] = [];
  const headerParts = lines[0].toLowerCase().split(",");
  
  // Find column indices
  const symbolIndex = headerParts.findIndex(h => h.includes("symbol"));
  const sideIndex = headerParts.findIndex(h => h.includes("side") || h.includes("direction"));
  const sizeIndex = headerParts.findIndex(h => h.includes("size") || h.includes("quantity"));
  const entryPriceIndex = headerParts.findIndex(h => h.includes("entry") && h.includes("price"));
  const exitPriceIndex = headerParts.findIndex(h => h.includes("exit") && h.includes("price"));
  const pnlIndex = headerParts.findIndex(h => h.includes("pnl") || h.includes("profit"));
  const openTimeIndex = headerParts.findIndex(h => h.includes("open") && (h.includes("time") || h.includes("date")));
  const closeTimeIndex = headerParts.findIndex(h => h.includes("close") && (h.includes("time") || h.includes("date")));
  const notesIndex = headerParts.findIndex(h => h.includes("note") || h.includes("comment"));
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(",");
    
    // Skip if not enough parts
    if (parts.length < Math.max(symbolIndex, sideIndex, sizeIndex, entryPriceIndex) + 1) {
      continue;
    }
    
    const symbol = symbolIndex >= 0 ? parts[symbolIndex].trim() : "UNKNOWN";
    let side = sideIndex >= 0 ? parts[sideIndex].trim().toUpperCase() : "BUY";
    
    // Normalize side
    if (side.includes("BUY") || side.includes("LONG")) {
      side = "BUY";
    } else if (side.includes("SELL") || side.includes("SHORT")) {
      side = "SELL";
    }
    
    const size = sizeIndex >= 0 ? parseFloat(parts[sizeIndex]) || 1 : 1;
    const entryPrice = entryPriceIndex >= 0 ? parseFloat(parts[entryPriceIndex]) || 0 : 0;
    const exitPrice = exitPriceIndex >= 0 && parts[exitPriceIndex] ? parseFloat(parts[exitPriceIndex]) : null;
    
    let pnl = null;
    if (pnlIndex >= 0 && parts[pnlIndex]) {
      pnl = parseFloat(parts[pnlIndex]);
    } else if (exitPrice !== null) {
      // Calculate P&L if not provided
      const multiplier = side === "BUY" ? 1 : -1;
      pnl = (exitPrice - entryPrice) * size * multiplier;
    }
    
    const openedAt = openTimeIndex >= 0 && parts[openTimeIndex] 
      ? new Date(parts[openTimeIndex]).toISOString() 
      : new Date().toISOString();
      
    const closedAt = exitPrice !== null && closeTimeIndex >= 0 && parts[closeTimeIndex]
      ? new Date(parts[closeTimeIndex]).toISOString()
      : exitPrice !== null ? new Date().toISOString() : null;
      
    const notes = notesIndex >= 0 ? parts[notesIndex] : "";
    
    trades.push({
      id: `import-${i}`,
      user_id: "", // Will be set by the caller
      symbol,
      side: side as "BUY" | "SELL",
      size,
      entry_price: entryPrice,
      exit_price: exitPrice,
      pnl,
      opened_at: openedAt,
      closed_at: closedAt,
      notes,
    });
  }
  
  return trades;
}

function parseNinjaTraderFormat(lines: string[]): Trade[] {
  const trades: Trade[] = [];
  const headerParts = lines[0].toLowerCase().split(",");
  
  // Find column indices
  const symbolIndex = headerParts.findIndex(h => h.includes("instrument"));
  const sideIndex = headerParts.findIndex(h => h.includes("action") || h.includes("type"));
  const sizeIndex = headerParts.findIndex(h => h.includes("quantity"));
  const priceIndex = headerParts.findIndex(h => h.includes("price"));
  const timeIndex = headerParts.findIndex(h => h.includes("time"));
  
  // Group entries and exits
  const tradeMap: Record<string, any> = {};
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(",");
    
    // Skip if not enough parts
    if (parts.length < Math.max(symbolIndex, sideIndex, sizeIndex, priceIndex, timeIndex) + 1) {
      continue;
    }
    
    const symbol = symbolIndex >= 0 ? parts[symbolIndex].trim() : "UNKNOWN";
    const action = sideIndex >= 0 ? parts[sideIndex].trim().toUpperCase() : "";
    const size = sizeIndex >= 0 ? parseFloat(parts[sizeIndex]) || 1 : 1;
    const price = priceIndex >= 0 ? parseFloat(parts[priceIndex]) || 0 : 0;
    const time = timeIndex >= 0 ? parts[timeIndex] : new Date().toISOString();
    
    // Generate a key for grouping related entries/exits
    const tradeKey = `${symbol}-${size}-${i}`;
    
    if (action.includes("BUY") || action.includes("SELL")) {
      // Entry
      tradeMap[tradeKey] = {
        symbol,
        side: action.includes("BUY") ? "BUY" : "SELL",
        size,
        entry_price: price,
        opened_at: time,
      };
    } else if (action.includes("EXIT") && tradeMap[tradeKey]) {
      // Exit
      tradeMap[tradeKey].exit_price = price;
      tradeMap[tradeKey].closed_at = time;
      
      // Calculate P&L
      const multiplier = tradeMap[tradeKey].side === "BUY" ? 1 : -1;
      tradeMap[tradeKey].pnl = (price - tradeMap[tradeKey].entry_price) * size * multiplier;
    }
  }
  
  // Convert to trades array
  Object.values(tradeMap).forEach((trade: any, index) => {
    if (trade.entry_price) {
      trades.push({
        id: `import-${index}`,
        user_id: "", // Will be set by the caller
        symbol: trade.symbol,
        side: trade.side,
        size: trade.size,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price || null,
        pnl: trade.pnl || null,
        opened_at: trade.opened_at,
        closed_at: trade.closed_at || null,
        notes: "",
      });
    }
  });
  
  return trades;
}

function parseGenericFormat(lines: string[]): Trade[] {
  const trades: Trade[] = [];
  const headerParts = lines[0].toLowerCase().split(",");
  
  // Find column indices
  const symbolIndex = headerParts.findIndex(h => h.includes("symbol"));
  const sideIndex = headerParts.findIndex(h => h.includes("side") || h.includes("direction"));
  const sizeIndex = headerParts.findIndex(h => h.includes("size") || h.includes("quantity"));
  const entryPriceIndex = headerParts.findIndex(h => h.includes("entry"));
  const exitPriceIndex = headerParts.findIndex(h => h.includes("exit"));
  const pnlIndex = headerParts.findIndex(h => h.includes("pnl") || h.includes("profit"));
  const openedAtIndex = headerParts.findIndex(h => h.includes("open"));
  const closedAtIndex = headerParts.findIndex(h => h.includes("close"));
  const notesIndex = headerParts.findIndex(h => h.includes("note"));
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(",");
    
    // Skip if not enough parts
    if (parts.length < Math.max(symbolIndex, sideIndex, sizeIndex, entryPriceIndex) + 1) {
      continue;
    }
    
    const symbol = symbolIndex >= 0 ? parts[symbolIndex].trim() : "UNKNOWN";
    let side = sideIndex >= 0 ? parts[sideIndex].trim().toUpperCase() : "BUY";
    
    // Normalize side
    if (side.includes("BUY") || side.includes("LONG")) {
      side = "BUY";
    } else if (side.includes("SELL") || side.includes("SHORT")) {
      side = "SELL";
    }
    
    const size = sizeIndex >= 0 ? parseFloat(parts[sizeIndex]) || 1 : 1;
    const entryPrice = entryPriceIndex >= 0 ? parseFloat(parts[entryPriceIndex]) || 0 : 0;
    const exitPrice = exitPriceIndex >= 0 && parts[exitPriceIndex] ? parseFloat(parts[exitPriceIndex]) : null;
    
    let pnl = null;
    if (pnlIndex >= 0 && parts[pnlIndex]) {
      pnl = parseFloat(parts[pnlIndex]);
    } else if (exitPrice !== null) {
      // Calculate P&L if not provided
      const multiplier = side === "BUY" ? 1 : -1;
      pnl = (exitPrice - entryPrice) * size * multiplier;
    }
    
    const openedAt = openedAtIndex >= 0 && parts[openedAtIndex] 
      ? new Date(parts[openedAtIndex]).toISOString() 
      : new Date().toISOString();
      
    const closedAt = exitPrice !== null && closedAtIndex >= 0 && parts[closedAtIndex]
      ? new Date(parts[closedAtIndex]).toISOString()
      : exitPrice !== null ? new Date().toISOString() : null;
      
    const notes = notesIndex >= 0 ? parts[notesIndex] : "";
    
    trades.push({
      id: `import-${i}`,
      user_id: "", // Will be set by the caller
      symbol,
      side: side as "BUY" | "SELL",
      size,
      entry_price: entryPrice,
      exit_price: exitPrice,
      pnl,
      opened_at: openedAt,
      closed_at: closedAt,
      notes,
    });
  }
  
  return trades;
}