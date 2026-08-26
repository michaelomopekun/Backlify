import { db, eq } from "../../index";

import { organizations } from "../../schema/organization";

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

      logger.info({ orgId: id }, "Deleting organization");

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

}
