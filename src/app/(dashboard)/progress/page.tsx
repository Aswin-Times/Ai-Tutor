// ============================================
// EduNex AI Tutor - Progress Dashboard Page
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  MessageSquare,
  Flame,
  Clock,
  Loader2,
} from "lucide-react";
import { fetchLearningStats, fetchLearnedTopics } from "@/lib/api/user";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { InterestProfile } from "@/components/dashboard/interest-profile";
import { TopicsList } from "@/components/dashboard/topics-list";
import { formatDuration } from "@/lib/utils";

export default function ProgressPage() {
  const {
    data: statsResponse,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["learning-stats"],
    queryFn: fetchLearningStats,
  });

  const {
    data: topicsResponse,
    isLoading: topicsLoading,
  } = useQuery({
    queryKey: ["learned-topics"],
    queryFn: fetchLearnedTopics,
  });

  const stats = statsResponse?.data;
  const topics = topicsResponse?.data || [];

  if (statsLoading || topicsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Learning Progress
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your growth and see how far you&apos;ve come
          </p>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Topics Learned"
              value={stats.totalTopics}
              subtitle="across all subjects"
              icon={BookOpen}
              color="#7c3aed"
              index={0}
            />
            <StatsCard
              title="Messages Sent"
              value={stats.totalMessages}
              subtitle="questions asked"
              icon={MessageSquare}
              color="#3b82f6"
              index={1}
            />
            <StatsCard
              title="Day Streak"
              value={stats.streakDays}
              subtitle="keep it going! 🔥"
              icon={Flame}
              color="#f59e0b"
              index={2}
            />
            <StatsCard
              title="Study Time"
              value={formatDuration(stats.totalStudyMinutes)}
              subtitle="total learning time"
              icon={Clock}
              color="#10b981"
              index={3}
            />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3">
            {stats && <ProgressChart data={stats.weeklyActivity} />}
          </div>
          <div className="lg:col-span-2">
            {stats && <InterestProfile data={stats.topInterests} />}
          </div>
        </div>

        {/* Topics List */}
        <TopicsList topics={topics} />
      </div>
    </div>
  );
}
