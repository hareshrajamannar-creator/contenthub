import React, { useRef } from 'react';
import { ImageIcon, AlignLeft, AlignRight } from 'lucide-react';
import { type BlockComponentProps } from '../blockTypes';

interface ImageTextContent {
  src: string; alt: string; headline: string; body: string;
  imagePosition: 'left' | 'right';
}

export function ImageTextBlock({ content, focused, onChange }: BlockComponentProps<ImageTextContent>) {
  const { src, alt, headline, body, imagePosition } = content;
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({ src: URL.createObjectURL(file) });
  }

  const imageSlot = (
    <div className="flex-1 min-w-0">
      {src ? (
        <img src={src} alt={alt} className="w-full h-[240px] object-cover rounded-lg" />
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-[240px] rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors"
        >
          <ImageIcon size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground">Upload image</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
    </div>
  );

  const textSlot = (
    <div className="flex-1 min-w-0 flex flex-col gap-3 justify-center">
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Headline…"
        onInput={e => onChange({ headline: (e.target as HTMLElement).innerText })}
        className="text-[20px] font-semibold text-foreground leading-snug outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
      >
        {headline || undefined}
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Body text…"
        onInput={e => onChange({ body: (e.target as HTMLElement).innerText })}
        className="text-[14px] text-foreground leading-relaxed outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
      >
        {body || undefined}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-3">
      {/* Position toggle */}
      {focused && (
        <div className="flex items-center gap-1">
          {([{ val: 'left' as const, icon: AlignLeft, label: 'Image left' }, { val: 'right' as const, icon: AlignRight, label: 'Image right' }]).map(({ val, icon: Icon, label }) => (
            <button
              key={val}
              type="button"
              onClick={() => onChange({ imagePosition: val })}
              className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                imagePosition === val
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon size={11} strokeWidth={1.6} absoluteStrokeWidth />
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {imagePosition === 'left' ? <>{imageSlot}{textSlot}</> : <>{textSlot}{imageSlot}</>}
      </div>
    </div>
  );
}
