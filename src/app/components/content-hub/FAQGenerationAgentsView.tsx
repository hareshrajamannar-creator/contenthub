export interface FAQGenerationAgentsViewProps {
  onBuilderModeChange?: (inBuilder: boolean) => void;
}

export function FAQGenerationAgentsView({ onBuilderModeChange: _onBuilderModeChange }: FAQGenerationAgentsViewProps) {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
      FAQ generation agents — coming soon
    </div>
  );
}
