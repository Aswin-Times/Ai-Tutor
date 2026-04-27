// ============================================
// EduNex AI Tutor - Chat Input Component
// ============================================

"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isDisabled = false,
  placeholder = "Ask me anything... I'll explain using your interests!",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isDisabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  };

  const suggestedQuestions = [
    "Explain photosynthesis",
    "What is recursion?",
    "How does gravity work?",
    "Teach me about DNA",
  ];

  return (
    <div className="border-t border-border bg-card/50 backdrop-blur-xl p-4">
      {/* Suggested Questions (show when empty) */}
      {!value && !isDisabled && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-3"
        >
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => {
                setValue(q);
                textareaRef.current?.focus();
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground 
                         hover:text-foreground hover:border-purple-500/40 hover:bg-purple-500/5 
                         transition-all duration-200"
            >
              {q}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-200">
            <Sparkles className="h-4 w-4 text-primary shrink-0 opacity-60" />
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={placeholder}
              disabled={isDisabled}
              rows={1}
              className={cn(
                "flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none min-h-[24px] max-h-[160px] py-1",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>
        </div>

        {/* Send Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={!value.trim() || isDisabled}
          className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0",
            value.trim() && !isDisabled
              ? "bg-gradient-primary text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              : "bg-secondary text-muted-foreground"
          )}
          whileHover={value.trim() ? { scale: 1.05 } : {}}
          whileTap={value.trim() ? { scale: 0.95 } : {}}
        >
          <Send className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
