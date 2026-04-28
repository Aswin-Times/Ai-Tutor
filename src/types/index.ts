// ============================================
// EduNex AI Tutor - Core Type Definitions
// ============================================

/** Available interest categories for adaptive learning */
export type Interest =
  | "gaming"
  | "cricket"
  | "music"
  | "coding"
  | "movies"
  | "cooking"
  | "sports"
  | "art"
  | "science"
  | "travel";

/** Metadata for each interest option */
export interface InterestOption {
  id: Interest;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

/** Roles in a chat conversation */
export type MessageRole = "user" | "assistant" | "system";

/** A single chat message */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  /** Which interest was used to tailor this response */
  detectedInterest?: Interest;
  /** Whether the message is still being streamed */
  isStreaming?: boolean;
}

/** A chat conversation/session */
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/** User profile data */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  interests: Interest[];
  learningStyle: LearningStyle;
  joinedAt: Date;
}

/** Supported learning styles */
export type LearningStyle = "visual" | "auditory" | "reading" | "kinesthetic";

/** A topic the user has learned */
export interface LearnedTopic {
  id: string;
  name: string;
  category: string;
  masteryLevel: number; // 0-100
  lastStudied: Date;
  interest: Interest;
}

/** Learning statistics for the progress dashboard */
export interface LearningStats {
  totalTopics: number;
  totalMessages: number;
  streakDays: number;
  totalStudyMinutes: number;
  weeklyActivity: WeeklyActivity[];
  topInterests: InterestStat[];
}

/** Daily activity data */
export interface WeeklyActivity {
  day: string;
  messages: number;
  minutes: number;
}

/** Statistics per interest */
export interface InterestStat {
  interest: Interest;
  topicCount: number;
  percentage: number;
}

/** API response wrapper */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

/** Chat completion request */
export interface ChatRequest {
  message: string;
  sessionId: string;
  interests: Interest[];
  userId?: string;
}

/** Chat completion response */
export interface ChatCompletionResponse {
  message: string;
  detectedInterest?: Interest;
  suggestedTopics?: string[];
}
