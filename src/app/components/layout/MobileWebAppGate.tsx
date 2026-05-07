import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BirdeyeLogoMark } from "@/app/components/brand/BirdeyeLogoMark";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import {
  type MobileAppStoreLinks,
  type MobileWebGatePreviewMode,
  MOBILE_WEB_GATE_DEFAULT_PREVIEW_MODE,
  readMobileAppStoreLinksFromEnv,
} from "@/config/mobileWebGate";

export type MobileWebAppGateProps = {
  className?: string;
  /** Overrides env-based links (e.g. Storybook). */
  links?: MobileAppStoreLinks;
  /**
   * `ios` (default): iPhone / App Store copy, 2s countdown, then opens deep link or App Store.
   * `all`: prior multi-store messaging and manual links only (no auto-redirect).
   */
  previewMode?: MobileWebGatePreviewMode;
  /**
   * When false, the 2s countdown still runs for UI preview but navigation is skipped (e.g. Storybook).
   * Defaults to true in production.
   */
  enableOpenCountdownRedirect?: boolean;
};

function StoreCtaLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button
      variant="link"
      className="h-auto min-h-0 px-0 py-1 text-sm font-normal text-primary underline-offset-4 hover:underline"
      asChild
    >
      <a href={href} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    </Button>
  );
}

export function MobileWebAppGate({
  className,
  links: linksProp,
  previewMode = MOBILE_WEB_GATE_DEFAULT_PREVIEW_MODE,
  enableOpenCountdownRedirect = true,
}: MobileWebAppGateProps) {
  const links = linksProp ?? readMobileAppStoreLinksFromEnv();
  const isIosPreview = previewMode === "ios";

  const hasDeepLink = Boolean(links.deepLink);
  const hasIos = Boolean(links.ios);
  const hasAndroid = Boolean(links.android);
  const unifiedStoreUrl =
    hasIos && hasAndroid && links.ios === links.android ? links.ios : "";
  const splitStores = hasIos && hasAndroid && !unifiedStoreUrl;
  const hasAnyStore = hasIos || hasAndroid;

  const [secondsLeft, setSecondsLeft] = useState(() => (isIosPreview ? 2 : 0));

  useEffect(() => {
    if (!isIosPreview || secondsLeft <= 0) return;
    const id = window.setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [isIosPreview, secondsLeft]);

  useEffect(() => {
    if (!isIosPreview || !enableOpenCountdownRedirect || secondsLeft > 0) return;
    const target = links.deepLink || links.ios;
    if (!target) return;
    window.location.assign(target);
  }, [isIosPreview, enableOpenCountdownRedirect, secondsLeft, links.deepLink, links.ios]);

  let redirectMessage: string;
  if (isIosPreview) {
    redirectMessage =
      "You’re on an iPhone. BirdAI runs in the native app — we’ll try to open it for you, or send you to the App Store.";
  } else if (unifiedStoreUrl) {
    redirectMessage =
      "Redirecting you to download BirdAI from the App Store or Google Play on this device.";
  } else if (splitStores) {
    redirectMessage =
      "Redirecting you to the Apple App Store or Google Play to download BirdAI.";
  } else if (hasIos && !hasAndroid) {
    redirectMessage = "Redirecting you to the Apple App Store to download BirdAI.";
  } else if (hasAndroid && !hasIos) {
    redirectMessage = "Redirecting you to Google Play to download BirdAI.";
  } else if (!hasAnyStore && !hasDeepLink) {
    redirectMessage = "Download BirdAI from the App Store or Google Play on this device.";
  } else {
    redirectMessage =
      "Open BirdAI in the app. If it is not installed, use your device's store to download BirdAI.";
  }

  const countdownLine =
    !isIosPreview ? null : secondsLeft >= 2 ? (
      "Opening BirdAI in 2 seconds…"
    ) : secondsLeft === 1 ? (
      "Opening BirdAI in 1 second…"
    ) : (
      "Opening…"
    );

  return (
    <div
      className={cn(
        "flex min-h-[100dvh] w-full flex-col items-center justify-center bg-background px-6 pb-8 pt-[max(2rem,env(safe-area-inset-top))] text-foreground",
        className,
      )}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <BirdeyeLogoMark sizePxHeight={48} aria-hidden />

        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-semibold tracking-tight">
            {isIosPreview ? "BirdAI on iPhone" : "Use the BirdAI app"}
          </h1>
          <p className="text-sm text-muted-foreground">{redirectMessage}</p>
          {countdownLine ? (
            <p className="text-sm font-medium text-foreground" aria-live="polite">
              {countdownLine}
            </p>
          ) : null}
        </div>

        {isIosPreview && (hasIos || hasDeepLink) ? (
          <div className="flex flex-col items-center gap-2 pt-2">
            {hasIos ? (
              <StoreCtaLink href={links.ios}>Take me to the App Store</StoreCtaLink>
            ) : null}
            {hasDeepLink ? (
              <Button
                variant="link"
                className="h-auto min-h-0 px-0 py-1 text-sm font-normal text-primary underline-offset-4 hover:underline"
                asChild
              >
                <a href={links.deepLink}>Open BirdAI now</a>
              </Button>
            ) : null}
          </div>
        ) : null}

        {!isIosPreview && (hasAnyStore || hasDeepLink) ? (
          <div className="flex flex-col items-center gap-2 pt-2">
            {unifiedStoreUrl ? (
              <StoreCtaLink href={unifiedStoreUrl}>Take me to the store</StoreCtaLink>
            ) : null}
            {splitStores && links.ios ? (
              <StoreCtaLink href={links.ios}>Take me to the App Store</StoreCtaLink>
            ) : null}
            {splitStores && links.android ? (
              <StoreCtaLink href={links.android}>Take me to Google Play</StoreCtaLink>
            ) : null}
            {!unifiedStoreUrl && !splitStores && hasIos ? (
              <StoreCtaLink href={links.ios}>Take me to the App Store</StoreCtaLink>
            ) : null}
            {!unifiedStoreUrl && !splitStores && !hasIos && hasAndroid ? (
              <StoreCtaLink href={links.android}>Take me to Google Play</StoreCtaLink>
            ) : null}
            {hasDeepLink ? (
              <Button
                variant="link"
                className="h-auto min-h-0 px-0 py-1 text-sm font-normal text-primary underline-offset-4 hover:underline"
                asChild
              >
                <a href={links.deepLink}>Open BirdAI</a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
