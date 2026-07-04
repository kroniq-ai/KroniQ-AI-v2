import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { PasswordAuthForm } from "@/components/auth/PasswordAuthForm";

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Sign in"
      subtitle="Enter the email and password we sent your team when you were invited to the pilot."
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white/5" />}>
        <PasswordAuthForm />
      </Suspense>
    </AuthPageShell>
  );
}
