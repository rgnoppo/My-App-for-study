import { useEffect, useState, useCallback } from "react";
import Dexie, { type Table } from "dexie";

interface SettingRow {
  key: string;
  value: string;
}

class SettingsDB extends Dexie {
  settings!: Table<SettingRow, string>;
  constructor() {
    super("study-os-settings");
    this.version(1).stores({ settings: "key" });
  }
}

const settingsDb = new SettingsDB();

function applyThemeClass(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    settingsDb.settings.get("dark").then((row) => {
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initial = row ? row.value === "1" : !!prefersDark;
      setDark(initial);
      applyThemeClass(initial);
    });
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      applyThemeClass(next);
      settingsDb.settings.put({ key: "dark", value: next ? "1" : "0" });
      return next;
    });
  }, []);

  return { dark, toggle };
}
