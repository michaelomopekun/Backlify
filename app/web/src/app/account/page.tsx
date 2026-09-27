import { requireCurrentUser } from "@/lib/current-user";
import { UserRepository } from "db";
import { AccountPreferencesClient } from "@/components/account/preferences-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Preferences | Backlify",
  description: "Manage your Backlify user account, profile details, and dashboard preferences.",
};

export default async function AccountPreferencesPage() {
  const sessionUser = await requireCurrentUser();
  let dbUser = null;

  try {
    dbUser = await UserRepository.getUserById(sessionUser.id);
  } catch (err) {
    console.error("Failed to fetch user by id:", err);
  }

  const user = {
    id: sessionUser.id,
    name: dbUser?.name || sessionUser.name,
    email: dbUser?.email || sessionUser.email,
    image: dbUser?.image || sessionUser.image,
  };

  return <AccountPreferencesClient user={user} />;
}
