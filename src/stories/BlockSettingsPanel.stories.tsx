import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BlockEditorProvider, useBlockEditorContext } from '@/app/components/content-hub/editor/BlockEditorContext';
import { BlockSettingsPanel } from '@/app/components/content-hub/editor/BlockSettingsPanel';
import { type Block } from '@/app/components/content-hub/editor/blockTypes';

const selectedBlock: Block = {
  id: 'hero-settings-story',
  type: 'hero',
  content: {
    headline: 'Make every property page feel alive',
    subheadline: 'A flexible hero block with configurable copy, calls to action, and visual style.',
    ctaLabel: 'Book a demo',
    ctaUrl: '',
    secondaryCtaLabel: 'See examples',
    secondaryCtaUrl: '',
    imageSrc: '',
    imageAlt: '',
    imagePosition: 'none',
  },
  style: {},
  behavior: {},
  settings: {
    alignment: 'left',
    width: 'contained',
    paddingTop: 'lg',
    paddingBottom: 'lg',
    background: 'primary',
    visibility: {
      desktop: true,
      tablet: true,
      mobile: true,
    },
  },
};

function SelectedSettingsPanel() {
  const { focusBlock } = useBlockEditorContext();

  React.useEffect(() => {
    focusBlock(selectedBlock.id);
  }, [focusBlock]);

  return <BlockSettingsPanel />;
}

function SettingsPanelStory() {
  return (
    <BlockEditorProvider initialBlocks={[selectedBlock]}>
      <div className="flex min-h-[720px] justify-end bg-muted/30 p-8">
        <SelectedSettingsPanel />
      </div>
    </BlockEditorProvider>
  );
}

const meta: Meta<typeof SettingsPanelStory> = {
  title: 'App/BlockSettingsPanel',
  component: SettingsPanelStory,
};

export default meta;
type Story = StoryObj<typeof SettingsPanelStory>;

export const Default: Story = {};
