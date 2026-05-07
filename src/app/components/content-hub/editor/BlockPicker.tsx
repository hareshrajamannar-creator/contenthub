/**
 * BlockPicker
 *
 * The "+" insertion button that appears between blocks (and at the bottom).
 * Opens a popover with a searchable, categorised list of block types.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BlockEditorMode, type BlockType, BLOCK_CATALOG, catalogForMode } from './blockTypes';

interface BlockPickerProps {
  mode: BlockEditorMode;
  onAdd: (type: BlockType) => void;
  /** Show as the empty-canvas primary CTA (bigger) */
  primary?: boolean;
}

export function BlockPicker({ mode, onAdd, primary = false }: BlockPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const catalog = catalogForMode(mode);

  // Filter by search query
  const filtered = query
    ? catalog.filter(b =>
        b.label.toLowerCase().includes(query.toLowerCase()) ||
        b.description.toLowerCase().includes(query.toLowerCase()))
    : catalog;

  // Group by category
  const groups = filtered.reduce<Record<string, typeof catalog>>((acc, b) => {
    if (!acc[b.category]) acc[b.category] = [];
    acc[b.category].push(b);
    return acc;
  }, {});

  const categoryLabel: Record<string, string> = {
    text:    'Text',
    media:   'Media',
    layout:  'Layout',
    content: 'Content blocks',
  };

  // Focus search on open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleAdd(type: BlockType) {
    onAdd(type);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={containerRef} className="relative flex justify-center">
      {primary ? (
        /* Empty canvas CTA */
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={15} strokeWidth={1.6} absoluteStrokeWidth />
          Add your first block
        </button>
      ) : (
        /* Between-blocks insertion line */
        <div className="group/ins flex items-center gap-2 w-full py-1">
          <div className="flex-1 h-px bg-transparent group-hover/ins:bg-border transition-colors" />
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className={cn(
              'flex items-center justify-center size-5 rounded-full border transition-all',
              open
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border text-muted-foreground bg-background opacity-0 group-hover/ins:opacity-100 hover:border-primary hover:text-primary',
            )}
          >
            <Plus size={11} strokeWidth={2} />
          </button>
          <div className="flex-1 h-px bg-transparent group-hover/ins:bg-border transition-colors" />
        </div>
      )}

      {/* Popover */}
      {open && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-30 w-[320px] bg-background rounded-xl border border-border shadow-xl overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
            <Search size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground flex-none" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search blocks…"
              className="flex-1 text-[13px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Block groups */}
          <div className="overflow-y-auto max-h-[320px] py-2">
            {Object.entries(groups).length === 0 ? (
              <p className="px-4 py-6 text-[13px] text-muted-foreground text-center">No blocks match "{query}"</p>
            ) : (
              Object.entries(groups).map(([category, blocks]) => (
                <div key={category}>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {categoryLabel[category] ?? category}
                  </p>
                  {blocks.map(b => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => handleAdd(b.type)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/60 transition-colors text-left"
                    >
                      <span className="flex items-center justify-center size-8 rounded-lg bg-muted text-[14px] flex-none">
                        {b.icon}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-foreground">{b.label}</span>
                        <span className="text-[11px] text-muted-foreground truncate">{b.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
