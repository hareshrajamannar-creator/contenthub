import { useMemo, useState, type ReactNode } from 'react';
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  Image,
  Link2,
  Linkedin,
  Lock,
  Presentation,
  Search,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { cn } from '@/lib/utils';

type ShareTab = 'collaborate' | 'link' | 'download' | 'embed';
type Permission = 'View only' | 'Comment' | 'Edit';

interface ContentShareModalProps {
  open: boolean;
  onClose: () => void;
  contentTitle?: string;
  shareUrl?: string;
  initialTab?: ShareTab;
}

const TABS: { id: ShareTab; label: string }[] = [
  { id: 'collaborate', label: 'Collaborate' },
  { id: 'link', label: 'Share link' },
  { id: 'download', label: 'Download' },
  { id: 'embed', label: 'Embed' },
];

const MEMBERS = [
  { id: 'maya', name: 'Maya Singh', email: 'maya@company.com', role: 'Marketing lead' },
  { id: 'jon', name: 'Jon Bell', email: 'jon@company.com', role: 'Content strategist' },
  { id: 'nina', name: 'Nina Patel', email: 'nina@company.com', role: 'SEO manager' },
];

const DOWNLOAD_OPTIONS = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'ppt', label: 'PowerPoint', icon: Presentation },
  { id: 'slides', label: 'Google Slides', icon: Presentation },
  { id: 'images', label: 'Images', icon: Image },
];

function PermissionSelect({
  value,
  onChange,
}: {
  value: Permission;
  onChange: (value: Permission) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={next => onChange(next as Permission)}
    >
      <SelectTrigger size="sm" className="h-8 w-[112px] border-border bg-background text-[12px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="View only">View only</SelectItem>
        <SelectItem value="Comment">Comment</SelectItem>
        <SelectItem value="Edit">Edit</SelectItem>
      </SelectContent>
    </Select>
  );
}

function CopyButton({
  text,
  copied,
  onCopy,
  children,
}: {
  text: string;
  copied: boolean;
  onCopy: (text: string) => void;
  children: ReactNode;
}) {
  return (
    <Button type="button" size="sm" onClick={() => onCopy(text)} className="gap-2">
      {copied ? <CheckCircle2 size={14} strokeWidth={1.6} absoluteStrokeWidth /> : <Copy size={14} strokeWidth={1.6} absoluteStrokeWidth />}
      {copied ? 'Copied' : children}
    </Button>
  );
}

export function ContentShareModal({
  open,
  onClose,
  contentTitle = 'New FAQ page',
  shareUrl = 'https://contenthub.birdeye.com/share/faq-set-001',
  initialTab = 'collaborate',
}: ContentShareModalProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>(initialTab);
  const [query, setQuery] = useState('');
  const [workspaceAccess, setWorkspaceAccess] = useState(false);
  const [linkPermission, setLinkPermission] = useState<Permission>('View only');
  const [memberPermissions, setMemberPermissions] = useState<Record<string, Permission>>({
    maya: 'Edit',
    jon: 'Comment',
    nina: 'View only',
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [searchIndex, setSearchIndex] = useState(false);
  const [downloadScope, setDownloadScope] = useState('all');
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe src="${shareUrl}/embed" width="100%" style="border:0;min-height:480px" loading="lazy"></iframe>`;
  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MEMBERS;
    return MEMBERS.filter(member =>
      member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q),
    );
  }, [query]);

  function copyText(text: string) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="!w-[960px] !max-w-[calc(100vw-32px)] gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-[15px] font-semibold">Share content</DialogTitle>
        </DialogHeader>

        <div className="px-6">
          <div className="flex gap-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'border-b-2 px-0 py-4 text-[13px] font-medium transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[380px] px-6 py-6">
          {activeTab === 'collaborate' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
                <Search size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search teammates or enter an email"
                  className="h-8 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                />
                <Button type="button" size="sm" variant="outline">
                  Invite
                </Button>
              </div>

              <div className="rounded-xl border border-border/70">
                <div className="flex items-center justify-between border-b border-border px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Users size={16} strokeWidth={1.6} absoluteStrokeWidth />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">Workspace access</p>
                      <p className="text-[12px] text-muted-foreground">Allow everyone in this workspace to access this content.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkspaceAccess(value => !value)}
                    className={cn(
                      'h-6 w-11 rounded-full p-0.5 transition-colors',
                      workspaceAccess ? 'bg-primary' : 'bg-muted',
                    )}
                    aria-pressed={workspaceAccess}
                  >
                    <span className={cn(
                      'block size-5 rounded-full bg-background transition-transform',
                      workspaceAccess && 'translate-x-5',
                    )} />
                  </button>
                </div>

                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-4">
                    <div>
                      <p className="text-[13px] font-medium text-foreground">You</p>
                      <p className="text-[12px] text-muted-foreground">Owner</p>
                    </div>
                    <span className="text-[12px] font-medium text-muted-foreground">Full access</span>
                  </div>
                  {filteredMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between gap-4 px-4 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-foreground">{member.name}</p>
                        <p className="truncate text-[12px] text-muted-foreground">{member.email} · {member.role}</p>
                      </div>
                      <PermissionSelect
                        value={memberPermissions[member.id]}
                        onChange={value => setMemberPermissions(prev => ({ ...prev, [member.id]: value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">Anyone with the link</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">Control what people can do after opening the shared URL.</p>
                  </div>
                  <PermissionSelect value={linkPermission} onChange={setLinkPermission} />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 pl-4">
                <Link2 size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
                <input
                  readOnly
                  value={shareUrl}
                  className="h-10 min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none"
                />
                <CopyButton text={shareUrl} copied={copied} onCopy={copyText}>
                  Copy
                </CopyButton>
              </div>

              <div className="rounded-xl border border-border/70">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(value => !value)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left"
                >
                  <span className="text-[13px] font-medium text-foreground">Advanced settings</span>
                  <ChevronDown
                    size={15}
                    strokeWidth={1.6}
                    absoluteStrokeWidth
                    className={cn('text-muted-foreground transition-transform', advancedOpen && 'rotate-180')}
                  />
                </button>
                {advancedOpen && (
                  <div className="space-y-4 border-t border-border px-4 py-4">
                    <label className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-[13px] text-foreground">
                        <Lock size={14} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
                        Require a password
                      </span>
                      <input type="checkbox" checked={requirePassword} onChange={event => setRequirePassword(event.target.checked)} />
                    </label>
                    <label className="flex items-center justify-between gap-4">
                      <span className="text-[13px] text-foreground">Allow this content to appear in search results</span>
                      <input type="checkbox" checked={searchIndex} onChange={event => setSearchIndex(event.target.checked)} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border/70 p-4">
                <label className="flex flex-col gap-1">
                  <span className="text-[12px] font-medium text-foreground">Download scope</span>
                  <Select
                    value={downloadScope}
                    onValueChange={setDownloadScope}
                  >
                    <SelectTrigger className="h-9 border-border bg-background text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="all">All content</SelectItem>
                      <SelectItem value="overview">FAQ overview section</SelectItem>
                      <SelectItem value="answers">Questions and answers only</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {DOWNLOAD_OPTIONS.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className="flex items-center gap-4 rounded-xl border border-border/70 p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                    >
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon size={17} strokeWidth={1.6} absoluteStrokeWidth />
                      </div>
                      <span className="text-[13px] font-medium text-foreground">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-border/70 p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <span className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Linkedin size={17} strokeWidth={1.6} absoluteStrokeWidth />
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-foreground">Post directly to LinkedIn</span>
                    <span className="text-[12px] text-muted-foreground">Share without downloading a file.</span>
                  </span>
                </span>
              </button>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-4">
              <p className="text-[13px] leading-5 text-muted-foreground">
                Copy this embed code and paste it into any external website or page.
              </p>
              <pre className="max-h-[220px] overflow-auto rounded-xl border border-border bg-muted/40 p-4 text-[12px] leading-5 text-foreground whitespace-pre-wrap break-all">
                {embedCode}
              </pre>
              <CopyButton text={embedCode} copied={copied} onCopy={copyText}>
                Copy embed code
              </CopyButton>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <Button type="button" variant="ghost" className="gap-2">
            <BarChart3 size={14} strokeWidth={1.6} absoluteStrokeWidth />
            View analytics
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => copyText(shareUrl)}>
            {copied ? <CheckCircle2 size={14} strokeWidth={1.6} absoluteStrokeWidth /> : <Copy size={14} strokeWidth={1.6} absoluteStrokeWidth />}
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
