import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// ── Platform data ──────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'facebook',  label: 'Facebook',  connected: true },
  { id: 'instagram', label: 'Instagram', connected: true },
  { id: 'linkedin',  label: 'LinkedIn',  connected: true },
  { id: 'google',    label: 'Google',    connected: false },
  { id: 'x',        label: 'X / Twitter', connected: false },
  { id: 'tiktok',   label: 'TikTok',    connected: false },
];

const POST_TYPES = [
  { id: 'promotional',  label: 'Promotional',  description: 'Drive a sale or offer' },
  { id: 'engagement',   label: 'Engagement',   description: 'Spark conversation or shares' },
  { id: 'educational',  label: 'Educational',  description: 'Share a tip or how-to' },
];

// ── Phone preview ──────────────────────────────────────────────────────────────

function PhonePreview({ platforms, postType }: { platforms: string[]; postType: string }) {
  const isFB = platforms.includes('facebook');
  const isIG = platforms.includes('instagram');

  return (
    <div className="w-[180px] mx-auto border-2 border-border rounded-[20px] overflow-hidden bg-background shadow-sm">
      <div className="h-4 bg-border/40 flex items-center justify-center">
        <div className="w-12 h-1.5 rounded-full bg-border/60" />
      </div>
      <div className="bg-background p-3">
        {/* Platform indicator */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
            {isFB ? 'f' : isIG ? '✦' : 'B'}
          </div>
          <div>
            <div className="h-2 w-16 bg-muted rounded-full mb-0.5" />
            <div className="h-1.5 w-10 bg-muted/60 rounded-full" />
          </div>
        </div>
        {/* Image placeholder */}
        {isIG && (
          <div className="w-full aspect-square bg-muted rounded-[6px] mb-2 flex items-center justify-center text-[10px] text-muted-foreground">
            {postType === 'promotional' ? '🏷️' : postType === 'engagement' ? '💬' : '💡'}
          </div>
        )}
        {/* Caption lines */}
        <div className="flex flex-col gap-1">
          <div className="h-2 rounded-full bg-muted" style={{ width: '90%' }} />
          <div className="h-2 rounded-full bg-muted" style={{ width: '75%' }} />
          <div className="h-2 rounded-full bg-muted/60" style={{ width: '55%' }} />
        </div>
        {/* Hashtags (IG) */}
        {isIG && (
          <div className="mt-2 flex flex-wrap gap-0.5">
            {['#spring', '#local', '#offer'].map((tag) => (
              <span key={tag} className="text-[7px] text-primary">{tag}</span>
            ))}
          </div>
        )}
        {/* CTA (FB promotional) */}
        {isFB && postType === 'promotional' && (
          <div className="mt-2 border border-border rounded-[4px] py-1 text-center text-[8px] font-medium text-primary">
            Learn more
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 1 component ───────────────────────────────────────────────────────────

interface SocialWizardStep1Props {
  selectedPlatforms: string[];
  onPlatformsChange: (p: string[]) => void;
  postType: string;
  onPostTypeChange: (t: string) => void;
}

export const SocialWizardStep1 = ({
  selectedPlatforms,
  onPlatformsChange,
  postType,
  onPostTypeChange,
}: SocialWizardStep1Props) => {
  const togglePlatform = (id: string) => {
    onPlatformsChange(
      selectedPlatforms.includes(id)
        ? selectedPlatforms.filter((p) => p !== id)
        : [...selectedPlatforms, id],
    );
  };

  return (
    <div className="max-w-[600px] mx-auto p-8 flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col gap-6">
        {/* Platform pills — flex-wrap */}
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">Platforms</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-medium transition-all',
                  selectedPlatforms.includes(p.id)
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50',
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                  selectedPlatforms.includes(p.id) ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground',
                )}>
                  {p.label[0]}
                </div>
                <span>{p.label}</span>
                {p.connected && (
                  <span className={cn(
                    'text-[9px] font-medium',
                    selectedPlatforms.includes(p.id) ? 'text-primary/70' : 'text-green-600',
                  )}>●</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">● Connected &nbsp;○ Not connected</p>
        </div>

        {/* Post type */}
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">Post type</p>
          <div className="flex flex-col gap-2">
            {POST_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => onPostTypeChange(t.id)}
                className={cn(
                  'flex items-center gap-3 rounded-[8px] border p-4 text-left transition-all',
                  postType === t.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted',
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  postType === t.id ? 'border-primary' : 'border-muted-foreground',
                )}>
                  {postType === t.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <div>
                  <span className="text-[13px] font-medium text-foreground">{t.label}</span>
                  <p className="text-[11px] text-muted-foreground">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
