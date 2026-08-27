"use client";

import { useEffect, useRef, useState } from "react";

import { isActiveStatus } from "@/lib/status";
import { BackupsTable } from "./backups-table";
import type { BackupRow } from "./backup-row";

/**
 * Keeps the table fresh only while something is actually moving.
 *
 * Server-rendered rows are the initial state, so there's no loading flash and no
 * fetch at all for a page whose jobs have all finished. The interval starts when
 * a row is in flight and clears the moment none are — a completed dashboard left
 * open overnight makes zero requests.
 */

const POLL_MS = 5000;

export function LiveBackupsTable({
  initialRows,
  projectId,
  statusParam,
  showProject = true,
}: {
  initialRows: BackupRow[];
  projectId?: string;
  /**
   * The `status` filter the server used, forwarded so a poll returns the same
   * set. Without it, a "In flight" view would quietly fill with completed rows
   * the moment the jobs finished.
   */
  statusParam?: string;
  showProject?: boolean;
}) {
  const [rows, setRows] = useState(initialRows);

  // Server rows win on navigation/revalidation.
  const initialRef = useRef(initialRows);
  useEffect(() => {
    if (initialRef.current !== initialRows) {
      initialRef.current = initialRows;
      setRows(initialRows);
    }
  }, [initialRows]);

  const hasActive = rows.some((row) => isActiveStatus(row.status));

  useEffect(() => {
    if (!hasActive) return;

    const controller = new AbortController();
    const params = new URLSearchParams({ limit: String(rows.length || 50) });
    if (projectId) params.set("projectId", projectId);
    if (statusParam) params.set("status", statusParam);
    const url = `/api/backups?${params.toString()}`;

    async function refresh() {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (Array.isArray(payload?.backups)) setRows(payload.backups);
      } catch {
        // A dropped poll is not worth surfacing — the next tick retries, and the
        // rows already on screen stay correct as of their last good read.
      }
    }

    const timer = setInterval(refresh, POLL_MS);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [hasActive, projectId, statusParam, rows.length]);

  return (
    <>
      <BackupsTable rows={rows} showProject={showProject} />
      <p aria-live="polite" className="sr-only">
        {hasActive
          ? "Backup in progress. This list updates automatically."
          : "All backups are up to date."}
      </p>
    </>
  );
}
