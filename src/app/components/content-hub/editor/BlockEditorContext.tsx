/**
 * BlockEditorContext
 *
 * A thin React context that makes the block store available to all three
 * panels (left library, center canvas, right settings) without prop-drilling.
 *
 * Usage:
 *   <BlockEditorProvider>
 *     <BlockLibraryPanel />
 *     <BlockCanvas />
 *     <BlockSettingsPanel />
 *   </BlockEditorProvider>
 */

import React, { createContext, useContext } from 'react';
import { useBlockStore } from './blockStore';

type BlockStoreCtx = ReturnType<typeof useBlockStore>;

const BlockEditorContext = createContext<BlockStoreCtx | null>(null);

/** Owns the block store and shares it via context. */
export function BlockEditorProvider({ children }: { children: React.ReactNode }) {
  const store = useBlockStore();
  return (
    <BlockEditorContext.Provider value={store}>
      {children}
    </BlockEditorContext.Provider>
  );
}

/** Consume the block store. Must be used inside <BlockEditorProvider>. */
export function useBlockEditorContext(): BlockStoreCtx {
  const ctx = useContext(BlockEditorContext);
  if (!ctx) throw new Error('useBlockEditorContext must be used inside <BlockEditorProvider>');
  return ctx;
}
