/**
 * socialPlatforms — brand logo SVGs and metadata for each social content type.
 *
 * Lucide does not include brand logos, so inline SVG components are used here.
 * These are the only brand-logo exceptions to the "Lucide icons only" rule.
 */

import React from 'react';

// ── Brand logo components ─────────────────────────────────────────────────────

export function FacebookLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="24" height="24" rx="5" fill="#1877F2" />
      <path
        d="M13.25 7.25H15V4.5H13C11.07 4.5 9.5 6.07 9.5 8V9.5H7.5V12.5H9.5V20H12.5V12.5H14.75L15.25 9.5H12.5V8C12.5 7.59 12.84 7.25 13.25 7.25Z"
        fill="white"
      />
    </svg>
  );
}

export function InstagramLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="40%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#8134AF" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <rect x="7" y="7" width="10" height="10" rx="3" stroke="white" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="1.6" />
      <circle cx="16.5" cy="7.5" r="0.8" fill="white" />
    </svg>
  );
}

export function LinkedInLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <path
        d="M7 10H9.5V17H7V10ZM8.25 9C7.56 9 7 8.44 7 7.75C7 7.06 7.56 6.5 8.25 6.5C8.94 6.5 9.5 7.06 9.5 7.75C9.5 8.44 8.94 9 8.25 9ZM11 10H13.4V11.1H13.43C13.77 10.48 14.57 9.83 15.77 9.83C18.18 9.83 18.63 11.37 18.63 13.41V17H16.13V13.91C16.13 13.02 16.11 11.88 14.88 11.88C13.63 11.88 13.44 12.84 13.44 13.84V17H11V10Z"
        fill="white"
      />
    </svg>
  );
}

export function YouTubeLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="24" height="24" rx="5" fill="#FF0000" />
      <path
        d="M20 8.2C20 8.2 19.78 6.74 19.16 6.12C18.38 5.29 17.5 5.29 17.1 5.24C14.72 5.07 11 5.07 11 5.07C11 5.07 7.28 5.07 4.9 5.24C4.5 5.29 3.62 5.29 2.84 6.12C2.22 6.74 2 8.2 2 8.2C2 8.2 1.78 9.9 1.78 11.6V13.19C1.78 14.88 2 16.58 2 16.58C2 16.58 2.22 18.04 2.84 18.66C3.62 19.49 4.66 19.46 5.12 19.55C6.8 19.71 12 19.75 12 19.75C12 19.75 15.72 19.75 18.1 19.57C18.5 19.51 19.38 19.49 20.16 18.66C20.78 18.04 21 16.58 21 16.58C21 16.58 21.22 14.88 21.22 13.19V11.6C21.22 9.9 21 8.2 21 8.2"
        fill="#FF0000"
      />
      <rect width="24" height="24" rx="5" fill="#FF0000" />
      <path d="M10 8.5L16 12L10 15.5V8.5Z" fill="white" />
    </svg>
  );
}

export function TikTokLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="24" height="24" rx="5" fill="#010101" />
      <path
        d="M16.5 4.5H14C14 6.43 12.43 8 10.5 8V10.5C11.42 10.5 12.27 10.22 13 9.74V15.5C13 17.43 11.43 19 9.5 19C7.57 19 6 17.43 6 15.5C6 13.57 7.57 12 9.5 12V9.5C6.19 9.5 3.5 12.19 3.5 15.5C3.5 18.81 6.19 21.5 9.5 21.5C12.81 21.5 15.5 18.81 15.5 15.5V9.82C16.45 10.48 17.59 10.88 18.82 10.88V8.38C17.5 8.38 16.5 6.56 16.5 4.5Z"
        fill="white"
      />
      <path
        d="M16.5 4.5C16.5 6.57 17.92 8.25 19.8 8.38V10.88C18.56 10.88 17.4 10.48 16.5 9.82V15.5C16.5 18.81 13.81 21.5 10.5 21.5C9.14 21.5 7.88 21.05 6.88 20.3C8.03 21.06 9.42 21.5 10.92 21.5C14.23 21.5 16.92 18.81 16.92 15.5V9.84C17.83 10.5 18.96 10.9 20.2 10.9V8.4C19.07 8.35 18.07 7.56 17.56 6.44"
        fill="#EE1D52"
        opacity="0.8"
      />
    </svg>
  );
}

// ── Platform definitions ───────────────────────────────────────────────────────

export interface SocialPlatformDef {
  id: string;
  label: string;
  Logo: React.FC<{ size?: number }>;
}

export const SOCIAL_PLATFORMS: SocialPlatformDef[] = [
  { id: 'facebook-post',  label: 'Facebook post',  Logo: FacebookLogo },
  { id: 'facebook-reel',  label: 'Facebook Reel',  Logo: FacebookLogo },
  { id: 'instagram-post', label: 'Instagram post', Logo: InstagramLogo },
  { id: 'instagram-reel', label: 'Instagram Reel', Logo: InstagramLogo },
  { id: 'linkedin-post',  label: 'LinkedIn post',  Logo: LinkedInLogo },
  { id: 'youtube-shorts', label: 'YouTube Shorts', Logo: YouTubeLogo },
  { id: 'tiktok-video',   label: 'TikTok video',   Logo: TikTokLogo },
];

export const SOCIAL_PLATFORM_LABEL_SET = new Set(SOCIAL_PLATFORMS.map(p => p.label));
export const SOCIAL_PLATFORM_BY_LABEL = new Map(SOCIAL_PLATFORMS.map(p => [p.label, p]));
