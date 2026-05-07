import * as React from "react";
import { Paperclip, Wand2, MoreVertical, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from "./prompt-input";

export interface CopilotPromptBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CopilotPromptBox({
  value,
  onChange,
  onSend,
  onAttach,
  placeholder = "Ask anything...",
  disabled = false,
  className,
}: CopilotPromptBoxProps) {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <PromptInput onSubmit={onSend} disabled={disabled} className={className}>
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
