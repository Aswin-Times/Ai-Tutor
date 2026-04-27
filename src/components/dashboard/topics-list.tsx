// ============================================
// EduNex AI Tutor - Topics List Component
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp } from "lucide-react";
import { LearnedTopic } from "@/types";
import { getInterestOption } from "@/lib/constants";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface TopicsListProps {
  topics: LearnedTopic[];
}

export function TopicsList({ topics }: TopicsListProps) {
  return (
    <Card variant="default">
      <CardHeader
        title="Topics Learned"
        subtitle={`${topics.length} topics mastered`}
        action={
          <Badge variant="primary">
            <BookOpen className="h-3 w-3" />
            All Topics
          </Badge>
        }
      />
      <div className="space-y-2">
        {topics.map((topic, index) => {
          const interest = getInterestOption(topic.interest);

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
            >
              {/* Interest icon */}
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                style={{
                  backgroundColor: interest
                    ? `${interest.color}15`
                    : undefined,
                }}
              >
                {interest?.emoji || "📚"}
              </div>

              {/* Topic info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {topic.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topic.category} · {formatDate(new Date(topic.lastStudied))}
                </p>
              </div>

              {/* Mastery level */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-20 h-1.5 rounded-full bg-border overflow-hidden hidden sm:block">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        topic.masteryLevel >= 80
                          ? "#10b981"
                          : topic.masteryLevel >= 50
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${topic.masteryLevel}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                  {topic.masteryLevel}%
                </span>
                <TrendingUp className="h-3 w-3 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
