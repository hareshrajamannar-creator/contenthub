import React from 'react';
import { type BlockComponentProps } from '../blockTypes';

interface HeadingContent { text: string; level: 'h1' | 'h2' | 'h3' }

export function HeadingBlock({ content, focused, onChange }: BlockComponentProps<HeadingContent>) {
  const { text, level } = content;

  const sizeClass =
    level === 'h1' ? 'text-[28px] font-bold' :
    level === 'h2' ? 'text-[22px] font-semibold' :
                     'text-[18px] font-semibold';

  return (
    <div className="w-full">
      {/* Level picker — only visible when focused */}
      {focused && (
        <div className="flex items-center gap-1 mb-2">
          {(['h1', 'h2', 'h3'] as const).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => onChange({ level: l })}
              className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                level === l
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder={`${level.toUpperCase()} heading…`}
        onInput={e => onChange({ text: (e.target as HTMLElement).innerText })}
        className={`w-full outline-none text-foreground leading-snug empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50 ${sizeClass}`}
      >
        {text || undefined}
      </div>
    </div>
  );
}
