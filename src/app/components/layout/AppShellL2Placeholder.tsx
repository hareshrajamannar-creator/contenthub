import { PANEL } from "@/app/components/L2NavLayout";

export type AppShellL2PlaceholderProps = {
  /** Explains why the column is non-interactive (shell preview). */
  caption?: string;
};

/**
 * L2 column skeleton matching `PANEL` from `L2NavLayout` — used when a product
 * does not use the shell L2 + main split (e.g. Chatbot / `searchai`, Insights).
 */
export function AppShellL2Placeholder({
  caption = "Chatbot is not wired to this shell — secondary nav is a preview only.",
}: AppShellL2PlaceholderProps) {
  return (
    <aside className={PANEL} aria-label="Secondary navigation placeholder" data-no-print>
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <p className="text-xs leading-snug text-muted-foreground">{caption}</p>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-black/8 animate-pulse dark:bg-white/8" />
              <div
                className="h-3 rounded bg-black/6 animate-pulse dark:bg-white/6"
                style={{ width: `${72 + (i % 4) * 20}px` }}
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
