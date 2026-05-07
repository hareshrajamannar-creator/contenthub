import type { Meta, StoryObj } from "@storybook/react";
import { MobileWebAppGate } from "@/app/components/layout/MobileWebAppGate";
import {
  DEFAULT_ANDROID_PLAY_URL,
  DEFAULT_IOS_APP_STORE_URL,
  DEFAULT_MOBILE_APP_STORE_MIMIC_URL,
  type MobileAppStoreLinks,
} from "@/config/mobileWebGate";

const demoLinks: MobileAppStoreLinks = {
  ios: "https://apps.apple.com/",
  android: "https://play.google.com/store",
  deepLink: "birdeye://",
};

const meta: Meta<typeof MobileWebAppGate> = {
  title: "UI/MobileWebAppGate",
  component: MobileWebAppGate,
  tags: ["autodocs"],
  args: {
    enableOpenCountdownRedirect: false,
  },
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        component:
          "Default **`previewMode: ios`**: iPhone-focused copy, **Opening BirdAI in 2 seconds…** countdown, then `location.assign` to the deep link or App Store (`enableOpenCountdownRedirect` is **false** in Storybook args so the canvas does not navigate away). Use **`previewMode: all`** for the two-store manual link layout. `VITE_MOBILE_WEB_GATE=0` disables the gate. QA bypass: `?allow_mobile_web=1`.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MobileWebAppGate>;

export const WithStoreAndOpenApp: Story = {
  args: {
    links: demoLinks,
    previewMode: "all",
  },
};

/** Same URL on both slots — single **Take me to the store** link (not the real default pairing). */
export const UnifiedMimicListing: Story = {
  args: {
    links: {
      ios: DEFAULT_MOBILE_APP_STORE_MIMIC_URL,
      android: DEFAULT_MOBILE_APP_STORE_MIMIC_URL,
      deepLink: "",
    },
    previewMode: "all",
  },
};

/** Real default pairing when env vars are unset (two small store links). */
export const DefaultIosAndPlay: Story = {
  args: {
    links: {
      ios: DEFAULT_IOS_APP_STORE_URL,
      android: DEFAULT_ANDROID_PLAY_URL,
      deepLink: "",
    },
    previewMode: "all",
  },
};

/** iPhone preview: countdown + App Store escape hatch (Storybook disables auto-redirect). */
export const IosIPhoneDefault: Story = {
  args: {
    links: {
      ios: DEFAULT_IOS_APP_STORE_URL,
      android: "",
      deepLink: "birdeye://",
    },
  },
};

export const AppStoreOnly: Story = {
  args: {
    links: { ios: demoLinks.ios, android: "", deepLink: "" },
    previewMode: "all",
  },
};

export const NoConfiguredLinks: Story = {
  args: {
    links: { ios: "", android: "", deepLink: "" },
    previewMode: "all",
  },
};

export const DeepLinkOnly: Story = {
  args: {
    links: { ios: "", android: "", deepLink: "birdeye://referrals" },
    previewMode: "all",
  },
};
