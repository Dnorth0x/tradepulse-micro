// @ts-ignore
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.1.0";

// @ts-ignore
declare const Deno: any;

export async function generateText(prompt: string, maxTokens = 150): Promise<string> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
  
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }
  
  const configuration = new Configuration({ apiKey: openaiApiKey });
  const openai = new OpenAIApi(configuration);
  
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    
    return completion.data.choices[0].text?.trim() || "";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}