/**
 * /dashboard/org root layout — lightweight wrapper so child pages and nested org layouts
 * are not polluted with a duplicate header.
 */
export default function OrgRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background text-foreground antialiased">{children}</div>;
}
