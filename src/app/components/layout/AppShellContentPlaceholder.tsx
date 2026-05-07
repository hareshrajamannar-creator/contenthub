import type { AppView } from "@/app/App";
import { getAppViewTitle } from "@/app/appViewTitle";

export type AppShellContentPlaceholderProps = {
  view: AppView;
  /** Caption in the chart skeleton (defaults to `getAppViewTitle(view)`). */
  productLabel?: string;
};

/**
 * Main-canvas skeleton used in Storybook App Shell and for routes that do not
 * ship product UI in the shell yet (e.g. Chatbot / `searchai`, Insights).
 */
export function AppShellContentPlaceholder({ view, productLabel }: AppShellContentPlaceholderProps) {
  if (view === "business-overview") {
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-2 overflow-hidden bg-app-shell-main px-8 transition-colors duration-300">
        <p className="text-sm font-medium text-foreground">Overview</p>
        <p className="max-w-sm text-center text-[13px] text-muted-foreground">
          Empty state — content is shown on the real Overview page in the app.
        </p>
      </div>
    );
  }

  const label = productLabel ?? getAppViewTitle(view);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-6 overflow-hidden overflow-y-auto bg-app-shell-main p-8 transition-colors duration-300">
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 rounded-lg bg-black/8 animate-pulse dark:bg-white/8" />
            <div className="h-4 w-72 rounded-lg bg-black/5 animate-pulse dark:bg-white/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-lg bg-black/8 animate-pulse dark:bg-white/8" />
            <div className="h-9 w-24 rounded-lg bg-black/5 animate-pulse dark:bg-white/5" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/[0.06] dark:bg-app-shell-main"
            >
              <div className="h-3 w-20 rounded bg-black/8 animate-pulse dark:bg-white/8" />
              <div className="h-8 w-16 rounded bg-black/10 animate-pulse dark:bg-white/10" />
              <div className="h-2 w-24 rounded bg-black/5 animate-pulse dark:bg-white/5" />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-black/[0.06] bg-white p-6 dark:border-white/[0.06] dark:bg-app-shell-main">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-black/8 animate-pulse dark:bg-white/8" />
            <div className="h-7 w-28 rounded-lg bg-black/5 animate-pulse dark:bg-white/5" />
          </div>
          <div className="flex h-48 items-center justify-center rounded-lg bg-gradient-to-br from-black/[0.03] to-black/[0.06] dark:from-white/[0.03] dark:to-white/[0.06]">
            <span className="select-none text-[13px] text-[#999] dark:text-[#555]">
              {label} · main content
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-white dark:border-white/[0.06] dark:bg-app-shell-main">
          <div className="flex gap-4 border-b border-black/[0.06] px-6 py-4 dark:border-white/[0.06]">
            {[160, 96, 80, 64].map((w, i) => (
              <div
                key={i}
                className="h-3 rounded bg-black/8 animate-pulse dark:bg-white/8"
                style={{ width: w }}
              />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, row) => (
            <div
              key={row}
              className="flex gap-4 border-b border-black/[0.04] px-6 py-4 last:border-0 dark:border-white/[0.04]"
            >
              {[140, 92, 72, 58].map((w, i) => (
                <div
                  key={i}
                  className="h-3 rounded bg-black/6 animate-pulse dark:bg-white/6"
                  style={{ width: w + row * 4 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
