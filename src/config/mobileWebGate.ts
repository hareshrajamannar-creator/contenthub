/** Session flag set when `?allow_mobile_web=1` is used (QA / internal). */
export const MOBILE_WEB_BYPASS_SESSION_KEY = "birdeye_allow_mobile_web";

/** Match `use-mobile.ts`: viewport width strictly below this value is treated as mobile. */
export const MOBILE_GATE_VIEWPORT_PX = 768;

/**
 * When unset or any value other than `"0"` / `"false"`, the mobile web gate may apply.
 * Set `VITE_MOBILE_WEB_GATE=0` in `.env` to disable for staging or local dev.
 */
export function readMobileWebGateEnabledFromEnv(): boolean {
  const v = import.meta.env.VITE_MOBILE_WEB_GATE;
  if (v === "0" || v === "false") return false;
  return true;
}

export type MobileAppStoreLinks = {
  ios: string;
  android: string;
  deepLink: string;
};

/** Used when `VITE_IOS_APP_STORE_URL` is unset. */
export const DEFAULT_IOS_APP_STORE_URL =
  "https://apps.apple.com/us/app/birdeye/id1000915473";

/** Used when `VITE_ANDROID_PLAY_URL` is unset. */
export const DEFAULT_ANDROID_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.birdeye.blip&hl=en_IN";

/** @deprecated Use `DEFAULT_IOS_APP_STORE_URL` — kept for stories that force one URL on both slots. */
export const DEFAULT_MOBILE_APP_STORE_MIMIC_URL = DEFAULT_IOS_APP_STORE_URL;

/** UI + auto-open behaviour: `ios` = iPhone / App Store preview (default); `all` = both stores, no auto-redirect. */
export type MobileWebGatePreviewMode = "ios" | "all";

export const MOBILE_WEB_GATE_DEFAULT_PREVIEW_MODE: MobileWebGatePreviewMode = "ios";

export function readMobileAppStoreLinksFromEnv(): MobileAppStoreLinks {
  const fromEnvIos = String(import.meta.env.VITE_IOS_APP_STORE_URL ?? "").trim();
  const fromEnvAndroid = String(import.meta.env.VITE_ANDROID_PLAY_URL ?? "").trim();
  const deepLink = String(import.meta.env.VITE_APP_DEEP_LINK ?? "").trim();
  return {
    ios: fromEnvIos || DEFAULT_IOS_APP_STORE_URL,
    android: fromEnvAndroid || DEFAULT_ANDROID_PLAY_URL,
    deepLink,
  };
}
