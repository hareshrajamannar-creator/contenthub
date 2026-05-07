import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CopilotPromptBox } from "@/app/components/ui/copilot-prompt-box";

const meta: Meta<typeof CopilotPromptBox> = {
  title: "UI/CopilotPromptBox",
  component: CopilotPromptBox,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof CopilotPromptBox>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-full max-w-lg">
        <CopilotPromptBox
          value={value}
          onChange={setValue}
          onSend={() => { alert(`Send: ${value}`); setValue(""); }}
          onAttach={() => alert("Attach clicked")}
          placeholder="Ask anything..."
        />
      </div>
    );
  },
};

export const WithContent: Story = {
  render: () => {
    const [value, setValue] = useState("How do I improve my FAQ for SEO?");
    return (
      <div className="w-full max-w-lg">
        <CopilotPromptBox
          value={value}
          onChange={setValue}
          onSend={() => { alert(`Send: ${value}`); setValue(""); }}
          onAttach={() => alert("Attach clicked")}
          placeholder="Ask anything..."
        />
      </div>
    );
  },
};

export const NoAttach: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-full max-w-lg">
        <CopilotPromptBox
          value={value}
          onChange={setValue}
          onSend={() => setValue("")}
          placeholder="Describe what you want to improve..."
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <CopilotPromptBox
        value="Generating content..."
        onChange={() => {}}
        onSend={() => {}}
        placeholder="Ask anything..."
        disabled
      />
    </div>
  ),
};

export const ContextualPlaceholder: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-full max-w-lg">
        <CopilotPromptBox
          value={value}
          onChange={setValue}
          onSend={() => setValue("")}
          placeholder="Select an option above, or ask directly…"
        />
      </div>
    );
  },
};
