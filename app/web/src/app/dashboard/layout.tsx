import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { getCurrentUser } from "@/lib/current-user";

/**
 * The product shell.
 *
 * `:root` already carries the dashboard tokens, so this isn't wrapped in a
 * token surface the way the landing is — everything here, portalled overlays
 * included, themes correctly by default.
 *
 * `data-surface="product"` is a typography marker, not a token scope: the
 * global `h1…h6` rule in globals.css is the marketing serif, and this is what
 * hands the product's headings back to JetBrains Mono.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div data-surface="product" className="min-h-svh bg-background">
      <AppSidebar user={user} />
      <div className="lg:pl-60">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </div>
    </div>
  );
}
