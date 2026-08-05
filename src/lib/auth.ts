import { supabase } from "./supabaseClient";

export async function signInWithPassword(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error("Supabase غير مفعّل");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
