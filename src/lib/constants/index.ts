// ============================================
// EduNex AI Tutor - Application Constants
// ============================================

import { InterestOption, Interest } from "@/types";

/** All available interest options with metadata */
export const INTEREST_OPTIONS: InterestOption[] = [
  {
    id: "gaming",
    label: "Gaming",
    emoji: "🎮",
    color: "#8B5CF6",
    description: "Learn through gaming analogies and examples",
  },
  {
    id: "cricket",
    label: "Cricket",
    emoji: "🏏",
    color: "#10B981",
    description: "Understand concepts with cricket references",
  },
  {
    id: "music",
    label: "Music",
    emoji: "🎵",
    color: "#EC4899",
    description: "Connect ideas through musical concepts",
  },
  {
    id: "coding",
    label: "Coding",
    emoji: "💻",
    color: "#3B82F6",
    description: "Technical examples with code snippets",
  },
  {
    id: "movies",
    label: "Movies",
    emoji: "🎬",
    color: "#F59E0B",
    description: "Movie scenes and storytelling analogies",
  },
  {
    id: "cooking",
    label: "Cooking",
    emoji: "🍳",
    color: "#EF4444",
    description: "Recipe-style step-by-step explanations",
  },
  {
    id: "sports",
    label: "Sports",
    emoji: "⚽",
    color: "#06B6D4",
    description: "Sports strategy and teamwork analogies",
  },
  {
    id: "art",
    label: "Art & Design",
    emoji: "🎨",
    color: "#F97316",
    description: "Visual and creative explanations",
  },
  {
    id: "science",
    label: "Science",
    emoji: "🔬",
    color: "#14B8A6",
    description: "Scientific method and experiment-based learning",
  },
  {
    id: "travel",
    label: "Travel",
    emoji: "✈️",
    color: "#6366F1",
    description: "World exploration and geography connections",
  },
];

/** Get interest option by ID */
export const getInterestOption = (id: Interest): InterestOption | undefined =>
  INTEREST_OPTIONS.find((opt) => opt.id === id);

/** Navigation items for the sidebar */
export const NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: "MessageSquare" },
  { href: "/progress", label: "Progress", icon: "BarChart3" },
  { href: "/profile", label: "Profile", icon: "User" },
] as const;

/** App metadata */
export const APP_NAME = "EduNex AI";
export const APP_DESCRIPTION =
  "Adaptive Interest-Based Learning Platform — Learn any topic through your passions.";
export const APP_VERSION = "1.0.0";
