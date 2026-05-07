/**
 * ProjectWizardStep1 — Project type
 *
 * The user picks the type of project they want to create
 * and selects the generation agent.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ProjectType {
  id: string;
  label: string;
  description: string;
  contentHint: string;
}

const PROJECT_TYPES: ProjectType[] = [
  {
    id: 'campaign',
    label: 'Campaign pack',
    description: 'Blog post, social posts, and email for a single campaign',
    contentHint: 'Blog · Social · Email',
  },
  {
    id: 'location',
    label: 'Location rollout',
    description: 'Content tailored per location across your network',
    contentHint: 'FAQ · Social · Local pages',
  },
  {
    id: 'launch',
    label: 'Product launch',
    description: 'Landing page, blog post, and FAQ for a new offering',
    contentHint: 'Landing · Blog · FAQ',
  },
  {
    id: 'reviews',
    label: 'Review response series',
    description: 'AI drafts on-brand responses based on recent review themes',
    contentHint: 'Review responses',
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'You choose the content mix and sources',
    contentHint: 'You decide',
  },
];

const AGENT_OPTIONS = [
  { value: 'balanced', label: 'Balanced (recommended)', description: 'Best mix of speed and quality' },
  { value: 'speed',    label: 'Speed',                  description: 'Faster generation, fewer sources' },
  { value: 'deep',     label: 'Deep research',           description: 'Slower but more thorough and cited' },
];

interface ProjectWizardStep1Props {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function ProjectWizardStep1({ data, onChange }: ProjectWizardStep1Props) {
  const selectedType  = (data.projectType as string) ?? 'campaign';
  const selectedAgent = (data.agent       as string) ?? 'balanced';
  const agentDesc = AGENT_OPTIONS.find(a => a.value === selectedAgent)?.description ?? '';

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Brand kit context */}
      <div className="bg-muted border border-border rounded-lg px-4 py-3 flex items-center gap-3">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-muted-foreground">
          <rect x="3" y="6" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 6V4.5a2 2 0 014 0V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="text-[12px] text-muted-foreground">
          <span className="font-medium text-foreground">LushGreen Brand Kit</span>
          <span className="mx-2">·</span>
          <span className="font-medium text-foreground">10 locations</span>
        </span>
      </div>

      {/* Project type list */}
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-medium text-foreground">Choose a project type</p>
        {PROJECT_TYPES.map(pt => {
          const selected = selectedType === pt.id;
          return (
            <button
              key={pt.id}
              type="button"
              onClick={() => onChange({ ...data, projectType: pt.id })}
              className={cn(
                'relative flex items-center gap-4 text-left bg-background rounded-lg p-4 transition-all w-full',
                selected
                  ? 'border-2 border-primary bg-primary/5'
                  : 'border border-border hover:border-primary/40 hover:bg-muted/50',
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-foreground leading-snug">{pt.label}</p>
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {pt.contentHint}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{pt.description}</p>
              </div>
              <div className={cn(
                'size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                selected ? 'bg-primary border-primary' : 'border-border',
              )}>
                {selected && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Agent picker */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] font-medium text-foreground">Generation agent</label>
        <select
          value={selectedAgent}
          onChange={e => onChange({ ...data, agent: e.target.value })}
          className="w-full border border-border rounded-md px-3 py-2 text-[13px] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {AGENT_OPTIONS.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
        <p className="text-[12px] text-muted-foreground">{agentDesc}</p>
      </div>
    </div>
  );
}
