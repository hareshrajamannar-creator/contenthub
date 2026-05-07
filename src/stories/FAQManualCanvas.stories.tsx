import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FAQManualCanvas } from '@/app/components/content-hub/faq/FAQManualCanvas';

const meta: Meta<typeof FAQManualCanvas> = {
  title: 'App/FAQManualCanvas',
  component: FAQManualCanvas,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof FAQManualCanvas>;

export const Default: Story = {
  render: () => {
    const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);
    const [toolbarVisible, setToolbarVisible] = useState(false);
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <FAQManualCanvas
          selectedFaqId={selectedFaqId}
          onSelectFaq={id => { setSelectedFaqId(id); if (!id) setToolbarVisible(false); }}
          onToolbarVisible={setToolbarVisible}
        />
        <div style={{ padding: 8, fontSize: 12, color: '#888' }}>
          Selected: {selectedFaqId ?? 'none'} · Toolbar: {toolbarVisible ? 'visible' : 'hidden'}
        </div>
      </div>
    );
  },
};
