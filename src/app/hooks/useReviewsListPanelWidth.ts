import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "reviews-list-panel-width";

export const REVIEWS_LIST_WIDTH_DEFAULT = 360;
export const REVIEWS_LIST_WIDTH_MIN = 280;
export const REVIEWS_LIST_WIDTH_MAX = 560;

function readStoredWidth(): number {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n)) return REVIEWS_LIST_WIDTH_DEFAULT;
    return Math.min(REVIEWS_LIST_WIDTH_MAX, Math.max(REVIEWS_LIST_WIDTH_MIN, n));
  } catch {
    return REVIEWS_LIST_WIDTH_DEFAULT;
  }
}

function persistWidth(w: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Math.round(w)));
  } catch {
    /* ignore */
  }
}

export function maxReviewsListWidth(rowWidth: number): number {
  if (rowWidth <= 0) return REVIEWS_LIST_WIDTH_MIN;
  const detailReserved = Math.max(400, rowWidth * 0.5);
  return Math.min(REVIEWS_LIST_WIDTH_MAX, Math.max(0, rowWidth - detailReserved));
}

export function clampReviewsListWidth(w: number, rowWidth: number): number {
  const maxW = maxReviewsListWidth(rowWidth);
  if (maxW <= REVIEWS_LIST_WIDTH_MIN) return REVIEWS_LIST_WIDTH_MIN;
  return Math.min(Math.max(w, REVIEWS_LIST_WIDTH_MIN), maxW);
}

export function useReviewsListPanelWidth(rowWidth: number) {
  const [width, setWidthState] = useState(readStoredWidth);
  const widthRef = useRef(width);
  widthRef.current = width;

  const setWidth = useCallback(
    (next: number | ((prev: number) => number)) => {
      setWidthState((prev) => {
        const raw = typeof next === "function" ? (next as (p: number) => number)(prev) : next;
        const clamped = clampReviewsListWidth(raw, rowWidth);
        persistWidth(clamped);
        return clamped;
      });
    },
    [rowWidth]
  );

  useEffect(() => {
    setWidthState((prev) => {
      const clamped = clampReviewsListWidth(prev, rowWidth);
      if (clamped !== prev) persistWidth(clamped);
      return clamped;
    });
  }, [rowWidth]);

  return { width, setWidth, widthRef };
}
