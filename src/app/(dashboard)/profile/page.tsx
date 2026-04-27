// ============================================
// EduNex AI Tutor - Profile Page
// ============================================

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Palette,
  Save,
  Check,
  BookOpen,
  Eye,
  Headphones,
  Hand,
} from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { InterestSelector } from "@/features/interest-engine/interest-selector";
import { getInterestOption } from "@/lib/constants";
import { LearningStyle } from "@/types";
import { cn } from "@/lib/utils";

const LEARNING_STYLES: {
  id: LearningStyle;
  label: string;
  icon: typeof Eye;
  description: string;
}[] = [
  {
    id: "visual",
    label: "Visual",
    icon: Eye,
    description: "Diagrams, charts, and visual aids",
  },
  {
    id: "auditory",
    label: "Auditory",
    icon: Headphones,
    description: "Explanations and verbal descriptions",
  },
  {
    id: "reading",
    label: "Reading",
    icon: BookOpen,
    description: "Text-based learning and notes",
  },
  {
    id: "kinesthetic",
    label: "Kinesthetic",
    icon: Hand,
    description: "Hands-on examples and practice",
  },
];

export default function ProfilePage() {
  const {
    profile,
    interests,
    updateName,
    updateEmail,
    setLearningStyle,
  } = useUserStore();

  const [saved, setSaved] = useState(false);
  const [editName, setEditName] = useState(profile?.name || "");
  const [editEmail, setEditEmail] = useState(profile?.email || "");

  const handleSave = () => {
    updateName(editName);
    updateEmail(editEmail);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account and learning preferences
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="default">
              <CardHeader title="Personal Information" />

              {/* Avatar section */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <Avatar name={profile?.name || "User"} size="lg" />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {profile?.name || "Guest User"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email || "No email set"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {interests.slice(0, 4).map((i) => {
                      const opt = getInterestOption(i);
                      return opt ? (
                        <Badge
                          key={i}
                          variant="interest"
                          color={opt.color}
                        >
                          {opt.emoji} {opt.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Edit fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  leftIcon={<User className="h-4 w-4" />}
                />
                <Input
                  label="Email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSave}
                  leftIcon={
                    saved ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )
                  }
                  variant={saved ? "secondary" : "primary"}
                >
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Learning Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="default">
              <CardHeader
                title="Learning Style"
                subtitle="How do you learn best?"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LEARNING_STYLES.map((style) => {
                  const isActive =
                    profile?.learningStyle === style.id;
                  return (
                    <motion.button
                      key={style.id}
                      onClick={() => setLearningStyle(style.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                        isActive
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                          : "border-border bg-card hover:border-white/20"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <style.icon
                        className={cn(
                          "h-6 w-6",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isActive
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {style.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground text-center">
                        {style.description}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Interest Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="default">
              <CardHeader
                title="Interest Preferences"
                subtitle="Update your interests to change how EduNex explains topics"
                action={
                  <Badge variant="primary">
                    <Palette className="h-3 w-3" />
                    {interests.length} selected
                  </Badge>
                }
              />
              <InterestSelector compact maxSelections={5} />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
