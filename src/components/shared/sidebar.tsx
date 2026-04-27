// ============================================
// EduNex AI Tutor - Sidebar Component
// ============================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  BarChart3,
  User,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import { useChatStore } from "@/store/chat-store";
import { useUserStore } from "@/store/user-store";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const iconMap = {
  MessageSquare,
  BarChart3,
  User,
} as const;

const NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: "MessageSquare" as const },
  { href: "/progress", label: "Progress", icon: "BarChart3" as const },
  { href: "/profile", label: "Profile", icon: "User" as const },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { sessions, activeSessionId, createSession, setActiveSession, deleteSession } =
    useChatStore();
  const { profile, logout } = useUserStore();

  const handleNewChat = () => {
    createSession();
  };

  return (
    <motion.aside
      className={cn(
        "h-screen flex flex-col border-r border-border bg-card/50 backdrop-blur-xl",
        "transition-all duration-300 relative z-20"
      )}
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="h-9 w-9 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-lg font-bold text-gradient">EduNex AI</h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pt-4 pb-2 shrink-0">
        <Button
          variant="outline"
          size={isCollapsed ? "icon" : "md"}
          onClick={handleNewChat}
          className="w-full border-dashed border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/5"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          {!isCollapsed && "New Chat"}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2 space-y-1 shrink-0">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-4 py-2 shrink-0">
        <div className="h-px bg-border" />
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-1 min-h-0">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                Recent Chats
              </p>
              {sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-4">
                  No conversations yet. Start one!
                </p>
              ) : (
                <div className="space-y-0.5">
                  {sessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={cn(
                        "group flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200",
                        session.id === activeSessionId
                          ? "bg-white/5 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )}
                      onClick={() => setActiveSession(session.id)}
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
                      <span className="flex-1 truncate text-xs">
                        {truncate(session.title, 28)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Section */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar name={profile?.name || "User"} size="sm" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.name || "Guest"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email || "Sign in to save progress"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-30"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  );
}
