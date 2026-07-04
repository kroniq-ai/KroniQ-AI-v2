"use client";

import Link from "next/link";
import { getPilotLoginHref } from "@/lib/app-url";

type Props = {
  className?: string;
  children?: React.ReactNode;
  nextPath?: string;
  onClick?: () => void;
};

/** Pilot sign-in — marketing `/login` (glass auth shell). */
export function PilotLoginLink({ className, children, nextPath, onClick }: Props) {
  const href = getPilotLoginHref(nextPath);
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children ?? "Already invited? Sign in"}
    </Link>
  );
}
