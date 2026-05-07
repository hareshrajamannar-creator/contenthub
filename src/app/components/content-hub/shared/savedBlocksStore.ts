/**
 * savedBlocksStore
 *
 * Lightweight module-level singleton for saved content blocks.
 * Blocks saved from the FAQ canvas appear in the BlockLibraryPanel "Saved" tab
 * for blog and landing page editors.
 *
 * Backed by sessionStorage so blocks persist across view navigation within
 * the same browser session.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type SavedBlockSource = 'faq-section' | 'faq-full';

export interface SavedBlock {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string; // ISO-8601
  sourceType: SavedBlockSource;
  /** Lightweight preview data used to render the thumbnail card. */
  preview: {
    title: string;
    snippets: string[]; // First 2–3 question texts
  };
}

// ── Internal store state ───────────────────────────────────────────────────────

const STORAGE_KEY = 'birdeye:saved-blocks:v1';

type Listener = (blocks: SavedBlock[]) => void;
const _listeners = new Set<Listener>();
let _blocks: SavedBlock[] = _loadFromStorage();

function _loadFromStorage(): SavedBlock[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedBlock[]) : [];
  } catch {
    return [];
  }
}

function _persist(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_blocks));
  } catch {
    // Ignore storage quota errors in prototype
  }
}

function _notify(): void {
  const snapshot = [..._blocks];
  _listeners.forEach(fn => fn(snapshot));
}

// ── Public API ─────────────────────────────────────────────────────────────────

/** Returns a snapshot of all saved blocks (newest first). */
export function getSavedBlocks(): SavedBlock[] {
  return [..._blocks];
}

/**
 * Adds a new saved block.  Generates `id` and `createdAt` automatically.
 * Returns the complete saved block record.
 */
export function addSavedBlock(
  block: Omit<SavedBlock, 'id' | 'createdAt'>,
): SavedBlock {
  const full: SavedBlock = {
    ...block,
    id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  _blocks = [full, ..._blocks];
  _persist();
  _notify();
  return full;
}

/** Removes a saved block by id. */
export function removeSavedBlock(id: string): void {
  _blocks = _blocks.filter(b => b.id !== id);
  _persist();
  _notify();
}

/**
 * Subscribes to store changes.  The listener is called with a fresh snapshot
 * every time the store mutates.  Returns an unsubscribe function.
 */
export function subscribeSavedBlocks(fn: Listener): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}
