import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { TextTabsRow, type TextTabItem } from '@/app/components/ui/text-tabs';
import {
  MAIN_VIEW_HEADER_BAND_CLASS,
  MAIN_VIEW_PRIMARY_HEADING_CLASS,
} from '@/app/components/layout/mainViewTitleClasses';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

export type ContentType = 'faq' | 'social' | 'email' | 'blog' | 'response' | 'ads';

export interface TemplateItem {
  id: string;
  type: ContentType;
  name: string;
  description: string;
  useCases: string[];
  previewLines: number[]; // widths as % of container
}

type TabId = 'all' | ContentType;

// ── Mock templates ─────────────────────────────────────────────────────────────

export const TEMPLATES: TemplateItem[] = [
  // FAQ
  { id: 'faq-1', type: 'faq', name: 'Product launch FAQ', description: 'Answer the most common questions customers ask when you launch a new product or service.', useCases: ['Launch campaigns', 'New products'], previewLines: [90, 60, 85, 50, 70] },
  { id: 'faq-2', type: 'faq', name: 'Location-specific FAQ', description: 'FAQ content tailored to a specific business location — hours, parking, services available.', useCases: ['Local SEO', 'Location pages'], previewLines: [70, 80, 55, 65, 45] },
  { id: 'faq-3', type: 'faq', name: 'Service & pricing FAQ', description: 'Clear answers about what you offer, how much it costs, and what the process looks like.', useCases: ['Pricing clarity', 'Sales enablement'], previewLines: [80, 60, 90, 70, 50] },
  { id: 'faq-4', type: 'faq', name: 'AEO / voice-search FAQ', description: 'Optimised for AI answer engines and voice search with concise, direct question-answer pairs.', useCases: ['Voice search', 'AI answer engines'], previewLines: [60, 80, 65, 75, 55] },
  // Social
  { id: 'soc-1', type: 'social', name: 'Promotion announcement', description: 'Drive awareness and urgency around a sale, offer, or limited-time deal across social channels.', useCases: ['Sales', 'Promo campaigns'], previewLines: [85, 55, 70] },
  { id: 'soc-2', type: 'social', name: 'Customer testimonial', description: 'Turn a great customer review into a shareable social post with brand-consistent formatting.', useCases: ['Social proof', 'Trust building'], previewLines: [70, 90, 60] },
  { id: 'soc-3', type: 'social', name: 'Seasonal / holiday', description: 'Timely content tied to a seasonal moment, holiday, or cultural event relevant to your audience.', useCases: ['Seasonal campaigns', 'Holidays'], previewLines: [60, 75, 80] },
  { id: 'soc-4', type: 'social', name: 'Behind the scenes', description: 'Humanise your brand by sharing how things work, your team, or your process in an authentic way.', useCases: ['Brand storytelling', 'Authenticity'], previewLines: [80, 60, 70] },
  // Email
  { id: 'em-1', type: 'email', name: 'Welcome series', description: 'Onboard new customers with a warm introduction to your business, services, and what to expect.', useCases: ['Onboarding', 'New customers'], previewLines: [90, 60, 80, 50, 70, 40] },
  { id: 'em-2', type: 'email', name: 'Promotional offer', description: 'A focused email driving a single, compelling offer with a clear call-to-action.', useCases: ['Promotions', 'Conversions'], previewLines: [70, 90, 55, 65] },
  { id: 'em-3', type: 'email', name: 'Re-engagement', description: 'Win back customers who haven\'t visited or engaged recently with a personalised incentive.', useCases: ['Win-back', 'Retention'], previewLines: [80, 60, 85, 55] },
  { id: 'em-4', type: 'email', name: 'Review request', description: 'Ask happy customers for a review at exactly the right moment with the right tone.', useCases: ['Review growth', 'Reputation'], previewLines: [65, 80, 70, 50] },
  // Blog
  { id: 'bl-1', type: 'blog', name: 'How-to guide', description: 'Step-by-step instructional content that answers a common customer question in depth.', useCases: ['SEO content', 'Education'], previewLines: [90, 70, 60, 85, 55, 75] },
  { id: 'bl-2', type: 'blog', name: 'Local SEO landing page', description: 'Location-specific content designed to rank for local search terms and convert nearby customers.', useCases: ['Local SEO', 'Lead gen'], previewLines: [80, 65, 90, 60, 70] },
  { id: 'bl-3', type: 'blog', name: 'Listicle', description: 'Easily scannable numbered or bulleted content that performs well for discovery and sharing.', useCases: ['Traffic', 'Shareability'], previewLines: [70, 55, 80, 65, 75] },
  { id: 'bl-4', type: 'blog', name: 'Case study', description: 'A detailed story of customer success that builds credibility and demonstrates real-world results.', useCases: ['Trust', 'B2B sales'], previewLines: [85, 70, 60, 90, 55] },
  // Review response
  { id: 'res-1', type: 'response', name: '5-star thank you', description: 'A warm, specific, on-brand response to a glowing review that reinforces loyalty.', useCases: ['Reputation', 'Retention'], previewLines: [75, 55, 85] },
  { id: 'res-2', type: 'response', name: 'Empathetic negative reply', description: 'Handle a negative review with empathy and professionalism while offering to make things right.', useCases: ['Crisis response', 'Reputation'], previewLines: [80, 65, 70] },
  { id: 'res-3', type: 'response', name: 'Mixed review response', description: 'Acknowledge the positives, address the concerns, and invite the customer back.', useCases: ['Reputation management'], previewLines: [70, 80, 60] },
  { id: 'res-4', type: 'response', name: 'No-text rating reply', description: 'A concise, friendly response to star-only ratings that still shows you care.', useCases: ['Quick responses'], previewLines: [60, 75] },
  // Ads
  { id: 'ads-1', type: 'ads', name: 'Google search ad', description: 'High-converting search ad copy with compelling headline and description variations.', useCases: ['Paid search', 'Lead gen'], previewLines: [80, 60, 90] },
  { id: 'ads-2', type: 'ads', name: 'Meta carousel', description: 'Multi-image carousel ad copy for Facebook and Instagram with individual card headlines.', useCases: ['Social ads', 'Brand awareness'], previewLines: [70, 55, 80] },
  { id: 'ads-3', type: 'ads', name: 'Local promo offer', description: 'Localised ad copy for a specific location promotion to drive foot traffic or bookings.', useCases: ['Local ads', 'Promotions'], previewLines: [85, 65, 75] },
  { id: 'ads-4', type: 'ads', name: 'Retargeting copy', description: 'Re-engage visitors who didn\'t convert with personalised, high-intent retargeting messages.', useCases: ['Retargeting', 'Conversions'], previewLines: [75, 90, 55] },
];

// ── Badge variant per content type ────────────────────────────────────────────

const TYPE_LABEL: Record<ContentType, string> = {
  faq: 'FAQ', social: 'Social', email: 'Email',
  blog: 'Blog', response: 'Review response', ads: 'Ads',
};

const TYPE_BADGE_CLASS: Record<ContentType, string> = {
  faq:      'bg-blue-50 text-blue-700',
  social:   'bg-purple-50 text-purple-700',
  email:    'bg-primary/10 text-primary',
  blog:     'bg-muted text-muted-foreground',
  response: 'bg-green-50 text-green-700',
  ads:      'bg-amber-50 text-amber-700',
};

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS: TextTabItem<TabId>[] = [
  { id: 'all',      label: 'All' },
  { id: 'faq',      label: 'FAQ' },
  { id: 'social',   label: 'Social' },
  { id: 'email',    label: 'Email' },
  { id: 'blog',     label: 'Blog' },
  { id: 'response', label: 'Review response' },
  { id: 'ads',      label: 'Ads' },
];

// ── Shimmer preview line ───────────────────────────────────────────────────────

function PreviewLine({ width }: { width: number }) {
  return (
    <div
      className="h-[10px] rounded-full bg-muted"
      style={{ width: `${width}%` }}
    />
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

interface TemplateGalleryProps {
  onBack: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
  /** When true, hides the back arrow — use when L2 nav provides navigation */
  hideBack?: boolean;
}

export const TemplateGallery = ({ onBack, onSelectTemplate, hideBack = false }: TemplateGalleryProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<TemplateItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return TEMPLATES.filter((t) => {
      const matchesTab = activeTab === 'all' || t.type === activeTab;
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [activeTab, query]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Header */}
      <div className={MAIN_VIEW_HEADER_BAND_CLASS}>
        <div className="flex items-center gap-2">
          {!hideBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft size={16} strokeWidth={1.6} absoluteStrokeWidth className="text-foreground" />
            </button>
          )}
          <h1 className={MAIN_VIEW_PRIMARY_HEADING_CLASS}>Templates</h1>
        </div>
        <div className="relative">
          <Search size={13} strokeWidth={1.6} absoluteStrokeWidth className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="border border-input rounded-md h-8 pl-8 pr-3 text-[13px] bg-background w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Type tabs */}
      <TextTabsRow<TabId>
        items={TABS}
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel="Template types"
        className="px-6"
      />

      {/* Main area */}
      <div className="flex flex-grow min-h-0 overflow-hidden">
        {/* Card grid */}
        <div className="flex-grow overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-[13px] text-muted-foreground">
              No templates match your search.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelected(tmpl)}
                  className={cn(
                    'bg-background border rounded-[10px] p-4 cursor-pointer transition-all hover:shadow-sm',
                    selected?.id === tmpl.id
                      ? 'border-primary ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/40',
                  )}
                >
                  <span className={cn('inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mb-2', TYPE_BADGE_CLASS[tmpl.type])}>
                    {TYPE_LABEL[tmpl.type]}
                  </span>
                  <p className="text-[13px] font-semibold text-foreground mb-1">{tmpl.name}</p>
                  <p className="text-[12px] text-muted-foreground line-clamp-2 mb-3">{tmpl.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.useCases.map((uc) => (
                      <span key={uc} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="w-[300px] flex-shrink-0 border-l border-border overflow-y-auto flex flex-col">
          {!selected ? (
            <div className="flex-grow flex items-center justify-center text-[13px] text-muted-foreground p-6 text-center">
              Select a template to preview
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-border flex-shrink-0">
                <span className={cn('inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mb-2', TYPE_BADGE_CLASS[selected.type])}>
                  {TYPE_LABEL[selected.type]}
                </span>
                <p className="text-[13px] font-semibold text-foreground">{selected.name}</p>
              </div>
              {/* Simulated content preview */}
              <div className="px-6 py-4 border-b border-border flex flex-col gap-2 flex-shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Preview</p>
                {selected.previewLines.map((w, i) => (
                  <PreviewLine key={i} width={w} />
                ))}
              </div>
              <div className="px-6 py-4 flex flex-col gap-4">
                <p className="text-[12px] text-muted-foreground leading-relaxed">{selected.description}</p>
                <div className="flex flex-wrap gap-1">
                  {selected.useCases.map((uc) => (
                    <span key={uc} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{uc}</span>
                  ))}
                </div>
              </div>
              <div className="px-6 pb-6 mt-auto">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => onSelectTemplate(selected)}
                >
                  Use this template
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
