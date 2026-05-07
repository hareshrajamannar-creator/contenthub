import React from 'react';
import { type BlockComponentProps } from '../blockTypes';

interface CTAContent { label: string; url: string; variant: 'primary' | 'secondary' | 'outline' }

export function CTABlock({ content, focused, onChange }: BlockComponentProps<CTAContent>) {
  const { label, url, variant } = content;

  const btnClass =
    variant === 'primary'   ? 'bg-primary text-primary-foreground hover:bg-primary/90' :
    variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
                              'border border-border text-foreground hover:bg-muted';

  return (
    <div className="w-full flex flex-col items-start gap-3">
      {/* Variant picker */}
      {focused && (
        <div className="flex items-center gap-1">
          {(['primary', 'secondary', 'outline'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ variant: v })}
              className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize transition-colors ${
                variant === v
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      {/* Button preview — editable label */}
      <div className={`inline-flex items-center px-5 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${btnClass}`}>
        <span
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Button label…"
          onInput={e => onChange({ label: (e.target as HTMLElement).innerText })}
          className="outline-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-60"
          onClick={e => e.preventDefault()}
        >
          {label || undefined}
        </span>
      </div>

      {/* URL input */}
      {focused && (
        <input
          type="url"
          value={url}
          onChange={e => onChange({ url: e.target.value })}
          placeholder="https://…"
          className="text-[12px] text-muted-foreground bg-transparent border-b border-border outline-none w-64 pb-0.5 focus:border-primary transition-colors"
        />
      )}
    </div>
  );
}
