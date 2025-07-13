// OpenAI helper for Supabase Edge Functions
// @ts-ignore
import { OpenAI } from "https://esm.sh/openai@4.28.0";

// @ts-ignore
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

export async function generateText(prompt: string, maxTokens = 150): Promise<string> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
  
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }
  
  const openai = new OpenAI({ apiKey: openaiApiKey });
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    
    return completion.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}