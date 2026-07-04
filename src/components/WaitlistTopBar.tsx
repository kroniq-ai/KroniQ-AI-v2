"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, MoreHorizontal, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { KroniQMarkBadgePng } from "@/components/brand/kroniq-logo-png";
import {
  clearWaitlistMemberSession,
  getWaitlistMemberSession,
  openLeaderboardModal,
  type WaitlistMemberSession,
} from "@/lib/waitlist/client-session";
import { PilotLoginLink } from "@/components/PilotLoginLink";

export default function WaitlistTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<WaitlistMemberSession | null>(() =>
    typeof window === "undefined" ? null : getWaitlistMemberSession()
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [launchAllowed, setLaunchAllowed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ bottom: number; right: number }>({ bottom: 0, right: 0 });

  const refresh = () => setSession(getWaitlistMemberSession());

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!menuOpen || !menuButtonRef.current) return;
    const r = menuButtonRef.current.getBoundingClientRect();
    setMenuPosition({
      bottom: window.innerHeight - r.top + 8,
      right: Math.max(8, window.innerWidth - r.right),
    });
  }, [menuOpen]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/launch-access/status")
        .then((r) => r.json() as Promise<{ allowed?: boolean }>)
        .then((d) => {
          if (!cancelled) setLaunchAllowed(Boolean(d?.allowed));
        })
        .catch(() => {
          if (!cancelled) setLaunchAllowed(false);
        });
    };
    load();
    const onLaunch = () => load();
    window.addEventListener("voyd-launch-access-change", onLaunch);
    return () => {
      cancelled = true;
      window.removeEventListener("voyd-launch-access-change", onLaunch);
    };
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("kroniq-waitlist-member-change", onChange);
    return () => {
      window.removeEventListener("kroniq-waitlist-member-change", onChange);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (pathname !== "/") return null;

  const menuPortal =
    mounted &&
    menuOpen &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[230] cursor-default bg-black/40"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
        <div
          role="menu"
          className="fixed z-[231] min-w-[200px] overflow-hidden rounded-xl border border-white/[0.08] bg-black/60 backdrop-blur-xl py-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)] mb-2"
          style={{
            bottom: menuPosition.bottom,
            right: menuPosition.right,
          }}
        >
          <PilotLoginLink
            className="block px-4 py-2.5 text-[13px] font-medium text-white/80 transition hover:bg-white/10 sm:hidden"
          >
            Pilot sign in
          </PilotLoginLink>
          <div className="mx-2 h-px bg-white/[0.08] sm:hidden" aria-hidden />
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-medium text-white/80 transition hover:bg-white/10"
            onClick={async () => {
              setMenuOpen(false);
              const supabase = createClient();
              await supabase.auth.signOut();
              clearWaitlistMemberSession();
              router.refresh();
            }}
          >
            <LogOut className="size-4 shrink-0 text-white/40" aria-hidden />
            Sign out
          </button>
        </div>
      </>,
      document.body
    );

  return (
    <>
      <AnimatePresence>
        {mounted && session && (
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed left-0 right-0 z-[110] bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] px-3 pb-2 pt-0 sm:bottom-[calc(1.75rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pb-3"
          >
            <div className="pointer-events-none mx-auto w-full max-w-3xl">
              <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2 px-2 py-2 sm:gap-3 sm:px-3 sm:py-2.5">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.1] bg-black sm:h-11 sm:w-11 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      {session.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- external avatar URLs vary by host
                        <img
                          src={session.avatarUrl}
                          alt=""
                          width={44}
                          height={44}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <img 
                          src="/logos/kroniqlogowithbg.png" 
                          alt="KroniQ" 
                          width={44} 
                          height={44} 
                          className="h-full w-full object-cover" 
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-white/40">
                        Waitlist
                      </p>
                      <p className="truncate text-[13px] font-semibold leading-tight text-white sm:text-[14px]">
                        {session.name}
                      </p>
                      <p className="truncate text-[11px] text-white/60">{session.email}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <PilotLoginLink className="hidden rounded-full border border-white/[0.1] bg-white px-3.5 py-2 text-[11px] font-semibold text-black transition hover:bg-gray-200 sm:inline-block">
                      Pilot sign in
                    </PilotLoginLink>
                    <button
                      type="button"
                      onClick={() => openLeaderboardModal()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/80 transition hover:border-white/[0.14] hover:bg-white/[0.08] sm:px-4 sm:text-[12px]"
                    >
                      <Trophy className="size-3.5 text-white/50" aria-hidden />
                      Board
                    </button>
                    <div className="relative">
                      <button
                        ref={menuButtonRef}
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/50 transition hover:border-white/[0.12] hover:bg-white/[0.08] hover:text-white"
                        aria-label="Menu"
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                      >
                        <MoreHorizontal className="size-[18px]" strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>
      {menuPortal}
    </>
  );
}
