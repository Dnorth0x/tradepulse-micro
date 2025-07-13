import { useCallback } from "react";
import { Alert } from "react-native";

// In a real app, this would be loaded from environment variables
const SUPABASE_URL = "https://your-project.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key";

export function useEdgeFn() {
  const callEdgeFn = useCallback(async (fnName: string, payload: any) => {
    try {
      // In a real app, this would use the actual Supabase Edge Function URL
      // For demo purposes, we'll simulate the API call
      console.log(`Calling Edge Function: ${fnName} with payload:`, payload);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate different responses based on function name
      if (fnName === "ai_ta") {
        const symbol = payload.symbol || "ES";
        
        // Mock AI technical analysis response
        return {
          id: "mock-id",
          symbol,
          rsi: 45 + Math.random() * 20,
          macd: -0.5 + Math.random() * 1,
          stoch: 40 + Math.random() * 30,
          composite: Math.random() > 0.5 ? "📈" : Math.random() > 0.5 ? "📉" : "➖",
          gpt_summary: `${symbol} is showing mixed signals with RSI in neutral territory. MACD is slightly ${Math.random() > 0.5 ? "bullish" : "bearish"}, suggesting potential ${Math.random() > 0.5 ? "upside" : "downside"} momentum in the short term.`,
          created_at: new Date().toISOString(),
        };
      } else if (fnName === "news_ingest") {
        // Mock news ingest response
        return {
          success: true,
          message: "Successfully processed market news",
          count: 5,
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Edge Function error (${fnName}):`, error);
      Alert.alert("Error", `Failed to call ${fnName}. Please try again later.`);
      throw error;
    }
  }, []);

  return callEdgeFn;
}