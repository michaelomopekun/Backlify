import { redirect } from "next/navigation";

/**
 * /dashboard → /dashboard/org
 * Matches Supabase's behaviour: landing on /dashboard immediately
 * redirects you to the org selection page.
 */
export default function DashboardRootPage() {
  redirect("/dashboard/org");
}
