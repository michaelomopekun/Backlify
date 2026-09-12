import { Suspense } from "react";
import { Metadata } from "next";
import { VercelAuthPreview } from "@/components/auth/vercel-auth-preview";

export const metadata: Metadata = {
  title: "Log in - Backlify",
  description: "Sign in to your Backlify account to access your automated PostgreSQL disaster recovery and backup management.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <VercelAuthPreview initialMode="login" />
    </Suspense>
  );
}
