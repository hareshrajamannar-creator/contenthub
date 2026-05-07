import React from 'react';
import { type BlockComponentProps } from '../blockTypes';

interface HeroContent { headline: string; subheadline: string; ctaLabel: string; ctaUrl: string }

export function HeroBlock({ content, focused, onChange }: BlockComponentProps<HeroContent>) {
  const { headline, subheadline, ctaLabel, ctaUrl } = content;

  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/15 p-8 flex flex-col items-center gap-4 text-center">
      {/* Headline */}
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Main headline…"
        onInput={e => onChange({ headline: (e.target as HTMLElement).innerText })}
        className="text-[28px] font-bold text-foreground leading-tight outline-none max-w-[560px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
      >
        {headline || undefined}
      </div>

      {/* Subheadline */}
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Supporting subheadline…"
        onInput={e => onChange({ subheadline: (e.target as HTMLElement).innerText })}
        className="text-[16px] text-muted-foreground leading-relaxed outline-none max-w-[480px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
      >
        {subheadline || undefined}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-1">
        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-[15px] font-medium">
          <span
            contentEditable
            suppressContentEditableWarning
            data-placeholder="CTA label…"
            onInput={e => onChange({ ctaLabel: (e.target as HTMLElement).innerText })}
            className="outline-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-60"
          >
            {ctaLabel || undefined}
          </span>
        </div>
        {focused && (
          <input
            type="url"
            value={ctaUrl}
            onChange={e => onChange({ ctaUrl: e.target.value })}
            placeholder="Button URL…"
            className="text-[11px] text-muted-foreground bg-transparent border-b border-border/60 outline-none w-56 pb-0.5 focus:border-primary transition-colors text-center"
          />
        )}
      </div>
    </div>
  );
}
