// ============================================
// EduNex AI Tutor - Card Component
// ============================================

"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "glass" | "gradient" | "interactive";
  noPadding?: boolean;
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", noPadding = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border",
      glass: "glass",
      gradient: "bg-gradient-to-br from-purple-500/10 via-card to-blue-500/10 border border-purple-500/20",
      interactive:
        "bg-card border border-border hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 cursor-pointer",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl transition-all duration-300",
          !noPadding && "p-6",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

/** Card header with title and optional action */
export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
