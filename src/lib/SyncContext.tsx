import { createContext, useContext, type ReactNode } from "react";
import { useSync } from "./useSync";

type SyncContextValue = ReturnType<typeof useSync>;

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const value = useSync();
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSyncContext(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error("useSyncContext must be used within a SyncProvider");
  }
  return ctx;
}
