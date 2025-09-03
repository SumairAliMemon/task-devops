import { supabase } from './supabaseClient';

export async function upsertProfile({ id, email, full_name }: { id: string; email: string; full_name?: string }) {
  // Upsert into the 'profiles' table
  const { error } = await supabase.from('profiles').upsert([
    { id, email, full_name },
  ], { onConflict: 'id' });
  return { error };
}
