// ============================================
// EduNex AI Tutor - Avatar Component
// ============================================

"use client";

import React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  isAI?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({
  name = "User",
  src,
  size = "md",
  className,
  isAI = false,
}: AvatarProps) {
  if (isAI) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center bg-gradient-primary shadow-lg shadow-purple-500/20",
          sizeClasses[size],
          className
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-[60%] h-[60%]"
          stroke="white"
          strokeWidth="1.5"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            fill="rgba(255,255,255,0.2)"
            stroke="white"
          />
          <path d="M2 17L12 22L22 17" stroke="white" />
          <path d="M2 12L12 17L22 12" stroke="white" />
        </svg>
      </div>
    );
  }

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={56}
        height={56}
        className={cn(
          "rounded-full object-cover border-2 border-border",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center bg-secondary border border-border font-semibold text-foreground",
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
