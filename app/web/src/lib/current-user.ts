import { ProjectRepository, projects } from "db";
import type { InferSelectModel } from "drizzle-orm";

export type Project = InferSelectModel<typeof projects>;

/**
 * The seam where authentication will land.
 *
 * There is no user concept in the schema yet — `projects` has no owner column —
 * so this returns a fixed placeholder. Every dashboard read goes through here
 * rather than calling `ProjectRepository.getAllProjects()` directly, so adding
 * real ownership later is a change to this file plus one `where` clause, not a
 * sweep across every page.
 *
 * When auth lands: resolve the session here, add `ownerId` to `projects`, and
 * make `listVisibleProjects` filter on it.
 */

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  /** Two-letter fallback for the sidebar avatar. */
  initials: string;
}

const PLACEHOLDER_USER: CurrentUser = {
  id: "user-placeholder",
  name: "galaxia",
  email: "hello@backlify.dev",
  initials: "GA",
};

export async function getCurrentUser(): Promise<CurrentUser> {
  return PLACEHOLDER_USER;
}

/**
 * Projects the current user may see. Today: all of them. The indirection is the
 * point — this is the single place that becomes owner-scoped.
 */
export async function listVisibleProjects(): Promise<Project[]> {
  return ProjectRepository.getAllProjects();
}
