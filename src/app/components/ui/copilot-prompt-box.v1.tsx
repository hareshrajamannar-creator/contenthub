import * as React from "react";
import { Paperclip, Wand2, MoreVertical, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "./prompt-input";

export interface CopilotPromptBoxContextChip {
  label: string;
  onRemove: () => void;
}

export interface CopilotPromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** When set, renders a dismissible context chip inside the prompt box above the textarea */
  contextChip?: CopilotPromptBoxContextChip | null;
}

export function CopilotPromptBox({
  value,
  onChange,
  onSend,
  onAttach,
  placeholder = "Ask anything...",
  disabled = false,
  className,
  contextChip,
}: CopilotPromptBoxProps) {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <PromptInput onSubmit={onSend} disabled={disabled} className={className}>
      {contextChip && (
        <div className="flex items-center px-3.5 pt-2.5 pb-0">
          <div className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/8 pl-2.5 pr-1 py-0.5 text-[12px] text-primary font-medium max-w-[220px]">
            <span className="truncate">{contextChip.label}</span>
            <button
              type="button"
              onClick={contextChip.onRemove}
              className="ml-0.5 shrink-0 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
              aria-label="Clear context"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      <PromptInputTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <PromptInputActions>
        <div className="flex items-center gap-0.5">
          <PromptInputAction
            tooltip="Attach file"
            onClick={onAttach}
            disabled={!onAttach || disabled}
          >
            <Paperclip className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
          </PromptInputAction>
          <PromptInputAction tooltip="Enhance prompt" disabled={disabled}>
            <Wand2 className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
          </PromptInputAction>
          <PromptInputAction tooltip="More options" disabled={disabled}>
            <MoreVertical className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
          </PromptInputAction>
        </div>
        <PromptInputAction
          tooltip="Send"
          onClick={onSend}
          disabled={!canSend}
          className={cn(
            'transition-colors',
            canSend
              ? 'rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground p-1.5'
              : 'text-muted-foreground/40',
          )}
        >
          <ArrowUp className="size-4" strokeWidth={1.6} absoluteStrokeWidth />
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
  );
}
