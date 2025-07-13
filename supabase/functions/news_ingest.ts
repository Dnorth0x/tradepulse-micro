// Supabase Edge Function: news_ingest.ts
// This function fetches market news and generates a digest using AI

// Supabase Edge Function: news_ingest.ts
// This function fetches market news and generates a digest using AI

// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
// @ts-ignore
import { OpenAI } from "https://esm.sh/openai@4.28.0";

// @ts-ignore
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch market news from Finnhub
    // In a real implementation, this would call Finnhub API
    // For this example, we'll generate mock news
    const mockNews = [
      {
        headline: "Fed signals potential rate cuts in upcoming meeting",
        url: "https://example.com/news/1",
        published_at: new Date().toISOString(),
        symbols: ["SPY", "QQQ", "ES", "NQ"],
      },
      {
        headline: "Tech earnings beat expectations, boosting market sentiment",
        url: "https://example.com/news/2",
        published_at: new Date().toISOString(),
        symbols: ["AAPL", "MSFT", "GOOGL", "NQ"],
      },
      {
        headline: "Oil prices surge on supply concerns",
        url: "https://example.com/news/3",
        published_at: new Date().toISOString(),
        symbols: ["CL", "USO", "XLE"],
      },
      {
        headline: "Bitcoin rallies past $40,000 as institutional adoption grows",
        url: "https://example.com/news/4",
        published_at: new Date().toISOString(),
        symbols: ["BTC", "ETH", "COIN"],
      },
      {
        headline: "Dollar weakens against major currencies after economic data",
        url: "https://example.com/news/5",
        published_at: new Date().toISOString(),
        symbols: ["EURUSD", "USDJPY", "DXY"],
      },
    ];
    
    // Insert news into database
    for (const news of mockNews) {
      const { error } = await supabase
        .from("macro_news")
        .insert([news])
        .select();
      
      if (error) {
        console.error("Error inserting news:", error);
      }
    }
    
    // Generate AI digest using OpenAI
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    const newsHeadlines = mockNews.map(n => n.headline).join("\n- ");
    
    const prompt = `
      Summarize these market news headlines into a concise market digest (max 120 words):
      
      - ${newsHeadlines}
      
      Focus on the most important market-moving events and their potential impact on traders.
      Include relevant asset classes (stocks, bonds, forex, crypto, commodities).
    `;
    
    let digest = "";
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });
      
      digest = completion.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("OpenAI API error:", error);
      digest = "Market summary: Fed signals potential rate cuts, boosting equities. Tech earnings exceeded expectations, with major companies reporting strong growth. Oil prices increased due to supply concerns, while Bitcoin rallied past $40,000 on growing institutional adoption. The dollar weakened against major currencies following recent economic data releases.";
    }
    
    // Create digest record
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);
    
    const newDigest = {
      digest,
      period_start: periodStart.toISOString(),
      period_end: now.toISOString(),
      created_at: now.toISOString(),
    };
    
    // Insert digest into database
    const { data, error } = await supabase
      .from("macro_digest")
      .insert([newDigest])
      .select();
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        digest: data[0],
        newsCount: mockNews.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// To deploy:
// supabase functions deploy news_ingest --project-ref your-project-ref