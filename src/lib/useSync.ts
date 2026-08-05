import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { runSync, pushFullLocalSnapshot } from "./sync";
import type { SyncStatus } from "../types";

const SYNC_INTERVAL_MS = 30_000;

export function useSync() {
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<SyncStatus>("offline");
  const [authLoaded, setAuthLoaded] = useState(!isSupabaseConfigured);
  const syncingRef = useRef(false);

  const sync = useCallback(async (uid: string) => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setStatus("syncing");
    try {
      await runSync(uid);
      setStatus("synced");
    } catch (e) {
      console.error("Sync failed", e);
      setStatus("error");
    } finally {
      syncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? null);
        setUserId(data.user.id);
        await sync(data.user.id);
      }
      setAuthLoaded(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setEmail(session.user.email ?? null);
        setUserId(session.user.id);
        await pushFullLocalSnapshot(session.user.id);
        await sync(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setEmail(null);
        setUserId(null);
        setStatus("offline");
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [sync]);

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => sync(userId), SYNC_INTERVAL_MS);
    const onOnline = () => sync(userId);
    window.addEventListener("online", onOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", onOnline);
    };
  }, [userId, sync]);

  const triggerSync = useCallback(() => {
    if (userId) sync(userId);
  }, [userId, sync]);

  return {
    isConfigured: isSupabaseConfigured,
    authLoaded,
    email,
    userId,
    isLoggedIn: !!userId,
    status,
    triggerSync,
  };
}
