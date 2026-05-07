"use client";

import { useState } from "react";
import { ReviewsViewList } from "./ReviewsView.v1";
import { ReviewsViewConversation } from "./ReviewsView.v2";

export type ReviewsViewMode = "list" | "conversation";

export function ReviewsView() {
  const [mode, setMode] = useState<ReviewsViewMode>("list");

  return mode === "list"
    ? <ReviewsViewList viewMode={mode} onViewModeChange={setMode} />
    : <ReviewsViewConversation viewMode={mode} onViewModeChange={setMode} />;
}
