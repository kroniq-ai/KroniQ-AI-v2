"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getPilotLoginHref } from "@/lib/app-url";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children?: React.ReactNode;
  nextPath?: string;
  onClick?: () => void;
};

/** Pilot sign-in — marketing `/login` with brief loading state before navigation. */
export function PilotLoginLink({ className, children, nextPath, onClick }: Props) {
  const router = useRouter();
  const href = getPilotLoginHref(nextPath);
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      className={cn(className, loading && "pointer-events-none opacity-80")}
      onClick={() => {
        onClick?.();
        setLoading(true);
        router.push(href);
      }}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
          Opening sign in…
        </span>
      ) : (
        (children ?? "Already invited? Sign in")
      )}
    </button>
  );
}
