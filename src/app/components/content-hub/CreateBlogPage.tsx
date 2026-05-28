import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowUpRight, Sparkles, Loader2, Upload, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import {
  ContentFlowStepper,
  ContentFlowInfoLabel,
  ContentFlowLocationFlatList,
  ContentFlowMultiSelect,
  ContentFlowSelect,
  ContentFlowTextarea,
  ContentFlowTextInput,
  CONTENT_FLOW_STEP_TITLE_CLASS,
  type ContentFlowStep,
} from './shared/ContentFlowControls';

// ── Data ──────────────────────────────────────────────────────────────────────

interface BrandKit {
  id: string;
  label: string;
  locations: { value: string; label: string }[];
}

const BRAND_KITS: BrandKit[] = [
  {
    id: 'smile-dental',
    label: 'Smile Dental Group',
    locations: [
      { value: 'l1',  label: '1001 - Mountain View, CA' },
      { value: 'l2',  label: '1002 - San Jose, CA' },
      { value: 'l3',  label: '1003 - Palo Alto, CA' },
      { value: 'l4',  label: '1004 - Sunnyvale, CA' },
      { value: 'l5',  label: '1005 - Santa Clara, CA' },
      { value: 'l6',  label: '1006 - Cupertino, CA' },
      { value: 'l7',  label: '1007 - Los Altos, CA' },
      { value: 'l8',  label: '1008 - Menlo Park, CA' },
      { value: 'l9',  label: '1009 - Redwood City, CA' },
      { value: 'l10', label: '1010 - Foster City, CA' },
    ],
  },
  {
    id: 'acme-dental',
    label: 'Acme Dental — Westside',
    locations: [
      { value: 'a1', label: '1001 - West LA, CA' },
      { value: 'a2', label: '1002 - Santa Monica, CA' },
      { value: 'a3', label: '1003 - Brentwood, CA' },
    ],
  },
  {
    id: 'bayview-ortho',
    label: 'Bayview Orthodontics',
    locations: [
      { value: 'b1', label: '1001 - San Francisco, CA' },
      { value: 'b2', label: '1002 - Oakland, CA' },
      { value: 'b3', label: '1003 - Berkeley, CA' },
      { value: 'b4', label: '1004 - Marin, CA' },
      { value: 'b5', label: '1005 - Walnut Creek, CA' },
    ],
  },
];

const BLOG_AGENTS = [
  { id: 'blog-default',  label: 'Blog generation agent' },
  { id: 'seo-writer',    label: 'SEO Writer — keyword-first content' },
  { id: 'local-blogger', label: 'Local Blogger — location-targeted posts' },
  { id: 'authority',     label: 'Authority Builder — thought leadership' },
  { id: 'story-writer',  label: 'Story Writer — patient & case stories' },
  { id: 'brand-voice',   label: 'Brand Voice — on-brand, on-tone content' },
];

const KEYWORD_OPTIONS = [
  { value: 'dental-anxiety',       label: 'Dental anxiety' },
  { value: 'family-dentist',       label: 'Family dentist' },
  { value: 'sedation-dentistry',   label: 'Sedation dentistry' },
  { value: 'preventive-care',      label: 'Preventive care' },
  { value: 'teeth-whitening',      label: 'Teeth whitening' },
  { value: 'dental-implants',      label: 'Dental implants' },
  { value: 'orthodontics',         label: 'Orthodontics' },
  { value: 'emergency-dentist',    label: 'Emergency dentist' },
  { value: 'cosmetic-dentistry',   label: 'Cosmetic dentistry' },
  { value: 'local-seo',            label: 'Local SEO' },
  { value: 'patient-experience',   label: 'Patient experience' },
  { value: 'dental-checkup',       label: 'Dental checkup' },
];

const INTENT_OPTIONS = [
  { value: 'agent',         label: 'Let agent decide' },
  { value: 'informational', label: 'Informational' },
  { value: 'commercial',    label: 'Commercial' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'navigational',  label: 'Navigational' },
];

const OBJECTIVE_OPTIONS = [
  { value: 'agent',       label: 'Let agent decide' },
  { value: 'traffic',     label: 'Traffic' },
  { value: 'aeo',         label: 'AEO' },
  { value: 'authority',   label: 'Authority' },
  { value: 'conversions', label: 'Conversions' },
];

const FUNNEL_OPTIONS = [
  { value: 'agent',         label: 'Let agent decide' },
  { value: 'awareness',     label: 'Awareness' },
  { value: 'consideration', label: 'Consideration' },
  { value: 'decision',      label: 'Decision' },
];

const LENGTH_OPTIONS = [
  { value: 'short',  label: 'Short (~800 words)' },
  { value: 'medium', label: 'Medium (~1,500 words)' },
  { value: 'long',   label: 'Long (~2,500 words)' },
];

const GENERATED_TOPIC_PAIRS: { topic: string; keywords: string[] }[] = [
  {
    topic: 'How to overcome dental anxiety as an adult\n\nMillions of adults skip routine dental care because of fear or past negative experiences. This post covers practical strategies — from open communication with your dentist to sedation options — that help anxious patients finally get the care they need.',
    keywords: ['dental-anxiety', 'sedation-dentistry', 'patient-experience'],
  },
  {
    topic: '5 tips for finding the right dentist for your family\n\nChoosing a family dentist is one of the most important healthcare decisions you can make. Learn what to look for — from preventive care philosophy to kid-friendly environments — so the whole family feels comfortable and cared for.',
    keywords: ['family-dentist', 'preventive-care', 'dental-checkup'],
  },
  {
    topic: 'The benefits of preventive dental care and regular checkups\n\nPreventive dentistry is the most cost-effective way to protect your long-term oral health. This article explains how routine cleanings, early screening, and personalised care plans keep small issues from becoming expensive problems.',
    keywords: ['preventive-care', 'dental-checkup', 'patient-experience'],
  },
  {
    topic: 'Understanding sedation dentistry: what patients need to know\n\nSedation dentistry has made dental care accessible for millions of anxious or medically complex patients. We break down the types of sedation available, who they are suitable for, and what to expect before, during, and after your appointment.',
    keywords: ['sedation-dentistry', 'dental-anxiety', 'family-dentist'],
  },
];

const STEPS: ContentFlowStep[] = [
  { id: 'brand-kit', label: 'Brand identity' },
  { id: 'setup',     label: 'Blog setup' },
];

// ── Props ─────────────────────────────────────────────────────────────────────

export interface CreateBlogPageProps {
  onCancel: () => void;
  onGenerate: () => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export function CreateBlogPage({ onCancel, onGenerate }: CreateBlogPageProps) {
  const [step, setStep] = useState(0);

  // Step 1
  const [blogName, setBlogName]           = useState('');
  const [brandKitId, setBrandKitId]       = useState('smile-dental');
  const currentKit = BRAND_KITS.find(k => k.id === brandKitId) ?? BRAND_KITS[0];
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    BRAND_KITS[0].locations.map(l => l.value),
  );
  const [agentId, setAgentId] = useState('blog-default');

  // Step 2
  const [topic, setTopic]           = useState('');
  const [keywords, setKeywords]     = useState<string[]>([]);
  const [intent, setIntent]         = useState('agent');
  const [objective, setObjective]   = useState('agent');
  const [funnelStage, setFunnelStage] = useState('agent');
  const [length, setLength]         = useState('medium');
  const [brief, setBrief]           = useState('');
  const [refUrls, setRefUrls]       = useState<string[]>([]);
  const [refUrlInput, setRefUrlInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [includeImages, setIncludeImages]   = useState(true);
  const [includeCTAs, setIncludeCTAs]       = useState(true);
  const [includeFAQ, setIncludeFAQ]         = useState(true);
  const [internalLinks, setInternalLinks]   = useState(true);
  const [generatingTopic, setGeneratingTopic] = useState(false);
  const topicIdxRef  = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAdvance = step === 0
    ? selectedLocations.length > 0
    : topic.trim().length >= 5;

  function handleBrandKitChange(id: string) {
    const kit = BRAND_KITS.find(k => k.id === id);
    if (!kit) return;
    setBrandKitId(id);
    setSelectedLocations(kit.locations.map(l => l.value));
  }

  function handleGenerateTopic() {
    setGeneratingTopic(true);
    setTimeout(() => {
      const pair = GENERATED_TOPIC_PAIRS[topicIdxRef.current % GENERATED_TOPIC_PAIRS.length];
      setTopic(pair.topic);
      setKeywords(pair.keywords);
      topicIdxRef.current += 1;
      setGeneratingTopic(false);
    }, 900);
  }

  function handleAddUrl() {
    const url = refUrlInput.trim();
    if (!url || refUrls.length >= 5 || refUrls.includes(url)) return;
    setRefUrls(prev => [...prev, url]);
    setRefUrlInput('');
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const names = Array.from(files).map(f => f.name);
    setAttachedFiles(prev => [...prev, ...names].filter((v, i, arr) => arr.indexOf(v) === i));
  }

  function handleNext() {
    if (step < 1) {
      setStep(1);
      return;
    }
    // Auto-derive blog name from topic when generating if still empty
    if (!blogName.trim() && topic.trim()) {
      setBlogName(topic.split('\n')[0].trim());
    }
    onGenerate();
  }

  // ── Step 1: Blog setup (agent at top, then topic + all setup fields) ─────────

  function renderStep1() {
    const selectedAgent = BLOG_AGENTS.find(a => a.id === agentId);
    return (
      <div className="space-y-6">
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Blog setup</h2>

        {/* Agent — at the top of blog setup */}
        <div className="space-y-1.5">
          <ContentFlowInfoLabel tooltip="Each agent is optimised for a different blog style and goal.">
            Agent
          </ContentFlowInfoLabel>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-[#e5e9f0] bg-white px-3 py-2 text-[13px] text-[#212121] transition-colors hover:border-[#c0c6d4] dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4] dark:hover:border-[#4d5568]"
              >
                <span className="truncate">{selectedAgent?.label ?? 'Choose an agent...'}</span>
                <ChevronDown size={20} strokeWidth={1.6} absoluteStrokeWidth className="size-5 shrink-0 text-[#888] dark:text-[#6b7280]" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-1">
              <div className="flex flex-col">
                {BLOG_AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setAgentId(agent.id)}
                    className={cn(
                      'flex w-full items-center rounded-md px-3 py-2 text-[13px] text-left transition-colors',
                      agentId === agent.id
                        ? 'bg-[#e8effe] text-[#2552ED] dark:bg-[#1e2d5e] dark:text-[#6b9bff]'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    {agent.label}
                  </button>
                ))}
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  className="flex h-8 w-full items-center gap-1.5 rounded-md px-3 text-[13px] text-primary transition-colors hover:bg-muted"
                >
                  <span>Manage blog agents</span>
                  <ArrowUpRight size={13} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0" />
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Topic */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">
            Topic <span className="text-destructive">*</span>
          </label>
          <ContentFlowTextarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. How to overcome dental anxiety as an adult"
            className="min-h-[100px]"
          />
          <button
            type="button"
            disabled={generatingTopic}
            onClick={handleGenerateTopic}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-60 transition-colors"
          >
            {generatingTopic
              ? <Loader2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="animate-spin text-[#7c3aed]" />
              : <Sparkles size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-[#7c3aed]" />
            }
            {generatingTopic ? 'Generating...' : topic ? 'Regenerate topic' : 'Generate a topic for me'}
          </button>
        </div>

        {/* Target keywords */}
        <div className="space-y-1.5">
          <ContentFlowInfoLabel tooltip="Select the keywords you want this blog to target.">
            Keywords
          </ContentFlowInfoLabel>
          <ContentFlowMultiSelect
            values={keywords}
            options={KEYWORD_OPTIONS}
            onChange={setKeywords}
            placeholder="Select keywords..."
          />
        </div>

        {/* Intent */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Intent</label>
          <ContentFlowSelect value={intent} options={INTENT_OPTIONS} onChange={setIntent} />
        </div>

        {/* Objective */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Objective</label>
          <ContentFlowSelect value={objective} options={OBJECTIVE_OPTIONS} onChange={setObjective} />
        </div>

        {/* Funnel stage */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Funnel stage</label>
          <ContentFlowSelect value={funnelStage} options={FUNNEL_OPTIONS} onChange={setFunnelStage} />
        </div>

        {/* Length */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Length</label>
          <ContentFlowSelect value={length} options={LENGTH_OPTIONS} onChange={setLength} />
        </div>

        {/* Brief */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Anything specific you want covered?</label>
          <ContentFlowTextarea
            value={brief}
            onChange={e => setBrief(e.target.value)}
            placeholder="What angle, tone, or specific points should the agent know about?"
            className="min-h-[100px]"
          />
        </div>

        {/* Reference URLs */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Reference URLs</label>
          <div className="flex items-center gap-2">
            <ContentFlowTextInput
              value={refUrlInput}
              onChange={e => setRefUrlInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUrl(); } }}
              placeholder="https://..."
              className="flex-1"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              disabled={!refUrlInput.trim() || refUrls.length >= 5}
              className="h-10 px-4 rounded-[8px] border border-border bg-background text-[13px] font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              Add
            </button>
          </div>
          {refUrls.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {refUrls.map(url => (
                <div key={url} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-[12px]">
                  <span className="flex-1 text-foreground truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => setRefUrls(prev => prev.filter(u => u !== url))}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X size={12} strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </div>
              ))}
            </div>
          )}
          {refUrls.length >= 5 && (
            <p className="text-[11px] text-muted-foreground">Maximum 5 URLs added</p>
          )}
        </div>

        {/* Attachments */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">Attachments</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={e => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={cn(
              'w-full rounded-lg border-2 border-dashed px-4 py-5 flex flex-col items-center gap-2 transition-colors',
              isDragOver
                ? 'border-primary/50 bg-primary/5'
                : 'border-border hover:border-primary/30 hover:bg-muted/30',
            )}
          >
            <Upload size={18} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
            <span className="text-[13px] font-medium text-foreground">Drop files or click to browse</span>
            <span className="text-[11px] text-muted-foreground">.pdf · .docx · .txt · .png · .jpg</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
          {attachedFiles.length > 0 && (
            <div className="flex flex-col gap-1">
              {attachedFiles.map(name => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-[12px]">
                  <FileText size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground shrink-0" />
                  <span className="flex-1 text-foreground truncate">{name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles(prev => prev.filter(f => f !== name))}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X size={12} strokeWidth={1.6} absoluteStrokeWidth />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advanced options */}
        <div className="rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setAdvancedOpen(o => !o)}
            className="flex items-center justify-between w-full px-4 py-3"
          >
            <span className="text-[13px] font-medium text-foreground">Advanced options</span>
            {advancedOpen
              ? <ChevronUp size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
              : <ChevronDown size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
            }
          </button>
          {advancedOpen && (
            <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
              <ToggleRow label="Include images" checked={includeImages} onChange={setIncludeImages} />
              <ToggleRow label="Include CTAs" checked={includeCTAs} onChange={setIncludeCTAs} />
              <ToggleRow label="Include FAQ section" checked={includeFAQ} onChange={setIncludeFAQ} />
              <ToggleRow label="Internal links" checked={internalLinks} onChange={setInternalLinks} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step 2: Brand identity ───────────────────────────────────────────────────

  function renderStep2() {
    return (
      <div className="space-y-6">
        <h2 className={CONTENT_FLOW_STEP_TITLE_CLASS}>Select brand identity and location</h2>

        {/* Blog name — auto-filled from topic */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">
            Blog name <span className="text-destructive">*</span>
          </label>
          <ContentFlowTextInput
            value={blogName}
            onChange={e => setBlogName(e.target.value)}
            placeholder="e.g. Restaurant dining guide series"
          />
        </div>

        {/* Brand identity */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">
            Brand identity <span className="text-destructive">*</span>
          </label>
          <ContentFlowSelect
            value={brandKitId}
            options={BRAND_KITS.map(k => ({ value: k.id, label: k.label }))}
            onChange={handleBrandKitChange}
          />
        </div>

        {/* Locations */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-foreground">
            Locations <span className="text-destructive">*</span>
          </label>
          <ContentFlowLocationFlatList
            values={selectedLocations}
            options={currentKit.locations}
            onChange={setSelectedLocations}
            description="Choose the locations this content will apply to."
          />
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-background">

      {/* Header — matches ContentEditorShell setup-phase header */}
      <div className="w-full bg-background flex items-center justify-between px-6 py-[9px] flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            aria-label="Go back"
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors flex-none"
          >
            <ArrowLeft size={16} strokeWidth={1.6} absoluteStrokeWidth />
          </button>
          <span className="text-[16px] font-semibold text-foreground leading-tight">Create blog</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(0)}
            disabled={step === 0}
          >
            Back
          </Button>
          <Button
            type="button"
            disabled={!canAdvance}
            onClick={handleNext}
          >
            {step === 0 ? 'Continue' : 'Generate'}
          </Button>
        </div>
      </div>

      {/* Body: left stepper sidebar + right form — same structure as ContentEditorShell */}
      <div className="flex-1 min-h-0 flex">

        {/* Left sidebar — ContentFlowStepper at 250px, exactly matching ContentEditorShell */}
        <aside className="flex-shrink-0 bg-background" style={{ width: 250 }}>
          <div className="px-4 py-4">
            <ContentFlowStepper
              steps={STEPS}
              currentStep={step}
              onStepChange={nextStep => { if (nextStep < step) setStep(nextStep); }}
            />
          </div>
        </aside>

        {/* Right content — same scrollable card shell as BlogInlineCreationFlow */}
        <div className="flex-1 min-w-0 min-h-0 bg-background">
          <div className="h-full overflow-hidden py-4 pl-4 pr-6">
            <div className="h-full overflow-y-auto rounded-lg border border-border bg-background px-[30px] pb-[30px] pt-[30px]">
              <div className="w-1/2 min-w-[520px] max-w-[720px]">
                {step === 0 ? renderStep2() : renderStep1()}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
