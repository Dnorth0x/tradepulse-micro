import { useEffect, useState, useRef, useCallback } from "react";
import { Platform } from "react-native";
import { TickerData } from "@/types";

interface PolygonTickerMessage {
  ev: string; // Event type
  sym: string; // Symbol
  c: number; // Close/Current price
  h: number; // High
  l: number; // Low
  v: number; // Volume
  o: number; // Open
  vw: number; // Volume weighted average price
  t: number; // Timestamp
}

interface FinnhubQuote {
  c: number; // Current price
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export function usePolygonTicker(symbol: string) {
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Fallback to Finnhub REST API
  const fetchFinnhubData = useCallback(async () => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_FINNHUB_API_KEY || "demo";
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: FinnhubQuote = await response.json();
      
      const tickerData: TickerData = {
        symbol,
        price: data.c,
        prevClose: data.pc,
        volume: 0, // Finnhub doesn't provide volume in quote endpoint
        high: data.h,
        low: data.l,
      };
      
      setTickerData(tickerData);
      setError(null);
    } catch (err) {
      console.error("Finnhub API error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    }
  }, [symbol]);

  // Generate mock data for demo
  const generateMockData = useCallback(() => {
    const basePrice = symbol === "ES" ? 4200 : 
                     symbol === "BTC" ? 35000 : 
                     symbol === "NQ" ? 14500 : 
                     symbol === "CL" ? 75 : 100;
    
    const mockData: TickerData = {
      symbol,
      price: basePrice + (Math.random() - 0.5) * basePrice * 0.02,
      prevClose: basePrice * 0.995,
      volume: Math.floor(Math.random() * 500000) + 100000,
      high: basePrice * 1.015,
      low: basePrice * 0.985,
    };
    
    return mockData;
  }, [symbol]);

  // Connect to Polygon WebSocket
  const connectPolygonWebSocket = useCallback(() => {
    const apiKey = process.env.EXPO_PUBLIC_POLYGON_API_KEY;
    
    if (!apiKey || apiKey === "your-polygon-api-key") {
      console.log("Polygon API key not configured, using mock data");
      const mockData = generateMockData();
      setTickerData(mockData);
      setIsConnected(true);
      
      // Simulate real-time updates
      const interval = setInterval(() => {
        setTickerData(prev => {
          if (!prev) return mockData;
          
          const change = (Math.random() - 0.5) * prev.price * 0.001;
          const newPrice = prev.price + change;
          
          return {
            ...prev,
            price: newPrice,
            high: Math.max(prev.high, newPrice),
            low: Math.min(prev.low, newPrice),
            volume: prev.volume + Math.floor(Math.random() * 1000),
          };
        });
      }, 2000);
      
      wsRef.current = { close: () => clearInterval(interval) } as any;
      return;
    }
    
    try {
      const ws = new WebSocket(`wss://socket.polygon.io/stocks`);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log("Connected to Polygon WebSocket");
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        
        // Authenticate
        ws.send(JSON.stringify({ action: "auth", params: apiKey }));
        
        // Subscribe to ticker
        ws.send(JSON.stringify({
          action: "subscribe",
          params: `T.${symbol}`
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const messages = JSON.parse(event.data);
          
          if (Array.isArray(messages)) {
            messages.forEach((msg: PolygonTickerMessage) => {
              if (msg.ev === "T" && msg.sym === symbol) {
                const tickerData: TickerData = {
                  symbol: msg.sym,
                  price: msg.c,
                  prevClose: msg.o, // Using open as previous close approximation
                  volume: msg.v,
                  high: msg.h,
                  low: msg.l,
                };
                
                setTickerData(tickerData);
              }
            });
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };
      
      ws.onerror = (error) => {
        console.error("Polygon WebSocket error:", error);
        setError("WebSocket connection error");
      };
      
      ws.onclose = () => {
        console.log("Polygon WebSocket disconnected");
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting to Polygon WebSocket (attempt ${reconnectAttempts.current})...`);
            connectPolygonWebSocket();
          }, delay);
        } else {
          console.log("Max reconnection attempts reached, falling back to Finnhub");
          fetchFinnhubData();
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to connect to real-time data");
      fetchFinnhubData();
    }
  }, [symbol, generateMockData, fetchFinnhubData]);

  useEffect(() => {
    if (!symbol) return;
    
    // Reset state
    setError(null);
    reconnectAttempts.current = 0;
    
    if (Platform.OS === "web") {
      // For web, use REST API fallback
      fetchFinnhubData();
      
      // Set up periodic updates for web
      const interval = setInterval(fetchFinnhubData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    } else {
      // For mobile, try WebSocket first
      connectPolygonWebSocket();
    }
    
    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [symbol, connectPolygonWebSocket, fetchFinnhubData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    if (Platform.OS === "web" || !isConnected) {
      fetchFinnhubData();
    }
  }, [fetchFinnhubData, isConnected]);

  return { 
    tickerData, 
    isConnected, 
    error, 
    refresh 
  };
}