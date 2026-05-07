import React, { useRef } from 'react';
import { ImageIcon, Upload } from 'lucide-react';
import { type BlockComponentProps } from '../blockTypes';

interface ImageContent { src: string; alt: string; caption: string }

export function ImageBlock({ content, focused, onChange }: BlockComponentProps<ImageContent>) {
  const { src, alt, caption } = content;
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ src: url });
  }

  return (
    <div className="w-full space-y-2">
      {src ? (
        <div className="relative group/img">
          <img
            src={src}
            alt={alt}
            className="w-full rounded-lg object-cover max-h-[400px]"
          />
          {focused && (
            <button
              type="button"
              onClick={() => onChange({ src: '' })}
              className="absolute top-2 right-2 bg-background/90 border border-border text-[11px] px-2 py-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover/img:opacity-100 transition-opacity"
            >
              Remove
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-[180px] rounded-lg border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 flex flex-col items-center justify-center gap-2 transition-colors"
        >
          <div className="size-10 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
          </div>
          <span className="text-[13px] text-muted-foreground">Click to upload image</span>
          <span className="text-[11px] text-muted-foreground/60">or paste an image URL below</span>
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />

      {/* URL input when empty */}
      {!src && focused && (
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          className="w-full text-[12px] border border-border rounded-md px-3 py-1.5 outline-none focus:border-primary transition-colors text-foreground bg-background"
          onBlur={e => { if (e.target.value) onChange({ src: e.target.value }); }}
        />
      )}

      {/* Alt text + caption */}
      {focused && (
        <div className="flex flex-col gap-1">
          <input
            type="text"
            value={alt}
            onChange={e => onChange({ alt: e.target.value })}
            placeholder="Alt text (for accessibility)…"
            className="text-[12px] text-muted-foreground bg-transparent border-b border-border/60 outline-none pb-0.5 focus:border-primary transition-colors"
          />
        </div>
      )}

      {/* Caption — always shown when there's content */}
      {(src || focused) && (
        <div
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Add a caption (optional)…"
          onInput={e => onChange({ caption: (e.target as HTMLElement).innerText })}
          className="text-[12px] text-center text-muted-foreground outline-none empty:before:content-[attr(data-placeholder)] empty:before:opacity-50"
        >
          {caption || undefined}
        </div>
      )}
    </div>
  );
}
