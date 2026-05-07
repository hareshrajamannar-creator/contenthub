import React from 'react';
import {
  FileText, Share2, Mail,
  MessageSquare, Monitor, Video, FolderPlus,
} from 'lucide-react';
import {
  MAIN_VIEW_HEADER_BAND_CLASS,
  MAIN_VIEW_PRIMARY_HEADING_CLASS,
} from '@/app/components/layout/mainViewTitleClasses';
import { cn } from '@/app/components/ui/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

export type ContentHomeInitialMode =
  | 'faq' | 'social' | 'email' | 'blog' | 'project'
  | 'brief' | 'templates' | 'socialEditor' | 'emailEditor' | 'blogEditor';

interface ContentHomeProps {
  onNavigate: (view: 'content-hub-create', initialMode?: ContentHomeInitialMode) => void;
  onOpenCanvas?: (mode: 'faq' | 'blog') => void;
  onOpenProjects?: () => void;
}

// ── Create options ─────────────────────────────────────────────────────────────

const CREATE_OPTIONS = [
  { id: 'project', label: 'Create project', desc: 'Multi-content campaign',  icon: FolderPlus,    mode: 'project' as ContentHomeInitialMode, accent: false },
  { id: 'blog',    label: 'Blog post',       desc: 'SEO + AEO long-form',     icon: FileText,      mode: 'blog'    as ContentHomeInitialMode, accent: false },
  { id: 'social',  label: 'Social post',     desc: 'Multi-platform',          icon: Share2,        mode: 'social'  as ContentHomeInitialMode, accent: false },
  { id: 'email',   label: 'Email campaign',  desc: 'Subject + body + CTA',    icon: Mail,          mode: 'email'   as ContentHomeInitialMode, accent: false },
  { id: 'faq',     label: 'FAQ page',        desc: 'AEO-ready Q&A set',       icon: MessageSquare, mode: 'faq'     as ContentHomeInitialMode, accent: false },
  { id: 'landing', label: 'Landing page',    desc: 'Conversion-focused',      icon: Monitor,       mode: 'brief'   as ContentHomeInitialMode, accent: false },
  { id: 'video',   label: 'Video post',      desc: 'Script + storyboard',     icon: Video,         mode: 'brief'   as ContentHomeInitialMode, accent: false },
];

// ── Mini canvas card previews ──────────────────────────────────────────────────

function MiniFaqCard() {
  return (
    <div className="w-full h-full flex flex-col border border-zinc-200 rounded-lg bg-white overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-1.5 px-2 py-[5px] border-b border-zinc-100">
        <div className="w-[14px] h-[14px] rounded-[3px] bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
          <MessageSquare size={7} strokeWidth={1.6} absoluteStrokeWidth className="text-purple-600" />
        </div>
        <span className="text-[5.5px] font-semibold text-zinc-700 flex-1">FAQ page</span>
        <div className="flex items-center gap-[3px]">
          <div className="w-8 h-[2.5px] rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '78%', backgroundColor: '#1D9E75' }} />
          </div>
          <span className="text-[5px] font-bold" style={{ color: '#1D9E75', background: '#DCFCE7', borderRadius: 2, padding: '1px 2px' }}>78</span>
        </div>
      </div>
      {/* Section header */}
      <div className="px-2 py-[2px] bg-zinc-50 border-b border-zinc-100">
        <span className="text-[5px] text-zinc-500 font-medium">General Questions</span>
      </div>
      {/* Q&A rows */}
      {[
        { q: 'What is a property appraisal?',      w: '80%' },
        { q: 'How long does the process take?',    w: '65%' },
        { q: 'What factors affect value?',          w: '72%' },
        { q: 'Do I need one to sell my home?',     w: '68%' },
        { q: 'How is the report delivered?',        w: '74%' },
      ].map((item, i) => (
        <div key={i} className="px-2 py-[2px] border-b border-zinc-50 last:border-0">
          <span className="block text-[5.5px] text-zinc-700 font-medium leading-tight">{item.q}</span>
          <div className="mt-[1.5px] h-[2px] rounded-full bg-zinc-100" style={{ width: item.w }} />
        </div>
      ))}
    </div>
  );
}

function MiniBlogCard() {
  return (
    <div className="w-full h-full flex flex-col border border-zinc-200 rounded-lg bg-white overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-1.5 px-2 py-[5px] border-b border-zinc-100">
        <div className="w-[14px] h-[14px] rounded-[3px] bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <FileText size={7} strokeWidth={1.6} absoluteStrokeWidth className="text-blue-600" />
        </div>
        <span className="text-[5.5px] font-semibold text-zinc-700 flex-1">Blog post</span>
        <div className="flex items-center gap-[3px]">
          <div className="w-8 h-[2.5px] rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '92%', backgroundColor: '#1D9E75' }} />
          </div>
          <span className="text-[5px] font-bold" style={{ color: '#1D9E75', background: '#DCFCE7', borderRadius: 2, padding: '1px 2px' }}>92</span>
        </div>
      </div>
      {/* Featured image */}
      <div className="relative h-[58px] shrink-0 overflow-hidden border-b border-zinc-100">
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-blue-100" />
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-[22px] bg-gradient-to-r from-slate-400 to-slate-300" />
        {/* Building left */}
        <div className="absolute bottom-[22px] left-[18px] w-[18px] h-[20px] bg-slate-500" />
        <div className="absolute bottom-[22px] left-[24px] w-[4px] h-[6px] bg-blue-200/60" />
        {/* Building right */}
        <div className="absolute bottom-[22px] left-[42px] w-[12px] h-[14px] bg-slate-600" />
        {/* Trees */}
        <div className="absolute bottom-[22px] right-[24px] w-[6px] h-[12px] bg-green-700/70 rounded-t-full" />
        <div className="absolute bottom-[22px] right-[14px] w-[5px] h-[10px] bg-green-700/50 rounded-t-full" />
        {/* Sun */}
        <div className="absolute top-[8px] right-[30px] w-[10px] h-[10px] rounded-full bg-amber-300/80" />
      </div>
      {/* Blog text content */}
      <div className="px-2 py-[5px] flex flex-col gap-[3px] flex-1 overflow-hidden">
        {/* Tag */}
        <div className="flex gap-[3px]">
          <span style={{ fontSize: 4.5, background: '#EFF6FF', color: '#2563EB', borderRadius: 2, padding: '1px 3px', fontWeight: 600 }}>Property</span>
          <span style={{ fontSize: 4.5, background: '#F0FDF4', color: '#16A34A', borderRadius: 2, padding: '1px 3px', fontWeight: 600 }}>Guide</span>
        </div>
        {/* Title */}
        <span className="block text-[6px] font-bold text-zinc-800 leading-tight">Dubbo Property Appraisal Guide 2025</span>
        {/* Byline */}
        <div className="flex items-center gap-[4px]">
          <div className="w-[8px] h-[8px] rounded-full bg-zinc-300 shrink-0" />
          <div className="h-[2px] rounded-full bg-zinc-200" style={{ width: 28 }} />
          <div className="h-[2px] rounded-full bg-zinc-100" style={{ width: 18 }} />
        </div>
        {/* Paragraph lines */}
        <div className="flex flex-col gap-[2px] mt-[1px]">
          <div className="h-[2px] rounded-full bg-zinc-200 w-full" />
          <div className="h-[2px] rounded-full bg-zinc-200" style={{ width: '88%' }} />
          <div className="h-[2px] rounded-full bg-zinc-200" style={{ width: '72%' }} />
        </div>
      </div>
    </div>
  );
}

function MiniPropertyFaqCard() {
  return (
    <div className="w-full h-full flex flex-col border border-zinc-200 rounded-lg bg-white overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-1.5 px-2 py-[5px] border-b border-zinc-100">
        <div className="w-[14px] h-[14px] rounded-[3px] bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
          <MessageSquare size={7} strokeWidth={1.6} absoluteStrokeWidth className="text-purple-600" />
        </div>
        <span className="text-[5.5px] font-semibold text-zinc-700 flex-1">FAQ page</span>
        <div className="flex items-center gap-[3px]">
          <div className="w-8 h-[2.5px] rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '95%', backgroundColor: '#1D9E75' }} />
          </div>
          <span className="text-[5px] font-bold" style={{ color: '#1D9E75', background: '#DCFCE7', borderRadius: 2, padding: '1px 2px' }}>95</span>
        </div>
      </div>
      {/* Section header */}
      <div className="px-2 py-[2px] bg-zinc-50 border-b border-zinc-100">
        <span className="text-[5px] text-zinc-500 font-medium">Property Appraisal</span>
      </div>
      {/* Q&A rows */}
      {[
        { q: 'How is property value calculated?', w: '82%' },
        { q: 'Do I need an appraisal to sell?',   w: '68%' },
        { q: 'How do I choose an appraiser?',     w: '75%' },
        { q: 'What documents are needed?',         w: '60%' },
        { q: 'How long does valuation take?',      w: '70%' },
      ].map((item, i) => (
        <div key={i} className="px-2 py-[2px] border-b border-zinc-50 last:border-0">
          <span className="block text-[5.5px] text-zinc-700 font-medium leading-tight">{item.q}</span>
          <div className="mt-[1.5px] h-[2px] rounded-full bg-zinc-100" style={{ width: item.w }} />
        </div>
      ))}
    </div>
  );
}

function MiniBlogCard2() {
  return (
    <div className="w-full h-full flex flex-col border border-zinc-200 rounded-lg bg-white overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-1.5 px-2 py-[5px] border-b border-zinc-100">
        <div className="w-[14px] h-[14px] rounded-[3px] bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <FileText size={7} strokeWidth={1.6} absoluteStrokeWidth className="text-blue-600" />
        </div>
        <span className="text-[5.5px] font-semibold text-zinc-700 flex-1">Blog post</span>
        <div className="flex items-center gap-[3px]">
          <div className="w-8 h-[2.5px] rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '88%', backgroundColor: '#1D9E75' }} />
          </div>
          <span className="text-[5px] font-bold" style={{ color: '#1D9E75', background: '#DCFCE7', borderRadius: 2, padding: '1px 2px' }}>88</span>
        </div>
      </div>
      {/* Featured image — garden/spring scene */}
      <div className="relative h-[58px] shrink-0 overflow-hidden border-b border-zinc-100">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-green-100" />
        <div className="absolute bottom-0 left-0 right-0 h-[18px] bg-gradient-to-r from-green-600 to-green-500" />
        <div className="absolute bottom-[18px] left-[8px] w-[18px] h-[22px] bg-green-700 rounded-t-full" />
        <div className="absolute bottom-[18px] left-[22px] w-[12px] h-[16px] bg-green-600 rounded-t-full" />
        <div className="absolute bottom-[18px] right-[12px] w-[16px] h-[20px] bg-green-700/80 rounded-t-full" />
        <div className="absolute bottom-[20px] left-[40px] w-[5px] h-[5px] rounded-full bg-pink-400/90" />
        <div className="absolute bottom-[20px] left-[50px] w-[4px] h-[4px] rounded-full bg-yellow-400/90" />
        <div className="absolute bottom-[21px] left-[60px] w-[4px] h-[4px] rounded-full bg-pink-300/90" />
        <div className="absolute top-[7px] right-[28px] w-[9px] h-[9px] rounded-full bg-amber-300/80" />
      </div>
      {/* Blog text content */}
      <div className="px-2 py-[5px] flex flex-col gap-[3px] flex-1 overflow-hidden">
        <div className="flex gap-[3px]">
          <span style={{ fontSize: 4.5, background: '#F0FDF4', color: '#16A34A', borderRadius: 2, padding: '1px 3px', fontWeight: 600 }}>Seasonal</span>
          <span style={{ fontSize: 4.5, background: '#FFF7ED', color: '#EA580C', borderRadius: 2, padding: '1px 3px', fontWeight: 600 }}>Tips</span>
        </div>
        <span className="block text-[6px] font-bold text-zinc-800 leading-tight">Spring Garden Cleanup: A Complete Guide</span>
        <div className="flex items-center gap-[4px]">
          <div className="w-[8px] h-[8px] rounded-full bg-zinc-300 shrink-0" />
          <div className="h-[2px] rounded-full bg-zinc-200" style={{ width: 28 }} />
          <div className="h-[2px] rounded-full bg-zinc-100" style={{ width: 18 }} />
        </div>
        <div className="flex flex-col gap-[2px] mt-[1px]">
          <div className="h-[2px] rounded-full bg-zinc-200 w-full" />
          <div className="h-[2px] rounded-full bg-zinc-200" style={{ width: '88%' }} />
          <div className="h-[2px] rounded-full bg-zinc-200" style={{ width: '72%' }} />
        </div>
      </div>
    </div>
  );
}

// ── AI suggestions ─────────────────────────────────────────────────────────────

const SUGGESTIONS: {
  id: string; kind: string; kindColor: string; title: string; why: string;
  cta: string; canvasMode: 'faq' | 'blog'; Preview: React.FC;
}[] = [
  {
    id: 'rec-faq',
    kind: 'FAQ suggestion',
    kindColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-300',
    title: 'Add FAQ schema for "property appraisal Dubbo"',
    why: 'Estimated 12% increase in AEO citation share. AI-generated and scored 95/100, ready for your review.',
    cta: 'Review & publish',
    canvasMode: 'faq',
    Preview: MiniFaqCard,
  },
  {
    id: 'faq-appraisal',
    kind: 'FAQ suggestion',
    kindColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-300',
    title: 'Property appraisal FAQs, Dubbo',
    why: 'Twelve questions structured for voice search readiness and featured snippet capture.',
    cta: 'Review & publish',
    canvasMode: 'faq',
    Preview: MiniPropertyFaqCard,
  },
  {
    id: 'blog-dubbo',
    kind: 'Blog suggestion',
    kindColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300',
    title: 'Dubbo property appraisal hub page',
    why: 'Closes a 75% visibility gap against top local competitors. AI draft is ready to review and publish.',
    cta: 'Review & publish',
    canvasMode: 'blog',
    Preview: MiniBlogCard,
  },
  {
    id: 'blog-spring',
    kind: 'Blog suggestion',
    kindColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300',
    title: 'Spring garden cleanup: a complete guide',
    why: 'Seasonal content timed to peak search interest. Structured to capture featured snippets across 8 queries.',
    cta: 'Review & publish',
    canvasMode: 'blog',
    Preview: MiniBlogCard2,
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export const ContentHome = ({ onNavigate, onOpenCanvas }: ContentHomeProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background overflow-y-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={MAIN_VIEW_HEADER_BAND_CLASS}>
        <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>Home</h1>
      </div>

      {/* ── What would you like to create today? ─────────────────────────── */}
      <section className="px-6 pb-8 shrink-0">
        <p className="text-[12px] font-medium text-muted-foreground mb-3">
          What would you like to create today?
        </p>
        <div className="grid grid-cols-7 gap-3">
          {CREATE_OPTIONS.map(opt => (
            <div
              key={opt.id}
              onClick={() => onNavigate('content-hub-create', opt.mode)}
              className={cn(
                'border rounded-xl p-4 cursor-pointer transition-all flex flex-col gap-3',
                opt.accent
                  ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                  : 'border-border bg-background hover:bg-muted/40 hover:border-primary/20'
              )}
            >
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', opt.accent ? 'bg-primary/15' : 'bg-primary/[0.07]')}>
                <opt.icon size={18} strokeWidth={1.6} absoluteStrokeWidth className={opt.accent ? 'text-primary' : 'text-foreground/70'} />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className={cn('text-[13px] font-medium leading-snug', opt.accent ? 'text-primary' : 'text-foreground')}>{opt.label}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{opt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Suggested for you ─────────────────────────────────────────────── */}
      <section className="px-6 pb-8 shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[12px] font-medium text-muted-foreground">Suggested for you</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {SUGGESTIONS.map(s => {
            const open = () => onOpenCanvas ? onOpenCanvas(s.canvasMode) : onNavigate('content-hub-create', s.canvasMode);
            return (
              <div
                key={s.id}
                onClick={open}
                className="border border-border rounded-[10px] bg-background hover:border-primary/30 transition-all cursor-pointer group flex flex-col overflow-hidden"
              >
                {/* Canvas card preview */}
                <div className="relative h-[200px] bg-zinc-100 border-b border-border overflow-hidden">
                  <div className="absolute inset-0 p-5">
                    <div className="w-full h-full rounded-lg overflow-hidden">
                      <s.Preview />
                    </div>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={e => { e.stopPropagation(); open(); }}
                      className="h-7 px-3 rounded-md bg-primary text-[11px] font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      {s.cta}
                    </button>
                  </div>
                </div>
                {/* Card body */}
                <div className="p-3 flex flex-col gap-1.5">
                  <span className={cn('self-start text-[10px] font-medium px-1.5 py-0.5 rounded', s.kindColor)}>{s.kind}</span>
                  <p className="text-[12px] text-foreground font-medium leading-snug line-clamp-2">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{s.why}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
