import { NextResponse } from "next/server";
import { getCurrentUser, CurrentUser } from "@/lib/current-user";
import {
  OrganizationRepository,
  ProjectRepository,
  BackupRepository,
  BackupFileRepository,
  RestoreRepository,
  ScheduleRepository,
} from "db";
import { logger } from "shared/config/logger";

export type OrgRole = "owner" | "admin" | "member";

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

export function hasMinRole(userRole: OrgRole, minRole: OrgRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 1);
}

export type AuthSuccess<T> = {
  authorized: true;
  user: CurrentUser;
  role: OrgRole;
} & T;

export type AuthFailure = {
  authorized: false;
  response: NextResponse;
};

export type AuthCheckResult<T> = AuthSuccess<T> | AuthFailure;

/**
 * Resolves the role a user holds within a specific organization.
 * Checks both organization creator (userId) and team memberships.
 */
export async function getUserOrgRole(
  userId: string,
  userEmail: string,
  orgId: string
): Promise<{ role: OrgRole; org: any } | null> {
  try {
    const org = await OrganizationRepository.getOrganizationById(orgId);
    if (!org) {
      return null;
    }

    // Direct creator/owner check
    if (org.userId === userId) {
      return { role: "owner", org };
    }

    // Team membership check
    const members = await OrganizationRepository.getOrganizationMembers(orgId);
    const normalizedEmail = userEmail.toLowerCase().trim();
    const member = members.find(
      (m) =>
        m.userId === userId ||
        (m.email && m.email.toLowerCase().trim() === normalizedEmail)
    );

    if (member) {
      const role = (member.role?.toLowerCase() as OrgRole) || "member";
      return { role, org };
    }

    return null;
  } catch (err) {
    logger.error({ userId, orgId, error: err }, "Failed to resolve user organization role");
    return null;
  }
}

/**
 * Ensures the request is authenticated with a valid session user.
 */
export async function requireAuth(): Promise<
  | { authorized: true; user: CurrentUser }
  | { authorized: false; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { authorized: true, user };
}

/**
 * Authorizes access to an organization with a minimum role requirement.
 */
export async function authorizeOrg(
  orgId: string,
  minRole: OrgRole = "member"
): Promise<AuthCheckResult<{ org: any }>> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth;

  const membership = await getUserOrgRole(auth.user.id, auth.user.email, orgId);
  if (!membership) {
    // Check if org actually exists to distinguish between 404 and 403
    const org = await OrganizationRepository.getOrganizationById(orgId);
    if (!org) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: "Organization not found" },
          { status: 404 }
        ),
      };
    }

    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Forbidden: You are not a member of this organization" },
        { status: 403 }
      ),
    };
  }

  if (!hasMinRole(membership.role, minRole)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Forbidden: Requires "${minRole}" role or higher (current role: "${membership.role}")`,
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: auth.user,
    role: membership.role,
    org: membership.org,
  };
}

/**
 * Authorizes access to a project by checking the caller's membership in the project's organization.
 */
export async function authorizeProject(
  projectId: string,
  minRole: OrgRole = "member"
): Promise<AuthCheckResult<{ project: any; org: any }>> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth;

  const project = await ProjectRepository.getProjectById(projectId);
  if (!project) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      ),
    };
  }

  if (!project.orgId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Project is not attached to a valid organization" },
        { status: 400 }
      ),
    };
  }

  const orgAuth = await authorizeOrg(project.orgId, minRole);
  if (!orgAuth.authorized) {
    return orgAuth;
  }

  return {
    authorized: true,
    user: auth.user,
    role: orgAuth.role,
    project,
    org: orgAuth.org,
  };
}

/**
 * Authorizes access to a backup job by looking up its associated project.
 */
export async function authorizeBackupJob(
  jobId: string,
  minRole: OrgRole = "member"
): Promise<AuthCheckResult<{ job: any; project: any; org: any }>> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth;

  const job = await BackupRepository.getJobById(jobId);
  if (!job) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Backup job not found" },
        { status: 404 }
      ),
    };
  }

  if (!job.projectId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Backup job is not associated with a project" },
        { status: 400 }
      ),
    };
  }

  const projectAuth = await authorizeProject(job.projectId, minRole);
  if (!projectAuth.authorized) {
    return projectAuth;
  }

  return {
    authorized: true,
    user: auth.user,
    role: projectAuth.role,
    job,
    project: projectAuth.project,
    org: projectAuth.org,
  };
}

/**
 * Authorizes access to a backup file record.
 */
export async function authorizeBackupFile(
  fileId: string,
  minRole: OrgRole = "member"
): Promise<AuthCheckResult<{ file: any; job?: any; project: any; org: any }>> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth;

  let file = await BackupFileRepository.getBackupFileById(fileId);
  if (!file) {
    file = await BackupFileRepository.getBackupFileByJobId(fileId);
  }

  if (!file) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Backup file record not found" },
        { status: 404 }
      ),
    };
  }

  // File might have projectId directly or via its backup job
  let projectId = (file as any).projectId;
  let job = null;

  if (!projectId && file.backupJobId) {
    job = await BackupRepository.getJobById(file.backupJobId);
    if (job) {
      projectId = job.projectId;
    }
  }

  if (!projectId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Backup file is not associated with an accessible project" },
        { status: 400 }
      ),
    };
  }

  const projectAuth = await authorizeProject(projectId, minRole);
  if (!projectAuth.authorized) {
    return projectAuth;
  }

  return {
    authorized: true,
    user: auth.user,
    role: projectAuth.role,
    file,
    job,
    project: projectAuth.project,
    org: projectAuth.org,
  };
}

/**
 * Authorizes access to a restore job.
 */
export async function authorizeRestoreJob(
  jobId: string,
  minRole: OrgRole = "member"
): Promise<AuthCheckResult<{ restoreJob: any; project: any; org: any }>> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth;

  const restoreJob = await RestoreRepository.getJobById(jobId);
  if (!restoreJob) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Restore job not found" },
        { status: 404 }
      ),
    };
  }

  if (!restoreJob.backupFileId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Restore job has no associated backup file" },
        { status: 400 }
      ),
    };
  }

  const fileAuth = await authorizeBackupFile(restoreJob.backupFileId, minRole);
  if (!fileAuth.authorized) {
    return fileAuth;
  }

  return {
    authorized: true,
    user: auth.user,
    role: fileAuth.role,
    restoreJob,
    project: fileAuth.project,
    org: fileAuth.org,
  };
}

/**
 * Authorizes access to a backup schedule.
 */
export async function authorizeSchedule(
  scheduleId: string,
  minRole: OrgRole = "member"
): Promise<AuthCheckResult<{ schedule: any; project: any; org: any }>> {
  const auth = await requireAuth();
  if (!auth.authorized) return auth;

  const schedule = await ScheduleRepository.getScheduleById(scheduleId);
  if (!schedule) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Schedule not found" },
        { status: 404 }
      ),
    };
  }

  const projectAuth = await authorizeProject(schedule.projectId, minRole);
  if (!projectAuth.authorized) {
    return projectAuth;
  }

  return {
    authorized: true,
    user: auth.user,
    role: projectAuth.role,
    schedule,
    project: projectAuth.project,
    org: projectAuth.org,
  };
}

/**
 * Fetches all project IDs accessible by the current authenticated user across all their organizations.
 */
export async function getUserAuthorizedProjectIds(userId: string): Promise<{
  orgIds: string[];
  projectIds: string[];
}> {
  try {
    const orgs = await OrganizationRepository.getOrganizationsByUser(userId);
    // Also include orgs where user is a team member
    const userOrgs = await OrganizationRepository.getOrganizationMembers(userId).catch(() => []);
    
    // We already have a battle-tested helper: UserRepository.getUserOrganizations(userId)
    const { UserRepository } = await import("db");
    const memberships = await UserRepository.getUserOrganizations(userId);
    const orgIds = Array.from(new Set(memberships.map((m) => m.id)));

    if (orgIds.length === 0) {
      return { orgIds: [], projectIds: [] };
    }

    const projects = await ProjectRepository.getProjectsByOrgIds(orgIds);
    const projectIds = projects.map((p) => p.id);

    return { orgIds, projectIds };
  } catch (err) {
    logger.error({ userId, error: err }, "Error fetching authorized project IDs");
    return { orgIds: [], projectIds: [] };
  }
}
