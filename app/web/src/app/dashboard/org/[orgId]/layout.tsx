/**
 * /dashboard/org/[orgId] root layout — passthrough wrapper.
 * Org-level pages and Project-level pages handle their own respective SidebarProviders
 * so they never conflict or duplicate headers/sidebars.
 */
export default function OrgWorkspaceRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background text-foreground antialiased">{children}</div>;
}
