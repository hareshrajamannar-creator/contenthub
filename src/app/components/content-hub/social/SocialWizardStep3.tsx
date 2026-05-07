import React from 'react';
import { cn } from '@/lib/utils';

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional', description: 'Polished and credible' },
  { id: 'friendly',     label: 'Friendly',     description: 'Warm and approachable' },
  { id: 'playful',      label: 'Playful',       description: 'Fun and conversational' },
  { id: 'authoritative',label: 'Authoritative', description: 'Bold and decisive' },
];

const SCHEDULE_OPTIONS = [
  { id: 'immediate', label: 'Publish immediately' },
  { id: 'schedule',  label: 'Schedule' },
  { id: 'calendar',  label: 'Add to content calendar' },
];

interface SocialWizardStep3Props {
  tone: string;
  onToneChange: (t: string) => void;
  postCount: number;
  onPostCountChange: (n: number) => void;
  autoHashtags: boolean;
  onAutoHashtagsChange: (v: boolean) => void;
  customHashtags: string;
  onCustomHashtagsChange: (v: string) => void;
  schedule: string;
  onScheduleChange: (s: string) => void;
  scheduleDate: string;
  onScheduleDateChange: (d: string) => void;
  requireApproval: boolean;
  onRequireApprovalChange: (v: boolean) => void;
}

export const SocialWizardStep3 = ({
  tone, onToneChange,
  postCount, onPostCountChange,
  autoHashtags, onAutoHashtagsChange,
  customHashtags, onCustomHashtagsChange,
  schedule, onScheduleChange,
  scheduleDate, onScheduleDateChange,
  requireApproval, onRequireApprovalChange,
}: SocialWizardStep3Props) => (
  <div className="max-w-[600px] mx-auto p-8 flex flex-col gap-6">

    {/* Tone */}
    <div>
      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">Tone</p>
      <div className="grid grid-cols-2 gap-2">
        {TONE_OPTIONS.map((t) => (
          <button
            key={t.id}
            onClick={() => onToneChange(t.id)}
            className={cn(
              'flex flex-col gap-1 rounded-[8px] border p-4 text-left transition-all',
              tone === t.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
            )}
          >
            <span className="text-[13px] font-medium text-foreground">{t.label}</span>
            <span className="text-[11px] text-muted-foreground">{t.description}</span>
          </button>
        ))}
      </div>
    </div>

    {/* Post count */}
    <div>
      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        Variations per platform
      </p>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={1}
          max={10}
          value={postCount}
          onChange={(e) => onPostCountChange(Number(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="text-[15px] font-semibold text-foreground w-6 text-center">{postCount}</span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">Generate {postCount} variation{postCount !== 1 ? 's' : ''} per platform</p>
    </div>

    {/* Hashtags */}
    <div>
      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">Hashtag strategy</p>
      <label className="flex items-center gap-2 cursor-pointer mb-2">
        <input
          type="checkbox"
          checked={autoHashtags}
          onChange={(e) => onAutoHashtagsChange(e.target.checked)}
          className="accent-primary"
        />
        <span className="text-[13px] text-foreground">Auto-generate hashtags</span>
      </label>
      <input
        value={customHashtags}
        onChange={(e) => onCustomHashtagsChange(e.target.value)}
        placeholder="#yourbrand #custom #tags"
        className="w-full border border-input rounded-md h-9 px-3 text-[13px] bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>

    {/* Scheduling */}
    <div>
      <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-4">Publishing</p>
      <div className="flex flex-col gap-2">
        {SCHEDULE_OPTIONS.map((opt) => (
          <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
              schedule === opt.id ? 'border-primary' : 'border-muted-foreground',
            )}>
              {schedule === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <span
              className="text-[13px] text-foreground"
              onClick={() => onScheduleChange(opt.id)}
            >
              {opt.label}
            </span>
            {opt.id === 'calendar' && <span className="text-[11px] text-muted-foreground">(Calendar coming soon)</span>}
          </label>
        ))}
        {schedule === 'schedule' && (
          <input
            type="datetime-local"
            value={scheduleDate}
            onChange={(e) => onScheduleDateChange(e.target.value)}
            className="mt-2 ml-7 border border-input rounded-md h-9 px-3 text-[13px] bg-background w-auto focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        )}
      </div>
    </div>

    {/* Approval */}
    <div className="border-t border-border pt-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={requireApproval}
          onChange={(e) => onRequireApprovalChange(e.target.checked)}
          className="accent-primary"
        />
        <div>
          <span className="text-[13px] text-foreground">Require approval before publishing</span>
          <p className="text-[11px] text-muted-foreground">Posts will be staged for review before going live.</p>
        </div>
      </label>
    </div>
  </div>
);
