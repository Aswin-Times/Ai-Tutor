// ============================================
// EduNex AI Tutor - Landing / Onboarding Page
// ============================================

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen,
  Brain,
  Target,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InterestSelector } from "@/features/interest-engine/interest-selector";
import { useUserStore } from "@/store/user-store";

type Step = "welcome" | "signup" | "interests" | "ready";

export default function LandingPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    hasOnboarded,
    interests,
    login,
    completeOnboarding,
  } = useUserStore();

  const [step, setStep] = useState<Step>(
    isAuthenticated && hasOnboarded ? "ready" : "welcome"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // If already onboarded, redirect to chat
  React.useEffect(() => {
    if (isAuthenticated && hasOnboarded) {
      router.push("/chat");
    }
  }, [isAuthenticated, hasOnboarded, router]);

  const handleSignup = () => {
    if (name.trim() && email.trim()) {
      login(name, email);
      setStep("interests");
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-t from-pink-500/5 to-transparent rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <WelcomeStep key="welcome" onNext={() => setStep("signup")} />
          )}

          {step === "signup" && (
            <SignupStep
              key="signup"
              name={name}
              email={email}
              setName={setName}
              setEmail={setEmail}
              onSubmit={handleSignup}
            />
          )}

          {step === "interests" && (
            <InterestsStep
              key="interests"
              selectedCount={interests.length}
              onNext={() => setStep("ready")}
            />
          )}

          {step === "ready" && (
            <ReadyStep key="ready" onStart={handleComplete} />
          )}
        </AnimatePresence>
      </div>

      {/* Step Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {(["welcome", "signup", "interests", "ready"] as Step[]).map(
          (s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-primary"
                  : (["welcome", "signup", "interests", "ready"] as Step[]).indexOf(s) <
                    (["welcome", "signup", "interests", "ready"] as Step[]).indexOf(step)
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-border"
              }`}
            />
          )
        )}
      </div>
    </div>
  );
}

// ── Step Components ──────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  const features = [
    {
      icon: Target,
      title: "Interest-Based",
      desc: "We adapt explanations to what you love",
    },
    {
      icon: Zap,
      title: "Instant Learning",
      desc: "Get answers that actually click",
    },
    {
      icon: Brain,
      title: "AI-Powered",
      desc: "Smart tutor that knows your style",
    },
    {
      icon: BookOpen,
      title: "All Subjects",
      desc: "From physics to philosophy",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-2xl"
    >
      {/* Logo */}
      <motion.div
        className="mx-auto h-24 w-24 rounded-3xl bg-gradient-primary flex items-center justify-center mb-8 shadow-2xl"
        animate={{
          boxShadow: [
            "0 0 40px rgba(124, 58, 237, 0.3)",
            "0 0 80px rgba(124, 58, 237, 0.5)",
            "0 0 40px rgba(124, 58, 237, 0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="h-12 w-12 text-white" />
      </motion.div>

      <motion.h1
        className="text-5xl sm:text-6xl font-extrabold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Learn Through{" "}
        <span className="text-gradient">What You Love</span>
      </motion.h1>

      <motion.p
        className="text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        EduNex AI adapts every explanation to your passions — gaming, cricket,
        music, or anything else. Learning finally feels personal.
      </motion.p>

      {/* Feature cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="glass rounded-xl p-4 text-center"
          >
            <f.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-sm font-semibold text-foreground">{f.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          size="lg"
          onClick={onNext}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          className="text-base px-8"
        >
          Get Started Free
        </Button>
      </motion.div>
    </motion.div>
  );
}

function SignupStep({
  name,
  email,
  setName,
  setEmail,
  onSubmit,
}: {
  name: string;
  email: string;
  setName: (v: string) => void;
  setEmail: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="glass rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Create Your Account
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us about yourself to personalize your experience
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            onClick={onSubmit}
            className="w-full"
            size="lg"
            disabled={!name.trim() || !email.trim()}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Continue
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </motion.div>
  );
}

function InterestsStep({
  selectedCount,
  onNext,
}: {
  selectedCount: number;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          What Do You <span className="text-gradient">Love</span>?
        </h2>
        <p className="text-muted-foreground">
          We&apos;ll use your interests to make learning relatable and fun
        </p>
      </div>

      <div className="glass rounded-2xl p-8">
        <InterestSelector maxSelections={5} />

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={onNext}
            disabled={selectedCount === 0}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {selectedCount === 0
              ? "Select at least one interest"
              : `Continue with ${selectedCount} interest${selectedCount > 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ReadyStep({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="text-center max-w-md"
    >
      <motion.div
        className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-2xl shadow-green-500/30"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <Zap className="h-10 w-10 text-white" />
      </motion.div>

      <h2 className="text-3xl font-bold text-foreground mb-3">
        You&apos;re All Set! 🎉
      </h2>
      <p className="text-muted-foreground mb-8 leading-relaxed">
        Your AI tutor is ready. Ask any question and watch as it gets explained
        through your passions.
      </p>

      <Button
        size="lg"
        onClick={onStart}
        rightIcon={<Sparkles className="h-4 w-4" />}
        className="text-base px-8"
      >
        Start Learning
      </Button>
    </motion.div>
  );
}
