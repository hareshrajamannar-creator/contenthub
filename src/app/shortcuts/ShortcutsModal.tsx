import type { ComponentType, ReactNode } from "react";
import { LayoutTemplate, Signpost } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { cn } from "@/app/components/ui/utils";
import type { AppView } from "@/app/App";
import {
  shortcutScopeFromView,
  shortcutsForModal,
  type ShortcutDefinition,
  type ShortcutScope,
} from "./shortcuts";

function modifierLabel(): string {
  if (typeof navigator === "undefined") return "⌘";
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "⌘" : "Ctrl";
}

function KeyChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium leading-none text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

function KeySequence({ keys }: { keys: string[] }) {
  const mod = modifierLabel();
  return (
    <span className="flex flex-wrap items-center justify-end gap-1">
      {keys.map((k, i) => (
        <span key={`${k}-${i}`} className="flex items-center gap-1">
          {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
          <KeyChip>{k === "⌘" ? mod : k}</KeyChip>
        </span>
      ))}
    </span>
  );
}

function ShortcutKeys({ def }: { def: ShortcutDefinition }) {
  if (def.keySequences?.length) {
    return (
      <span className="flex flex-wrap items-center justify-end gap-1">
        {def.keySequences.map((seq, i) => (
          <span key={seq.join("-")} className="flex flex-wrap items-center justify-end gap-1">
            {i > 0 && <span className="text-muted-foreground px-0.5 text-xs" aria-hidden>/</span>}
            <KeySequence keys={seq} />
          </span>
        ))}
      </span>
    );
  }
  if (def.id.startsWith("go-") && def.keys.length > 1) {
    return (
      <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
        <KeyChip>G</KeyChip>
        <span className="text-muted-foreground text-xs">then</span>
        <KeyChip>{def.keys[1]}</KeyChip>
      </span>
    );
  }
  return <KeySequence keys={def.keys} />;
}

const scopeLabel: Record<ShortcutScope, string> = {
  global: "Everywhere",
  reviews: "Reviews",
  inbox: "Inbox",
  agents: "BirdAI",
  social: "Social",
  dashboard: "Reports & dashboards",
  ticketing: "Ticketing",
  surveys: "Surveys",
  default: "This view",
};

type ModalColumnKey = "navigation" | "current-view";

const columnIcons: Record<ModalColumnKey, ComponentType<{ className?: string }>> = {
  navigation: Signpost,
  "current-view": LayoutTemplate,
};

/** One Navigation column for all globals; optional view-specific column. */
function buildModalColumns(
  rows: ShortcutDefinition[],
  scope: ShortcutScope,
): { key: ModalColumnKey; title: string; rows: ShortcutDefinition[] }[] {
  const globals = rows.filter((r) => r.scope === "global");
  const scoped = rows.filter((r) => r.scope !== "global");
  const out: { key: ModalColumnKey; title: string; rows: ShortcutDefinition[] }[] = [];
  if (globals.length) out.push({ key: "navigation", title: "Navigation", rows: globals });
  if (scoped.length) out.push({ key: "current-view", title: scopeLabel[scope], rows: scoped });
  return out;
}

interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentView: AppView;
}

export function ShortcutsModal({ open, onOpenChange, currentView }: ShortcutsModalProps) {
  const scope = shortcutScopeFromView(currentView);
  const rows = shortcutsForModal(scope);
  const columns = buildModalColumns(rows, scope);
  const mod = modifierLabel();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(88vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        data-shortcuts-ignore
      >
        <DialogHeader className="shrink-0 px-4 py-3 text-left">
          <DialogTitle className="text-base">Keyboard shortcuts</DialogTitle>
          <DialogDescription className="text-left text-xs leading-snug">
            Press ? or {mod}+K anytime to open this panel. Press G, then a letter, to jump to a main area.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-1">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {columns.map(({ key, title, rows: colRows }) => {
              const Icon = columnIcons[key];
              return (
                <section
                  key={key}
                  aria-label={title}
                  className="flex min-w-0 flex-col gap-2"
                >
                  <h2 className="text-muted-foreground flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
                    <Icon className="size-3 shrink-0 opacity-80" aria-hidden />
                    {title}
                  </h2>
                  <ul className="flex flex-col gap-0">
                    {colRows.map((row) => (
                      <li
                        key={row.id}
                        className="grid min-w-0 grid-cols-1 gap-2 py-2 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-3"
                      >
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="text-foreground text-sm font-medium leading-snug">{row.description}</p>
                          {row.detail ? (
                            <p className="text-muted-foreground text-xs leading-snug">{row.detail}</p>
                          ) : null}
                        </div>
                        <div className="flex min-h-5 min-w-0 items-start justify-start sm:justify-end">
                          <ShortcutKeys def={row} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
