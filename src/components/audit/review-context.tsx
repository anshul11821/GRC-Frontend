"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { ReviewOverlay } from "./review-overlay";

interface ReviewContextValue {
  /** Open the review overlay for an audit id. onClose optionally fires after a verdict/close. */
  openReview: (auditId: number) => void;
  closeReview: () => void;
  /** Bumped whenever a verdict is recorded so lists can refetch. */
  version: number;
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [auditId, setAuditId] = useState<number | null>(null);
  const [version, setVersion] = useState(0);

  const openReview = useCallback((id: number) => setAuditId(id), []);
  const closeReview = useCallback(() => setAuditId(null), []);
  const onDecided = useCallback(() => setVersion((v) => v + 1), []);

  return (
    <ReviewContext.Provider value={{ openReview, closeReview, version }}>
      {children}
      {auditId != null && (
        <ReviewOverlay auditId={auditId} onClose={closeReview} onDecided={onDecided} />
      )}
    </ReviewContext.Provider>
  );
}

export function useReview(): ReviewContextValue {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReview must be used within <ReviewProvider>");
  return ctx;
}
