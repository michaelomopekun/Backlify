"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "dark" | "blue" | "amber" | "outline" | "ghost" | "custom";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "long" | "heroLong";

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant matching the design spec */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Optional link destination — renders as Next.js Link when provided */
  href?: string;
  /** Whether the link should open in a new tab (only if href is provided) */
  external?: boolean;
  /** Custom background color (e.g. "#121316", or any CSS color) */
  bgColor?: string;
  /** Custom hover background color */
  hoverBgColor?: string;
  /** Custom border color (e.g. "#303336") */
  borderColor?: string;
  /** Custom hover border color */
  hoverBorderColor?: string;
  /** Custom text color (e.g. "#ffffff") */
  textColor?: string;
  /** Custom width (e.g. "120px", 120, "100%") */
  width?: string | number;
  /** Custom minimum width (e.g. "110px", 110) */
  minWidth?: string | number;
  /** Custom border radius (e.g. "9px", "12px", "9999px") */
  borderRadius?: string;
  /** Custom border width (e.g. "1px", "1.5px") */
  borderWidth?: string | number;
  /** Custom font size (e.g. "13px", "14px") */
  fontSize?: string;
  /** Custom font weight (e.g. 500, 600, "500", "600") */
  fontWeight?: string | number;
  /** Optional left icon element */
  leftIcon?: React.ReactNode;
  /** Optional right icon element */
  rightIcon?: React.ReactNode;
  /** Loading indicator state */
  isLoading?: boolean;
  /** Children content */
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, {
  bg: string;
  border: string;
  text: string;
  hoverBg: string;
  hoverBorder: string;
}> = {
  // Exact match to the "Sign in" button in the provided image
  dark: {
    bg: "#121316",
    border: "#303336",
    text: "#FFFFFF",
    hoverBg: "#1a1c20",
    hoverBorder: "#3f4449",
  },
  // Exact match to the "Start free" button in the provided image
  blue: {
    bg: "#035397",
    border: "#3284D0",
    text: "#FFFFFF",
    hoverBg: "#045ea9",
    hoverBorder: "#4a97e0",
  },
  // Backlify brand amber accent
  amber: {
    bg: "#FFB31F",
    border: "#ffe5a9ff",
    text: "#080B14",
    hoverBg: "#fabc48ff",
    hoverBorder: "#f6dda4ff",
  },
  outline: {
    bg: "transparent",
    border: "#303336",
    text: "#ededed",
    hoverBg: "#16181b",
    hoverBorder: "#464b52",
  },
  ghost: {
    bg: "transparent",
    border: "transparent",
    text: "#a1a1a1",
    hoverBg: "#16181b",
    hoverBorder: "transparent",
  },
  custom: {
    bg: "transparent",
    border: "transparent",
    text: "#FFFFFF",
    hoverBg: "transparent",
    hoverBorder: "transparent",
  },
  
};

const SIZE_STYLES: Record<ButtonSize, {
  height: string;
  padding: string;
  fontSize: string;
  gap: string;
  minWidth?: string;
  width?: string;
}> = {
  xs: { height: "29px", padding: "0 10px", fontSize: "12px", gap: "6px" },
  sm: { height: "30px", padding: "0 13px", fontSize: "13px", gap: "6px" },
  md: { height: "36px", padding: "0 16px", fontSize: "14px", gap: "8px" },
  lg: { height: "40px", padding: "0 20px", fontSize: "15px", gap: "8px" },
  xl: { height: "46px", padding: "0 24px", fontSize: "16px", gap: "10px" },
  long: { height: "32px", padding: "0 24px", fontSize: "12px", gap: "8px", minWidth: "165px" },
  heroLong: { height: "40px", padding: "0 25px", fontSize: "12px", gap: "8px", minWidth: "140px" },
};

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      variant = "dark",
      size = "md",
      href,
      external,
      bgColor,
      hoverBgColor,
      borderColor,
      hoverBorderColor,
      textColor,
      width,
      minWidth,
      borderRadius = "9px",
      borderWidth = "1px",
      fontSize,
      fontWeight = "600",
      leftIcon,
      rightIcon,
      isLoading,
      disabled,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const variantStyle = VARIANT_STYLES[variant];
    const sizeStyle = SIZE_STYLES[size];

    // Compute active background, border, and text colors with priority for custom props
    const currentBg = isHovered && !disabled
      ? (hoverBgColor || (bgColor ? undefined : variantStyle.hoverBg))
      : (bgColor || variantStyle.bg);

    const currentBorder = isHovered && !disabled
      ? (hoverBorderColor || (borderColor ? undefined : variantStyle.hoverBorder))
      : (borderColor || variantStyle.border);

    const currentText = textColor || variantStyle.text;

    const mergedStyles: React.CSSProperties = {
      backgroundColor: currentBg,
      borderColor: currentBorder,
      color: currentText,
      borderRadius,
      borderWidth: typeof borderWidth === "number" ? `${borderWidth}px` : borderWidth,
      borderStyle: "solid",
      height: sizeStyle.height,
      width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : sizeStyle.width,
      minWidth: minWidth !== undefined ? (typeof minWidth === "number" ? `${minWidth}px` : minWidth) : sizeStyle.minWidth,
      padding: sizeStyle.padding,
      fontSize: fontSize || sizeStyle.fontSize,
      fontWeight,
      gap: sizeStyle.gap,
      ...style,
    };

    const content = (
      <>
        {isLoading ? (
          <svg
            className="animate-spin size-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <span className="truncate leading-none select-none">{children}</span>
        {!isLoading && rightIcon}
      </>
    );

    const baseClassName = cn(
      "inline-flex items-center justify-center shrink-0 cursor-pointer",
      "font-sans transition-all duration-150 ease-out select-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3284D0]/60",
      "active:scale-[0.98]",
      disabled && "opacity-50 cursor-not-allowed pointer-events-none",
      className
    );

    if (href) {
      return (
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer noopener" : undefined}
          className={baseClassName}
          style={mergedStyles}
          onClick={props.onClick as any}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={props.type || "button"}
        disabled={disabled || isLoading}
        className={baseClassName}
        style={mergedStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {content}
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";
