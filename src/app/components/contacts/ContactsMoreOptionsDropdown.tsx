"use client";

import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { L1_STRIP_ICON_STROKE_PX } from "@/app/components/l1StripIconTokens";
import { buttonVariants } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/app/components/ui/utils";

export type ContactsMoreOptionsDropdownProps = {
  /** Opens the bulk import workspace (App shell). */
  onChooseBulkImport?: () => void;
};

function placeholderToast(label: string) {
  toast.message(`${label} is not wired yet in this prototype.`);
}

/**
 * Contacts directory **More options**: Radix dropdown on the three-dot control (no centered dialog).
 * Matches product copy: sentence case, text-only rows.
 */
export function ContactsMoreOptionsDropdown({ onChooseBulkImport }: ContactsMoreOptionsDropdownProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {/*
          Native <button> so Radix can attach ref (our `Button` primitive is not forwardRef).
          Without a DOM ref, DropdownMenuTrigger does not open the menu.
        */}
        <button
          type="button"
          className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          aria-label="More options"
        >
          <MoreVertical
            className="size-4"
            strokeWidth={L1_STRIP_ICON_STROKE_PX}
            absoluteStrokeWidth
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[min(100vw-2rem,280px)]">
        <DropdownMenuItem
          className="px-4 py-2"
          onSelect={() => placeholderToast("Edit communication preferences")}
        >
          Edit communication preferences
        </DropdownMenuItem>
        <DropdownMenuItem
          className="px-4 py-2"
          onSelect={() => placeholderToast("Delete contacts")}
        >
          Delete contacts
        </DropdownMenuItem>
        <DropdownMenuItem
          className="px-4 py-2"
          onSelect={() => {
            if (onChooseBulkImport) onChooseBulkImport();
            else toast.message("Bulk import (connect from the app shell to use this flow).");
          }}
        >
          Bulk import
        </DropdownMenuItem>
        <DropdownMenuItem
          className="px-4 py-2"
          onSelect={() => placeholderToast("Download")}
        >
          Download
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
