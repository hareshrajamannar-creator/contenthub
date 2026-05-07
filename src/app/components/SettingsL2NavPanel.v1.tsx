import { L2NavLayout } from "./L2NavLayout";
import { SETTINGS_SECTION_LABELS } from "./settings/settingsLandingData";

interface SettingsL2NavPanelProps {
  activeSection: string;
  onSectionClick: (label: string) => void;
}

export function SettingsL2NavPanel({ activeSection, onSectionClick }: SettingsL2NavPanelProps) {
  return (
    <L2NavLayout
      panelTitle="Settings"
      standaloneItems={SETTINGS_SECTION_LABELS}
      sections={[]}
      activeItem={`standalone/${activeSection}`}
      onActiveItemChange={(key) => {
        const label = key.replace("standalone/", "");
        onSectionClick(label);
      }}
    />
  );
}
