import React from 'react';
import {
  AlignLeft,
  Bold,
  ChevronDown,
  ChevronRight,
  Gauge,
  Italic,
  List,
  MapPin,
  Maximize2,
  Mic,
  Minimize2,
  Redo2,
  ScanText,
  SpellCheck,
  StretchHorizontal,
  Type,
  Underline,
  Undo2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Strikethrough,
  Indent,
  Outdent,
  Highlighter,
  PaintRoller,
  Minus,
  Plus,
  AlignVerticalSpaceAround,
  TrendingUp,
  MousePointerClick,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EditorToolbarPosition {
  top: number;
  left: number;
}

interface EditorChromeToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  richTextVisible?: boolean;
  canvasPosition: EditorToolbarPosition;
  richTextPosition?: EditorToolbarPosition;
  inlineMode?: boolean;
  mode?: 'blog' | 'faq';
}

type TextInput = HTMLInputElement | HTMLTextAreaElement;

const COLOR_SWATCH_ROWS = [
  ['#2f3340', '#45464a', '#5d5e62', '#9b9c9f', '#adadaf', '#c8c8ca', '#e3e4e6', '#ffffff'],
  ['#1f4f83', '#2a756d', '#2f701f', '#d3a915', '#b95412', '#b6281c', '#94145b', '#52307e'],
  ['#2f78bd', '#4aa891', '#4dad2f', '#ffd84d', '#f28a49', '#ef3b28', '#c93177', '#8250bd'],
  ['#3b99e8', '#65d2c8', '#82d663', '#ffe06b', '#ffad72', '#f6684d', '#e74792', '#9a78d1'],
  ['#67b9ed', '#9be5dc', '#98ee73', '#fff183', '#ffc166', '#f29d8d', '#e884b5', '#c5a7e8'],
  ['#dce7f9', '#d8f3ee', '#daf5dc', '#fbf5d4', '#f9e8c9', '#f8dddd', '#f6e2ee', '#eee0f4'],
] as const;

const TONE_OPTIONS = ['Friendly', 'Witty', 'Descriptive', 'Informative', 'Formal'] as const;

const MODIFY_ACTIONS = [
  { id: 'shorter', label: 'Make shorter', icon: Minimize2 },
  { id: 'longer', label: 'Make longer', icon: Maximize2 },
  { id: 'spelling', label: 'Fix spelling and grammar', icon: SpellCheck },
] as const;

const IMPROVE_ACTIONS_BLOG = [
  { id: 'boost-seo', label: 'Boost SEO', icon: TrendingUp },
  { id: 'strengthen-cta', label: 'Strengthen CTA', icon: MousePointerClick },
  { id: 'improve-readability', label: 'Improve readability', icon: BookOpen },
] as const;

const IMPROVE_ACTIONS_FAQ = [
  { id: 'aeo', label: 'Improve AEO score', icon: Gauge },
  { id: 'local', label: 'Add local context', icon: MapPin },
  { id: 'clarity', label: 'Rewrite for clarity', icon: ScanText },
] as const;

type AiActionId = 'boost-seo' | 'strengthen-cta' | 'improve-readability' | 'aeo' | 'clarity' | 'local' | 'shorter' | 'longer' | 'spelling';

function activeTextInput(): TextInput | null {
  const active = document.activeElement;
  if (active instanceof HTMLTextAreaElement) return active;
  if (active instanceof HTMLInputElement && active.type === 'text') return active;
  return null;
}

function applyInputStyle(styles: Partial<CSSStyleDeclaration>, listStyle?: 'bulleted' | 'numbered') {
  const input = activeTextInput();
  if (!input) return false;
  Object.assign(input.style, styles);
  input.dataset.hasRichStyle = 'true';
  if (listStyle) input.dataset.listStyle = listStyle;
  // Auto-resize textarea so content is never clipped when font size changes
  if (input instanceof HTMLTextAreaElement) {
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
    input.style.overflow = 'hidden';
  }
  // Notify the React component owning this input so it can persist styles across edit/view transitions
  input.dispatchEvent(new CustomEvent('richstylechange', { detail: styles }));
  return true;
}

function execRichCommand(command: string, value?: string) {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.isContentEditable) {
    document.execCommand(command, false, value);
  }
}

function formatSelection(kind: 'bold' | 'italic' | 'underline' | 'link' | 'color' | 'fontSize' | 'fontName' | 'alignLeft' | 'bulleted' | 'numbered', value?: string) {
  const input = activeTextInput();
  if (input) {
    if (kind === 'bold') applyInputStyle({ fontWeight: input.style.fontWeight === '700' ? '' : '700' });
    if (kind === 'italic') applyInputStyle({ fontStyle: input.style.fontStyle === 'italic' ? '' : 'italic' });
    if (kind === 'underline') applyInputStyle({ textDecoration: input.style.textDecoration === 'underline' ? '' : 'underline' });
    if (kind === 'link') applyInputStyle({ color: 'var(--primary)', textDecoration: 'underline' });
    if (kind === 'color') applyInputStyle({ color: value ?? '' });
    if (kind === 'fontSize') applyInputStyle({ fontSize: value ? `${value}px` : '' });
    if (kind === 'fontName') applyInputStyle({ fontFamily: value ?? '' });
    if (kind === 'alignLeft') applyInputStyle({ textAlign: 'left' });
    if (kind === 'bulleted') applyInputStyle({ paddingLeft: '24px' }, 'bulleted');
    if (kind === 'numbered') applyInputStyle({ paddingLeft: '24px' }, 'numbered');
    return;
  }

  if (kind === 'bold') execRichCommand('bold');
  if (kind === 'italic') execRichCommand('italic');
  if (kind === 'underline') execRichCommand('underline');
  if (kind === 'link') execRichCommand('createLink', 'https://');
  if (kind === 'color') execRichCommand('foreColor', value);
  if (kind === 'fontSize') execRichCommand('fontSize', value);
  if (kind === 'fontName') execRichCommand('fontName', value);
  if (kind === 'alignLeft') execRichCommand('justifyLeft');
  if (kind === 'bulleted') execRichCommand('insertUnorderedList');
  if (kind === 'numbered') execRichCommand('insertOrderedList');
}

function improveTextWithAi(text: string, action: AiActionId) {
  const trimmed = text.trim();
  const base = trimmed || 'Add a clear answer for your customers.';

  if (action === 'expand' || action === 'longer') {
    return `${base} Include what customers can expect, when they should take action, and the next best step.`;
  }
  if (action === 'concise' || action === 'shorter') {
    return base
      .replace(/\s+/g, ' ')
      .replace(/\btypically\s+/gi, '')
      .replace(/\bto minimize disruption and ensure your safety\b/gi, 'to keep you safe')
      .trim();
  }
  if (action === 'spelling') {
    return base
      .replace(/\s+/g, ' ')
      .replace(/\butilize\b/gi, 'use')
      .replace(/\bprioritize\b/gi, 'focus on')
      .trim();
  }
  if (action === 'aeo') {
    return `${base} In short: ${base.split(/[.!?]/)[0].trim()}. This gives search and AI answer engines a direct, citation-friendly response.`;
  }
  if (action === 'clarity') {
    return base.replace(/\s+/g, ' ').replace(/\butilize\b/gi, 'use').trim();
  }
  return `${base} For local customers, this applies across your nearby service area and can be tailored by city, suburb, or neighborhood.`;
}

function replaceInputText(input: TextInput, nextText: string) {
  const start = input.selectionStart ?? 0;
  const end = input.selectionEnd ?? input.value.length;
  const hasSelection = end > start;
  const nextValue = hasSelection
    ? `${input.value.slice(0, start)}${nextText}${input.value.slice(end)}`
    : nextText;

  input.value = nextValue;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const cursor = hasSelection ? start + nextText.length : nextText.length;
  input.setSelectionRange(cursor, cursor);
}

function applyAiAction(action: AiActionId) {
  const input = activeTextInput();
  const active = document.activeElement;

  if (input) {
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? input.value.length;
    const selectedText = end > start ? input.value.slice(start, end) : input.value;
    input.classList.add('animate-pulse', 'bg-[#7c3aed]/[0.06]');
    window.setTimeout(() => {
      replaceInputText(input, improveTextWithAi(selectedText, action));
      input.classList.remove('animate-pulse', 'bg-[#7c3aed]/[0.06]');
      input.focus();
    }, 650);
    return;
  }

  if (active instanceof HTMLElement && active.isContentEditable) {
    const selectedText = window.getSelection()?.toString() || active.innerText;
    active.classList.add('animate-pulse', 'bg-[#7c3aed]/[0.06]');
    window.setTimeout(() => {
      document.execCommand('insertText', false, improveTextWithAi(selectedText, action));
      active.classList.remove('animate-pulse', 'bg-[#7c3aed]/[0.06]');
      active.focus();
    }, 650);
  }
}

function ToolbarButton({
  title,
  onClick,
  disabled,
  children,
  className,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={event => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors',
        'hover:bg-muted hover:text-foreground disabled:opacity-30',
        className,
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="h-5 w-px bg-border" />;
}

function MenuControl({
  title,
  value,
  options,
  onSelect,
  open,
  onOpenChange,
  className,
}: {
  title: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        title={title}
        aria-label={title}
        onMouseDown={event => event.preventDefault()}
        onClick={() => onOpenChange(!open)}
        className={cn('relative flex h-8 items-center rounded-md pl-2 pr-6 text-[13px] text-foreground hover:bg-muted', className)}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={13} strokeWidth={1.6} absoluteStrokeWidth className="absolute right-1.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute left-0 top-10 z-50 min-w-full rounded-lg border border-border bg-background p-1 shadow-lg shadow-black/10">
          {options.map(option => (
            <button
              key={option}
              type="button"
              onMouseDown={event => event.preventDefault()}
              onClick={() => {
                onSelect(option);
                onOpenChange(false);
              }}
              className={cn(
                'flex h-8 w-full items-center rounded-md px-2 text-left text-[13px] transition-colors hover:bg-muted',
                option === value ? 'text-primary' : 'text-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorControl({
  value,
  open,
  onOpenChange,
  onSelect,
}: {
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        title="Text color"
        aria-label="Text color"
        aria-expanded={open}
        onMouseDown={event => event.preventDefault()}
        onClick={() => onOpenChange(!open)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors',
          open ? 'bg-muted text-foreground' : 'hover:bg-muted hover:text-foreground',
        )}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <Type size={18} strokeWidth={1.6} absoluteStrokeWidth />
          <span className="absolute bottom-0 h-0.5 w-4 rounded-full" style={{ backgroundColor: value }} />
        </span>
      </button>
      {open && (
        <div className="absolute left-0 top-10 z-50 w-[264px] rounded-xl border border-border bg-background p-2 shadow-lg shadow-black/10">
          <div className="grid grid-cols-8 gap-2">
            {COLOR_SWATCH_ROWS.flat().map(color => (
              <button
                key={color}
                type="button"
                title={color}
                aria-label={`Text color ${color}`}
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  onSelect(color);
                  onOpenChange(false);
                }}
                className={cn(
                  'h-6 w-6 rounded-full shadow-sm ring-1 ring-border transition-transform hover:scale-105',
                  color === value && 'ring-2 ring-foreground ring-offset-2 ring-offset-background',
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AiActionControl({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        title="AI actions"
        aria-label="AI actions"
        aria-expanded={open}
        onMouseDown={event => event.preventDefault()}
        onClick={() => onOpenChange(!open)}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md text-[#7c3aed] transition-colors',
          open ? 'bg-[#7c3aed]/10' : 'hover:bg-muted',
        )}
      >
        <Sparkles size={17} strokeWidth={1.2} absoluteStrokeWidth />
      </button>
      {open && (
        <div className="absolute left-0 top-10 z-50 w-[216px] rounded-xl border border-border bg-background p-1 shadow-lg shadow-black/10">
          {AI_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  applyAiAction(action.id);
                  onOpenChange(false);
                }}
                className="flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
              >
                <Icon size={15} strokeWidth={1.6} absoluteStrokeWidth className="text-muted-foreground" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EditorChromeToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomOut,
  onZoomIn,
  richTextVisible = false,
  canvasPosition,
  richTextPosition,
  inlineMode = false,
  mode = 'blog',
}: EditorChromeToolbarProps) {
  const [fontFamily, setFontFamily] = React.useState('Inter');
  const [textColor, setTextColor] = React.useState('#2f3340');
  const [openMenu, setOpenMenu] = React.useState<'ai' | 'font' | 'color' | null>(null);
  const [fontSizeNum, setFontSizeNum] = React.useState(15);
  const [toneOpen, setToneOpen] = React.useState(false);
  const position = richTextVisible && richTextPosition ? richTextPosition : canvasPosition;
  const improveActions = mode === 'faq' ? IMPROVE_ACTIONS_FAQ : IMPROVE_ACTIONS_BLOG;

  const richTextContent = (
    <>
      {/* 1. Magic Write */}
      <div className="relative">
        <button
          type="button"
          title="Magic Write"
          aria-label="Magic Write"
          onMouseDown={event => event.preventDefault()}
          onClick={() => { setOpenMenu(openMenu === 'ai' ? null : 'ai'); setToneOpen(false); }}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-[#7c3aed]/10 transition-colors hover:bg-[#7c3aed]/15"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.51931 10.0887H4.57118L4.24883 11.0207H3.2187L4.97763 6.12236H6.11988L7.8788 11.0207H6.84167L6.51931 10.0887ZM6.25302 9.30384L5.54525 7.25761L4.83747 9.30384H6.25302Z" fill="#6834B7"/>
            <path d="M9.51733 6.12937V11.0207H8.53626V6.12937H9.51733Z" fill="#6834B7"/>
            <path d="M9.32388 3.12083H1.8628C0.834006 3.12083 0 3.95484 0 4.98364V12.4349C0 13.4637 0.834007 14.2977 1.86281 14.2977H11.1768C12.2056 14.2977 13.0396 13.4637 13.0396 12.4349V6.85539C12.8579 6.94499 12.673 6.97287 12.523 6.97287C12.3815 6.97287 12.241 6.94766 12.1082 6.89686V12.4349C12.1082 12.9493 11.6912 13.3663 11.1768 13.3663H1.86281C1.34841 13.3663 0.931402 12.9493 0.931402 12.4349V4.98364C0.931402 4.46924 1.3484 4.05224 1.8628 4.05224H9.26645C9.21567 3.91308 9.1962 3.77401 9.1962 3.64919C9.1962 3.47286 9.23581 3.28997 9.32388 3.12083Z" fill="#6834B7"/>
            <path d="M14.3135 1.88781C14.2909 1.87008 14.2773 1.84761 14.2727 1.8204C14.2684 1.79607 14.2737 1.77277 14.2886 1.75049C14.3932 1.57115 14.4698 1.42736 14.5185 1.31913C14.5688 1.21216 14.5876 1.11705 14.5749 1.0338C14.5651 0.950203 14.5229 0.858108 14.4483 0.757518C14.3736 0.656928 14.2655 0.526047 14.1238 0.364876C14.0815 0.315913 14.0782 0.268806 14.1138 0.223556C14.1316 0.200931 14.1535 0.188046 14.1794 0.184901C14.2054 0.181756 14.2301 0.186801 14.2535 0.200035C14.4371 0.307876 14.5853 0.38785 14.6981 0.439957C14.8122 0.490449 14.911 0.510628 14.9946 0.500495C15.081 0.490012 15.1717 0.447579 15.2668 0.373195C15.363 0.297195 15.4865 0.185008 15.6371 0.0366344C15.683 -0.00839756 15.7301 -0.0119137 15.7784 0.026086C15.8267 0.0640857 15.8329 0.110843 15.797 0.166358C15.6908 0.344433 15.6125 0.486954 15.5622 0.593921C15.5136 0.702155 15.4956 0.797897 15.5083 0.881147C15.5226 0.965664 15.567 1.05822 15.6417 1.15881C15.7176 1.25778 15.8255 1.38722 15.9656 1.54712C16.0079 1.59609 16.0112 1.64319 15.9756 1.68844C15.94 1.7337 15.8902 1.739 15.8262 1.70437C15.6417 1.60102 15.4932 1.52474 15.3807 1.47552C15.2683 1.42629 15.1695 1.40611 15.0843 1.41498C15.0007 1.42511 14.9115 1.46737 14.8164 1.54175C14.723 1.6174 14.6023 1.7278 14.4542 1.87294C14.4087 1.92086 14.3617 1.92581 14.3135 1.88781Z" fill="#6834B7"/>
            <path d="M12.5714 6.04144C12.5135 6.04144 12.4639 6.02275 12.4225 5.98537C12.3853 5.95214 12.3646 5.90854 12.3604 5.85454C12.3025 5.43922 12.2446 5.11526 12.1867 4.88268C12.1329 4.6501 12.0439 4.47566 11.9198 4.35937C11.7998 4.23892 11.6178 4.14548 11.3737 4.07902C11.1296 4.01257 10.7945 3.93989 10.3684 3.86098C10.2401 3.83606 10.176 3.76545 10.176 3.64916C10.176 3.59102 10.1946 3.54325 10.2318 3.50587C10.2691 3.4685 10.3146 3.44565 10.3684 3.43735C10.7945 3.3792 11.1296 3.32105 11.3737 3.26291C11.6178 3.20061 11.7998 3.10924 11.9198 2.98879C12.0439 2.8642 12.135 2.68353 12.1929 2.44679C12.2508 2.20591 12.3066 1.87364 12.3604 1.45001C12.377 1.32126 12.4473 1.25689 12.5714 1.25689C12.6955 1.25689 12.7638 1.32334 12.7762 1.45624C12.83 1.87157 12.8838 2.19552 12.9376 2.4281C12.9955 2.66069 13.0865 2.83512 13.2106 2.95142C13.3389 3.06771 13.525 3.15908 13.7691 3.22553C14.0132 3.28783 14.3463 3.35843 14.7683 3.43735C14.8965 3.46227 14.9607 3.53287 14.9607 3.64916C14.9607 3.76545 14.8883 3.83606 14.7434 3.86098C14.3215 3.92743 13.9905 3.99181 13.7505 4.0541C13.5106 4.1164 13.3285 4.20778 13.2044 4.32822C13.0844 4.44866 12.9955 4.62725 12.9376 4.86399C12.8838 5.10073 12.83 5.42676 12.7762 5.84208C12.7638 5.97499 12.6955 6.04144 12.5714 6.04144Z" fill="#6834B7"/>
          </svg>
        </button>
        {openMenu === 'ai' && (
          <div className="absolute left-0 top-10 z-50 w-[232px] rounded-xl border border-border bg-background p-1 shadow-lg shadow-black/10">
            {/* MODIFY section */}
            <p className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Modify
            </p>

            {/* Change tone — has submenu */}
            <div className="relative">
              <button
                type="button"
                onMouseDown={event => event.preventDefault()}
                onClick={() => setToneOpen(v => !v)}
                className={cn(
                  'flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] transition-colors',
                  toneOpen ? 'bg-[#7c3aed]/8 text-[#7c3aed]' : 'text-foreground hover:bg-muted',
                )}
              >
                <Mic size={15} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-[#7c3aed]" />
                <span className="flex-1">Change tone</span>
                <ChevronRight size={13} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-muted-foreground" />
              </button>
              {toneOpen && (
                <div className="absolute left-full top-0 z-50 ml-1 w-[148px] rounded-xl border border-border bg-background p-1 shadow-lg shadow-black/10">
                  {TONE_OPTIONS.map(tone => (
                    <button
                      key={tone}
                      type="button"
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => {
                        setToneOpen(false);
                        setOpenMenu(null);
                      }}
                      className="flex h-9 w-full items-center rounded-lg px-3 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Make shorter / longer / Fix spelling */}
            {MODIFY_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    applyAiAction(action.id as AiActionId);
                    setOpenMenu(null);
                    setToneOpen(false);
                  }}
                  className="flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
                >
                  <Icon size={15} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-[#7c3aed]" />
                  <span>{action.label}</span>
                </button>
              );
            })}

            <div className="my-1 h-px bg-border" />

            {/* IMPROVE section — original AI actions */}
            <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Improve
            </p>
            {improveActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    applyAiAction(action.id as AiActionId);
                    setOpenMenu(null);
                    setToneOpen(false);
                  }}
                  className="flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[13px] text-foreground transition-colors hover:bg-muted"
                >
                  <Icon size={15} strokeWidth={1.6} absoluteStrokeWidth className="shrink-0 text-[#7c3aed]" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Divider */}
      <Divider />

      {/* 3. H1 */}
      <button
        type="button"
        title="Heading 1"
        aria-label="Heading 1"
        onMouseDown={event => event.preventDefault()}
        onClick={() => execRichCommand('formatBlock', 'H1')}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[14px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        H1
      </button>

      {/* 4. H2 */}
      <button
        type="button"
        title="Heading 2"
        aria-label="Heading 2"
        onMouseDown={event => event.preventDefault()}
        onClick={() => execRichCommand('formatBlock', 'H2')}
        className="flex h-8 w-8 items-center justify-center rounded-md text-[14px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        H2
      </button>

      {/* 5. Divider */}
      <Divider />

      {/* 6. Font family */}
      <MenuControl
        title="Font family"
        value={fontFamily}
        options={['Inter', 'Arial', 'Georgia', 'Times New Roman']}
        open={openMenu === 'font'}
        onOpenChange={open => setOpenMenu(open ? 'font' : null)}
        onSelect={value => {
          setFontFamily(value);
          formatSelection('fontName', value);
        }}
        className="w-[130px] rounded-lg border border-border"
      />

      {/* 7. Font size stepper */}
      <div className="flex items-center rounded-lg border border-border">
        <button
          type="button"
          title="Decrease font size"
          aria-label="Decrease font size"
          onMouseDown={event => event.preventDefault()}
          onClick={() => {
            const next = Math.max(8, fontSizeNum - 1);
            setFontSizeNum(next);
            formatSelection('fontSize', String(next));
          }}
          className="flex h-7 w-7 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Minus size={13} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
        <span className="min-w-[28px] border-x border-border text-center text-[13px] tabular-nums text-foreground leading-7">
          {fontSizeNum}
        </span>
        <button
          type="button"
          title="Increase font size"
          aria-label="Increase font size"
          onMouseDown={event => event.preventDefault()}
          onClick={() => {
            const next = Math.min(96, fontSizeNum + 1);
            setFontSizeNum(next);
            formatSelection('fontSize', String(next));
          }}
          className="flex h-7 w-7 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus size={13} strokeWidth={1.6} absoluteStrokeWidth />
        </button>
      </div>

      {/* 8. Divider */}
      <Divider />

      {/* 9. Text color */}
      <div className="relative">
        <button
          type="button"
          title="Text color"
          aria-label="Text color"
          aria-expanded={openMenu === 'color'}
          onMouseDown={event => event.preventDefault()}
          onClick={() => setOpenMenu(openMenu === 'color' ? null : 'color')}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors',
            openMenu === 'color' ? 'bg-muted text-foreground' : 'hover:bg-muted hover:text-foreground',
          )}
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <Type size={18} strokeWidth={1.6} absoluteStrokeWidth />
            <span
              className="absolute bottom-0 h-0.5 w-4 rounded-full"
              style={{ background: 'linear-gradient(to right, #f44336, #ff9800, #ffeb3b, #4caf50, #2196f3, #9c27b0)' }}
            />
          </span>
        </button>
        {openMenu === 'color' && (
          <div className="absolute left-0 top-10 z-50 w-[264px] rounded-xl border border-border bg-background p-2 shadow-lg shadow-black/10">
            <div className="grid grid-cols-8 gap-2">
              {COLOR_SWATCH_ROWS.flat().map(color => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  aria-label={`Text color ${color}`}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    setTextColor(color);
                    formatSelection('color', color);
                    setOpenMenu(null);
                  }}
                  className={cn(
                    'h-6 w-6 rounded-full shadow-sm ring-1 ring-border transition-transform hover:scale-105',
                    color === textColor && 'ring-2 ring-foreground ring-offset-2 ring-offset-background',
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 10. Highlight */}
      <div className="relative">
        <button
          type="button"
          title="Highlight color"
          onMouseDown={e => e.preventDefault()}
          onClick={() => execRichCommand('hiliteColor', '#fff176')}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <Highlighter size={16} strokeWidth={1.6} absoluteStrokeWidth />
            <span
              className="absolute bottom-0 h-0.5 w-4 rounded-full"
              style={{ background: 'linear-gradient(to right, #f44336, #ff9800, #ffeb3b, #4caf50, #2196f3, #9c27b0)' }}
            />
          </span>
        </button>
      </div>

      {/* 11. Divider */}
      <Divider />

      {/* 12. Bold */}
      <ToolbarButton title="Bold" onClick={() => formatSelection('bold')}>
        <Bold size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>

      {/* 13. Italic */}
      <ToolbarButton title="Italic" onClick={() => formatSelection('italic')}>
        <Italic size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>

      {/* 14. Underline */}
      <ToolbarButton title="Underline" onClick={() => formatSelection('underline')}>
        <Underline size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>

      {/* 15. Strikethrough */}
      <ToolbarButton title="Strikethrough" onClick={() => execRichCommand('strikeThrough')}>
        <Strikethrough size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>

      {/* 16. Divider */}
      <Divider />

      {/* 17. Align left */}
      <ToolbarButton title="Align left" onClick={() => formatSelection('alignLeft')}>
        <AlignLeft size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>

      {/* 18. Bullets */}
      <ToolbarButton title="Bulleted list" onClick={() => formatSelection('bulleted')}>
        <List size={17} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>

      {/* 19. Line spacing */}
      <ToolbarButton title="Line spacing">
        <AlignVerticalSpaceAround size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>

      {/* 20. Indent */}
      <ToolbarButton title="Indent" onClick={() => execRichCommand('indent')}>
        <Indent size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>

      {/* 21. Outdent */}
      <ToolbarButton title="Outdent" onClick={() => execRichCommand('outdent')}>
        <Outdent size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>

      {/* 22. Divider */}
      <Divider />

      {/* 23. Format painter */}
      <ToolbarButton title="Format painter">
        <PaintRoller size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>
    </>
  );

  const nonRichContent = (
    <>
      <ToolbarButton title="Undo" onClick={onUndo} disabled={!canUndo}>
        <Undo2 size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={onRedo} disabled={!canRedo}>
        <Redo2 size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>
      <Divider />
      <ToolbarButton title="Zoom out" onClick={onZoomOut}>
        <ZoomOut size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>
      <span className="min-w-10 text-center text-[13px] text-muted-foreground tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <ToolbarButton title="Zoom in" onClick={onZoomIn}>
        <ZoomIn size={16} strokeWidth={1.6} absoluteStrokeWidth />
      </ToolbarButton>
    </>
  );

  if (inlineMode) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 rounded-xl border border-border bg-background px-2 shadow-sm shadow-black/5',
          richTextVisible ? 'min-h-11' : 'h-11',
        )}
      >
        {richTextVisible ? richTextContent : nonRichContent}
      </div>
    );
  }

  return (
    <div
      className="fixed z-50 -translate-x-1/2"
      style={{ top: position.top, left: position.left }}
    >
      <div
        className={cn(
          'flex items-center gap-1 rounded-xl border border-border bg-background px-2 shadow-lg shadow-black/10',
          richTextVisible ? 'min-h-11' : 'h-11',
        )}
      >
        {richTextVisible ? richTextContent : nonRichContent}
      </div>
    </div>
  );
}
