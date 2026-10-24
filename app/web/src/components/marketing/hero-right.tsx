"use client";

import { IsometricMigrationIllustration } from "@/components/marketing/isometric-migration-illustration";

export interface HeroRightProps {
  className?: string;
  style?: React.CSSProperties;
}

export function HeroRight({ className, style }: HeroRightProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: "600px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <IsometricMigrationIllustration accentColor="#FFB31F" />
    </div>
  );
}

export default HeroRight;
