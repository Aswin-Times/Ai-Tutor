// ============================================
// EduNex AI Tutor - Utility Functions
// ============================================

import { type ClassValue, clsx } from "clsx";

/** Merge Tailwind class names with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  // Simple implementation without tailwind-merge to avoid extra dependency
  return clsx(inputs);
}

/** Generate a unique ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Format a date to a readable string */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Format minutes to hours and minutes */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/** Delay helper for simulating async operations */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/** Capitalize the first letter of a string */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Get initials from a name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Simulate streaming text (character by character) */
export async function* streamText(
  text: string,
  delayMs: number = 20
): AsyncGenerator<string> {
  for (let i = 0; i < text.length; i++) {
    yield text[i];
    await delay(delayMs);
  }
}
