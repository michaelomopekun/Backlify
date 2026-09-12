import { Suspense } from "react";
import { Metadata } from "next";
import { VercelAuthPreview } from "@/components/auth/vercel-auth-preview";

export const metadata: Metadata = {
  title: "Sign up - Backlify",
  description: "Create your Backlify account. Automated PostgreSQL backups and instant disaster recovery are just a sign-up away.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <VercelAuthPreview initialMode="signup" />
    </Suspense>
  );
}
