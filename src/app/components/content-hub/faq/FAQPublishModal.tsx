/**
 * FAQPublishModal — rich publish / export hub.
 */
import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Globe, Download, Layers, Puzzle, Code2,
  CheckCircle2, ExternalLink,
  Copy, CheckCheck, ChevronRight, X,
  FileCode2, FileText, Braces, Table2, Image,
} from 'lucide-react';
import type { FAQItem } from './FAQReviewCard';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FAQPublishModalProps {
  open: boolean;
  onClose: () => void;
  faqs: FAQItem[];
  overallScore: number;
}

type Destination = 'birdeye' | 'html' | 'wordpress' | 'framer' | 'embed';

// ── Helpers ────────────────────────────────────────────────────────────────────

function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    });
  };
  return { copied, copy };
}

function escHtml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function buildHTML(faqs: FAQItem[]): string {
  const ready = faqs.filter(f => f.status === 'ready');
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ready.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }, null, 2);

  const rows = ready.map(f => `
    <details class="faq-item">
      <summary class="faq-q">${escHtml(f.question)}</summary>
      <div class="faq-a">${escHtml(f.answer)}</div>
    </details>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>FAQ</title>
  <script type="application/ld+json">${schema}</script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;background:#f9fafb}
    .wrap{max-width:720px;margin:64px auto;padding:0 24px}
    h1{font-size:28px;font-weight:700;margin-bottom:32px}
    .faq-item{border:1px solid #e5e7eb;border-radius:10px;background:#fff;margin-bottom:10px;overflow:hidden}
    .faq-q{cursor:pointer;font-size:15px;font-weight:500;padding:16px 20px;list-style:none;
      display:flex;justify-content:space-between;align-items:center;user-select:none}
    .faq-q::-webkit-details-marker{display:none}
    .faq-q::after{content:'+';font-size:20px;color:#6b7280;transition:transform .2s}
    details[open] .faq-q::after{content:'−'}
    .faq-a{padding:0 20px 16px;font-size:14px;line-height:1.65;color:#374151}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Frequently Asked Questions</h1>${rows}
  </div>
</body>
</html>`;
}

function triggerDownload(content: string, mime: string, filename: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

function downloadHTML(faqs: FAQItem[]) {
  triggerDownload(buildHTML(faqs), 'text/html', 'faq.html');
}

function downloadJSON(faqs: FAQItem[]) {
  const data = faqs
    .filter(f => f.status === 'ready')
    .map(f => ({ question: f.question, answer: f.answer }));
  triggerDownload(JSON.stringify(data, null, 2), 'application/json', 'faq.json');
}

function downloadCSV(faqs: FAQItem[]) {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = [
    'question,answer',
    ...faqs
      .filter(f => f.status === 'ready')
      .map(f => `${esc(f.question)},${esc(f.answer)}`),
  ];
  triggerDownload(rows.join('\n'), 'text/csv', 'faq.csv');
}

function downloadPDF(faqs: FAQItem[]) {
  const ready = faqs.filter(f => f.status === 'ready');
  const body  = ready
    .map(f => `<div class="item"><h2>${escHtml(f.question)}</h2><p>${escHtml(f.answer)}</p></div>`)
    .join('\n');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>FAQ</title>
<style>
  body{font-family:-apple-system,sans-serif;max-width:700px;margin:48px auto;color:#111}
  h1{font-size:26px;margin-bottom:32px}
  .item{margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #e5e7eb}
  .item:last-child{border-bottom:none}
  h2{font-size:15px;font-weight:600;margin:0 0 8px}
  p{font-size:13px;line-height:1.7;margin:0;color:#374151}
  @media print{body{margin:32px}}
</style>
</head><body>
<h1>Frequently Asked Questions</h1>${body}
<script>window.onload=()=>{window.print()}<\/script>
</body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

function downloadPNG(faqs: FAQItem[]) {
  const ready = faqs.filter(f => f.status === 'ready');
  const padding = 40;
  const width = 800;
  const rowH = 44;
  const headerH = 88;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = headerH + ready.length * rowH + padding;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Frequently Asked Questions', padding, padding + 24);

  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(padding, headerH - 16, width - padding * 2, 1);

  ready.forEach((faq, i) => {
    const y = headerH + i * rowH;
    ctx.fillStyle = '#374151';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    const q = faq.question.length > 90 ? faq.question.slice(0, 90) + '…' : faq.question;
    ctx.fillText(q, padding, y + 24);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(padding, y + rowH - 1, width - padding * 2, 1);
  });

  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'faq.png' }).click();
    URL.revokeObjectURL(url);
  });
}

const FAQ_SET_ID = 'faq-set-001';

// ── Summary bar ───────────────────────────────────────────────────────────────

function PublishSummary({ faqs, score }: { faqs: FAQItem[]; score: number }) {
  const ready     = faqs.filter(f => f.status === 'ready').length;
  const needsWork = faqs.filter(f => f.status === 'needs-work').length;

  const [scoreBg, scoreFg] =
    score >= 80 ? ['#dcfce7','#166534'] :
    score >= 60 ? ['#fef9c3','#854d0e'] :
                  ['#fee2e2','#991b1b'];

  return (
    <div className="flex items-center gap-3 px-6 py-2.5 bg-muted/40 border-b border-border flex-wrap">
      <div className="flex items-center gap-1.5">
        <CheckCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-green-600 flex-shrink-0" />
        <span className="text-[12px] font-medium text-foreground">{ready} ready</span>
      </div>
      {needsWork > 0 && (
        <span className="text-[12px] text-muted-foreground">{needsWork} needs work (skipped)</span>
      )}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground">AEO score</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: scoreBg, color: scoreFg }}>{score}/100</span>
      </div>
    </div>
  );
}

// ── Destination card ──────────────────────────────────────────────────────────

interface DestCardProps {
  id: Destination;
  title: string;
  badge?: string;
  badgeClass?: string;
  selected: boolean;
  onSelect: (id: Destination) => void;
}

function DestCard({ id, title, badge, badgeClass = 'bg-primary/10 text-primary', selected, onSelect }: DestCardProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        'w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg transition-all',
        selected
          ? 'bg-primary/[0.06] text-primary'
          : 'text-foreground hover:bg-muted/60',
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-medium">{title}</span>
        {badge && (
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', badgeClass)}>{badge}</span>
        )}
      </div>
      <ChevronRight size={13} strokeWidth={1.6} absoluteStrokeWidth
        className={cn('flex-shrink-0 transition-colors', selected ? 'text-primary' : 'text-muted-foreground/30')} />
    </button>
  );
}

// ── Detail panels ─────────────────────────────────────────────────────────────

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map(t => (
        <li key={t} className="flex items-start gap-2 text-[12px] text-muted-foreground">
          <CheckCircle2 size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-green-500 mt-0.5 flex-shrink-0" />
          {t}
        </li>
      ))}
    </ul>
  );
}

function BirdeyePanel() {
  const [isLive, setIsLive] = useState(false);
  const url = `https://birdeye.com/faq/${FAQ_SET_ID}`;
  const { copied, copy } = useCopy();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground mb-1">Birdeye hosted page</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Go live on a Birdeye-hosted page with structured FAQ schema markup —
          indexed by Google instantly, no developer needed.
        </p>
      </div>

      <div className={cn(
        'flex items-center justify-between px-4 py-3.5 rounded-xl border-[1.5px] transition-all',
        isLive ? 'border-green-400 bg-green-50/50' : 'border-border bg-muted/20',
      )}>
        <div>
          <div className="text-[13px] font-semibold text-foreground mb-0.5">
            {isLive ? '🟢 Published' : '⚪ Draft'}
          </div>
          <div className="text-[11px] text-muted-foreground">{url}</div>
        </div>
        <button
          onClick={() => setIsLive(v => !v)}
          role="switch"
          aria-checked={isLive}
          className={cn(
            'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent',
            'transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30',
            isLive ? 'bg-green-500' : 'bg-muted-foreground/30',
          )}
        >
          <span className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition duration-200',
            isLive ? 'translate-x-5' : 'translate-x-0',
          )} />
        </button>
      </div>

      {isLive && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-green-600 flex-shrink-0" />
          <span className="text-[12px] text-green-800 flex-1">Your FAQ is live with AEO schema markup.</span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-green-700 hover:text-green-900 hover:bg-green-100"
            onClick={() => window.open(url, '_blank')}>
            <ExternalLink size={12} strokeWidth={1.6} absoluteStrokeWidth />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1 border border-border rounded-lg bg-muted/30 px-3 py-2 min-w-0">
          <Globe size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground flex-shrink-0" />
          <span className="text-[11px] text-muted-foreground truncate">{url}</span>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0" onClick={() => copy(url)}>
          {copied
            ? <><CheckCheck size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-green-600" /> Copied!</>
            : <><Copy size={12} strokeWidth={1.6} absoluteStrokeWidth /> Copy link</>}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0"
          onClick={() => window.open(url, '_blank')}>
          <ExternalLink size={12} strokeWidth={1.6} absoluteStrokeWidth />
          Preview
        </Button>
      </div>

      <FeatureList items={[
        'Structured FAQ schema for AI & traditional search',
        'Auto-indexed by Google and Bing',
        'Live-updates whenever you edit questions here',
      ]} />
    </div>
  );
}

// ── Download panel ────────────────────────────────────────────────────────────

type DownloadFormat = 'html' | 'pdf' | 'json' | 'csv' | 'png';

interface FormatConfig {
  id: DownloadFormat;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
  sizeNote: (readyCount: number) => string;
  onDownload: (faqs: FAQItem[]) => void;
}

const FORMAT_CONFIG: FormatConfig[] = [
  {
    id: 'html',
    icon: <FileCode2 size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-orange-600" />,
    iconBg: '#fff7ed',
    label: 'HTML',
    description: 'Self-contained web page with JSON-LD AEO schema baked in. Drop into any server or CMS.',
    sizeNote: (n) => `${n} questions · ~${Math.max(1, Math.round(buildHTML([]).length / 1024 + n * 0.3))} KB`,
    onDownload: downloadHTML,
  },
  {
    id: 'pdf',
    icon: <FileText size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-red-500" />,
    iconBg: '#fef2f2',
    label: 'PDF',
    description: 'Print-ready document. Opens browser print dialog — save as PDF from there.',
    sizeNote: (n) => `${n} questions · via browser print`,
    onDownload: downloadPDF,
  },
  {
    id: 'json',
    icon: <Braces size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-violet-600" />,
    iconBg: '#f5f3ff',
    label: 'JSON',
    description: 'Structured Q&A data for developers — import into any app or CMS via API.',
    sizeNote: (n) => `${n} questions · ~${Math.max(1, Math.round(n * 0.18))} KB`,
    onDownload: downloadJSON,
  },
  {
    id: 'csv',
    icon: <Table2 size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-emerald-600" />,
    iconBg: '#f0fdf4',
    label: 'CSV',
    description: 'Question & answer pairs in spreadsheet format. Open in Excel, Sheets, or Notion.',
    sizeNote: (n) => `${n} rows · ~${Math.max(1, Math.round(n * 0.08))} KB`,
    onDownload: downloadCSV,
  },
  {
    id: 'png',
    icon: <Image size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-sky-500" />,
    iconBg: '#f0f9ff',
    label: 'PNG',
    description: 'High-resolution image of your FAQ. Great for social sharing or presentations.',
    sizeNote: (n) => `${n} questions · ~${Math.max(1, n * 50)} KB`,
    onDownload: downloadPNG,
  },
];

function DownloadPanel({ faqs }: { faqs: FAQItem[] }) {
  const [downloaded, setDownloaded] = useState<DownloadFormat | null>(null);
  const ready = faqs.filter(f => f.status === 'ready');

  const handleDownload = (fmt: FormatConfig) => {
    fmt.onDownload(faqs);
    setDownloaded(fmt.id);
    setTimeout(() => setDownloaded(null), 3000);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground mb-1">Download &amp; export</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Choose the format that works best for you. All exports include your{' '}
          <span className="font-medium text-foreground">{ready.length} ready</span> questions.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {FORMAT_CONFIG.map(fmt => {
          const isDone = downloaded === fmt.id;
          return (
            <div
              key={fmt.id}
              className="group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border bg-background hover:border-primary/30 hover:bg-muted/20 transition-all"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: fmt.iconBg }}
              >
                {fmt.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground mb-0.5">{fmt.label}</p>
                <p className="text-[12px] text-muted-foreground leading-snug">{fmt.description}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">{fmt.sizeNote(ready.length)}</p>
              </div>

              {/* Download button — visible on hover */}
              <Button
                variant={isDone ? 'outline' : 'default'}
                size="sm"
                className={cn(
                  'flex-shrink-0 gap-1.5 min-w-[110px] transition-opacity duration-150',
                  isDone ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
                onClick={() => handleDownload(fmt)}
              >
                {isDone
                  ? <><CheckCheck size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-green-600" /> Done!</>
                  : <><Download size={13} strokeWidth={1.6} absoluteStrokeWidth /> Download</>}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WordPressPanel() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground mb-1">WordPress plugin</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Install the free Birdeye plugin to sync your FAQ to any WordPress page or post.
          Content updates automatically when you edit here.
        </p>
      </div>

      <div className="flex items-start gap-4 p-4 border border-border rounded-xl bg-muted/20">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Layers size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[13px] font-semibold text-foreground">Birdeye FAQ for WordPress</span>
            <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Free</span>
            <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Verified</span>
          </div>
          <div className="text-[11px] text-muted-foreground">v2.4.1 · 10,000+ installs · 5-star rating</div>
          <div className="flex gap-2 mt-3">
            <Button variant="default" size="sm" className="gap-1.5"
              onClick={() => window.open('https://wordpress.org/plugins/birdeye-faq/', '_blank')}>
              <ExternalLink size={12} strokeWidth={1.6} absoluteStrokeWidth />
              Install plugin
            </Button>
            <Button variant="outline" size="sm"
              onClick={() => window.open('https://wordpress.org/plugins/birdeye-faq/', '_blank')}>
              View docs
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          How to install
        </div>
        <div className="flex flex-col gap-2">
          {[
            'Go to WordPress → Plugins → Add new',
            'Search "Birdeye FAQ" and click Install',
            'Activate and connect with your Birdeye API key',
            'Add [birdeye_faq] shortcode to any page',
          ].map((step, i) => (
            <div key={step} className="flex items-start gap-2.5 text-[12px] text-muted-foreground">
              <span className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center
                text-[9px] font-semibold text-muted-foreground flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FramerPanel() {
  const [opened, setOpened] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground mb-1">Framer component</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Add the Birdeye FAQ component to your Framer project. Drag, drop, and your content
          syncs automatically whenever you publish here.
        </p>
      </div>

      <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/20">
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Puzzle size={20} strokeWidth={1.6} absoluteStrokeWidth className="text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-foreground">Birdeye FAQ Component</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Framer Marketplace · Free</div>
        </div>
        <Button
          variant={opened ? 'outline' : 'default'}
          size="sm"
          className="flex-shrink-0 gap-1.5"
          onClick={() => {
            window.open(`https://framer.com/marketplace/birdeye-faq?id=${FAQ_SET_ID}`, '_blank');
            setOpened(true);
          }}
        >
          {opened
            ? <><CheckCircle2 size={12} strokeWidth={1.6} absoluteStrokeWidth className="text-green-600" /> Opened</>
            : <><ExternalLink size={12} strokeWidth={1.6} absoluteStrokeWidth /> Open in Framer</>}
        </Button>
      </div>

      {opened && (
        <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <CheckCircle2 size={13} strokeWidth={1.6} absoluteStrokeWidth className="text-purple-600 flex-shrink-0 mt-0.5" />
          <span className="text-[12px] text-purple-800">
            Framer opened. In the editor, paste your FAQ ID:{' '}
            <code className="font-mono font-semibold">{FAQ_SET_ID}</code>
          </span>
        </div>
      )}

      <FeatureList items={[
        'Drag-and-drop component — no code needed',
        'FAQ ID links directly to your Birdeye content',
        'Live-syncs automatically when you publish edits',
        "Fully customisable styles in Framer's canvas",
      ]} />
    </div>
  );
}

function EmbedPanel() {
  const [embedType, setEmbedType] = useState<'script' | 'iframe'>('script');
  const { copied, copy } = useCopy();

  const script  = `<script src="https://cdn.birdeye.com/faq-widget.js"\n  data-faq-id="${FAQ_SET_ID}" async></script>`;
  const iframe  = `<iframe\n  src="https://birdeye.com/faq/${FAQ_SET_ID}/embed"\n  width="100%"\n  style="border:none;min-height:480px"\n  loading="lazy">\n</iframe>`;
  const snippet = embedType === 'script' ? script : iframe;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground mb-1">Embed on any website</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Paste one snippet to add your FAQ to Webflow, Wix, Squarespace, or any custom HTML page.
        </p>
      </div>

      <div className="flex gap-1 p-0.5 bg-muted rounded-lg w-fit">
        {(['script', 'iframe'] as const).map(t => (
          <button
            key={t}
            onClick={() => setEmbedType(t)}
            className={cn(
              'px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all',
              embedType === t
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'script' ? 'Script tag' : 'iFrame'}
          </button>
        ))}
      </div>

      <div className="relative">
        <pre className="bg-[#0f172a] text-[#94a3b8] text-[11.5px] font-mono leading-relaxed
          px-5 py-4 rounded-xl overflow-x-auto whitespace-pre max-w-full">
          {snippet}
        </pre>
        <button
          onClick={() => copy(snippet)}
          className="absolute top-3 right-3 flex items-center gap-1 bg-white/10 hover:bg-white/20
            border border-white/10 rounded-md px-2 py-1 text-[11px] text-slate-300 transition-colors"
        >
          {copied
            ? <><CheckCheck size={11} strokeWidth={1.6} absoluteStrokeWidth className="text-green-400" /> Copied!</>
            : <><Copy size={11} strokeWidth={1.6} absoluteStrokeWidth /> Copy</>}
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Paste the snippet just before the closing{' '}
        <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">&lt;/body&gt;</code> tag.
      </p>

      <FeatureList items={[
        'Works with Webflow, Wix, Squarespace, Shopify',
        'Script tag option renders in <3 KB of JavaScript',
        'FAQ content served from Birdeye CDN globally',
      ]} />
    </div>
  );
}

// ── Destination config ────────────────────────────────────────────────────────

const DESTINATIONS: Omit<DestCardProps, 'selected' | 'onSelect'>[] = [
  { id: 'html',      title: 'Download' },
  { id: 'embed',     title: 'Embed code' },
  { id: 'wordpress', title: 'WordPress', badge: 'Free', badgeClass: 'bg-green-100 text-green-700' },
  { id: 'framer',    title: 'Framer' },
];

// ── Root component ────────────────────────────────────────────────────────────

export const FAQPublishModal = ({ open, onClose, faqs, overallScore }: FAQPublishModalProps) => {
  const [active, setActive] = useState<Destination>('html');

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogPortal>
        <DialogOverlay className="!bg-slate-900/20 !backdrop-blur-[1px]" />

        <DialogPrimitive.Content
          className={cn(
            'fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
            'bg-background rounded-xl shadow-xl overflow-hidden flex flex-col',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200',
          )}
          style={{ width: 'calc(100vw - 48px)', maxWidth: '1020px', height: '82vh' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 flex-shrink-0 border-b border-border">
            <div>
              <DialogTitle className="text-[15px] font-semibold leading-none">
                Publish &amp; export
              </DialogTitle>
              <p className="text-[13px] text-muted-foreground mt-1">
                Choose where and how your FAQ will appear.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors -mt-0.5 -mr-1"
            >
              <X size={16} strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </div>

          {/* Two-column body */}
          <div className="flex flex-1 overflow-hidden min-h-0">

            {/* Left — destination list */}
            <div className="w-[200px] flex-shrink-0 border-r border-border overflow-y-auto p-2 flex flex-col gap-0.5 pt-3">
              {DESTINATIONS.map(d => (
                <DestCard key={d.id} {...d} selected={active === d.id} onSelect={setActive} />
              ))}
            </div>

            {/* Right — detail panel */}
            <div className="flex-1 min-w-0 overflow-y-auto p-7">
              {active === 'html'      && <DownloadPanel faqs={faqs} />}
              {active === 'embed'     && <EmbedPanel />}
              {active === 'wordpress' && <WordPressPanel />}
              {active === 'framer'    && <FramerPanel />}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
