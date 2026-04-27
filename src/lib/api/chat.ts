// ============================================
// EduNex AI Tutor - Mock Chat API
// ============================================

import { ChatCompletionResponse, ChatRequest, Interest } from "@/types";
import { delay } from "@/lib/utils";
import { getInterestOption } from "@/lib/constants";

/**
 * Interest-based response templates.
 * Each interest has tailored explanations that make learning relatable.
 */
const INTEREST_RESPONSES: Record<Interest, string[]> = {
  gaming: [
    "Think of it like leveling up in an RPG 🎮 — each new concept is a skill tree branch. You start with the basics (Level 1), and as you master them, you unlock more advanced abilities. Right now, you're grinding XP on the fundamentals, and once you've got enough, you'll unlock the boss-level concepts!",
    "Imagine this concept as a game mechanic 🎮. Just like how in Minecraft you need to mine basic resources before crafting advanced items, this topic builds on foundational knowledge. The 'crafting recipe' here is: understand the inputs, process them, and you get a powerful output!",
    "Let's think of this like a multiplayer strategy game 🎮. Each component works like a team member with a specific role — tank, healer, DPS. When they work together in sync, you clear the dungeon (solve the problem). If one is missing, the whole team struggles.",
  ],
  cricket: [
    "Think of this like a cricket match 🏏 — the concept is your batting technique. You start in the nets (practice), work on your stance and timing, and gradually face faster bowlers. Each 'over' of practice makes you more confident for the real match!",
    "Imagine you're a cricket captain 🏏 setting the field. Each element of this topic is like a fielder — they each have a position and purpose. When placed correctly, they work together to take wickets (achieve the goal). Strategy is everything!",
    "This is like reading a bowler's delivery 🏏. At first, every ball looks the same. But with practice, you start spotting the seam position, the wrist angle, and predict whether it'll swing or spin. Pattern recognition is the key skill here!",
  ],
  music: [
    "Think of this concept like composing a song 🎵. You start with a melody (the main idea), add harmony (supporting concepts), then rhythm (the structure that holds it all together). Each layer makes the piece richer and more complete!",
    "Imagine learning this topic like learning an instrument 🎵. Day one, you can barely play a scale. But with consistent practice, muscle memory kicks in and suddenly you're playing complex pieces without thinking about individual notes. That's mastery!",
    "This works like a symphony orchestra 🎵 — every section (strings, brass, woodwinds, percussion) plays a different part. Individually they sound incomplete, but together they create something magnificent. Each concept here is one section of your orchestra!",
  ],
  coding: [
    "Think of this like writing clean code 💻. The concept is essentially an algorithm — it takes inputs, processes them through a series of logical steps, and produces an output. If you can write pseudocode for it, you understand it!",
    "Imagine this as a design pattern 💻. Just like how MVC separates concerns in software, this topic separates complex ideas into manageable layers. Each layer has a single responsibility, making the whole system easier to understand and maintain.",
    "This is like debugging a program 💻. When something doesn't work, you don't panic — you trace through the logic step by step, check your variables (assumptions), and find where the bug (misunderstanding) is hiding. Systematic thinking is your debugger!",
  ],
  movies: [
    "Think of this like a movie plot 🎬. Every great story has three acts: Setup (introduction), Confrontation (the complexity), and Resolution (understanding). Right now we're in Act 1, building the world. The exciting plot twists come next!",
    "Imagine this concept as a Christopher Nolan film 🎬 — it might seem complex with multiple timelines (layers), but once you see the connecting thread, everything clicks into place. The 'inception' moment is when you see how all the layers relate!",
    "This is like character development in a great movie 🎬. At first, the protagonist seems simple. But as the story unfolds, you see depth, motivations, and connections you didn't expect. This topic has the same kind of rewarding depth!",
  ],
  cooking: [
    "Think of this like following a recipe 🍳. You gather your ingredients (prerequisites), follow the steps in order (methodology), and with the right timing and technique, you get a delicious result (understanding)! Mise en place is everything.",
    "Imagine this concept as a layered cake 🍳. Each layer needs to set properly before you add the next one. Rush it, and the whole thing collapses. Take it step by step, and you build something impressive that holds together beautifully.",
    "This is like understanding flavor profiles 🍳. Sweet, salty, sour, bitter, umami — each element plays a role. Too much of one throws everything off balance. This topic works the same way: it's about finding the right balance of components.",
  ],
  sports: [
    "Think of this like training for a championship ⚽. You don't just show up on game day — you drill fundamentals, study plays, build fitness. Each practice session (study session) compounds, and eventually you perform under pressure without thinking!",
    "Imagine this as a team formation ⚽. Each concept is a player with a specific position and role. The formation (framework) determines how they interact. A great coach (you!) knows how to arrange them for maximum effectiveness.",
    "This is like watching game film ⚽. The first time, you see chaos. The second time, you notice patterns. By the third viewing, you can predict plays before they happen. Repetition reveals structure — that's how this topic works too!",
  ],
  art: [
    "Think of this like creating a painting 🎨. You start with a sketch (outline), then add layers of color (details), and finally the finishing touches (nuance). Each layer builds on the last, transforming a blank canvas into a masterpiece!",
    "Imagine this concept as color theory 🎨. Primary colors combine to create secondaries, which combine further. The complexity emerges from simple building blocks. Understanding the 'primary colors' of this topic lets you mix any shade of understanding!",
    "This is like learning perspective drawing 🎨. At first, everything looks flat and confusing. But once you understand vanishing points and horizon lines, suddenly you can create depth from a 2D surface. One key insight changes everything!",
  ],
  science: [
    "Think of this like a scientific experiment 🔬. We start with a hypothesis (question), design an experiment (methodology), collect data (learn the details), and draw conclusions. The scientific method IS the learning method!",
    "Imagine this at the atomic level 🔬. Just like how all matter is made of atoms with protons, neutrons, and electrons, this complex topic is built from fundamental particles (core concepts). Understand the atoms, understand everything built from them!",
    "This is like evolution 🔬 — simple organisms became complex through iteration and adaptation. This topic started as a simple idea and evolved through contribution and refinement into something sophisticated. Understanding its 'fossil record' reveals the whole picture!",
  ],
  travel: [
    "Think of this like planning a trip ✈️. You start with a destination (goal), plan your route (methodology), pack essentials (prerequisites), and the journey itself is where the real learning happens. Sometimes the detours teach you the most!",
    "Imagine exploring a new city ✈️. At first, every street looks unfamiliar. But as you walk around, you build a mental map. Landmarks (key concepts) become anchors, and soon you're navigating confidently. You're building your mental map right now!",
    "This is like learning a new language while traveling ✈️. Immersion is the fastest teacher. You won't understand everything immediately, but context fills in gaps. Each interaction (each example) adds vocabulary to your understanding!",
  ],
};

/** Pick a random interest-tailored response */
function getInterestResponse(interest: Interest): string {
  const responses = INTEREST_RESPONSES[interest];
  return responses[Math.floor(Math.random() * responses.length)];
}

/** Detect which interest might be relevant to the user's question */
function detectInterest(
  message: string,
  userInterests: Interest[]
): Interest | undefined {
  if (userInterests.length === 0) return undefined;

  // Simple keyword matching — in production this would be an ML model
  const keywords: Record<Interest, string[]> = {
    gaming: ["game", "play", "level", "score", "character", "quest"],
    cricket: ["cricket", "bat", "bowl", "wicket", "run", "match", "team"],
    music: ["music", "song", "note", "rhythm", "melody", "instrument"],
    coding: ["code", "program", "function", "algorithm", "variable", "loop"],
    movies: ["movie", "film", "scene", "actor", "story", "plot"],
    cooking: ["cook", "recipe", "food", "ingredient", "bake", "kitchen"],
    sports: ["sport", "goal", "team", "win", "train", "exercise"],
    art: ["art", "draw", "paint", "design", "color", "creative"],
    science: ["science", "experiment", "theory", "hypothesis", "atom"],
    travel: ["travel", "trip", "country", "city", "explore", "adventure"],
  };

  for (const interest of userInterests) {
    if (
      keywords[interest]?.some((kw) => message.toLowerCase().includes(kw))
    ) {
      return interest;
    }
  }

  // Default to the user's primary interest
  return userInterests[0];
}

/**
 * Mock chat completion API.
 * Simulates an AI response tailored to user interests.
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatCompletionResponse> {
  // Simulate network delay
  await delay(800 + Math.random() * 1200);

  const detectedInterest = detectInterest(
    request.message,
    request.interests
  );

  const interestLabel = detectedInterest
    ? getInterestOption(detectedInterest)
    : null;

  let response: string;

  if (detectedInterest) {
    const interestResponse = getInterestResponse(detectedInterest);
    response = `Great question! Let me explain this in a way that connects to your love of **${interestLabel?.label}** ${interestLabel?.emoji}:\n\n${interestResponse}\n\nWould you like me to dive deeper into any part of this explanation?`;
  } else {
    response = `That's a wonderful question! Let me break this down step by step:\n\n1. **The Foundation**: Every complex idea starts with simple building blocks. Let's identify those first.\n\n2. **The Connections**: Once you see the building blocks, notice how they connect and interact with each other.\n\n3. **The Big Picture**: Step back and see how all the pieces form the complete concept.\n\nWant me to connect this to any of your interests to make it more relatable?`;
  }

  return {
    message: response,
    detectedInterest,
    suggestedTopics: [
      "Explain further with examples",
      "Give me a practice problem",
      "How does this connect to real life?",
    ],
  };
}

/**
 * Mock streaming chat API.
 * Returns an async iterator of string chunks.
 */
export async function* streamChatMessage(
  request: ChatRequest
): AsyncGenerator<{ chunk: string; done: boolean; detectedInterest?: Interest }> {
  const fullResponse = await sendChatMessage(request);
  const text = fullResponse.message;

  // Stream character by character with variable speed
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Slower at sentence boundaries for natural feel
    const delayMs = ['.', '!', '?', '\n'].includes(char) ? 60 : 15 + Math.random() * 10;
    await delay(delayMs);

    yield {
      chunk: char,
      done: i === text.length - 1,
      detectedInterest: i === text.length - 1 ? fullResponse.detectedInterest : undefined,
    };
  }
}
