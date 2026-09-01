/**
 * /dashboard layout — thin shell, no sidebar.
 * The actual redirect from /dashboard → /dashboard/org happens in page.tsx.
 * All nested layouts (org, project) handle their own SidebarProvider.
 */
import { FloatingSupportDock } from "@/components/layout/floating-support-dock";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-surface="product" className="min-h-screen bg-background text-foreground antialiased relative">
      {children}
      <FloatingSupportDock />
    </div>
  );
}
