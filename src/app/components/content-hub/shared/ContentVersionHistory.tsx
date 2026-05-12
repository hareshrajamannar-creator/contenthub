import { ArrowLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────

type VersionId = 'v4' | 'v3' | 'v2' | 'v1';

interface Version {
  id: VersionId;
  date: string;
  author: string;
  initials: string;
  avatarColor: string;
  isCurrent: boolean;
}

interface ChangedSpan {
  text: string;
  changed: boolean;
}

interface FAQItem {
  question: string;
  answer: ChangedSpan[];
}

interface FAQVersionSection {
  title: string;
  items: FAQItem[];
}

interface BlogVersionBlock {
  type: 'hero-title' | 'hero-subtitle' | 'heading' | 'paragraph' | 'bullets';
  text?: string;
  items?: string[];
  changed?: boolean;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const VERSIONS: Version[] = [
  {
    id: 'v4',
    date: 'Dec 10, 2025 10:11 AM',
    author: 'Mohammed Hussain',
    initials: 'MH',
    avatarColor: 'bg-amber-500',
    isCurrent: true,
  },
  {
    id: 'v3',
    date: 'Dec 04, 2025 11:24 AM',
    author: 'Adam',
    initials: 'AD',
    avatarColor: 'bg-indigo-500',
    isCurrent: false,
  },
  {
    id: 'v2',
    date: 'Nov 28, 2025 04:12 PM',
    author: 'Emily Jason',
    initials: 'EJ',
    avatarColor: 'bg-emerald-500',
    isCurrent: false,
  },
  {
    id: 'v1',
    date: 'Nov 28, 2025 11:24 AM',
    author: 'Emily Jason',
    initials: 'EJ',
    avatarColor: 'bg-emerald-500',
    isCurrent: false,
  },
];

// FAQ content per version — older versions have fewer/weaker answers
const FAQ_CONTENT: Record<VersionId, FAQVersionSection[]> = {
  v4: [
    {
      title: 'General questions',
      items: [
        {
          question: 'How quickly can you respond to an emergency?',
          answer: [{ text: 'Our team is available 24/7 and typically responds to emergency calls within 30–60 minutes. We prioritize urgent situations to minimize disruption and ensure your safety.', changed: false }],
        },
        {
          question: 'Do you offer same-day service?',
          answer: [{ text: 'Yes, we offer same-day service for most requests submitted before 2 PM local time. Availability may vary during peak periods or holidays.', changed: false }],
        },
        {
          question: 'Are you licensed and insured?',
          answer: [{ text: 'We are fully licensed, bonded, and insured. Our technicians carry all required certifications and our work is backed by a 1-year service guarantee.', changed: false }],
        },
      ],
    },
    {
      title: 'Pricing and appointments',
      items: [
        {
          question: 'How do I book an appointment?',
          answer: [{ text: 'You can book online at our website, call us directly, or use our app. Online bookings are available 24/7 and confirmed instantly.', changed: false }],
        },
        {
          question: 'How much does a standard service call cost?',
          answer: [{ text: 'Standard service calls start at $85 for the first hour, with materials billed separately. We provide a detailed estimate before any work begins.', changed: false }],
        },
      ],
    },
  ],
  v3: [
    {
      title: 'General questions',
      items: [
        {
          question: 'How quickly can you respond to an emergency?',
          answer: [{ text: 'Our team responds to emergency calls as quickly as possible. We prioritize urgent situations to minimize disruption.', changed: true }],
        },
        {
          question: 'Do you offer same-day service?',
          answer: [{ text: 'Yes, we offer same-day service for most requests submitted before 2 PM local time. Availability may vary during peak periods or holidays.', changed: false }],
        },
        {
          question: 'Are you licensed and insured?',
          answer: [{ text: 'We are fully licensed and insured. Our technicians carry all required certifications.', changed: true }],
        },
      ],
    },
    {
      title: 'Pricing and appointments',
      items: [
        {
          question: 'How do I book an appointment?',
          answer: [{ text: 'You can book online at our website or call us directly.', changed: true }],
        },
        {
          question: 'How much does a standard service call cost?',
          answer: [{ text: 'Standard service calls start at $85 for the first hour, with materials billed separately. We provide a detailed estimate before any work begins.', changed: false }],
        },
      ],
    },
  ],
  v2: [
    {
      title: 'General questions',
      items: [
        {
          question: 'How quickly can you respond to an emergency?',
          answer: [{ text: 'Our team responds to emergency calls as quickly as possible.', changed: true }],
        },
        {
          question: 'Do you offer same-day service?',
          answer: [{ text: 'Same-day service may be available depending on schedule. Contact us to check.', changed: true }],
        },
        {
          question: 'Are you licensed and insured?',
          answer: [{ text: 'We are fully licensed and insured.', changed: true }],
        },
      ],
    },
    {
      title: 'Pricing and appointments',
      items: [
        {
          question: 'How do I book an appointment?',
          answer: [{ text: 'Call us or visit our website to schedule a service visit.', changed: true }],
        },
        {
          question: 'How much does a standard service call cost?',
          answer: [{ text: 'Contact us for current pricing information.', changed: true }],
        },
      ],
    },
  ],
  v1: [
    {
      title: 'General questions',
      items: [
        {
          question: 'How quickly can you respond to an emergency?',
          answer: [{ text: 'Contact us and we will get back to you as soon as possible.', changed: true }],
        },
        {
          question: 'Do you offer same-day service?',
          answer: [{ text: 'Please call us to discuss availability.', changed: true }],
        },
      ],
    },
    {
      title: 'Pricing and appointments',
      items: [
        {
          question: 'How do I book an appointment?',
          answer: [{ text: 'Call us or send us an email to schedule.', changed: true }],
        },
      ],
    },
  ],
};

const BLOG_CONTENT: Record<VersionId, BlogVersionBlock[]> = {
  v4: [
    { type: 'hero-title', text: 'The Complete Guide to Building Exceptional Customer Experiences' },
    { type: 'hero-subtitle', text: 'Proven strategies that leading brands use to turn every interaction into a loyalty-building moment' },
    { type: 'heading', text: 'Why customer experience is the ultimate differentiator' },
    { type: 'paragraph', text: 'In today\'s hyper-competitive landscape, the quality of your customer experience is the single greatest differentiator available to any business. Customers who feel genuinely valued don\'t just return — they become advocates.' },
    { type: 'heading', text: 'Five strategies that consistently work' },
    { type: 'bullets', items: ['Respond to every review within 24 hours', 'Personalise onboarding for each customer segment', 'Build a feedback loop that feeds directly into product', 'Empower front-line staff to resolve issues on the spot'] },
  ],
  v3: [
    { type: 'hero-title', text: 'The Complete Guide to Building Exceptional Customer Experiences', changed: false },
    { type: 'hero-subtitle', text: 'How leading brands create loyalty-building interactions', changed: true },
    { type: 'heading', text: 'Why customer experience matters', changed: true },
    { type: 'paragraph', text: 'Customer experience has become increasingly important for businesses. Customers who feel valued are more likely to return and recommend your brand.', changed: true },
    { type: 'heading', text: 'Key strategies for success' },
    { type: 'bullets', items: ['Respond to reviews promptly', 'Personalise the customer journey', 'Build a feedback loop', 'Empower your team'], changed: true },
  ],
  v2: [
    { type: 'hero-title', text: 'Building Better Customer Experiences', changed: true },
    { type: 'hero-subtitle', text: 'A practical guide for growing businesses', changed: true },
    { type: 'heading', text: 'Why customer experience matters' },
    { type: 'paragraph', text: 'Great customer experiences drive repeat business and referrals. Here are some tips to get started.', changed: true },
    { type: 'bullets', items: ['Reply to reviews', 'Personalise communications', 'Listen to feedback'], changed: true },
  ],
  v1: [
    { type: 'hero-title', text: 'How to Improve Customer Experience', changed: true },
    { type: 'paragraph', text: 'Customer experience is important for every business. This post covers the basics.', changed: true },
    { type: 'bullets', items: ['Be responsive', 'Be friendly', 'Follow up'], changed: true },
  ],
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function HighlightedText({ spans }: { spans: ChangedSpan[] }) {
  return (
    <>
      {spans.map((span, i) =>
        span.changed ? (
          <mark key={i} className="bg-amber-100 text-foreground rounded-[3px] px-0.5 not-italic">
            {span.text}
          </mark>
        ) : (
          <span key={i}>{span.text}</span>
        ),
      )}
    </>
  );
}

function FAQReadOnlyPreview({ versionId }: { versionId: VersionId }) {
  const sections = FAQ_CONTENT[versionId];
  return (
    <div className="flex flex-col gap-6">
      {sections.map((section, si) => (
        <div key={si} className="flex flex-col gap-3">
          <h3 className="text-[13px] font-semibold text-foreground">{section.title}</h3>
          <div className="flex flex-col gap-2">
            {section.items.map((item, qi) => (
              <div key={qi} className="rounded-[8px] border border-border/60 bg-muted/20 px-4 py-3">
                <p className="text-[13px] font-medium text-foreground mb-1">{item.question}</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  <HighlightedText spans={item.answer} />
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BlogReadOnlyPreview({ versionId }: { versionId: VersionId }) {
  const blocks = BLOG_CONTENT[versionId];
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {blocks.map((block, i) => {
        const changed = block.changed ?? false;
        const wrapClass = changed ? 'bg-amber-100 rounded-[3px] px-1' : '';
        if (block.type === 'hero-title') {
          return (
            <h1 key={i} className={cn('text-[22px] font-bold text-foreground leading-tight', wrapClass)}>
              {block.text}
            </h1>
          );
        }
        if (block.type === 'hero-subtitle') {
          return (
            <p key={i} className={cn('text-[15px] text-muted-foreground leading-relaxed', wrapClass)}>
              {block.text}
            </p>
          );
        }
        if (block.type === 'heading') {
          return (
            <h2 key={i} className={cn('text-[16px] font-semibold text-foreground mt-2', wrapClass)}>
              {block.text}
            </h2>
          );
        }
        if (block.type === 'paragraph') {
          return (
            <p key={i} className={cn('text-[13px] text-foreground leading-relaxed', wrapClass)}>
              {block.text}
            </p>
          );
        }
        if (block.type === 'bullets' && block.items) {
          return (
            <ul key={i} className={cn('flex flex-col gap-1 pl-4', changed && 'bg-amber-100 rounded-[3px] px-4 py-2')}>
              {block.items.map((item, bi) => (
                <li key={bi} className="text-[13px] text-foreground list-disc">{item}</li>
              ))}
            </ul>
          );
        }
        return null;
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export interface ContentVersionHistoryProps {
  contentType: 'faq' | 'blog';
  onClose: () => void;
}

export function ContentVersionHistory({ contentType, onClose }: ContentVersionHistoryProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<VersionId>('v4');

  const selectedVersion = VERSIONS.find(v => v.id === selectedVersionId)!;
  const isCurrentVersion = selectedVersion.isCurrent;

  function handleRestore() {
    setSelectedVersionId('v4');
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas,#F7F8FA)]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between h-14 px-6 bg-background border-b border-border">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} strokeWidth={1.6} absoluteStrokeWidth />
          Version history
        </button>
        {!isCurrentVersion && (
          <Button size="sm" onClick={handleRestore}>
            Restore
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 gap-2 p-2">
        {/* Read-only content preview */}
        <div className="flex-1 min-w-0 overflow-y-auto rounded-xl border border-border/60 bg-background">
          <div className="px-8 py-6 pb-10">
            {contentType === 'faq' ? (
              <FAQReadOnlyPreview versionId={selectedVersionId} />
            ) : (
              <BlogReadOnlyPreview versionId={selectedVersionId} />
            )}
          </div>
        </div>

        {/* Version list panel */}
        <div
          className="shrink-0 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background"
          style={{ width: 300 }}
        >
          <div className="shrink-0 px-4 py-3 border-b border-border">
            <p className="text-[13px] font-semibold text-foreground">All versions</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {VERSIONS.map(version => {
              const isSelected = selectedVersionId === version.id;
              return (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => setSelectedVersionId(version.id)}
                  className={cn(
                    'w-full text-left px-4 py-4 flex flex-col gap-1.5 transition-colors',
                    isSelected ? 'bg-primary/5' : 'hover:bg-muted/50',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-medium text-foreground">{version.date}</span>
                    {version.isCurrent && isSelected && (
                      <Check size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-primary shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {version.isCurrent && (
                      <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Current version
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white',
                      version.avatarColor,
                    )}>
                      {version.initials}
                    </div>
                    <span className="text-[12px] text-muted-foreground">{version.author}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
