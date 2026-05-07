import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { ReferralsL2NavPanel, REFERRALS_L2_DEFAULT_ACTIVE_KEY } from "@/app/components/Sidebar";
import { L2_FLAT_NAV_KEY_PREFIX } from "@/app/components/L2NavLayout";
import { ReferralsView, referralsL2KeyToSection } from "@/app/components/ReferralsView";

const meta: Meta = {
  title: "App/Views/ReferralsView",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Referrals product view. Migrated from `UI-web-2.0/src/app/pages/referral/`. " +
          "L2 shell matches the app: Sent / Shared / Leads in the left column, stat cards and table in the main area. " +
          "All data is mocked for prototype use.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const REFERRALS_L2_LEADS_KEY = `${L2_FLAT_NAV_KEY_PREFIX}/leads`;
const REFERRALS_L2_SHARED_KEY = `${L2_FLAT_NAV_KEY_PREFIX}/shared`;

function ReferralsWithL2Shell({ initialL2Key }: { initialL2Key?: string }) {
  const [active, setActive] = useState(initialL2Key ?? REFERRALS_L2_DEFAULT_ACTIVE_KEY);
  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex h-[calc(100vh-2rem)] min-h-[560px] w-full bg-background p-4 gap-0">
        <ReferralsL2NavPanel
          activeItem={active}
          onActiveItemChange={setActive}
          onSendReferralRequest={() => toast.message("Send a referral request (prototype)")}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-tr-xl rounded-br-xl border border-border border-l-0 bg-card">
          <ReferralsView activeSection={referralsL2KeyToSection(active)} />
        </div>
      </div>
    </>
  );
}

export const Default: Story = {
  render: () => <ReferralsWithL2Shell />,
};

export const SentTab: Story = {
  name: "Sent (default L2)",
  render: () => <ReferralsWithL2Shell initialL2Key={REFERRALS_L2_DEFAULT_ACTIVE_KEY} />,
};

export const SharedSection: Story = {
  name: "Shared",
  render: () => <ReferralsWithL2Shell initialL2Key={REFERRALS_L2_SHARED_KEY} />,
};

export const LeadsSection: Story = {
  name: "Leads",
  render: () => <ReferralsWithL2Shell initialL2Key={REFERRALS_L2_LEADS_KEY} />,
};
