// Backend logic for posts (example: fetch from Supabase GraphQL)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchPosts() {
  // Example: fetch posts from Supabase REST (or use GraphQL client as needed)
  const { data, error } = await supabase.from('posts').select('*').order('published_at', { ascending: false });
  if (error) throw error;
  return data;
}
