import React, { useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { type BlockComponentProps } from '../blockTypes';

interface ListContent { items: string[]; ordered: boolean }

export function ListBlock({ content, focused, onChange }: BlockComponentProps<ListContent>) {
  const { items, ordered } = content;
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  function updateItem(idx: number, text: string) {
    const next = [...items];
    next[idx] = text;
    onChange({ items: next });
  }

  function addItem(afterIdx: number) {
    const next = [...items];
    next.splice(afterIdx + 1, 0, '');
    onChange({ items: next });
    // Focus new item after render
    setTimeout(() => refs.current[afterIdx + 1]?.focus(), 0);
  }

  function removeItem(idx: number) {
    if (items.length <= 1) return;
    const next = items.filter((_, i) => i !== idx);
    onChange({ items: next });
    setTimeout(() => refs.current[Math.max(0, idx - 1)]?.focus(), 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>, idx: number) {
    if (e.key === 'Enter') { e.preventDefault(); addItem(idx); }
    if (e.key === 'Backspace' && (e.target as HTMLElement).innerText === '') {
      e.preventDefault();
      removeItem(idx);
    }
  }

  const Tag = ordered ? 'ol' : 'ul';

  return (
    <div className="w-full">
      {/* Ordered / Unordered toggle */}
      {focused && (
        <div className="flex items-center gap-1 mb-2">
          {[{ label: '• Bullets', val: false }, { label: '1. Numbers', val: true }].map(({ label, val }) => (
            <button
              key={label}
              type="button"
              onClick={() => onChange({ ordered: val })}
              className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                ordered === val
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <Tag className={`w-full space-y-1 ${ordered ? 'list-decimal' : 'list-disc'} pl-5`}>
        {items.map((item, idx) => (
          <li key={idx} className="group/item text-[14px] text-foreground leading-relaxed">
            <div className="flex items-start gap-1">
              <div
                ref={el => { refs.current[idx] = el; }}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="List item…"
                onInput={e => updateItem(idx, (e.target as HTMLElement).innerText)}
                onKeyDown={e => handleKeyDown(e, idx)}
                className="flex-1 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
              >
                {item || undefined}
              </div>
              {focused && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-none mt-0.5"
                >
                  <Minus size={12} strokeWidth={1.6} absoluteStrokeWidth />
                </button>
              )}
            </div>
          </li>
        ))}
      </Tag>

      {focused && (
        <button
          type="button"
          onClick={() => addItem(items.length - 1)}
          className="flex items-center gap-1 mt-2 text-[12px] text-muted-foreground hover:text-primary transition-colors"
        >
          <Plus size={12} strokeWidth={1.6} absoluteStrokeWidth />
          Add item
        </button>
      )}
    </div>
  );
}
