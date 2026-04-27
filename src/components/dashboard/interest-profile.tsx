// ============================================
// EduNex AI Tutor - Interest Profile Component
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import { InterestStat } from "@/types";
import { getInterestOption } from "@/lib/constants";
import { Card, CardHeader } from "@/components/ui/card";

interface InterestProfileProps {
  data: InterestStat[];
}

export function InterestProfile({ data }: InterestProfileProps) {
  return (
    <Card variant="default">
      <CardHeader
        title="Interest Profile"
        subtitle="How you learn best"
      />
      <div className="space-y-4">
        {data.map((stat, index) => {
          const option = getInterestOption(stat.interest);
          if (!option) return null;

          return (
            <motion.div
              key={stat.interest}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.08 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {stat.topicCount} topics · {stat.percentage}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: option.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
