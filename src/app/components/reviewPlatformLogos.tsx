import type { ReactNode } from "react";
import svgPaths from "../../imports/svg-k7qrt1366a";

/** Site keys used by review mocks and list/detail UIs. */
export type ReviewPlatformSite = "yelp" | "google" | "facebook" | "tripadvisor";

const RING_PAD_PX = 5;

/** Inner square side after `RING_PAD_PX` padding on each edge of the outer `size`. */
function innerDiameter(outer: number): number {
  return Math.max(6, outer - RING_PAD_PX * 2);
}

/**
 * Shared chrome for third‑party marks: token border/fill, fixed padding, round ring.
 */
function PlatformLogoRing({ size, children }: { size: number; children: ReactNode }) {
  return (
    <div
      className="box-border flex shrink-0 items-center justify-center rounded-full border border-border bg-background p-[5px] dark:bg-muted/40"
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}

/** Yelp burst — aspect from viewBox 22.88 × 27.44. */
export function YelpLogo({ size = 40 }: { size?: number }) {
  const inner = innerDiameter(size);
  const w = inner * (22.8814 / 27.4352);
  const h = inner;
  return (
    <PlatformLogoRing size={size}>
      <svg width={w} height={h} viewBox="0 0 22.8814 27.4352" fill="none" aria-hidden>
        <path d={svgPaths.p53b0d00} fill="#FF1A1A" />
        <path d={svgPaths.pf0e0dc0} fill="#FF1A1A" />
        <path d={svgPaths.p27030500} fill="#FF1A1A" />
        <path d={svgPaths.p3643f600} fill="#FF1A1A" />
        <path d={svgPaths.p5cc3100} fill="#FF1A1A" />
      </svg>
    </PlatformLogoRing>
  );
}

/** Google “G” on white disc (stroke reads on light; token border in app chrome). */
export function GoogleLogo({ size = 40 }: { size?: number }) {
  const inner = innerDiameter(size);
  return (
    <PlatformLogoRing size={size}>
      <svg
        width={inner}
        height={inner}
        viewBox="0 0 40 40"
        fill="none"
        className="text-border"
        aria-hidden
      >
        <circle cx="20" cy="20" fill="white" r="19.5833" stroke="currentColor" strokeWidth="0.833333" />
        <path d={svgPaths.p27765500} fill="#4285F4" />
        <path d={svgPaths.p266b3f00} fill="#34A853" />
        <path d={svgPaths.p39b489f0} fill="#FBBC05" />
        <path d={svgPaths.p16fc1f80} fill="#EB4335" />
      </svg>
    </PlatformLogoRing>
  );
}

/** Facebook brand mark (vector path — do not substitute a text “f”). */
export function FacebookLogo({ size = 40 }: { size?: number }) {
  const inner = innerDiameter(size);
  return (
    <PlatformLogoRing size={size}>
      <svg width={inner} height={inner} viewBox="0 0 24 24" className="shrink-0" aria-hidden>
        <path
          fill="#0866FF"
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </svg>
    </PlatformLogoRing>
  );
}

/** TripAdvisor-style owl (simplified). */
export function TripAdvisorLogo({ size = 40 }: { size?: number }) {
  const inner = innerDiameter(size);
  return (
    <PlatformLogoRing size={size}>
      <svg width={inner} height={inner} viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="15" fill="#00AF87" />
        <circle cx="11.5" cy="14" r="3.25" fill="white" />
        <circle cx="20.5" cy="14" r="3.25" fill="white" />
        <circle cx="11.5" cy="14" r="1.35" fill="#1a1a1a" />
        <circle cx="20.5" cy="14" r="1.35" fill="#1a1a1a" />
        <path
          d="M10 22c2.2 2.8 4.8 3.8 6 3.8s3.8-1 6-3.8"
          stroke="#FFCC00"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </PlatformLogoRing>
  );
}

export function ReviewSiteLogo({ site, size = 40 }: { site: ReviewPlatformSite; size?: number }) {
  switch (site) {
    case "yelp":
      return <YelpLogo size={size} />;
    case "google":
      return <GoogleLogo size={size} />;
    case "facebook":
      return <FacebookLogo size={size} />;
    case "tripadvisor":
      return <TripAdvisorLogo size={size} />;
  }
}
