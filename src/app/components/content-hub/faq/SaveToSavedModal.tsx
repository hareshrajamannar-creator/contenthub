/**
 * SaveToSavedModal
 *
 * "Add block to Saved" dialog — mirrors the Campaigns editor pattern.
 * Shows a visual preview of the content being saved, lets the user name it,
 * then calls onSave(name) to commit to the savedBlocksStore.
 */

import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { MessageSquare, HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SaveToSavedModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-filled name for the block (section title or "FAQ content"). */
  defaultName: string;
  /** Shown in the preview card header. */
  previewTitle: string;
  /** First 2–3 question texts shown in the preview body. */
  previewSnippets: string[];
  /** Whether saving one section or the full FAQ. */
  sourceType: 'faq-section' | 'faq-full';
  /** Called with the trimmed name when the user clicks Save. */
  onSave: (name: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SaveToSavedModal({
  open,
  onClose,
  defaultName,
  previewTitle,
  previewSnippets,
  sourceType,
  onSave,
}: SaveToSavedModalProps) {
  const [name, setName] = useState(defaultName);

  // Reset name each time the modal is opened for a (possibly different) section
  useEffect(() => {
    if (open) setName(defaultName);
  }, [open, defaultName]);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-[520px] rounded-2xl bg-background shadow-xl',
            'outline-none',
          )}
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
            <DialogTitle className="text-[15px] font-semibold text-foreground">
              Add block to Saved
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              <X size={15} strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </div>

          {/* Preview card */}
          <div className="px-6 pt-5">
            <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
              {/* Card header row */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                <div className="size-5 rounded-md bg-primary/[0.08] flex items-center justify-center flex-none">
                  {sourceType === 'faq-section'
                    ? <HelpCircle size={11} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground/60" />
                    : <MessageSquare size={11} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground/60" />
                  }
                </div>
                <span className="text-[12px] font-semibold text-foreground truncate">
                  {previewTitle}
                </span>
              </div>
              {/* Question snippets */}
              <div className="px-4 py-3 flex flex-col gap-1.5">
                {previewSnippets.slice(0, 3).map((q, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[11px] text-muted-foreground font-medium mt-px flex-none">
                      Q{i + 1}
                    </span>
                    <span className="text-[12px] text-foreground/70 leading-snug truncate">
                      {q}
                    </span>
                  </div>
                ))}
                {previewSnippets.length === 0 && (
                  <p className="text-[12px] text-muted-foreground italic">No questions yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Name field */}
          <div className="px-6 pt-4 pb-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-foreground">
                Block name
                <span className="text-destructive ml-0.5">*</span>
              </span>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                maxLength={80}
                placeholder="Name this block..."
                className={cn(
                  'w-full rounded-lg border border-border bg-background px-3 py-2',
                  'text-[13px] text-foreground placeholder:text-muted-foreground',
                  'outline-none focus:border-primary transition-colors',
                )}
              />
            </label>
            <p className="mt-2 text-[12px] text-muted-foreground">
              You can access this block from the Saved tab to reuse it in other templates.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className={cn(
                'h-8 px-4 rounded-lg text-[13px] font-medium transition-colors',
                name.trim()
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              Save
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
