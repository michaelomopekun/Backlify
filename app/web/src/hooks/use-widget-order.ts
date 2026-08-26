"use client";

import { useState, useEffect, useCallback } from "react";

const DEFAULT_ORDER = ["top-panel", "telemetry-panel"];

/**
 * Persists the widget order for the project overview dashboard.
 * Reads from localStorage on mount, writes back on every reorder.
 *
 * @param projectId - Used to namespace the localStorage key per project
 */
export function useWidgetOrder(projectId: string) {
  const key = `backlify_widget_order_${projectId}`;

  // Start with default order — localStorage is read client-side in useEffect
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        // Validate it's an array of strings matching known widget IDs
        if (
          Array.isArray(parsed) &&
          parsed.every((id) => DEFAULT_ORDER.includes(id as string)) &&
          parsed.length === DEFAULT_ORDER.length
        ) {
          setOrder(parsed as string[]);
        }
      }
    } catch {
      // Corrupted storage — fall back to default
    }
  }, [key]);

  const updateOrder = useCallback(
    (newOrder: string[]) => {
      setOrder(newOrder);
      try {
        localStorage.setItem(key, JSON.stringify(newOrder));
      } catch {
        // Storage quota exceeded or private browsing — silently ignore
      }
    },
    [key]
  );

  return { order, updateOrder };
}
