import type { Meta, StoryObj } from "@storybook/react";
import { ApptCard } from "@/app/components/AppointmentsView";

const meta: Meta<typeof ApptCard> = {
  title: "App/Views/ApptCard",
  component: ApptCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Appointment card used inside WeekCalendar, DayCalendar, and ByDoctorCalendar. " +
          "Renders patient name (bold), optional doctor name (provider-color tinted), service, and time. " +
          "Pass `hideDoctor` for the by-doctor view where the column header already names the doctor.",
      },
    },
  },
  argTypes: {
    compact: { control: "boolean" },
    hideDoctor: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ApptCard>;

const base = {
  id: "demo-1",
  patientName: "Alex Kim",
  patientEmail: "alex@example.com",
  patientPhone: "(512) 555-0101",
  providerId: "p1",
  service: "Teeth Cleaning",
  status: "confirmed" as const,
  date: "2026-04-30",
  startTime: "09:00",
  endTime: "09:45",
  duration: 45,
  location: "Suite 101",
};

const noop = () => {};

export const Default: Story = {
  name: "Default (with doctor)",
  render: () => (
    <div style={{ width: 180 }}>
      <ApptCard appt={base} onClick={noop} />
    </div>
  ),
};

export const WithoutDoctor: Story = {
  name: "Without doctor (by-doctor view)",
  render: () => (
    <div style={{ width: 180 }}>
      <ApptCard appt={base} onClick={noop} hideDoctor />
    </div>
  ),
};

export const Compact: Story = {
  name: "Compact (≤30 min)",
  render: () => (
    <div style={{ width: 180 }}>
      <ApptCard appt={{ ...base, duration: 30 }} onClick={noop} compact />
    </div>
  ),
};

export const LongDuration: Story = {
  name: "Long duration (90 min)",
  render: () => (
    <div style={{ width: 180 }}>
      <ApptCard appt={{ ...base, duration: 90, service: "Root Canal", status: "in_progress" }} onClick={noop} />
    </div>
  ),
};

export const EachProvider: Story = {
  name: "Each provider — color tinting",
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 180 }}>
      {(["p1", "p2", "p3", "p4"] as const).map((pid) => (
        <ApptCard key={pid} appt={{ ...base, providerId: pid }} onClick={noop} />
      ))}
    </div>
  ),
};
