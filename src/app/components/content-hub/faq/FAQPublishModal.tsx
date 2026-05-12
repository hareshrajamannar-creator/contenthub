/**
 * FAQPublishModal
 *
 * Guided publish flow for generated FAQ content.
 */
import React, { useMemo, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Globe2,
  Info,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/lib/utils';
import type { FAQItem } from './FAQReviewCard';

export interface FAQPublishModalProps {
  open: boolean;
  onClose: () => void;
  faqs: FAQItem[];
  overallScore: number;
}

type Step = 'destination' | 'existing-page' | 'standalone-page';

interface ExistingPage {
  id: string;
  type: 'Blog post' | 'Landing page';
  title: string;
  updatedAt: string;
}

const EXISTING_PAGES: ExistingPage[] = [
  {
    id: 'blog-emergency-service',
    type: 'Blog post',
    title: 'How to choose an emergency service provider',
    updatedAt: 'Updated 2 days ago',
  },
  {
    id: 'landing-property-appraisal',
    type: 'Landing page',
    title: 'Property appraisal services',
    updatedAt: 'Updated May 7',
  },
  {
    id: 'blog-same-day-service',
    type: 'Blog post',
    title: 'What same-day service means for local customers',
    updatedAt: 'Updated Apr 28',
  },
  {
    id: 'landing-service-area',
    type: 'Landing page',
    title: 'Austin service areas',
    updatedAt: 'Updated Apr 19',
  },
];

function DestinationCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-xl border border-border/70 bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-foreground">{title}</p>
        <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 inline-flex items-center gap-2 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft size={14} strokeWidth={1.6} absoluteStrokeWidth />
      Back
    </button>
  );
}

export const FAQPublishModal = ({ open, onClose, faqs, overallScore: _overallScore }: FAQPublishModalProps) => {
  const [step, setStep] = useState<Step>('destination');
  const [query, setQuery] = useState('');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [siteUrl, setSiteUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);

  const readyFaqCount = faqs.filter(faq => faq.status === 'ready').length || faqs.length;
  const selectedPage = EXISTING_PAGES.find(page => page.id === selectedPageId);
  const canConnect = Boolean(siteUrl.trim() && username.trim() && password.trim());

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXISTING_PAGES;
    return EXISTING_PAGES.filter(page =>
      page.title.toLowerCase().includes(q) || page.type.toLowerCase().includes(q),
    );
  }, [query]);

  function resetAndClose() {
    onClose();
    window.setTimeout(() => {
      setStep('destination');
      setQuery('');
      setSelectedPageId(null);
      setSiteUrl('');
      setUsername('');
      setPassword('');
      setConnecting(false);
    }, 180);
  }

  function handleSaveDraft() {
    toast.success('FAQ saved as draft');
    resetAndClose();
  }

  function handleAddToPage() {
    if (!selectedPage) return;
    toast.success('FAQ added to page', {
      description: selectedPage.title,
    });
    resetAndClose();
  }

  function handleConnectWordPress() {
    if (!canConnect || connecting) return;
    setConnecting(true);
    window.setTimeout(() => {
      toast.success('WordPress connected', {
        description: 'Your FAQ is being published.',
      });
      resetAndClose();
    }, 1200);
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && resetAndClose()}>
      <DialogPortal>
        <DialogOverlay className="!bg-slate-900/20 !backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 flex max-h-[82vh] w-[calc(100vw-48px)] max-w-[600px]',
            'translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-xl bg-background shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200',
          )}
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-4">
            <div>
              <DialogTitle className="text-[15px] font-semibold leading-none">Publish FAQ</DialogTitle>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {step === 'destination'
                  ? 'Where would you like to publish this FAQ?'
                  : step === 'existing-page'
                    ? 'Choose an existing blog post or landing page.'
                    : 'Connect WordPress to publish this FAQ as a standalone page.'}
              </p>
            </div>
            <button
              type="button"
              onClick={resetAndClose}
              className="-mr-1 -mt-1 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {step === 'destination' && (
              <div className="flex flex-col gap-4">
                <DestinationCard
                  icon={<FileText size={18} strokeWidth={1.6} absoluteStrokeWidth />}
                  title="Add to existing page"
                  description="Drop this FAQ section into a blog post or landing page you already have."
                  onClick={() => setStep('existing-page')}
                />
                <DestinationCard
                  icon={<Globe2 size={18} strokeWidth={1.6} absoluteStrokeWidth />}
                  title="Publish as standalone FAQ page"
                  description="Create a dedicated FAQ page and publish it through your connected CMS."
                  onClick={() => setStep('standalone-page')}
                />
                <DestinationCard
                  icon={<CheckCircle2 size={18} strokeWidth={1.6} absoluteStrokeWidth />}
                  title="Save as draft"
                  description="Keep this FAQ saved in Content Hub and come back to it later."
                  onClick={handleSaveDraft}
                />
              </div>
            )}

            {step === 'existing-page' && (
              <div>
                <BackButton onClick={() => setStep('destination')} />
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
                  <Search size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
                  <input
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Search blog posts and landing pages"
                    className="h-8 min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>

                <div className="mt-4 flex max-h-[280px] flex-col gap-2 overflow-y-auto">
                  {filteredPages.map(page => {
                    const selected = selectedPageId === page.id;
                    return (
                      <button
                        type="button"
                        key={page.id}
                        onClick={() => setSelectedPageId(page.id)}
                        className={cn(
                          'flex items-start justify-between gap-4 rounded-lg border p-4 text-left transition-colors',
                          selected
                            ? 'border-primary/50 bg-primary/[0.04]'
                            : 'border-border/70 bg-background hover:border-primary/30 hover:bg-muted/30',
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-foreground">{page.title}</p>
                          <p className="mt-1 text-[12px] text-muted-foreground">{page.type} · {page.updatedAt}</p>
                        </div>
                        {selected && (
                          <CheckCircle2 size={16} strokeWidth={1.6} absoluteStrokeWidth className="mt-0.5 flex-none text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedPage && (
                  <div className="mt-4 rounded-lg bg-muted/50 px-4 py-4 text-[12px] leading-5 text-muted-foreground">
                    {readyFaqCount > 0 ? `This FAQ section with ${readyFaqCount} questions` : 'This FAQ section'} will be added to the end of <span className="font-medium text-foreground">{selectedPage.title}</span>.
                  </div>
                )}
              </div>
            )}

            {step === 'standalone-page' && (
              <div>
                <BackButton onClick={() => setStep('destination')} />
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
                  <Info size={15} strokeWidth={1.6} absoluteStrokeWidth className="mt-0.5 flex-none text-amber-700" />
                  <p className="text-[12px] leading-5 text-amber-900">
                    WordPress Application Passwords must be enabled. In WordPress admin, go to Users, open your profile, then create an Application Password.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-foreground">WordPress site URL</span>
                    <input
                      value={siteUrl}
                      onChange={event => setSiteUrl(event.target.value)}
                      placeholder="https://example.com"
                      className="h-10 rounded-lg border border-border bg-background px-4 text-[13px] outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-foreground">WordPress username</span>
                    <input
                      value={username}
                      onChange={event => setUsername(event.target.value)}
                      placeholder="editor@example.com"
                      className="h-10 rounded-lg border border-border bg-background px-4 text-[13px] outline-none transition-colors focus:border-primary"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-foreground">Application password</span>
                    <input
                      type="password"
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      placeholder="Different from your login password"
                      className="h-10 rounded-lg border border-border bg-background px-4 text-[13px] outline-none transition-colors focus:border-primary"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-none items-center justify-end gap-2 border-t border-border px-6 py-4">
            {step === 'destination' && (
              <Button type="button" variant="outline" onClick={resetAndClose}>
                Cancel
              </Button>
            )}
            {step === 'existing-page' && (
              <Button type="button" disabled={!selectedPage} onClick={handleAddToPage}>
                Add to page
              </Button>
            )}
            {step === 'standalone-page' && (
              <Button type="button" disabled={!canConnect || connecting} onClick={handleConnectWordPress}>
                {connecting && <Loader2 size={14} strokeWidth={1.6} absoluteStrokeWidth className="animate-spin" />}
                Connect account
              </Button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
