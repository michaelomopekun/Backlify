"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/current-user";

// Exact SVG paths extracted from Figma
const figmaSvgPaths = {
  // Dashboard icon parts
  dashboard1: "M9 3H4C3.44772 3 3 3.44772 3 4V11C3 11.5523 3.44772 12 4 12H9C9.55228 12 10 11.5523 10 11V4C10 3.44772 9.55228 3 9 3Z",
  dashboard2: "M20 3H15C14.4477 3 14 3.44772 14 4V7C14 7.55228 14.4477 8 15 8H20C20.5523 8 21 7.55228 21 7V4C21 3.44772 20.5523 3 20 3Z",
  dashboard3: "M20 12H15C14.4477 12 14 12.4477 14 13V20C14 20.5523 14 21 15 21H20C20.5523 21 21 20.5523 21 20V13C21 12.4477 20.5523 12 20 12Z",
  dashboard4: "M9 16H4C3.44772 16 3 16.4477 3 17V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V17C10 16.4477 9.55228 16 9 16Z",
  // Projects folder icon
  projectsFolder: "M4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V8C22 7.46957 21.7893 6.96086 21.4142 6.58579C21.0391 6.21071 20.5304 6 20 6H12.07C11.7406 5.9983 11.4167 5.91525 11.1271 5.75824C10.8375 5.60123 10.5912 5.37512 10.41 5.1L9.59 3.9C9.40882 3.62488 9.1625 3.39877 8.8729 3.24176C8.58331 3.08475 8.25941 3.0017 7.93 3H4C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5V18C2 19.1 2.9 20 4 20Z",
  // Backups cloud vector
  backupCloud: "M10.3518 8.40175L8.79575 9.96375C8.63575 10.1216 8.45125 10.2005 8.24225 10.2005C8.03342 10.2005 7.85192 10.1236 7.69775 9.96975C7.53975 9.81175 7.45983 9.62358 7.458 9.40525C7.456 9.18692 7.53392 8.99875 7.69175 8.84075L10.5348 5.973C10.7076 5.803 10.9093 5.718 11.1398 5.718C11.3701 5.718 11.5702 5.803 11.7402 5.973L14.6083 8.84675C14.7661 9.00475 14.844 9.18875 14.842 9.39875C14.8402 9.60875 14.7611 9.79075 14.6048 9.94475C14.4444 10.1029 14.2562 10.1809 14.0402 10.1787C13.8242 10.1766 13.6392 10.0966 13.4852 9.93875L11.9232 8.40175V14.5767H17.9027C18.6314 14.5767 19.2584 14.3143 19.7837 13.7895C20.3091 13.2647 20.5718 12.6367 20.5718 11.9055C20.5718 11.1715 20.3093 10.5427 19.7845 10.0192C19.2597 9.49592 18.6317 9.23425 17.9005 9.23425H16.2718V7.0685C16.2718 5.60333 15.7742 4.34383 14.7792 3.29C13.7842 2.23617 12.5546 1.70925 11.0902 1.70925C9.61708 1.70925 8.38008 2.24358 7.37925 3.31225C6.37858 4.38092 5.87825 5.65492 5.87825 7.13425H5.3495C4.331 7.13425 3.46867 7.49142 2.7625 8.20575C2.05633 8.91992 1.70325 9.80275 1.70325 10.8542C1.70325 11.8724 2.06408 12.7474 2.78575 13.4792C3.50742 14.2109 4.37867 14.5767 5.3995 14.5767H8C8.24033 14.5767 8.44233 14.659 8.606 14.8235C8.76983 14.988 8.85175 15.1911 8.85175 15.4327C8.85175 15.6744 8.76983 15.876 8.606 16.0375C8.44233 16.1992 8.24033 16.28 8 16.28H5.3995C3.925 16.28 2.65642 15.75 1.59375 14.69C0.53125 13.63 0 12.3642 0 10.8925C0 9.5685 0.4145 8.39575 1.2435 7.37425C2.0725 6.35275 3.14692 5.738 4.46675 5.53C4.81608 3.90133 5.61575 2.5725 6.86575 1.5435C8.11575 0.5145 9.55692 0 11.1893 0C13.0874 0 14.6839 0.681166 15.9788 2.0435C17.2738 3.40583 17.9372 5.043 17.969 6.955V7.555C19.181 7.5575 20.2017 7.97325 21.031 8.80225C21.8603 9.63142 22.275 10.6698 22.275 11.9175C22.275 13.111 21.8434 14.1364 20.9803 14.9938C20.1169 15.8513 19.0903 16.28 17.9005 16.28H12.0607C11.6011 16.28 11.2013 16.1101 10.8615 15.7702C10.5217 15.4304 10.3518 15.0326 10.3518 14.5767V8.40175Z",
  // Chevron toggle
  chevronLeft: "M4.56569 0.234315C4.8781 0.546734 4.8781 1.05327 4.56569 1.36569L1.93137 4L4.56569 6.63431C4.8781 6.94673 4.8781 7.45327 4.56569 7.76569C4.25327 8.07811 3.74673 8.07811 3.43431 7.76569L0.234315 4.56569C-0.0781049 4.25327 -0.0781049 3.74673 0.234315 3.43431L3.43431 0.234315C3.74673 -0.0781049 4.25327 -0.0781049 4.56569 0.234315Z",
  // Footer Caret
  caretRight: "M0.292894 9.70711C-0.0976307 9.31658 -0.0976307 8.68342 0.292894 8.29289L3.58579 5L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683418 0.292893 0.292894C0.683417 -0.0976312 1.31658 -0.0976312 1.70711 0.292894L5.70711 4.29289C6.09763 4.68342 6.09763 5.31658 5.70711 5.70711L1.70711 9.70711C1.31658 10.0976 0.683418 10.0976 0.292894 9.70711Z",
};

// Exact SVG Components
function DashboardSvgIcon({ active }: { active: boolean }) {
  const color = active ? "#FFB31F" : "white";
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" viewBox="0 0 24 24" width="24">
        <g>
          <path d={figmaSvgPaths.dashboard1} fill={color} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.dashboard2} fill={color} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.dashboard3} fill={color} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.dashboard4} fill={color} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ProjectsSvgIcon({ active }: { active: boolean }) {
  const color = active ? "#FFB31F" : "white";
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" viewBox="0 0 24 24" width="24">
        <g>
          <path d={figmaSvgPaths.projectsFolder} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M8 10V14" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M12 10V12" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d="M16 10V16" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function BackupsSvgIcon({ active }: { active: boolean }) {
  const color = active ? "#FFB31F" : "white";
  return (
    <div className="relative shrink-0 size-[24px] flex items-center justify-center">
      <svg className="block size-[22.275px]" fill="none" height="16.28" viewBox="0 0 22.275 16.28" width="22.275">
        <path d={figmaSvgPaths.backupCloud} fill={color} />
      </svg>
    </div>
  );
}

function SchedulesSvgIcon({ active }: { active: boolean }) {
  const color = active ? "#FFB31F" : "white";
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" viewBox="0 0 24 24" width="24">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="15" r="3" stroke={color} strokeWidth="1.5" />
        <path d="M14 13.8V15L15.2 15.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function RestoresSvgIcon({ active }: { active: boolean }) {
  const color = active ? "#FFB31F" : "white";
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" viewBox="0 0 24 24" width="24">
        <ellipse cx="12" cy="5" rx="8" ry="2.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 5V12C4 13.38 7.58 14.5 12 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 5V8.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 12V19C4 20.38 7.58 21.5 12 21.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 12.5V16H22" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21.5 14.5C21 13 19.5 12 17.5 12C15 12 13 14 13 16.5C13 19 15 21 17.5 21C19.2 21 20.6 20 21.2 18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative shrink-0 size-[44px] flex items-center justify-center", className)}>
      <img
        src="/backlify-logo.svg"
        alt="Backlify"
        className="size-full object-contain pointer-events-none"
      />
    </div>
  );
}

export function AppSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isDashboard = pathname === "/dashboard";
  const isProjects = pathname.startsWith("/dashboard/projects") && !pathname.includes("/schedules") && !pathname.includes("/restore");
  const isBackups = pathname.startsWith("/dashboard/backups");
  const isSchedules = pathname.includes("/schedules");
  const isRestores = pathname.includes("/restore");

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden lg:flex flex-col bg-[#0f172a] drop-shadow-[0px_16px_22px_rgba(0,0,0,0.07)] rounded-r-[16px] rounded-l-none transition-all duration-300",
          collapsed ? "w-[80px]" : "w-[240px]"
        )}
        style={{ height: "100vh" }}
      >
        {/* Top Header - Exact 80px */}
        <div className="content-stretch flex gap-[12px] h-[80px] items-center p-[24px] relative shrink-0">
          <Link href="/dashboard" className="flex items-center gap-[12px] min-w-0">
            <BrandMark />
            {!collapsed && (
              <p className="font-['JetBrains_Mono',sans-serif] font-extrabold text-[20px] text-white whitespace-nowrap tracking-wide">
                BACKLIFY
              </p>
            )}
          </Link>

          {/* Expand / Compress Circular Glass Button - Vertically centered on the 80px top header */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-[15px] top-[25px] z-50 flex size-[30px] items-center justify-center rounded-full border border-white/30 bg-[rgba(100,116,139,0.65)] text-[#080B14] shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-[rgba(100,116,139,0.85)] hover:border-white/50"
          >
            <svg
              className={cn("size-[10px] text-[#080B14] transition-transform duration-200", collapsed ? "rotate-180" : "rotate-0")}
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                clipRule="evenodd"
                d={figmaSvgPaths.chevronLeft}
                fill="#080B14"
                fillRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Main Nav Items - Exact gap 15px, px 24px */}
        <div className="content-stretch flex flex-col items-center left-0 right-0 top-[104px] pt-4 flex-1">
          <div className="w-full">
            <div className={cn("content-stretch flex flex-col gap-[15px] items-start", collapsed ? "px-[16px] items-center" : "px-[24px]")}>
              {/* Nav item 1 - Dashboard */}
              <Link
                href="/dashboard"
                className={cn(
                  "relative shrink-0 transition-all flex items-center",
                  collapsed
                    ? cn(
                        "size-[48px] rounded-full justify-center",
                        isDashboard
                          ? "bg-[rgba(100,116,139,0.5)] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                          : "hover:bg-white/[0.06]"
                      )
                    : cn(
                        "w-full",
                        isDashboard ? "bg-[rgba(100,116,139,0.5)] rounded-[15px] border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" : "h-[44px] rounded-[99px] hover:bg-white/[0.05]"
                      )
                )}
              >
                {collapsed ? (
                  <div className="flex items-center justify-center size-full">
                    <DashboardSvgIcon active={isDashboard} />
                  </div>
                ) : (
                  <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
                      <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative">
                        <DashboardSvgIcon active={isDashboard} />
                        <div
                          className={cn(
                            "font-['JetBrains_Mono',sans-serif] font-medium text-[14px] leading-[20px]",
                            isDashboard ? "text-[#ffb31f]" : "text-white"
                          )}
                        >
                          Dashboard
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>

              {/* Nav item 2 - Projects */}
              <Link
                href="/dashboard/projects"
                className={cn(
                  "relative shrink-0 transition-all flex items-center",
                  collapsed
                    ? cn(
                        "size-[48px] rounded-full justify-center",
                        isProjects
                          ? "bg-[rgba(100,116,139,0.5)] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                          : "hover:bg-white/[0.06]"
                      )
                    : cn(
                        "w-full",
                        isProjects ? "bg-[rgba(100,116,139,0.5)] rounded-[15px] border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" : "h-[44px] rounded-[99px] hover:bg-white/[0.05]"
                      )
                )}
              >
                {collapsed ? (
                  <div className="flex items-center justify-center size-full">
                    <ProjectsSvgIcon active={isProjects} />
                  </div>
                ) : (
                  <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
                      <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative">
                        <ProjectsSvgIcon active={isProjects} />
                        <div
                          className={cn(
                            "font-['JetBrains_Mono',sans-serif] font-medium text-[14px] leading-[20px]",
                            isProjects ? "text-[#ffb31f]" : "text-white"
                          )}
                        >
                          Projects
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>

              {/* Nav item 3 - Backups */}
              <Link
                href="/dashboard/backups"
                className={cn(
                  "relative shrink-0 transition-all flex items-center",
                  collapsed
                    ? cn(
                        "size-[48px] rounded-full justify-center",
                        isBackups
                          ? "bg-[rgba(100,116,139,0.5)] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                          : "hover:bg-white/[0.06]"
                      )
                    : cn(
                        "w-full",
                        isBackups ? "bg-[rgba(100,116,139,0.5)] rounded-[15px] border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" : "h-[44px] rounded-[99px] hover:bg-white/[0.05]"
                      )
                )}
              >
                {collapsed ? (
                  <div className="flex items-center justify-center size-full">
                    <BackupsSvgIcon active={isBackups} />
                  </div>
                ) : (
                  <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
                      <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative">
                        <BackupsSvgIcon active={isBackups} />
                        <div
                          className={cn(
                            "font-['JetBrains_Mono',sans-serif] font-medium text-[14px] leading-[20px]",
                            isBackups ? "text-[#ffb31f]" : "text-white"
                          )}
                        >
                          Backups
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>

              {/* Nav item 4 - Schedules */}
              <Link
                href="/dashboard/projects"
                className={cn(
                  "relative shrink-0 transition-all flex items-center",
                  collapsed
                    ? cn(
                        "size-[48px] rounded-full justify-center",
                        isSchedules
                          ? "bg-[rgba(100,116,139,0.5)] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                          : "hover:bg-white/[0.06]"
                      )
                    : cn(
                        "w-full",
                        isSchedules ? "bg-[rgba(100,116,139,0.5)] rounded-[15px] border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" : "h-[44px] rounded-[99px] hover:bg-white/[0.05]"
                      )
                )}
              >
                {collapsed ? (
                  <div className="flex items-center justify-center size-full">
                    <SchedulesSvgIcon active={isSchedules} />
                  </div>
                ) : (
                  <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
                      <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative">
                        <SchedulesSvgIcon active={isSchedules} />
                        <div
                          className={cn(
                            "font-['JetBrains_Mono',sans-serif] font-medium text-[14px] leading-[20px]",
                            isSchedules ? "text-[#ffb31f]" : "text-white"
                          )}
                        >
                          Schedules
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>

              {/* Nav item 5 - Restores */}
              <Link
                href="/dashboard/backups"
                className={cn(
                  "relative shrink-0 transition-all flex items-center",
                  collapsed
                    ? cn(
                        "size-[48px] rounded-full justify-center",
                        isRestores
                          ? "bg-[rgba(100,116,139,0.5)] border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]"
                          : "hover:bg-white/[0.06]"
                      )
                    : cn(
                        "w-full",
                        isRestores ? "bg-[rgba(100,116,139,0.5)] rounded-[15px] border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" : "h-[44px] rounded-[99px] hover:bg-white/[0.05]"
                      )
                )}
              >
                {collapsed ? (
                  <div className="flex items-center justify-center size-full">
                    <RestoresSvgIcon active={isRestores} />
                  </div>
                ) : (
                  <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                    <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
                      <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative">
                        <RestoresSvgIcon active={isRestores} />
                        <div
                          className={cn(
                            "font-['JetBrains_Mono',sans-serif] font-medium text-[14px] leading-[20px]",
                            isRestores ? "text-[#ffb31f]" : "text-white"
                          )}
                        >
                          Restores
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Footer - Exact 90px height, top border #e2e8f0 */}
        <div className="h-[90px] relative shrink-0 border-t border-[#e2e8f0]/15">
          <div className="flex flex-row items-center size-full">
            <div className={cn("content-stretch flex gap-[12px] items-center relative size-full", collapsed ? "p-[16px]" : "p-[24px]")}>
              <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-w-px relative">
                {/* Amber Avatar Circle */}
                <div className="bg-[#ffb31f] overflow-clip relative rounded-[99px] shrink-0 size-[40px] flex items-center justify-center font-bold text-[#080B14] shadow-md shadow-amber-500/20 text-sm">
                  {user.initials || "JD"}
                </div>
                {!collapsed && (
                  <div className="content-stretch flex flex-[1_0_0] flex-col font-['Poppins',sans-serif] gap-[2px] items-start leading-[20px] min-w-px not-italic relative">
                    <p className="relative shrink-0 text-[#64748b] text-[12px] w-full">Welcome back 👋</p>
                    <p className="relative shrink-0 text-[14px] text-white w-full font-medium">{user.name || "Johnathan"}</p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <div className="overflow-clip relative shrink-0 size-[20px] flex items-center justify-center">
                  <svg className="block size-[10px]" fill="none" height="10" viewBox="0 0 6 10" width="6">
                    <path clipRule="evenodd" d={figmaSvgPaths.caretRight} fill="#E7E7E8" fillRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile nav bar */}
      <nav aria-label="Main" className="sticky top-0 z-30 flex items-center justify-around border-b border-white/10 bg-[#0F172A] px-4 py-2.5 lg:hidden">
        <Link href="/dashboard" className={cn("p-2 rounded-xl", isDashboard && "bg-[rgba(100,116,139,0.5)]")}>
          <DashboardSvgIcon active={isDashboard} />
        </Link>
        <Link href="/dashboard/projects" className={cn("p-2 rounded-xl", isProjects && "bg-[rgba(100,116,139,0.5)]")}>
          <ProjectsSvgIcon active={isProjects} />
        </Link>
        <Link href="/dashboard/backups" className={cn("p-2 rounded-xl", isBackups && "bg-[rgba(100,116,139,0.5)]")}>
          <BackupsSvgIcon active={isBackups} />
        </Link>
      </nav>
    </>
  );
}
