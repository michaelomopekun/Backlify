import { cn } from "@/lib/utils";

// Exact SVG paths extracted from Figma
const figmaSvgPaths = {
  backupCloud: "M10.3518 8.40175L8.79575 9.96375C8.63575 10.1216 8.45125 10.2005 8.24225 10.2005C8.03342 10.2005 7.85192 10.1236 7.69775 9.96975C7.53975 9.81175 7.45983 9.62358 7.458 9.40525C7.456 9.18692 7.53392 8.99875 7.69175 8.84075L10.5348 5.973C10.7076 5.803 10.9093 5.718 11.1398 5.718C11.3701 5.718 11.5702 5.803 11.7402 5.973L14.6083 8.84675C14.7661 9.00475 14.844 9.18875 14.842 9.39875C14.8402 9.60875 14.7611 9.79075 14.6048 9.94475C14.4444 10.1029 14.2562 10.1809 14.0402 10.1787C13.8242 10.1766 13.6392 10.0966 13.4852 9.93875L11.9232 8.40175V14.5767H17.9027C18.6314 14.5767 19.2584 14.3143 19.7837 13.7895C20.3091 13.2647 20.5718 12.6367 20.5718 11.9055C20.5718 11.1715 20.3093 10.5427 19.7845 10.0192C19.2597 9.49592 18.6317 9.23425 17.9005 9.23425H16.2718V7.0685C16.2718 5.60333 15.7742 4.34383 14.7792 3.29C13.7842 2.23617 12.5546 1.70925 11.0902 1.70925C9.61708 1.70925 8.38008 2.24358 7.37925 3.31225C6.37858 4.38092 5.87825 5.65492 5.87825 7.13425H5.3495C4.331 7.13425 3.46867 7.49142 2.7625 8.20575C2.05633 8.91992 1.70325 9.80275 1.70325 10.8542C1.70325 11.8724 2.06408 12.7474 2.78575 13.4792C3.50742 14.2109 4.37867 14.5767 5.3995 14.5767H8C8.24033 14.5767 8.44233 14.659 8.606 14.8235C8.76983 14.988 8.85175 15.1911 8.85175 15.4327C8.85175 15.6744 8.76983 15.876 8.606 16.0375C8.44233 16.1992 8.24033 16.28 8 16.28H5.3995C3.925 16.28 2.65642 15.75 1.59375 14.69C0.53125 13.63 0 12.3642 0 10.8925C0 9.5685 0.4145 8.39575 1.2435 7.37425C2.0725 6.35275 3.14692 5.738 4.46675 5.53C4.81608 3.90133 5.61575 2.5725 6.86575 1.5435C8.11575 0.5145 9.55692 0 11.1893 0C13.0874 0 14.6839 0.681166 15.9788 2.0435C17.2738 3.40583 17.9372 5.043 17.969 6.955V7.555C19.181 7.5575 20.2017 7.97325 21.031 8.80225C21.8603 9.63142 22.275 10.6698 22.275 11.9175C22.275 13.111 21.8434 14.1364 20.9803 14.9938C20.1169 15.8513 19.0903 16.28 17.9005 16.28H12.0607C11.6011 16.28 11.2013 16.1101 10.8615 15.7702C10.5217 15.4304 10.3518 15.0326 10.3518 14.5767V8.40175Z",
  checkDb1: "M16 19L18 21L22 17",
  checkDb2: "M21 13.127V5",
  checkDb3: "M3 12C3 12.7956 3.94821 13.5587 5.63604 14.1213C7.32387 14.6839 9.61305 15 12 15C14.3869 15 16.6761 14.6839 18.364 14.1213C20.0518 13.5587 21 12.7956 21 12",
  checkDb4: "M3 5V19C2.99985 19.4311 3.27848 19.8572 3.8169 20.2492C4.35531 20.6412 5.14088 20.9899 6.12007 21.2716C7.09926 21.5532 8.24908 21.7613 9.4912 21.8814C10.7333 22.0016 12.0386 22.0311 13.318 21.968",
  checkDb5: "M12 8C16.9706 8 21 6.65685 21 5C21 3.34315 16.9706 2 12 2C7.02944 2 3 3.34315 3 5C3 6.65685 7.02944 8 12 8Z",
  failedDb1: "M17 17L22 22",
  failedDb2: "M19.323 13.744C20.4137 13.2351 21 12.6254 21 12",
  failedDb3: "M21 13.127V5",
  failedDb4: "M22 17L17 22",
  failedDb5: "M3 12C3.00018 12.438 3.28814 12.8708 3.84364 13.2677C4.39914 13.6647 5.20871 14.0163 6.21545 14.2979C7.22219 14.5794 8.40169 14.784 9.67105 14.8974C10.9404 15.0108 12.2688 15.0301 13.563 14.954",
  failedDb6: "M3 5V19C3.00018 19.4221 3.26752 19.8393 3.78455 20.2246C4.30158 20.6099 5.05667 20.9544 6.00047 21.2358C6.94428 21.5171 8.05555 21.7289 9.26169 21.8573C10.4678 21.9858 11.7417 22.0279 13 21.981",
  failedDb7: "M12 8C16.9706 8 21 6.65685 21 5C21 3.34315 16.9706 2 12 2C7.02944 2 3 3.34315 3 5C3 6.65685 7.02944 8 12 8Z",
  storage1: "M10 16H10.01",
  storage2: "M2.212 11.577C2.07261 11.8551 2.00002 12.1619 2 12.473V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12.473C22 12.1619 21.9274 11.8551 21.788 11.577L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11L2.212 11.577Z",
  storage3: "M21.946 12.013H2.054",
  storage4: "M6 16H6.01",
};

// Exact Trend Arrow from Figma (Frame component with rotate-180 and #0B8544 green stroke)
function FigmaTrendArrow({ direction }: { direction: "up" | "down" | "neutral" }) {
  if (direction === "neutral") return null;

  return (
    <div className="flex items-center justify-center relative shrink-0">
      <div className={cn("flex-none", direction === "up" ? "rotate-180" : "rotate-0")}>
        <div className="relative size-[20px]">
          <svg className="absolute block inset-0 size-full" fill="none" height="20" viewBox="0 0 20 20" width="20">
            <g>
              <path
                d="M5 6.99999L10 12L15 6.99999"
                stroke={direction === "up" ? "#0B8544" : "#EF4444"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.92"
                strokeWidth="2"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

// Exact 1:1 Vector Icon Renderers for the 4 Stat Card types
export function StatBackupIcon() {
  return (
    <div className="relative size-[24px] flex items-center justify-center">
      <svg className="block size-[22.275px]" fill="none" height="16.28" viewBox="0 0 22.275 16.28" width="22.275">
        <path d={figmaSvgPaths.backupCloud} fill="white" />
      </svg>
    </div>
  );
}

export function StatSuccessfulIcon() {
  return (
    <div className="relative size-[24px]">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" viewBox="0 0 24 24" width="24">
        <g>
          <path d={figmaSvgPaths.checkDb1} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.checkDb2} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.checkDb3} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.checkDb4} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.checkDb5} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

export function StatFailedIcon() {
  return (
    <div className="relative size-[24px]">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" viewBox="0 0 24 24" width="24">
        <g>
          <path d={figmaSvgPaths.failedDb1} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.failedDb2} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.failedDb3} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.failedDb4} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.failedDb5} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.failedDb6} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.failedDb7} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

export function StatStorageIcon() {
  return (
    <div className="relative size-[24px]">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" viewBox="0 0 24 24" width="24">
        <g>
          <path d={figmaSvgPaths.storage1} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.storage2} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.storage3} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          <path d={figmaSvgPaths.storage4} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

export interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "primary" | "success" | "destructive";
}

export function StatCard({
  label,
  value,
  unit,
  trend = "100%",
  trendDirection = "up",
  hint = "over 7 days",
  icon: IconComponent,
}: StatCardProps) {
  return (
    <div
      className="h-[123px] relative rounded-[15px] shrink-0 w-full transition-all duration-200"
      style={{
        background: "#0F172A",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        boxSizing: "border-box",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
      }}
    >
      <div className="overflow-clip relative rounded-[inherit] size-full">
        {/* Label - Exact left 20px, top 16px, 13px JetBrains Mono */}
        <div className="absolute h-[22px] left-[20px] overflow-clip top-[16px] w-[194px]">
          <p className="font-['JetBrains_Mono',sans-serif] font-normal leading-[1.4] text-[#64748b] text-[13px] whitespace-nowrap">
            {label}
          </p>
        </div>

        {/* Icon Chip - Exact right/left 192px, top 38px, size 50px, rounded 13px */}
        <div
          className="absolute bg-[rgba(100,116,139,0.5)] right-[20px] rounded-[13px] size-[50px] top-[38px] flex items-center justify-center text-white"
        >
          {IconComponent && <IconComponent />}
        </div>

        {/* Big Stat Value - Exact left 20px, top 44px, 36px ExtraBold JetBrains Mono */}
        <div className="absolute h-[38px] left-[20px] overflow-clip top-[44px] flex items-baseline">
          <span className="font-['JetBrains_Mono',sans-serif] font-extrabold leading-[1.4] text-[36px] text-white whitespace-nowrap">
            {value}
          </span>
          {unit && (
            <span className="ml-2 font-['JetBrains_Mono',sans-serif] font-normal text-[#64748b] text-[13px]">
              {unit}
            </span>
          )}
        </div>

        {/* Trend delta row - Exact left 20px, top 88px */}
        <div className="absolute content-stretch flex gap-[5px] items-center left-[20px] top-[88px] whitespace-nowrap">
          <FigmaTrendArrow direction={trendDirection} />
          <p
            className={cn(
              "font-['JetBrains_Mono',sans-serif] font-extrabold leading-[1.4] relative shrink-0 text-[15px]",
              trendDirection === "up" ? "text-[rgba(11,133,68,0.92)]" : trendDirection === "down" ? "text-[#EF4444]" : "text-[#64748b]"
            )}
          >
            {trend}
          </p>
          <p className="font-['JetBrains_Mono',sans-serif] font-medium leading-[1.4] relative shrink-0 text-[#64748b] text-[13px]">
            {hint}
          </p>
        </div>
      </div>

      {/* 1px White border */}
      <div
        aria-hidden
        className="absolute border border-solid border-white/20 inset-0 pointer-events-none rounded-[15px]"
      />
    </div>
  );
}
