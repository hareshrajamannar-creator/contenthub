import React, { useRef, useEffect } from 'react';
import { type BlockComponentProps } from '../blockTypes';

interface ParagraphContent { text: string }

export function ParagraphBlock({ content, onChange }: BlockComponentProps<ParagraphContent>) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external content changes (e.g. AI-generated text)
  useEffect(() => {
    if (ref.current && ref.current.innerText !== content.text) {
      ref.current.innerText = content.text ?? '';
    }
  }, [content.text]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder="Start writing…"
      onInput={e => onChange({ text: (e.target as HTMLElement).innerText })}
      className="w-full outline-none text-[14px] leading-relaxed text-foreground empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
    />
  );
}
