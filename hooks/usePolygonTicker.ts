import { useEffect, useState, useRef } from "react";
import { Platform } from "react-native";
import { TickerData } from "@/types";

export function usePolygonTicker(symbol: string) {
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Don't attempt to connect on web platform for demo purposes
    if (Platform.OS === "web") {
      // Simulate data for web demo
      const mockData: TickerData = {
        symbol,
        price: 4200.50,
        prevClose: 4180.25,
        volume: 125000,
        high: 4220.75,
        low: 4175.50,
      };
      
      setTickerData(mockData);
      setIsConnected(true);
      
      // Simulate price updates
      const interval = setInterval(() => {
        setTickerData(prev => {
          if (!prev) return mockData;
          
          const change = (Math.random() - 0.5) * 5;
          const newPrice = prev.price + change;
          
          return {
            ...prev,
            price: newPrice,
            high: Math.max(prev.high || 0, newPrice),
            low: Math.min(prev.low || Infinity, newPrice),
            volume: (prev.volume || 0) + Math.floor(Math.random() * 1000),
          };
        });
      }, 2000);
      
      return () => clearInterval(interval);
    }

    // For mobile, attempt to connect to Polygon WebSocket
    const connectWebSocket = () => {
      // TODO: Replace with your Polygon API key
      const apiKey = "POLYGON_API_KEY"; // This would come from environment or user settings
      
      // In a real app, this would use the actual Polygon WebSocket URL
      // For demo purposes, we'll simulate the connection
      const simulateWebSocket = () => {
        console.log(`Connecting to Polygon WebSocket for ${symbol}...`);
        
        // Simulate connection delay
        setTimeout(() => {
          setIsConnected(true);
          console.log("Connected to Polygon WebSocket");
          
          // Initial data
          const initialData: TickerData = {
            symbol,
            price: symbol === "ES" ? 4200.50 : 
                   symbol === "BTC" ? 35000.25 : 
                   symbol === "NQ" ? 14500.75 : 100.00,
            prevClose: symbol === "ES" ? 4180.25 : 
                       symbol === "BTC" ? 34800.50 : 
                       symbol === "NQ" ? 14450.25 : 99.50,
            volume: 125000,
            high: symbol === "ES" ? 4220.75 : 
                  symbol === "BTC" ? 35200.00 : 
                  symbol === "NQ" ? 14550.50 : 101.00,
            low: symbol === "ES" ? 4175.50 : 
                 symbol === "BTC" ? 34900.00 : 
                 symbol === "NQ" ? 14400.25 : 99.00,
          };
          
          setTickerData(initialData);
          
          // Simulate price updates
          const updateInterval = setInterval(() => {
            setTickerData(prev => {
              if (!prev) return initialData;
              
              const change = (Math.random() - 0.5) * (symbol === "BTC" ? 100 : 5);
              const newPrice = prev.price + change;
              
              return {
                ...prev,
                price: newPrice,
                high: Math.max(prev.high || 0, newPrice),
                low: Math.min(prev.low || Infinity, newPrice),
                volume: (prev.volume || 0) + Math.floor(Math.random() * 1000),
              };
            });
          }, 2000);
          
          // Store the interval ID for cleanup
          wsRef.current = { close: () => clearInterval(updateInterval) } as any;
        }, 1000);
      };
      
      simulateWebSocket();
    };

    // Connect to WebSocket
    connectWebSocket();

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
  }, [symbol]);

  return { tickerData, isConnected };
}