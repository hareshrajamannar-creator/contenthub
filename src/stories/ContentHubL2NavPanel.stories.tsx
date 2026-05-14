import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ContentHubL2NavPanel } from '@/app/components/ContentHubL2NavPanel';
import { APP_SHELL_GUTTER_SURFACE_CLASS } from '@/app/components/layout/appShellClasses';

const meta: Meta<typeof ContentHubL2NavPanel> = {
  title: 'App/ContentHubL2NavPanel',
  component: ContentHubL2NavPanel,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof ContentHubL2NavPanel>;

function Frame({ initialActive }: { initialActive: string }) {
  const [activeItem, setActiveItem] = useState(initialActive);

  return (
    <div className={`flex h-screen ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
      <ContentHubL2NavPanel
        activeItem={activeItem}
        onActiveItemChange={(key) => setActiveItem(key)}
        onCreate={() => {}}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <Frame initialActive="Human actions/Projects" />,
};

export const AssignedActive: Story = {
  name: 'Assigned active',
  render: () => <Frame initialActive="Human actions/Assigned to me" />,
};

export const FixContentActive: Story = {
  name: 'Fix content active',
  render: () => <Frame initialActive="Human actions/Fix content" />,
};

export const FAQAgentsActive: Story = {
  name: 'FAQ agents active',
  render: () => <Frame initialActive="Agents/FAQ generation agents" />,
};
