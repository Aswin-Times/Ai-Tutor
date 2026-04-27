// ============================================
// EduNex AI Tutor - Badge Component
// ============================================

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "interest";
  /** Custom color for interest badges */
  color?: string;
}

export function Badge({
  className,
  variant = "default",
  color,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-secondary text-secondary-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    interest: "",
  };

  const interestStyle = color
    ? {
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }
    : {};

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        "transition-colors duration-200",
        variant !== "interest" && variantStyles[variant],
        variant === "interest" && "border",
        className
      )}
      style={variant === "interest" ? interestStyle : undefined}
      {...props}
    >
      {children}
    </span>
  );
}
