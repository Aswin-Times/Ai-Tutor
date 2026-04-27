// ============================================
// EduNex AI Tutor - Mock User API
// ============================================

import {
  UserProfile,
  LearnedTopic,
  LearningStats,
  Interest,
  ApiResponse,
} from "@/types";
import { delay, generateId } from "@/lib/utils";

/** Mock user profile data */
const MOCK_USER: UserProfile = {
  id: "user-001",
  name: "Aswin R",
  email: "aswin@edunex.ai",
  interests: [],
  learningStyle: "visual",
  joinedAt: new Date("2025-01-15"),
};

/** Mock learned topics */
const MOCK_TOPICS: LearnedTopic[] = [
  {
    id: generateId(),
    name: "Newton's Laws of Motion",
    category: "Physics",
    masteryLevel: 85,
    lastStudied: new Date("2026-04-25"),
    interest: "cricket",
  },
  {
    id: generateId(),
    name: "Binary Search Algorithm",
    category: "Computer Science",
    masteryLevel: 92,
    lastStudied: new Date("2026-04-26"),
    interest: "gaming",
  },
  {
    id: generateId(),
    name: "Photosynthesis",
    category: "Biology",
    masteryLevel: 78,
    lastStudied: new Date("2026-04-24"),
    interest: "cooking",
  },
  {
    id: generateId(),
    name: "Supply and Demand",
    category: "Economics",
    masteryLevel: 70,
    lastStudied: new Date("2026-04-23"),
    interest: "gaming",
  },
  {
    id: generateId(),
    name: "Pythagorean Theorem",
    category: "Mathematics",
    masteryLevel: 95,
    lastStudied: new Date("2026-04-26"),
    interest: "sports",
  },
  {
    id: generateId(),
    name: "Cell Division (Mitosis)",
    category: "Biology",
    masteryLevel: 65,
    lastStudied: new Date("2026-04-22"),
    interest: "science",
  },
  {
    id: generateId(),
    name: "World War II Overview",
    category: "History",
    masteryLevel: 80,
    lastStudied: new Date("2026-04-21"),
    interest: "movies",
  },
  {
    id: generateId(),
    name: "Chemical Bonding",
    category: "Chemistry",
    masteryLevel: 73,
    lastStudied: new Date("2026-04-20"),
    interest: "cooking",
  },
];

/** Mock learning statistics */
const MOCK_STATS: LearningStats = {
  totalTopics: 24,
  totalMessages: 342,
  streakDays: 12,
  totalStudyMinutes: 1860,
  weeklyActivity: [
    { day: "Mon", messages: 18, minutes: 45 },
    { day: "Tue", messages: 24, minutes: 62 },
    { day: "Wed", messages: 12, minutes: 30 },
    { day: "Thu", messages: 32, minutes: 78 },
    { day: "Fri", messages: 28, minutes: 55 },
    { day: "Sat", messages: 42, minutes: 95 },
    { day: "Sun", messages: 35, minutes: 80 },
  ],
  topInterests: [
    { interest: "gaming", topicCount: 8, percentage: 33 },
    { interest: "cricket", topicCount: 5, percentage: 21 },
    { interest: "music", topicCount: 4, percentage: 17 },
    { interest: "coding", topicCount: 4, percentage: 17 },
    { interest: "movies", topicCount: 3, percentage: 12 },
  ],
};

/** Fetch user profile */
export async function fetchUserProfile(): Promise<ApiResponse<UserProfile>> {
  await delay(500);
  return { data: MOCK_USER, success: true };
}

/** Update user profile */
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<ApiResponse<UserProfile>> {
  await delay(400);
  const updated = { ...MOCK_USER, ...updates };
  return { data: updated, success: true };
}

/** Update user interests */
export async function updateUserInterests(
  interests: Interest[]
): Promise<ApiResponse<{ interests: Interest[] }>> {
  await delay(300);
  return { data: { interests }, success: true };
}

/** Fetch learned topics */
export async function fetchLearnedTopics(): Promise<
  ApiResponse<LearnedTopic[]>
> {
  await delay(600);
  return { data: MOCK_TOPICS, success: true };
}

/** Fetch learning statistics */
export async function fetchLearningStats(): Promise<
  ApiResponse<LearningStats>
> {
  await delay(500);
  return { data: MOCK_STATS, success: true };
}
