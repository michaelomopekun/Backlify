import { db, eq } from "../../index";
import { users } from "../../schema/user";
import { organizations, organizationMembers } from "../../schema/organization";
import { logger } from "shared/config/logger";
import { randomUUID } from "crypto";

export interface UpsertUserParams {
  id?: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}

export class UserRepository {
  static async findOrCreateUser(params: UpsertUserParams) {
    try {
      const normalizedEmail = params.email.trim().toLowerCase();

      // 1. Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      if (existing.length > 0) {
        const user = existing[0];
        // Optionally update name/image if provided and changed
        if (params.name && params.name !== user.name) {
          await db
            .update(users)
            .set({ name: params.name, image: params.image || user.image, updatedAt: new Date() })
            .where(eq(users.id, user.id));
        }
        return user;
      }

      // 2. Create new user
      const userId = params.id || `user_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      const newUser = await db
        .insert(users)
        .values({
          id: userId,
          email: normalizedEmail,
          name: params.name || normalizedEmail.split("@")[0],
          image: params.image || null,
          emailVerified: params.emailVerified || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const user = newUser[0];
      logger.info({ userId: user.id, email: user.email }, "User record created");

      // 3. Auto-provision initial organization for the new user
      const orgName = `${user.name || "My"}'s Org`;
      const baseSlug = (user.name || "org")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 20);
      const orgSlug = `${baseSlug}-${randomUUID().slice(0, 6)}`;
      const orgId = `org_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

      await db.insert(organizations).values({
        id: orgId,
        name: orgName,
        slug: orgSlug,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(organizationMembers).values({
        id: `mem_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
        orgId: orgId,
        userId: user.id,
        email: user.email,
        name: user.name,
        role: "owner",
        invitedAt: new Date(),
        joinedAt: new Date(),
      });

      logger.info({ userId: user.id, orgId }, "Auto-provisioned initial organization");

      return user;
    } catch (error) {
      logger.error({ email: params.email, error }, "Failed in findOrCreateUser");
      throw error;
    }
  }

  static async getUserById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  static async getUserByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);
    return result[0] || null;
  }

  static async getUserOrganizations(userId: string) {
    const userMemberships = await db
      .select({
        org: organizations,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizations.id, organizationMembers.orgId))
      .where(eq(organizationMembers.userId, userId));

    return userMemberships.map((m) => ({
      ...m.org,
      role: m.role,
    }));
  }
}
