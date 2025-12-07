import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase Environment Variables! Check your .env file.');
}

// This 'supabase' object is what we will use to send/receive data
export const supabase = createClient(supabaseUrl, supabaseAnonKey);