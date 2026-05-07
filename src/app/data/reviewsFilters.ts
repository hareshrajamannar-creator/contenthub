import type { FilterItem } from "@/app/components/FilterPanel.v1";
import { cloneFilterItems } from "@/app/data/filterUtils";

export const reviewsFilterItems: FilterItem[] = [
  {
    id: "review_source",
    label: "Source",
    options: ["All sources", "Google", "Yelp", "Facebook", "TripAdvisor"],
  },
  {
    id: "review_rating",
    label: "Rating",
    options: ["All ratings", "5 stars", "4 stars", "3 stars", "2 stars", "1 star"],
  },
  {
    id: "review_status",
    label: "Reply status",
    options: ["All statuses", "Replied", "Not replied", "Draft"],
  },
  {
    id: "review_date",
    label: "Date range",
    options: [
      "All time",
      "Today",
      "Last 7 days",
      "Last 30 days",
      "Last 90 days",
      "Last year",
    ],
  },
  {
    id: "review_location",
    label: "Location",
    options: ["All locations", "Georgia", "New York", "California", "Texas", "Florida"],
  },
  {
    id: "review_sentiment",
    label: "Sentiment",
    options: ["All sentiments", "Positive", "Neutral", "Negative"],
  },
  {
    id: "review_keyword",
    label: "Keywords",
    options: ["All keywords", "Ambience", "Food", "Service", "Price", "Cleanliness"],
  },
  {
    id: "review_featured",
    label: "Featured",
    options: ["All", "Featured only", "Not featured"],
  },
  {
    id: "review_photos",
    label: "Has photos",
    options: ["All", "With photos", "Without photos"],
  },
  {
    id: "review_employee",
    label: "Employee",
    options: ["All employees", "Unassigned", "Sampada", "John", "Maria"],
  },
];

export function createInitialReviewsFilters(): FilterItem[] {
  return cloneFilterItems(reviewsFilterItems);
}
