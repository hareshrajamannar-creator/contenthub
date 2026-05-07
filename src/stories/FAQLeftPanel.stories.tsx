import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FAQLeftPanel } from '@/app/components/content-hub/faq/FAQLeftPanel';

const meta: Meta<typeof FAQLeftPanel> = {
  title: 'App/FAQLeftPanel',
  component: FAQLeftPanel,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof FAQLeftPanel>;

export const Default: Story = {
  render: () => {
    const [width, setWidth] = useState(220);
    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ width, flexShrink: 0, position: 'relative' }}>
          <FAQLeftPanel
            onAddQuestion={() => alert('Add question')}
            onAddSection={() => alert('Add section')}
            onWidthChange={setWidth}
            className="h-full"
          />
        </div>
        <div style={{ flex: 1, padding: 24, fontSize: 12, color: '#888' }}>
          Panel width: {width}px · Drag the right edge handle to resize.
        </div>
      </div>
    );
  },
};
