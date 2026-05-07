import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sidebar.hover-expand";

function readStored(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return false;
    return raw === "1";
  } catch {
    return false;
  }
}

function persist(v: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function useSidebarHoverExpand(): [boolean, (v: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(readStored);

  const set = useCallback((next: boolean) => {
    setEnabled(next);
    persist(next);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setEnabled(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return [enabled, set];
}
