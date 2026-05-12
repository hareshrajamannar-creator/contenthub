import React from 'react';
import {
  AlignLeft,
  Bold,
  ChevronDown,
  Gauge,
  Italic,
  Link2,
  List,
  ListOrdered,
  MapPin,
  Minimize2,
  Redo2,
  ScanText,
  StretchHorizontal,
  Type,
  Underline,
  Undo2,
  Sparkles,
  ZoomIn,
  ZoomOut,
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

const AI_ACTIONS = [
  { id: 'expand', label: 'Expand answer', icon: StretchHorizontal },
  { id: 'concise', label: 'Make more concise', icon: Minimize2 },
  { id: 'aeo', label: 'Improve AEO score', icon: Gauge },
  { id: 'clarity', label: 'Rewrite for clarity', icon: ScanText },
  { id: 'local', label: 'Add local context', icon: MapPin },
] as const;

type AiActionId = typeof AI_ACTIONS[number]['id'];

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

  if (action === 'expand') {
    return `${base} Include what customers can expect, when they should take action, and the next best step.`;
  }
  if (action === 'concise') {
    return base
      .replace(/\s+/g, ' ')
      .replace(/\btypically\s+/gi, '')
      .replace(/\bto minimize disruption and ensure your safety\b/gi, 'to keep you safe')
      .trim();
  }
  if (action === 'aeo') {
    return `${base} In short: ${base.split(/[.!?]/)[0].trim()}. This gives search and AI answer engines a direct, citation-friendly response.`;
  }
  if (action === 'clarity') {
    return base
      .replace(/\s+/g, ' ')
      .replace(/\butilize\b/gi, 'use')
      .replace(/\bprioritize\b/gi, 'focus on')
      .trim();
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
}: EditorChromeToolbarProps) {
  const [fontFamily, setFontFamily] = React.useState('Inter');
  const [fontSize, setFontSize] = React.useState('14');
  const [textColor, setTextColor] = React.useState('#2f3340');
  const [openMenu, setOpenMenu] = React.useState<'ai' | 'font' | 'size' | 'color' | null>(null);
  const position = richTextVisible && richTextPosition ? richTextPosition : canvasPosition;

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
        {richTextVisible ? (
          <>
            <AiActionControl
              open={openMenu === 'ai'}
              onOpenChange={open => setOpenMenu(open ? 'ai' : null)}
            />
            <Divider />
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
              className="w-[118px]"
            />
            <MenuControl
              title="Font size"
              value={fontSize}
              options={['12', '14', '16', '18', '24', '32']}
              open={openMenu === 'size'}
              onOpenChange={open => setOpenMenu(open ? 'size' : null)}
              onSelect={value => {
                setFontSize(value);
                formatSelection('fontSize', value);
              }}
              className="w-[72px]"
            />
            <ColorControl
              value={textColor}
              open={openMenu === 'color'}
              onOpenChange={open => setOpenMenu(open ? 'color' : null)}
              onSelect={value => {
                setTextColor(value);
                formatSelection('color', value);
              }}
            />
            <ToolbarButton title="Bold" onClick={() => formatSelection('bold')}>
              <Bold size={16} strokeWidth={1.6} absoluteStrokeWidth />
            </ToolbarButton>
            <ToolbarButton title="Italic" onClick={() => formatSelection('italic')}>
              <Italic size={16} strokeWidth={1.6} absoluteStrokeWidth />
            </ToolbarButton>
            <ToolbarButton title="Underline" onClick={() => formatSelection('underline')}>
              <Underline size={16} strokeWidth={1.6} absoluteStrokeWidth />
            </ToolbarButton>
            <ToolbarButton title="Link" onClick={() => formatSelection('link')}>
              <Link2 size={16} strokeWidth={1.6} absoluteStrokeWidth />
            </ToolbarButton>
            <ToolbarButton title="Bulleted list" onClick={() => formatSelection('bulleted')}>
              <List size={17} strokeWidth={1.6} absoluteStrokeWidth />
            </ToolbarButton>
            <ToolbarButton title="Numbered list" onClick={() => formatSelection('numbered')}>
              <ListOrdered size={17} strokeWidth={1.6} absoluteStrokeWidth />
            </ToolbarButton>
            <ToolbarButton title="Align left" onClick={() => formatSelection('alignLeft')}>
              <AlignLeft size={16} strokeWidth={1.6} absoluteStrokeWidth />
            </ToolbarButton>
          </>
        ) : (
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
        )}
      </div>
    </div>
  );
}
