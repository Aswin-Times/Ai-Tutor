// ============================================
// EduNex AI Tutor - Progress Chart Component
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WeeklyActivity } from "@/types";
import { Card, CardHeader } from "@/components/ui/card";

interface ProgressChartProps {
  data: WeeklyActivity[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <Card variant="default">
      <CardHeader
        title="Weekly Activity"
        subtitle="Messages & study time this week"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="h-[280px] -mx-2"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#fafafa",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="messages"
              stroke="#7c3aed"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMessages)"
              name="Messages"
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMinutes)"
              name="Minutes"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
}
