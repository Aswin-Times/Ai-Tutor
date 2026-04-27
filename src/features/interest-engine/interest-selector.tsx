// ============================================
// EduNex AI Tutor - Interest Selector Component
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Interest, InterestOption } from "@/types";
import { INTEREST_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/user-store";

interface InterestSelectorProps {
  /** Optional custom list of interests to show */
  options?: InterestOption[];
  /** Max number of selections allowed */
  maxSelections?: number;
  /** Compact mode for settings page */
  compact?: boolean;
}

export function InterestSelector({
  options = INTEREST_OPTIONS,
  maxSelections = 5,
  compact = false,
}: InterestSelectorProps) {
  const { interests, toggleInterest } = useUserStore();

  const handleToggle = (interest: Interest) => {
    if (interests.includes(interest)) {
      toggleInterest(interest);
    } else if (interests.length < maxSelections) {
      toggleInterest(interest);
    }
  };

  return (
    <div>
      {!compact && (
        <p className="text-sm text-muted-foreground mb-4">
          Select up to {maxSelections} interests ({interests.length}/{maxSelections})
        </p>
      )}

      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
        )}
      >
        {options.map((option, index) => {
          const isSelected = interests.includes(option.id);
          const isDisabled = !isSelected && interests.length >= maxSelections;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleToggle(option.id)}
              disabled={isDisabled}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected
                  ? "border-transparent shadow-lg"
                  : "border-border hover:border-white/20 bg-card",
                isDisabled && "opacity-40 cursor-not-allowed",
                compact && "p-3"
              )}
              style={
                isSelected
                  ? {
                      backgroundColor: `${option.color}15`,
                      borderColor: `${option.color}60`,
                      boxShadow: `0 0 20px ${option.color}20`,
                    }
                  : undefined
              }
              whileHover={!isDisabled ? { scale: 1.03, y: -2 } : {}}
              whileTap={!isDisabled ? { scale: 0.97 } : {}}
            >
              {/* Selected checkmark */}
              <AnimatePresenceCheck isSelected={isSelected} color={option.color} />

              {/* Emoji */}
              <span className={cn("text-3xl", compact && "text-2xl")}>
                {option.emoji}
              </span>

              {/* Label */}
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {option.label}
              </span>

              {/* Description */}
              {!compact && (
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {option.description}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/** Animated checkmark for selected state */
function AnimatePresenceCheck({
  isSelected,
  color,
}: {
  isSelected: boolean;
  color: string;
}) {
  if (!isSelected) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <Check className="h-3 w-3 text-white" />
    </motion.div>
  );
}
