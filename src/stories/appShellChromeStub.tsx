import type { ReactNode } from "react";

import { APP_SHELL_BELOW_TOPBAR_CARD_CLASS } from "@/app/components/layout/appShellClasses";

/**
 * Storybook-only chrome: wide **below-TopBar card** (`APP_SHELL_BELOW_TOPBAR_CARD_CLASS`) with
 * a tall viewport so **ContactsBulkImportWorkspace** (full L2+main replacement in the app)
 * reads at a realistic width. The workspace already includes the vertical stepper rail.
 */
export function AppShellChromeStub({ children }: { children: ReactNode }) {
  return (
    <div className="h-[min(720px,85vh)] w-full min-w-0 px-2 py-2 sm:px-4">
      <div
        className={`${APP_SHELL_BELOW_TOPBAR_CARD_CLASS} h-full min-h-0 min-w-0 shadow-sm`}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-app-shell-main">
          {children}
        </div>
      </div>
    </div>
  );
}
