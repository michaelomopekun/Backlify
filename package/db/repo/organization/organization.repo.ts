import { db, eq, and } from "../../index";
import { organizations, organizationMembers } from "../../schema/organization";
import { projects } from "../../schema/project";
import { logger } from "shared/config/logger";


export interface CreateOrganizationParams {

  id: string;

  name: string;

  slug: string;

  userId: string;

}


export interface UpdateOrganizationParams {

  name?: string;

  slug?: string;

}


export class OrganizationRepository {

  static async createOrganization(params: CreateOrganizationParams) {

    try {

      logger.info({ orgId: params.id, name: params.name }, "Creating organization");

      const result = await db.insert(organizations).values({

        id: params.id,

        name: params.name,

        slug: params.slug,

        userId: params.userId,

        createdAt: new Date(),

        updatedAt: new Date(),

      }).returning();

      logger.info({ orgId: params.id }, "Organization created successfully");

      return result[0];

    } catch (error) {

      logger.error({ orgId: params.id, error }, "Failed to create organization");

      throw error;

    }

  }


  static async getOrganizationsByUser(userId: string) {

    try {

      logger.info({ userId }, "Fetching organizations by user");

      const result = await db

        .select()

        .from(organizations)

        .where(eq(organizations.userId, userId));

      return result;

    } catch (error) {

      logger.error({ userId, error }, "Failed to fetch organizations");

      throw error;

    }

  }


  static async getOrganizationBySlug(slug: string) {

    try {

      logger.info({ slug }, "Fetching organization by slug");

      const result = await db

        .select()

        .from(organizations)

        .where(eq(organizations.slug, slug));

      return result[0] ?? null;

    } catch (error) {

      logger.error({ slug, error }, "Failed to fetch organization by slug");

      throw error;

    }

  }


  static async getOrganizationById(id: string) {

    try {

      const result = await db

        .select()

        .from(organizations)

        .where(eq(organizations.id, id));

      return result[0] ?? null;

    } catch (error) {

      logger.error({ orgId: id, error }, "Failed to fetch organization by ID");

      throw error;

    }

  }


  static async updateOrganization(id: string, params: UpdateOrganizationParams) {

    try {

      logger.info({ orgId: id }, "Updating organization");

      const result = await db

        .update(organizations)

        .set({ ...params, updatedAt: new Date() })

        .where(eq(organizations.id, id))

        .returning();

      return result[0];

    } catch (error) {

      logger.error({ orgId: id, error }, "Failed to update organization");

      throw error;

    }

  }


  static async deleteOrganization(id: string) {
    try {
      logger.info({ orgId: id }, "Deleting organization and associated resources");

      // Clean up members
      await db.delete(organizationMembers).where(eq(organizationMembers.orgId, id));

      // Clean up projects belonging to this org
      await db.delete(projects).where(eq(projects.orgId, id));

      const result = await db
        .delete(organizations)
        .where(eq(organizations.id, id))
        .returning();

      return result[0];
    } catch (error) {
      logger.error({ orgId: id, error }, "Failed to delete organization");
      throw error;
    }
  }

  // ─── Team Members ──────────────────────────────────────────────────────────

  static async getOrganizationMembers(orgId: string) {
    try {
      const members = await db
        .select()
        .from(organizationMembers)
        .where(eq(organizationMembers.orgId, orgId));

      return members;
    } catch (error) {
      logger.error({ orgId, error }, "Failed to fetch organization members");
      throw error;
    }
  }

  static async addMember(params: {
    id: string;
    orgId: string;
    email: string;
    name?: string;
    role?: string;
    userId?: string;
  }) {
    try {
      logger.info({ orgId: params.orgId, email: params.email }, "Adding organization member");

      const result = await db
        .insert(organizationMembers)
        .values({
          id: params.id,
          orgId: params.orgId,
          email: params.email.toLowerCase().trim(),
          name: params.name || params.email.split("@")[0],
          role: params.role || "member",
          userId: params.userId || null,
          invitedAt: new Date(),
          joinedAt: params.userId ? new Date() : null,
        })
        .returning();

      return result[0];
    } catch (error) {
      logger.error({ orgId: params.orgId, email: params.email, error }, "Failed to add member");
      throw error;
    }
  }

  static async updateMemberRole(orgId: string, memberId: string, role: string) {
    try {
      logger.info({ orgId, memberId, role }, "Updating member role");

      const result = await db
        .update(organizationMembers)
        .set({ role })
        .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.orgId, orgId)))
        .returning();

      return result[0];
    } catch (error) {
      logger.error({ orgId, memberId, error }, "Failed to update member role");
      throw error;
    }
  }

  static async removeMember(orgId: string, memberId: string) {
    try {
      logger.info({ orgId, memberId }, "Removing organization member");

      const member = await db
        .select()
        .from(organizationMembers)
        .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.orgId, orgId)));

      if (member[0]?.role === "owner") {
        // Check if there are other owners
        const owners = await db
          .select()
          .from(organizationMembers)
          .where(and(eq(organizationMembers.orgId, orgId), eq(organizationMembers.role, "owner")));

        if (owners.length <= 1) {
          throw new Error("Cannot remove the sole organization owner.");
        }
      }

      const result = await db
        .delete(organizationMembers)
        .where(and(eq(organizationMembers.id, memberId), eq(organizationMembers.orgId, orgId)))
        .returning();

      return result[0];
    } catch (error) {
      logger.error({ orgId, memberId, error }, "Failed to remove member");
      throw error;
    }
  }
}
