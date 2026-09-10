import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { OrganizationRepository } from "db";
import { logger } from "shared/config/logger";

const AddMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().max(255).optional(),
  role: z.enum(["owner", "admin", "member"]).default("member"),
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

    const members = await OrganizationRepository.getOrganizationMembers(id);

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error) {
    logger.error({ error }, "Error fetching organization members");
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Organization ID is required" }, { status: 400 });
    }

    const org = await OrganizationRepository.getOrganizationById(id);
    if (!org) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = AddMemberSchema.safeParse(body);

    if (!validated.success) {
      const firstError = validated.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    // Check if email is already in the organization
    const existingMembers = await OrganizationRepository.getOrganizationMembers(id);
    const alreadyExists = existingMembers.some(
      (m) => m.email.toLowerCase() === validated.data.email.toLowerCase().trim()
    );

    if (alreadyExists) {
      return NextResponse.json(
        { success: false, error: "A member with this email is already part of the organization." },
        { status: 409 }
      );
    }

    const memberId = `mem_${uuidv4().replace(/-/g, "").substring(0, 16)}`;
    const newMember = await OrganizationRepository.addMember({
      id: memberId,
      orgId: id,
      email: validated.data.email,
      name: validated.data.name,
      role: validated.data.role,
    });

    return NextResponse.json({
      success: true,
      member: newMember,
      message: `Invitation sent to ${validated.data.email}`,
    });
  } catch (error) {
    logger.error({ error }, "Error adding organization member");
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to add member" },
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
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!id || !memberId) {
      return NextResponse.json(
        { success: false, error: "Both Organization ID and memberId query parameter are required" },
        { status: 400 }
      );
    }

    const removed = await OrganizationRepository.removeMember(id, memberId);

    return NextResponse.json({
      success: true,
      member: removed,
      message: "Member removed from organization successfully.",
    });
  } catch (error) {
    logger.error({ error }, "Error removing member");
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to remove member" },
      { status: 400 }
    );
  }
}
