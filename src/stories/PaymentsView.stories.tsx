import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { PaymentsL2NavPanel, PAYMENTS_L2_DEFAULT_ACTIVE_KEY } from "@/app/components/Sidebar";
import { L2_FLAT_NAV_KEY_PREFIX } from "@/app/components/L2NavLayout";
import {
  PaymentsView,
  paymentsL2KeyToStatusFilter,
} from "@/app/components/PaymentsView";

const meta: Meta = {
  title: "App/Views/PaymentsView",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Payments product view. Summary strip (totals + metrics), and a transaction table. " +
          "L2 matches the app shell: Request a payment plus status scopes (All, Received, …). " +
          "Row click opens a floating medium Sheet (FloatingSheetFrame) for invoice detail. " +
          "All data is mocked for prototype use.",
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const PAYMENTS_L2_RECEIVED_KEY = `${L2_FLAT_NAV_KEY_PREFIX}/received`;

function PaymentsWithL2Shell({ initialL2Key }: { initialL2Key?: string }) {
  const [active, setActive] = useState(initialL2Key ?? PAYMENTS_L2_DEFAULT_ACTIVE_KEY);
  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex h-[calc(100vh-2rem)] min-h-[560px] w-full bg-background p-4">
        <PaymentsL2NavPanel
          activeItem={active}
          onActiveItemChange={setActive}
          onRequestPayment={() => toast.message("Request a payment (prototype)")}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-tr-xl rounded-br-xl border border-border border-l-0 bg-card">
          <PaymentsView statusFilter={paymentsL2KeyToStatusFilter(active)} />
        </div>
      </div>
    </>
  );
}

export const Default: Story = {
  render: () => <PaymentsWithL2Shell />,
};

export const ReceivedFilter: Story = {
  name: "Received (L2)",
  render: () => <PaymentsWithL2Shell initialL2Key={PAYMENTS_L2_RECEIVED_KEY} />,
};
