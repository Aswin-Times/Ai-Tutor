// ============================================
// EduNex AI Tutor - Message Bubble Component
// ============================================

"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChatMessage } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { getInterestOption } from "@/lib/constants";
import { useUserStore } from "@/store/user-store";

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  const { profile } = useUserStore();
  const isUser = message.role === "user";
  const interestOption = message.detectedInterest
    ? getInterestOption(message.detectedInterest)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className={cn("flex items-start gap-3 px-4 py-2", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar name={profile?.name || "You"} size="sm" />
      ) : (
        <Avatar isAI size="sm" />
      )}

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[75%] space-y-2",
          isUser && "flex flex-col items-end"
        )}
      >
        {/* Interest Tag */}
        {interestOption && !isUser && (
          <Badge variant="interest" color={interestOption.color}>
            Explained via {interestOption.label} {interestOption.emoji}
          </Badge>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-gradient-primary text-white rounded-tr-md"
              : "glass rounded-tl-md"
          )}
        >
          {/* Render message content with basic formatting */}
          <div className={cn(!isUser && "prose-chat")}>
            {message.content.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={j} className={cn(!isUser && "text-primary", isUser && "text-white font-semibold")}>
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return <span key={j}>{part}</span>;
                })}
                {i < message.content.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
            {/* Streaming cursor */}
            {message.isStreaming && (
              <motion.span
                className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground px-1">
          {formatDate(new Date(message.timestamp))}
        </p>
      </div>
    </motion.div>
  );
}
