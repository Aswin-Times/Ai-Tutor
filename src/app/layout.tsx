// ============================================
// EduNex AI Tutor - Root Layout
// ============================================

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/providers";

export const metadata: Metadata = {
  title: "EduNex AI — Adaptive Interest-Based Learning",
  description:
    "Learn any topic through your passions. EduNex AI adapts explanations to your interests — gaming, cricket, music, coding, and more.",
  keywords: [
    "AI tutor",
    "adaptive learning",
    "interest-based",
    "education",
    "personalized",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
