/**
 * blockStore.ts
 *
 * useReducer-based block state for the WYSIWYG block canvas.
 * Keeps the block array, focused block ID, and drag state.
 */

import { useReducer, useCallback } from 'react';
import { type Block, type BlockType, defaultContent } from './blockTypes';

// ── State ─────────────────────────────────────────────────────────────────────

export interface BlockState {
  blocks: Block[];
  focusedId: string | null;
}

// ── Actions ───────────────────────────────────────────────────────────────────

type BlockAction =
  | { type: 'ADD';        blockType: BlockType; afterId?: string | null }
  | { type: 'UPDATE';     id: string; patch: Record<string, unknown> }
  | { type: 'REMOVE';     id: string }
  | { type: 'FOCUS';      id: string | null }
  | { type: 'MOVE_UP';    id: string }
  | { type: 'MOVE_DOWN';  id: string }
  | { type: 'DUPLICATE';  id: string }
  | { type: 'REORDER';    fromIndex: number; toIndex: number }
  | { type: 'SET_BLOCKS'; blocks: Block[] };

// ── Reducer ───────────────────────────────────────────────────────────────────

function makeBlock(blockType: BlockType): Block {
  return {
    id: crypto.randomUUID(),
    type: blockType,
    content: defaultContent(blockType),
    settings: { alignment: 'left', width: 'contained' },
  };
}

function reducer(state: BlockState, action: BlockAction): BlockState {
  switch (action.type) {

    case 'ADD': {
      const newBlock = makeBlock(action.blockType);
      if (!action.afterId) {
        return { ...state, blocks: [...state.blocks, newBlock], focusedId: newBlock.id };
      }
      const idx = state.blocks.findIndex(b => b.id === action.afterId);
      const next = [...state.blocks];
      next.splice(idx + 1, 0, newBlock);
      return { ...state, blocks: next, focusedId: newBlock.id };
    }

    case 'UPDATE': {
      return {
        ...state,
        blocks: state.blocks.map(b =>
          b.id === action.id
            ? { ...b, content: { ...b.content, ...action.patch } }
            : b,
        ),
      };
    }

    case 'REMOVE': {
      const remaining = state.blocks.filter(b => b.id !== action.id);
      return {
        ...state,
        blocks: remaining,
        focusedId: state.focusedId === action.id ? null : state.focusedId,
      };
    }

    case 'FOCUS': {
      return { ...state, focusedId: action.id };
    }

    case 'MOVE_UP': {
      const idx = state.blocks.findIndex(b => b.id === action.id);
      if (idx <= 0) return state;
      const next = [...state.blocks];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return { ...state, blocks: next };
    }

    case 'MOVE_DOWN': {
      const idx = state.blocks.findIndex(b => b.id === action.id);
      if (idx < 0 || idx >= state.blocks.length - 1) return state;
      const next = [...state.blocks];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return { ...state, blocks: next };
    }

    case 'DUPLICATE': {
      const idx = state.blocks.findIndex(b => b.id === action.id);
      if (idx < 0) return state;
      const clone: Block = {
        ...state.blocks[idx],
        id: crypto.randomUUID(),
        content: { ...state.blocks[idx].content },
      };
      const next = [...state.blocks];
      next.splice(idx + 1, 0, clone);
      return { ...state, blocks: next, focusedId: clone.id };
    }

    case 'REORDER': {
      const { fromIndex, toIndex } = action;
      if (fromIndex === toIndex) return state;
      const next = [...state.blocks];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...state, blocks: next };
    }

    case 'SET_BLOCKS': {
      return { ...state, blocks: action.blocks };
    }

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useBlockStore(initial: Block[] = []) {
  const [state, dispatch] = useReducer(reducer, { blocks: initial, focusedId: null });

  const addBlock    = useCallback((blockType: BlockType, afterId?: string | null) =>
    dispatch({ type: 'ADD', blockType, afterId }), []);

  const updateBlock = useCallback((id: string, patch: Record<string, unknown>) =>
    dispatch({ type: 'UPDATE', id, patch }), []);

  const removeBlock = useCallback((id: string) =>
    dispatch({ type: 'REMOVE', id }), []);

  const focusBlock  = useCallback((id: string | null) =>
    dispatch({ type: 'FOCUS', id }), []);

  const moveUp      = useCallback((id: string) =>
    dispatch({ type: 'MOVE_UP', id }), []);

  const moveDown    = useCallback((id: string) =>
    dispatch({ type: 'MOVE_DOWN', id }), []);

  const duplicate   = useCallback((id: string) =>
    dispatch({ type: 'DUPLICATE', id }), []);

  const reorder     = useCallback((fromIndex: number, toIndex: number) =>
    dispatch({ type: 'REORDER', fromIndex, toIndex }), []);

  const setBlocks   = useCallback((blocks: Block[]) =>
    dispatch({ type: 'SET_BLOCKS', blocks }), []);

  return {
    blocks:     state.blocks,
    focusedId:  state.focusedId,
    addBlock,
    updateBlock,
    removeBlock,
    focusBlock,
    moveUp,
    moveDown,
    duplicate,
    reorder,
    setBlocks,
  };
}
