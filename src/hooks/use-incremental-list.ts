"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_PAGE = 24;

/** Render list items in batches as user scrolls near the bottom. */
export function useIncrementalList<T>(items: T[], pageSize = DEFAULT_PAGE) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((n) => Math.min(n + pageSize, items.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length, visibleCount, pageSize]);

  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + pageSize, items.length));
  }, [items.length, pageSize]);

  return {
    visible: items.slice(0, visibleCount),
    hasMore: visibleCount < items.length,
    sentinelRef,
    loadMore,
  };
}
