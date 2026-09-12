import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectRepository, UserRepository, projects } from "db";
import type { InferSelectModel } from "drizzle-orm";

export type Project = InferSelectModel<typeof projects>;

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  /** Two-letter fallback for the sidebar avatar. */
  initials: string;
}

/**
 * Returns the currently authenticated user from the session, or null if unauthenticated.
 * Safe for use in public or optional-auth contexts.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    const name = session.user.name || session.user.email?.split("@")[0] || "User";
    const email = session.user.email || "user@backlify.dev";
    const initials =
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U";

    return {
      id: session.user.id || email,
      name,
      email,
      image: session.user.image,
      initials,
    };
  } catch (err) {
    console.error("Error resolving currentUser from session:", err);
    return null;
  }
}

/**
 * Enforces authentication for protected dashboard routes and Server Actions.
 * If no authenticated user is found, immediately redirects to /login.
 */
export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Projects the current user may see, strictly scoped to their active organization memberships.
 */
export async function listVisibleProjects(): Promise<Project[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const userOrgs = await UserRepository.getUserOrganizations(user.id);
    if (!userOrgs || userOrgs.length === 0) {
      return [];
    }

    const orgIds = userOrgs.map((o) => o.id);
    return ProjectRepository.getProjectsByOrgIds(orgIds);
  } catch (err) {
    console.error("Error listing visible projects:", err);
    return [];
  }
}
