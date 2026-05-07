import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "inbox-list-panel-width";

export const INBOX_LIST_WIDTH_DEFAULT = 360;
export const INBOX_LIST_WIDTH_MIN = 360;
export const INBOX_LIST_WIDTH_MAX = 600;

function readStoredWidth(): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n)) return INBOX_LIST_WIDTH_DEFAULT;
    return Math.min(INBOX_LIST_WIDTH_MAX, Math.max(INBOX_LIST_WIDTH_MIN, n));
  } catch {
    return INBOX_LIST_WIDTH_DEFAULT;
  }
}

function persistWidth(w: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Math.round(w)));
  } catch {
    /* ignore */
  }
}

/** Max list width so conversation detail keeps at least 400px or 50% of row. */
export function maxInboxListWidth(rowWidth: number): number {
  if (rowWidth <= 0) return INBOX_LIST_WIDTH_MIN;
  const detailReserved = Math.max(400, rowWidth * 0.5);
  return Math.min(INBOX_LIST_WIDTH_MAX, Math.max(0, rowWidth - detailReserved));
}

export function clampInboxListWidth(w: number, rowWidth: number): number {
  const maxW = maxInboxListWidth(rowWidth);
  if (maxW <= INBOX_LIST_WIDTH_MIN) return INBOX_LIST_WIDTH_MIN;
  return Math.min(Math.max(w, INBOX_LIST_WIDTH_MIN), maxW);
}

export function useInboxListPanelWidth(rowWidth: number) {
  const [width, setWidthState] = useState(readStoredWidth);
  const widthRef = useRef(width);
  widthRef.current = width;

  const setWidth = useCallback(
    (next: number | ((prev: number) => number)) => {
      setWidthState((prev) => {
        const raw = typeof next === "function" ? (next as (p: number) => number)(prev) : next;
        const clamped = clampInboxListWidth(raw, rowWidth);
        persistWidth(clamped);
        return clamped;
      });
    },
    [rowWidth]
  );

  useEffect(() => {
    setWidthState((prev) => {
      const clamped = clampInboxListWidth(prev, rowWidth);
      if (clamped !== prev) persistWidth(clamped);
      return clamped;
    });
  }, [rowWidth]);

  return { width, setWidth, widthRef };
}
