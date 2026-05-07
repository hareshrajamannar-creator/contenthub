/**
 * BlogEditor — 3-column editor for blog post content.
 *
 * Left:   AI/Manual toggle + mode-specific controls
 * Center: Document editor canvas (Blaze-style full-width)
 * Right:  ContentScorePanel (canonical shared score display)
 */
import React, { useState } from 'react';
import {
  ArrowLeft, Sparkles, RotateCcw,
  AlignLeft, Heading1, Heading2, Bold, Italic, List, Link,
  CheckCircle2, TriangleAlert,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { SegmentedToggle } from '@/app/components/ui/segmented-toggle.v1';
import {
  ContentScorePanel,
  type ScoreDim,
  type QuickWin,
} from '../shared/ContentScorePanel';

// ── Mock data ─────────────────────────────────────────────────────────────────

const BLOG_SCORE = 87;

const BLOG_DIMS: ScoreDim[] = [
  { label: 'Brand voice',      score: 90, weight: 30 },
  { label: 'Factual accuracy', score: 85, weight: 30 },
  { label: 'SEO optimization', score: 82, weight: 25 },
  { label: 'Content depth',    score: 88, weight: 15 },
];

const BLOG_QUICK_WINS: QuickWin[] = [
  {
    label: 'Add internal links',
    description: 'Add 2+ internal links to boost SEO authority.',
    action: 'Add links',
  },
  {
    label: 'Add an FAQ section',
    description: 'FAQ sections increase AEO score by up to 20%.',
    action: 'Add FAQ',
  },
];

const MOCK_TITLE = 'How Local Businesses Are Winning With AI-Powered Review Responses';

const MOCK_BODY = `Online reviews shape purchasing decisions more than ever. According to a 2024 BrightLocal survey, 93% of consumers read reviews before visiting a local business, and 89% say they're more likely to choose a business that responds to all reviews.

## The AI Advantage

AI-powered response tools help local businesses respond faster and more consistently — without sacrificing personalization. Rather than templated copy-paste replies, modern AI can:

- **Personalize** each response based on the reviewer's specific feedback
- **Match your brand voice** across thousands of locations
- **Escalate** negative reviews to the right team member automatically

## Getting Started

The most effective approach is to start with your most common review scenarios — 5-star compliments, 3-star mixed reviews, and 1-star complaints. Training your AI on these three patterns covers 85% of real-world cases.

## What Results to Expect

Businesses using AI review response tools typically see a **23% increase in review volume** within 60 days, as customers feel more acknowledged and are more likely to leave follow-up feedback.`;

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'ai' | 'manual';

interface SEOItem {
  label: string;
  passed: boolean;
  note?: string;
}

const SEO_CHECKLIST: SEOItem[] = [
  { label: 'Title tag optimized',       passed: true },
  { label: 'Meta description present',  passed: true },
  { label: 'Primary keyword in H1',     passed: true },
  { label: 'Internal links added',      passed: false, note: 'Add 2+ internal links' },
  { label: 'Image alt text',            passed: false, note: 'No images added yet' },
  { label: 'Word count > 700',          passed: true },
  { label: 'FAQ section present',       passed: false, note: 'Add an FAQ for AEO boost' },
  { label: 'Reading level appropriate', passed: true },
];

// ── Left panel — AI mode ──────────────────────────────────────────────────────

function AIModePanel({ onGenerate }: { onGenerate: (prompt: string) => void }) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const suggestions = [
    'How AI is changing reputation management for local businesses',
    'Top 5 ways to improve your Google Maps ranking',
    'What the Google SGE update means for local SEO',
  ];

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setTimeout(() => { setIsGenerating(false); onGenerate(prompt); }, 1800);
  };

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2">
        <Sparkles size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-primary" />
        <span className="text-[12px] font-medium text-foreground">AI writes your blog post</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted-foreground">Topic or title idea</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. How local businesses can use AI to respond to reviews at scale…"
          rows={4}
          className="w-full text-[12px] border border-input rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] text-muted-foreground">Tone</span>
        {['Educational', 'Thought leadership', 'How-to guide'].map((t) => (
          <button
            key={t}
            className="text-left text-[12px] text-foreground px-3 py-2 border border-border rounded-lg hover:border-primary/40 hover:bg-muted/50 transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-muted-foreground">Or try a topic</span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setPrompt(s)}
            className="text-left text-[12px] text-foreground px-3 py-2 border border-border rounded-lg hover:border-primary/40 hover:bg-muted/50 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <Button
        variant="default"
        size="sm"
        disabled={!prompt.trim() || isGenerating}
        onClick={handleGenerate}
        className="mt-auto"
      >
        {isGenerating ? (
          <>
            <div className="w-3 h-3 rounded-full border-[1.5px] border-primary-foreground border-t-transparent animate-spin mr-2" />
            Writing…
          </>
        ) : (
          <>
            <Sparkles size={12} strokeWidth={1.6} absoluteStrokeWidth className="mr-1.5" />
            Write blog post
          </>
        )}
      </Button>
    </div>
  );
}

// ── Left panel — Manual mode ──────────────────────────────────────────────────

function ManualModePanel({
  title,
  onTitleChange,
}: {
  title: string;
  onTitleChange: (s: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted-foreground">Title</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full text-[12px] border border-input rounded-md h-8 px-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Blog post title…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted-foreground">Meta description</label>
        <textarea
          placeholder="Brief description for search engines (150–160 chars)…"
          rows={3}
          className="w-full text-[12px] border border-input rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted-foreground">Target keywords</label>
        <input
          className="w-full text-[12px] border border-input rounded-md h-8 px-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="review management, local SEO, Google Maps…"
        />
        <p className="text-[10px] text-muted-foreground">Separate with commas</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted-foreground">Word count target</label>
        <div className="flex gap-1.5">
          {['500', '800', '1200', '2000'].map((wc) => (
            <button
              key={wc}
              className={`flex-1 text-[11px] py-1 rounded-md border transition-colors ${
                wc === '800'
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              {wc}w
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full gap-1.5 mt-auto">
        <Sparkles size={11} strokeWidth={1.6} absoluteStrokeWidth />
        AI assist writing
      </Button>
    </div>
  );
}

// ── Center — document editor ──────────────────────────────────────────────────

function DocumentEditor({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col h-full w-full overflow-auto bg-muted/30">
      {/* Formatting toolbar */}
      <div className="flex-shrink-0 bg-background border-b border-border px-6 py-2 flex items-center gap-1">
        {[
          { icon: <Heading1 size={14} strokeWidth={1.6} absoluteStrokeWidth />, label: 'Heading 1' },
          { icon: <Heading2 size={14} strokeWidth={1.6} absoluteStrokeWidth />, label: 'Heading 2' },
          { icon: <Bold size={14} strokeWidth={1.6} absoluteStrokeWidth />, label: 'Bold' },
          { icon: <Italic size={14} strokeWidth={1.6} absoluteStrokeWidth />, label: 'Italic' },
          { icon: <List size={14} strokeWidth={1.6} absoluteStrokeWidth />, label: 'List' },
          { icon: <Link size={14} strokeWidth={1.6} absoluteStrokeWidth />, label: 'Link' },
          { icon: <AlignLeft size={14} strokeWidth={1.6} absoluteStrokeWidth />, label: 'Align' },
        ].map((btn) => (
          <button
            key={btn.label}
            title={btn.label}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {btn.icon}
          </button>
        ))}
        <div className="h-4 w-px bg-border mx-1" />
        <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Sparkles size={11} strokeWidth={1.6} absoluteStrokeWidth />
          AI rewrite
        </button>
      </div>

      {/* Document area — Blaze-style */}
      <div className="flex-grow overflow-auto flex justify-center py-8 px-4">
        <div className="w-full max-w-[700px] bg-white rounded-[12px] shadow-sm border border-border/50 px-12 py-10 flex flex-col gap-6">
          {/* Title */}
          <h1 className="text-[22px] text-foreground leading-tight">{title}</h1>

          {/* Word count + read time */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground border-b border-border pb-4">
            <span>~{body.split(/\s+/).length} words</span>
            <span>·</span>
            <span>~{Math.ceil(body.split(/\s+/).length / 200)} min read</span>
            <span>·</span>
            <span className="text-primary">AEO optimized</span>
          </div>

          {/* Body */}
          <div className="prose prose-sm max-w-none text-[14px] text-foreground leading-relaxed">
            {body.split('\n\n').map((para, i) => {
              if (para.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-[17px] text-foreground mt-4 mb-2">
                    {para.replace('## ', '')}
                  </h2>
                );
              }
              if (para.startsWith('- ')) {
                return (
                  <ul key={i} className="list-disc pl-5 flex flex-col gap-1 mb-3">
                    {para.split('\n').filter((l) => l.startsWith('- ')).map((line, j) => (
                      <li key={j} className="text-[13px]">
                        {line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '$1')}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-[13px] mb-3 leading-relaxed">
                  {para.replace(/\*\*(.*?)\*\*/g, '$1')}
                </p>
              );
            })}
          </div>

          {/* SEO checklist — collapsed inside the doc */}
          <details className="border-t border-border pt-4">
            <summary className="text-[12px] text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
              SEO checklist — {SEO_CHECKLIST.filter(i => i.passed).length}/{SEO_CHECKLIST.length} passed
            </summary>
            <div className="mt-3 flex flex-col gap-1.5">
              {SEO_CHECKLIST.map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.passed ? 'bg-green-100' : 'bg-muted'
                  }`}>
                    {item.passed ? (
                      <CheckCircle2 size={10} strokeWidth={1.6} absoluteStrokeWidth className="text-green-600" />
                    ) : (
                      <TriangleAlert size={9} strokeWidth={1.6} absoluteStrokeWidth className="text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className={`text-[11px] leading-tight ${item.passed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </p>
                    {item.note && !item.passed && (
                      <p className="text-[10px] text-amber-600 mt-0.5">{item.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface BlogEditorProps {
  initialTitle?: string;
  initialBody?: string;
  onBack: () => void;
  onPublish?: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({
  initialTitle = MOCK_TITLE,
  initialBody = MOCK_BODY,
  onBack,
  onPublish,
}) => {
  const [mode, setMode] = useState<Mode>('ai');
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const handleAIGenerate = (prompt: string) => {
    void prompt;
    setTitle(MOCK_TITLE);
    setBody(MOCK_BODY);
  };

  return (
    <div className="flex flex-col h-full w-full bg-muted/20">
      {/* Header bar */}
      <div className="flex-shrink-0 h-[52px] bg-background border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.6} />
            Back to review
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="text-[14px] text-foreground">Blog editor</span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            Draft
          </span>
        </div>
        <Button variant="ghost" size="sm">
          <RotateCcw size={13} strokeWidth={1.6} absoluteStrokeWidth className="mr-1.5" />
          Regenerate
        </Button>
      </div>

      {/* Three columns */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left — 260px */}
        <div className="w-[260px] flex-shrink-0 bg-background border-r border-border flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-4 py-3 border-b border-border">
            <SegmentedToggle
              items={[
                { value: 'ai' as Mode,     label: 'AI',     icon: <Sparkles size={11} strokeWidth={1.6} absoluteStrokeWidth /> },
                { value: 'manual' as Mode, label: 'Manual' },
              ]}
              value={mode}
              onChange={setMode}
              className="w-full"
            />
          </div>
          <div className="flex-grow overflow-hidden">
            {mode === 'ai' ? (
              <AIModePanel onGenerate={handleAIGenerate} />
            ) : (
              <ManualModePanel title={title} onTitleChange={setTitle} />
            )}
          </div>
        </div>

        {/* Center — flex-1, document editor */}
        <DocumentEditor title={title} body={body} />

        {/* Right — 300px — canonical ContentScorePanel */}
        <div className="w-[300px] flex-shrink-0 border-l border-border overflow-hidden">
          <ContentScorePanel
            title="Blog score"
            scoreLabel="AEO Content score"
            score={BLOG_SCORE}
            dimensions={BLOG_DIMS}
            quickWins={BLOG_QUICK_WINS}
          />
        </div>
      </div>
    </div>
  );
};
