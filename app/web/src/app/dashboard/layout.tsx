import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { getCurrentUser } from "@/lib/current-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div
      data-surface="product"
      className="relative min-h-screen bg-[#080B14] text-[#E2E8F0] font-['JetBrains_Mono',monospace] overflow-x-hidden"
    >
      {/* Ambient background lighting glow for glassmorphism */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-[20%] size-[600px] rounded-full bg-indigo-600/[0.07] blur-[140px]" />
        <div className="absolute top-[30%] right-[10%] size-[500px] rounded-full bg-amber-500/[0.05] blur-[160px]" />
        <div className="absolute bottom-[10%] left-[30%] size-[550px] rounded-full bg-slate-700/[0.08] blur-[150px]" />
      </div>

      <AppSidebar user={user} />
      <div className="relative z-10 lg:pl-[264px] transition-all duration-300 p-4 lg:p-6 lg:pr-8">
        <div className="mx-auto max-w-[1240px] space-y-6">{children}</div>
      </div>
    </div>
  );
}
