import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedToggle } from '@/app/components/ui/segmented-toggle';

const SegmentedToggleDemo = () => {
  const [view, setView] = useState<'list' | 'grid'>('list');

  return (
    <div className="flex items-center gap-4 p-6">
      <SegmentedToggle<'list' | 'grid'>
        ariaLabel="View mode"
        iconOnly
        value={view}
        onChange={setView}
        items={[
          {
            value: 'list',
            label: 'List view',
            icon: <List className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
          },
          {
            value: 'grid',
            label: 'Grid view',
            icon: <LayoutGrid className="size-[14px]" strokeWidth={1.6} absoluteStrokeWidth aria-hidden />,
          },
        ]}
      />
    </div>
  );
};

const meta: Meta<typeof SegmentedToggle> = {
  title: 'UI/SegmentedToggle',
  component: SegmentedToggle,
};

export default meta;
type Story = StoryObj<typeof SegmentedToggle>;

export const Default: Story = {
  render: () => <SegmentedToggleDemo />,
};

export const IconOnly: Story = {
  name: 'Icon only',
  render: () => <SegmentedToggleDemo />,
};
