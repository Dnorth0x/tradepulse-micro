import { User } from "@/types";

// Update user profile
export async function updateUserProfile({
  userId,
  disclaimerAgreedAt,
}: {
  userId: string;
  disclaimerAgreedAt?: string;
}): Promise<User> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would update the user profile in Supabase
  return {
    id: userId,
    email: "user@example.com", // This would be the actual user email
    disclaimer_agreed_at: disclaimerAgreedAt || null,
  };
}

// Update API keys
export async function updateApiKeys({
  userId,
  polygonKey,
  finnhubKey,
}: {
  userId: string;
  polygonKey: string;
  finnhubKey: string;
}): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would update the API keys in Supabase
  console.log("API keys updated:", { userId, polygonKey, finnhubKey });
}