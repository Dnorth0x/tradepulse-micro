import { createClient } from "@supabase/supabase-js";

// In a real app, these would be loaded from environment variables
const supabaseUrl = "https://your-project.supabase.co";
const supabaseAnonKey = "your-anon-key";

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);