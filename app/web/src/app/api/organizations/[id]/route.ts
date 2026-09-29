import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OrganizationRepository, ProjectRepository, BackupRepository } from "db";
import { logger } from "shared/config/logger";
import { authorizeOrg } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

const UpdateOrgSchema = z.object({
  name: z.string().min(1, "Organization name cannot be empty").max(255).optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Organization ID is required" }, { status: 400 });
    }

    // Authorize: user must be a member of this organization
    const auth = await authorizeOrg(id, "member");
    if (!auth.authorized) {
      return auth.response;
    }

    const org = auth.org;

    // Compute basic usage statistics scoped to this organization
    const allProjects = await ProjectRepository.getAllProjects();
    const orgProjects = allProjects.filter((p) => p.orgId === id);

    let totalStorageBytes = 0;
    try {
      const allBackups = await BackupRepository.listBackups({});
      const orgProjectIds = new Set(orgProjects.map((p) => p.id));
      const orgBackups = allBackups.filter((b) => b.projectId && orgProjectIds.has(b.projectId));
      totalStorageBytes = orgBackups.reduce((sum, b) => sum + (b.fileSize || 0), 0);
    } catch {}

    return NextResponse.json({
      success: true,
      organization: {
        ...org,
        role: auth.role,
        projectsCount: orgProjects.length,
        totalStorageBytes,
      },
    });
  } catch (error) {
    logger.error({ error }, "Error fetching organization");
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Organization ID is required" }, { status: 400 });
    }

    // Authorize: requires admin or owner role
    const auth = await authorizeOrg(id, "admin");
    if (!auth.authorized) {
      return auth.response;
    }

    const org = auth.org;
    const body = await req.json().catch(() => ({}));
    const validated = UpdateOrgSchema.safeParse(body);

    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    // Check slug uniqueness if slug is being changed
    if (validated.data.slug && validated.data.slug !== org.slug) {
      const existingSlugOrg = await OrganizationRepository.getOrganizationBySlug(validated.data.slug);
      if (existingSlugOrg && existingSlugOrg.id !== id) {
        return NextResponse.json(
          { success: false, error: "Organization slug is already taken. Please choose another." },
          { status: 409 }
        );
      }
    }

    const updated = await OrganizationRepository.updateOrganization(id, {
      name: validated.data.name,
      slug: validated.data.slug,
    });

    return NextResponse.json({
      success: true,
      organization: updated,
      message: "Organization settings updated successfully",
    });
  } catch (error) {
    logger.error({ error }, "Error updating organization");
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update organization" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Organization ID is required" }, { status: 400 });
    }

    // Authorize: Only the organization owner can delete the organization
    const auth = await authorizeOrg(id, "owner");
    if (!auth.authorized) {
      return auth.response;
    }

    const deleted = await OrganizationRepository.deleteOrganization(id);

    return NextResponse.json({
      success: true,
      message: `Organization "${deleted.name}" and all associated projects deleted successfully.`,
    });
  } catch (error) {
    logger.error({ error }, "Error deleting organization");
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete organization" },
      { status: 500 }
    );
  }
}
