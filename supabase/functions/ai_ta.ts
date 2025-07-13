// Supabase Edge Function: ai_ta.ts
// This function fetches technical indicators for a given symbol and generates AI analysis

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
// @ts-ignore
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0";

// @ts-ignore
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const { symbol } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if we have a recent analysis in the cache
    const { data: existingSignals } = await supabase
      .from("ai_signals")
      .select("*")
      .eq("symbol", symbol)
      .order("created_at", { ascending: false })
      .limit(1);
    
    // If we have a recent analysis (less than 15 minutes old), return it
    if (existingSignals && existingSignals.length > 0) {
      const lastSignal = existingSignals[0];
      const lastAnalysisTime = new Date(lastSignal.created_at).getTime();
      const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
      
      if (lastAnalysisTime > fifteenMinutesAgo) {
        return new Response(
          JSON.stringify(lastSignal),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Fetch technical indicators from Finnhub
    // In a real implementation, this would call Finnhub API
    // For this example, we'll generate mock data
    const rsi = 30 + Math.random() * 40; // Random RSI between 30-70
    const macd = -1 + Math.random() * 2; // Random MACD between -1 and 1
    const stoch = 20 + Math.random() * 60; // Random Stochastic between 20-80
    
    // Determine composite signal
    let composite = "➖"; // Neutral by default
    
    if (rsi > 70 || stoch > 80) {
      composite = "📉"; // Bearish (overbought)
    } else if (rsi < 30 || stoch < 20) {
      composite = "📈"; // Bullish (oversold)
    } else if (macd > 0.5) {
      composite = "📈"; // Bullish
    } else if (macd < -0.5) {
      composite = "📉"; // Bearish
    }
    
    // Generate AI analysis using OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const configuration = new Configuration({ apiKey: openaiApiKey });
    const openai = new OpenAIApi(configuration);
    
    const prompt = `
      As an experienced trader, analyze these technical indicators for ${symbol}:
      - RSI: ${rsi.toFixed(2)}
      - MACD: ${macd.toFixed(2)}
      - Stochastic: ${stoch.toFixed(2)}
      
      Explain what these numbers mean in 2 concise sentences. Be specific about potential trade setups.
    `;
    
    let gptSummary = "";
    
    try {
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 100,
        temperature: 0.7,
      });
      
      gptSummary = completion.data.choices[0].text?.trim() || "";
    } catch (error) {
      console.error("OpenAI API error:", error);
      gptSummary = `${symbol} shows ${rsi > 50 ? "bullish" : "bearish"} RSI at ${rsi.toFixed(2)} with MACD ${macd > 0 ? "positive" : "negative"} at ${macd.toFixed(2)}. ${stoch > 50 ? "Momentum is strong" : "Momentum is weakening"} with Stochastic at ${stoch.toFixed(2)}.`;
    }
    
    // Create new signal record
    const newSignal = {
      symbol,
      rsi,
      macd,
      stoch,
      composite,
      gpt_summary: gptSummary,
      created_at: new Date().toISOString(),
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from("ai_signals")
      .insert([newSignal])
      .select();
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify(data[0]),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// To deploy:
// supabase functions deploy ai_ta --project-ref your-project-ref