"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { OrganizationRepository } from "db";
import { getCurrentUser } from "@/lib/current-user";

export async function createOrganizationAction(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  if (!name) {
    return { error: "Organization name is required." };
  }

  const user = await getCurrentUser();
  const id = `org_${uuidv4().replace(/-/g, "").substring(0, 16)}`;
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "org";
  const slug = `${baseSlug.substring(0, 80)}-${Math.random().toString(36).substring(2, 6)}`;

  try {
    await OrganizationRepository.createOrganization({
      id,
      name,
      slug,
      userId: user.id,
    });
  } catch (error) {
    console.error("Failed to create organization:", error);
    return { error: "Failed to create organization. Please try again." };
  }

  revalidatePath("/dashboard/org");
  redirect(`/dashboard/org/${id}`);
}
