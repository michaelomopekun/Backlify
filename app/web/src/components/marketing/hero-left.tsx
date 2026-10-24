"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ActionButton, ActionButtonProps, ButtonSize } from "@/components/ui/action-button";
import { useIsMobile } from "@/hooks/use-mobile";

export interface HeroLeftProps {
  /** First line of the display headline (e.g. "Automate every backup" or "Build in a weekend") */
  firstLine?: string;
  /** Second line with brand accent color (e.g. "Verify every restore" or "Scale to millions") */
  secondLine?: string;
  /** Text color for the first line (default: "#EDEDED") */
  titleColor?: string;
  /** Accent color for the second line (default: "#FFB31F") */
  accentColor?: string;
  /** Custom font size for the headline (e.g. "48px" or "clamp(34px, 4.5vw, 48px)") */
  fontSize?: string;
  /** Line height for headline (default: "1.1") */
  lineHeight?: string;
  /** Font weight for headline (default: 600) */
  fontWeight?: number | string;
  /** Letter spacing for headline (default: "-0.03em") */
  letterSpacing?: string;

  /** Primary CTA button label (default: "Start your project") */
  primaryText?: string;
  /** Primary CTA href link */
  primaryHref?: string;
  /** Additional props forwarded to primary ActionButton */
  primaryButtonProps?: Partial<ActionButtonProps>;

  /** Secondary CTA button label (default: "Request a demo") */
  secondaryText?: string;
  /** Secondary CTA href link */
  secondaryHref?: string;
  /** Additional props forwarded to secondary ActionButton */
  secondaryButtonProps?: Partial<ActionButtonProps>;

  /** Button size preset (default: "long" matching Supabase hero button dimensions) */
  buttonSize?: ButtonSize;
  /** Gap between CTA buttons (default: "12px") */
  buttonsGap?: string;
  /** Margin above CTA buttons (default: "32px") */
  buttonsMarginTop?: string;

  /** Max width of the left column (default: "560px") */
  columnMaxWidth?: string;
  /** Max width of outer centered container (default: "1280px" matching navbar) */
  containerMaxWidth?: string;
  /** Top padding from header (default: "96px") */
  paddingTop?: string;
  /** Bottom padding (default: "48px") */
  paddingBottom?: string;
  /** Additional classes */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;

  /** Optional right column content (e.g. HeroRight or ShaderLensBlur) */
  rightContent?: React.ReactNode;
  isMobile?: boolean;
}

export function HeroLeft({
  isMobile: isMobileProp,
  firstLine = "Automate every backup",
  secondLine = "Verify every restore",
  titleColor = "#EDEDED",
  accentColor = "#FFB31F",
  fontSize = "clamp(34px, 4.5vw, 48px)",
  lineHeight = "1.1",
  fontWeight = 400,
  letterSpacing = "-0.01em",

  primaryText = "Start your project",
  primaryHref = "/signup",
  primaryButtonProps,

  secondaryText = "Request a demo",
  secondaryHref = "#demo",
  secondaryButtonProps,

  buttonSize = "heroLong",
  buttonsGap = "12px",
  buttonsMarginTop = "32px",

  columnMaxWidth = "560px",
  containerMaxWidth = "1150px",
  paddingTop,
  paddingBottom = "48px",
  className,
  style,
  rightContent,
}: HeroLeftProps) {
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;
  const effectivePaddingTop = paddingTop ?? (isMobile ? "45px" : "40px");

  return (
    <section
      className={cn("w-full", className)}
      style={{
        maxWidth: containerMaxWidth,
        margin: "0 auto",
        paddingLeft: "23px",
        paddingRight: "23px",
        paddingTop: effectivePaddingTop,
        paddingBottom: paddingBottom,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "40px",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: columnMaxWidth,
            width: "100%",
            flex: "1 1 480px",
          }}
        >
          {/* ── 2-Line High-Impact Display Headline ── */}
          <h1
            style={{
              fontSize: fontSize,
              fontWeight: fontWeight,
              lineHeight: lineHeight,
              letterSpacing: letterSpacing,
              margin: 0,
              padding: 0,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            }}
          >
            <span
              style={{
                color: titleColor,
                display: "block",
              }}
            >
              {firstLine}
            </span>
            <span
              style={{
                color: accentColor,
                display: "block",
              }}
            >
              {secondLine}
            </span>
          </h1>

          {/* ── Dual CTA Action Buttons ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: buttonsGap,
              marginTop: buttonsMarginTop,
              flexWrap: "wrap",
            }}
          >
            {/* Primary CTA (Amber Accent) */}
            <ActionButton
              variant="amber"
              size={buttonSize}
              href={primaryHref}
              {...primaryButtonProps}
            >
              {primaryText}
            </ActionButton>

            {/* Secondary CTA (Dark with subtle border) */}
            <ActionButton
              variant="dark"
              size={buttonSize}
              href={secondaryHref}
              {...secondaryButtonProps}
            >
              {secondaryText}
            </ActionButton>
          </div>
        </div>

        {rightContent && (
          <div
            style={{
              flex: "1 1 420px",
              minWidth: "300px",
              maxWidth: "520px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {rightContent}
          </div>
        )}
      </div>
    </section>
  );
}
