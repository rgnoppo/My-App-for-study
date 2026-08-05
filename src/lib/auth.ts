import { supabase } from "./supabaseClient";

export async function sendLoginCode(email: string): Promise<void> {
  if (!supabase) throw new Error("Supabase غير مفعّل");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) throw error;
}

export async function verifyLoginCode(email: string, code: string): Promise<void> {
  if (!supabase) throw new Error("Supabase غير مفعّل");
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
