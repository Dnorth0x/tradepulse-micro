import { MacroDigest } from "@/types";

// Mock macro digest data
const mockMacroDigests: MacroDigest[] = [
  {
    id: "1",
    digest: "Markets rallied on Fed's dovish stance. S&P futures up 0.8% with tech leading gains. Treasury yields fell, suggesting rate cut expectations are growing. Economic data showed mixed signals with strong employment but weakening manufacturing.",
    period_start: "2023-07-10T00:00:00Z",
    period_end: "2023-07-10T23:59:59Z",
    created_at: "2023-07-10T23:30:00Z",
  },
  {
    id: "2",
    digest: "Bearish sentiment prevailed as inflation data came in hotter than expected. Major indices declined with small caps hit hardest. Oil prices surged 3% on Middle East tensions. USD strengthened against major currencies.",
    period_start: "2023-07-11T00:00:00Z",
    period_end: "2023-07-11T23:59:59Z",
    created_at: "2023-07-11T23:30:00Z",
  },
  {
    id: "3",
    digest: "Markets traded sideways as investors await earnings season. Tech giants reported mixed results with cloud services outperforming. Crypto markets saw increased volatility with Bitcoin testing support levels. VIX remains elevated.",
    period_start: "2023-07-12T00:00:00Z",
    period_end: "2023-07-12T23:59:59Z",
    created_at: "2023-07-12T23:30:00Z",
  },
];

// Fetch macro digests
export async function fetchMacroDigest(): Promise<MacroDigest[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // In a real app, this would query Supabase
  return [...mockMacroDigests].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// Refresh macro digest (call Edge Function)
export async function refreshMacroDigest(): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would call the Edge Function
  // For demo, we'll add a new mock digest
  const newDigest: MacroDigest = {
    id: `mock-${Date.now()}`,
    digest: "Fresh market update: Futures trending higher on positive earnings surprises. Tech sector showing strength with semiconductor stocks leading. Treasury yields stable as markets digest recent economic data. Asian markets closed mixed.",
    period_start: new Date().toISOString(),
    period_end: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  
  mockMacroDigests.unshift(newDigest);
}