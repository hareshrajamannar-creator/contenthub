export interface FAQPrerequisiteCheckResult {
  hasBrandKit: boolean;
  hasLocation: boolean;
  brandKitName: string | null;
  locationName: string | null;
}

export function useFAQPrerequisiteCheck(): FAQPrerequisiteCheckResult {
  return {
    hasBrandKit: true,
    hasLocation: true,
    brandKitName: 'LushGreen Brand Kit',
    locationName: '10 locations',
  };
}
