import React, { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { cn } from '@/lib/utils';

export interface BlogPublishModalProps {
  open: boolean;
  onClose: () => void;
}

const APPROVAL_WORKFLOWS = [
  'Marketing approval',
  'Legal review',
  'Brand compliance',
  'Regional manager approval',
  'SEO review',
  'Product marketing review',
  'Executive approval',
  'Franchise owner approval',
  'Content quality review',
  'Final publishing review',
];

function formatScheduleDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export const BlogPublishModal = ({ open, onClose }: BlogPublishModalProps) => {
  const [siteUrl, setSiteUrl]             = useState('');
  const [username, setUsername]           = useState('');
  const [appPassword, setAppPassword]     = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [approvalWorkflow, setApprovalWorkflow] = useState('');
  const [scheduleDate, setScheduleDate]   = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const canPublish = siteUrl.trim() !== '' && username.trim() !== '' && appPassword.trim() !== '';

  function resetAndClose() {
    onClose();
    window.setTimeout(() => {
      setSiteUrl('');
      setUsername('');
      setAppPassword('');
      setShowPassword(false);
      setApprovalWorkflow('');
      setScheduleDate(undefined);
      setDatePickerOpen(false);
    }, 180);
  }

  function handlePublish() {
    if (!canPublish) return;
    toast.success('Blog post published to WordPress', {
      icon: <CheckCircle2 size={16} strokeWidth={1.6} absoluteStrokeWidth className="text-green-500 flex-none" />,
    });
    resetAndClose();
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && resetAndClose()}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-[50%] top-[50px] z-50 flex max-h-[calc(100vh-66px)] w-[calc(100vw-48px)] max-w-[560px]',
            'translate-x-[-50%] flex-col overflow-hidden rounded-xl bg-background shadow-xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200',
          )}
        >
          {/* Header */}
          <div className="flex flex-none items-center justify-between border-b border-border px-6 py-4">
            <DialogTitle className="text-[15px] font-semibold leading-none">Publish blog post</DialogTitle>
            <button
              type="button"
              onClick={resetAndClose}
              className="-mr-1 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X size={16} strokeWidth={1.6} absoluteStrokeWidth />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
            {/* Warning banner */}
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/30">
              <AlertCircle size={15} strokeWidth={1.6} absoluteStrokeWidth className="mt-0.5 flex-none text-amber-600 dark:text-amber-400" />
              <p className="text-[12px] leading-[1.6] text-amber-900 dark:text-amber-200">
                WordPress Application Passwords must be enabled. In WordPress admin, go to Users, open your profile, then create an Application Password.
              </p>
            </div>

            {/* WordPress site URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-foreground">WordPress site URL</label>
              <input
                type="url"
                value={siteUrl}
                onChange={e => setSiteUrl(e.target.value)}
                placeholder="https://example.com"
                className={cn(
                  'h-10 w-full rounded-lg border border-[#e5e9f0] bg-white px-4 text-[13px] text-foreground outline-none transition-colors',
                  'placeholder:text-muted-foreground hover:border-[#c0c6d4]',
                  'focus:border-primary focus:ring-2 focus:ring-primary/10',
                  'dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4]',
                )}
              />
            </div>

            {/* WordPress username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-foreground">WordPress username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="editor@example.com"
                autoComplete="username"
                className={cn(
                  'h-10 w-full rounded-lg border border-[#e5e9f0] bg-white px-4 text-[13px] text-foreground outline-none transition-colors',
                  'placeholder:text-muted-foreground hover:border-[#c0c6d4]',
                  'focus:border-primary focus:ring-2 focus:ring-primary/10',
                  'dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4]',
                )}
              />
            </div>

            {/* Application password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-foreground">Application password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={appPassword}
                  onChange={e => setAppPassword(e.target.value)}
                  placeholder="Different from your login password"
                  autoComplete="new-password"
                  className={cn(
                    'h-10 w-full rounded-lg border border-[#e5e9f0] bg-white px-4 pr-10 text-[13px] text-foreground outline-none transition-colors',
                    'placeholder:text-muted-foreground hover:border-[#c0c6d4]',
                    'focus:border-primary focus:ring-2 focus:ring-primary/10',
                    'dark:border-[#333a47] dark:bg-[#262b35] dark:text-[#e4e4e4]',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff size={14} strokeWidth={1.6} absoluteStrokeWidth />
                    : <Eye size={14} strokeWidth={1.6} absoluteStrokeWidth />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-none items-center gap-2 border-t border-border px-6 py-4">
            <Select value={approvalWorkflow} onValueChange={setApprovalWorkflow}>
              <SelectTrigger
                size="sm"
                aria-label="Approval workflow"
                className="h-9 w-[200px] border-border bg-background text-[13px]"
              >
                <SelectValue placeholder="Select approval" />
              </SelectTrigger>
              <SelectContent align="start" className="w-[240px]">
                {APPROVAL_WORKFLOWS.map(workflow => (
                  <SelectItem key={workflow} value={workflow}>
                    {workflow}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-[13px] text-foreground transition-colors hover:bg-muted/60"
                  aria-label="Schedule date"
                >
                  <CalendarDays size={14} strokeWidth={1.6} absoluteStrokeWidth className="flex-none text-muted-foreground" />
                  <span className={scheduleDate ? 'text-foreground' : 'text-muted-foreground'}>
                    {scheduleDate ? formatScheduleDate(scheduleDate) : 'Select date and time'}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduleDate}
                  onSelect={date => {
                    setScheduleDate(date);
                    if (date) setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex-1" />

            <Button
              type="button"
              disabled={!canPublish}
              onClick={handlePublish}
            >
              Publish
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
