import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { OrganizationRepository, ProjectRepository, UserRepository } from "db";
import { logger } from "shared/config/logger";
import { maskDatabaseUrl } from "shared/config/encryption";
import { validateSafeDatabaseUrl } from "shared/config/security";
import { requireAuth, authorizeOrg } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

const CreateProjectInputSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Name is required").max(255),
  databaseUrl: z.string().url("Invalid database URL format"),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    const body = await req.json().catch(() => ({}));
    const validated = CreateProjectInputSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validated.error },
        { status: 400 }
      );
    }

    const { orgId, name, databaseUrl } = validated.data;

    // Verify user is an owner or admin of this organization
    const orgAuth = await authorizeOrg(orgId, "admin");
    if (!orgAuth.authorized) {
      return orgAuth.response;
    }

    // SSRF Defense: Ensure database URL does not point to internal networks or cloud metadata
    const ssrfCheck = await validateSafeDatabaseUrl(databaseUrl);
    if (!ssrfCheck.safe) {
      return NextResponse.json(
        {
          success: false,
          error: ssrfCheck.error || "Restricted database target. Destinations must be publicly routable.",
        },
        { status: 400 }
      );
    }

    const id = `proj-${uuidv4().substring(0, 12)}`;

    const project = await ProjectRepository.createProject({
      id,
      orgId,
      name,
      databaseUrl,
    });

    return NextResponse.json(
      {
        success: true,
        project: {
          ...project,
          databaseUrl: maskDatabaseUrl(project.databaseUrl),
        },
        message: "Project created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Failed to create project:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return auth.response;

    // Strictly scope projects to organizations the authenticated user belongs to
    const userOrgs = await UserRepository.getUserOrganizations(auth.user.id);
    if (!userOrgs || userOrgs.length === 0) {
      return NextResponse.json({
        success: true,
        projects: [],
      });
    }

    const orgIds = userOrgs.map((o) => o.id);
    const rawProjects = await ProjectRepository.getProjectsByOrgIds(orgIds);

    // Safely mask database URLs before returning to client
    const projects = rawProjects.map((p) => ({
      ...p,
      databaseUrl: maskDatabaseUrl(p.databaseUrl),
    }));

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    logger.error("Failed to fetch projects:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
