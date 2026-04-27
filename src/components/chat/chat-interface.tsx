// ============================================
// EduNex AI Tutor - Chat Interface (Main)
// ============================================

"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, BookOpen, Brain } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import { useUserStore } from "@/store/user-store";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { Badge } from "@/components/ui/badge";
import { getInterestOption } from "@/lib/constants";

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { sessions, activeSessionId, isGenerating, error, sendMessage, clearError } =
    useChatStore();
  const { interests } = useUserStore();

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = useMemo(() => activeSession?.messages || [], [activeSession?.messages]);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content, interests);
    },
    [sendMessage, interests]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0 bg-card/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {activeSession?.title || "EduNex AI Tutor"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {interests.length > 0
                ? `Adapting to: ${interests.map((i) => getInterestOption(i)?.emoji).join(" ")}`
                : "Select interests for personalized learning"}
            </p>
          </div>
        </div>

        {/* Active interests badges */}
        <div className="hidden md:flex items-center gap-1.5">
          {interests.slice(0, 3).map((interest) => {
            const opt = getInterestOption(interest);
            return opt ? (
              <Badge key={interest} variant="interest" color={opt.color}>
                {opt.emoji} {opt.label}
              </Badge>
            ) : null;
          })}
          {interests.length > 3 && (
            <Badge variant="default">+{interests.length - 3}</Badge>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto scrollbar-hide min-h-0"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="py-4 space-y-1">
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center px-4 py-3"
                >
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2 text-sm text-destructive flex items-center gap-2">
                    <span>{error}</span>
                    <button
                      onClick={clearError}
                      className="text-xs underline hover:no-underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isDisabled={isGenerating} />
    </div>
  );
}

/** Empty state shown when no messages exist */
function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md px-6 py-16"
      >
        {/* Animated logo */}
        <motion.div
          className="mx-auto h-20 w-20 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30"
          animate={{
            boxShadow: [
              "0 0 30px rgba(124, 58, 237, 0.3)",
              "0 0 60px rgba(124, 58, 237, 0.5)",
              "0 0 30px rgba(124, 58, 237, 0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="h-10 w-10 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome to <span className="text-gradient">EduNex AI</span>
        </h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          I adapt my explanations to your interests. Ask me anything, and I&apos;ll
          explain it through the lens of what you love!
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Zap, label: "Adaptive", desc: "Personalized explanations" },
            { icon: BookOpen, label: "Any Topic", desc: "All subjects covered" },
            { icon: Brain, label: "Smart", desc: "Learns your style" },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="glass rounded-xl p-3 text-center"
            >
              <feature.icon className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <p className="text-xs font-medium text-foreground">
                {feature.label}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
