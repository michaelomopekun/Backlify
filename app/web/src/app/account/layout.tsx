import { requireCurrentUser } from "@/lib/current-user";
import { AccountHeader } from "@/components/account/account-header";
import { AccountSidebar } from "@/components/account/account-sidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account Preferences | Backlify",
  description: "Manage your Backlify user account, profile details, and dashboard preferences.",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCurrentUser();

  return (
    <div data-surface="product" className="h-screen w-screen overflow-hidden flex flex-col bg-[#0c0c0c] text-foreground font-sans">
      {/* Top Header */}
      <AccountHeader
        userInitials={user.initials}
        userEmail={user.email}
        userName={user.name}
      />

      {/* Main Workspace with Account Sidebar */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden">
        <AccountSidebar />

        {/* Scrollable Content Container */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto px-6 sm:px-10 lg:px-12 py-8 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
