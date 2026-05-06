"use client";

import React, { useEffect, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const INTRO_STYLE_ID = "faq-monocrhome-animations";

const palette = {
    /* Dark-mode palette: glass cards on dark bg, white text */
    surface: "bg-transparent text-white",
    panel: "bg-[rgba(18,18,18,0.9)]",
    border: "border-white/[0.06]",
    heading: "text-white",
    muted: "text-white/60",
    iconRing: "border-white/[0.08]",
    iconSurface: "bg-white/[0.02]",
    icon: "text-white/70",
    glow: "rgba(16, 185, 129, 0.15)",
    shadow: "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]",
};

export type FaqMonoEntry = {
    question: string;
    answer: string;
    /** Short tag (e.g. “Basics”) — shown as a pill */
    meta?: string;
};

export type FaqMonochromeSectionProps = {
    categories: Record<string, string>;
    faqData: Record<string, FaqMonoEntry[]>;
    /** Intro pill label */
    introLabel?: string;
    /** Small kicker above title */
    kicker?: string;
    title: ReactNode;
    subtitle?: ReactNode;
    className?: string;
};

function injectFaqStyles() {
    if (typeof document === "undefined") return () => {};
    if (document.getElementById(INTRO_STYLE_ID)) return () => {};
    const style = document.createElement("style");
    style.id = INTRO_STYLE_ID;
    style.innerHTML = `
      @keyframes faq1-fade-up {
        0% { transform: translate3d(0, 20px, 0); opacity: 0; filter: blur(6px); }
        60% { filter: blur(0); }
        100% { transform: translate3d(0, 0, 0); opacity: 1; filter: blur(0); }
      }
      @keyframes faq1-beam-spin {
        0% { transform: rotate(0deg) scale(1); }
        100% { transform: rotate(360deg) scale(1); }
      }
      @keyframes faq1-pulse {
        0% { transform: scale(0.7); opacity: 0.55; }
        60% { opacity: 0.1; }
        100% { transform: scale(1.25); opacity: 0; }
      }
      @keyframes faq1-meter {
        0%, 20% { transform: scaleX(0); transform-origin: left; }
        45%, 60% { transform: scaleX(1); transform-origin: left; }
        80%, 100% { transform: scaleX(0); transform-origin: right; }
      }
      @keyframes faq1-tick {
        0%, 30% { transform: translateX(-6px); opacity: 0.4; }
        50% { transform: translateX(2px); opacity: 1; }
        100% { transform: translateX(20px); opacity: 0; }
      }
      .faq1-intro {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.85rem 1.4rem;
        border-radius: 9999px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(12, 12, 12, 0.42);
        color: rgba(248, 250, 252, 0.92);
        text-transform: uppercase;
        letter-spacing: 0.35em;
        font-size: 0.65rem;
        width: 100%;
        max-width: 24rem;
        margin: 0 auto;
        opacity: 0;
        transform: translate3d(0, 12px, 0);
        filter: blur(8px);
        transition: opacity 720ms ease, transform 720ms ease, filter 720ms ease;
        isolation: isolate;
      }
      .faq1-intro--active {
        opacity: 1;
        transform: translate3d(0, 0, 0);
        filter: blur(0);
      }
      .faq1-intro__beam,
      .faq1-intro__pulse {
        position: absolute;
        inset: -110%;
        pointer-events: none;
        border-radius: 50%;
      }
      .faq1-intro__beam {
        background: conic-gradient(from 160deg, rgba(100, 116, 139, 0.16), transparent 40%, rgba(71, 85, 105, 0.12) 60%, transparent 80%, rgba(71, 85, 105, 0.1));
        animation: faq1-beam-spin 18s linear infinite;
        opacity: 0.28;
      }
      .faq1-intro__pulse {
        border: 1px solid currentColor;
        opacity: 0.18;
        animation: faq1-pulse 3.4s ease-out infinite;
      }
      .faq1-intro__label {
        position: relative;
        z-index: 1;
        font-weight: 600;
        letter-spacing: 0.4em;
      }
      .faq1-intro__meter {
        position: relative;
        z-index: 1;
        flex: 1 1 auto;
        height: 1px;
        background: linear-gradient(90deg, transparent, currentColor 35%, transparent 85%);
        transform: scaleX(0);
        transform-origin: left;
        animation: faq1-meter 5.8s ease-in-out infinite;
        opacity: 0.7;
      }
      .faq1-intro__tick {
        position: relative;
        z-index: 1;
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 9999px;
        background: currentColor;
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
        animation: faq1-tick 3.2s ease-in-out infinite;
      }
      .faq1-fade {
        opacity: 0;
        transform: translate3d(0, 24px, 0);
        filter: blur(12px);
        transition: opacity 700ms ease, transform 700ms ease, filter 700ms ease;
      }
      .faq1-fade--ready {
        animation: faq1-fade-up 860ms cubic-bezier(0.22, 0.68, 0, 1) forwards;
      }
    `;
    document.head.appendChild(style);
    return () => {
        if (style.parentNode) style.remove();
    };
}

/**
 * Monochrome FAQ layout: intro pill, header, 3-way category tabs, accordion cards with cursor glow.
 */
export function FaqMonochromeSection({
    categories,
    faqData,
    introLabel = "Signal FAQ",
    kicker = "Questions",
    title,
    subtitle,
    className,
}: FaqMonochromeSectionProps) {
    const keys = useMemo(() => Object.keys(categories), [categories]);
    const [selected, setSelected] = useState<string>(keys[0] ?? "");
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const [introReady, setIntroReady] = useState(false);
    const [hasEntered, setHasEntered] = useState(false);

    const list = faqData[selected] ?? [];

    useEffect(() => {
        setActiveIndex(-1);
    }, [selected]);

    useEffect(() => injectFaqStyles(), []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const frame = window.requestAnimationFrame(() => setIntroReady(true));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") {
            setHasEntered(true);
            return;
        }
        let timeout: number | undefined;
        const onLoad = () => {
            timeout = window.setTimeout(() => setHasEntered(true), 120);
        };
        if (document.readyState === "complete") {
            onLoad();
        } else {
            window.addEventListener("load", onLoad, { once: true });
        }
        return () => {
            window.removeEventListener("load", onLoad);
            window.clearTimeout(timeout);
        };
    }, []);

    const setCardGlow = (event: React.MouseEvent<HTMLLIElement>) => {
        const target = event.currentTarget;
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--faq-x", `${event.clientX - rect.left}px`);
        target.style.setProperty("--faq-y", `${event.clientY - rect.top}px`);
    };

    const clearCardGlow = (event: React.MouseEvent<HTMLLIElement>) => {
        const target = event.currentTarget;
        target.style.removeProperty("--faq-x");
        target.style.removeProperty("--faq-y");
    };

    const toggleQuestion = (index: number) => {
        setActiveIndex((prev) => (prev === index ? -1 : index));
    };

    return (
        <div className={cn("relative w-full overflow-hidden transition-colors duration-700", palette.surface, className)}>

            <div
                className={cn(
                    "relative z-[2] mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-12 pt-12 md:gap-12 md:px-8 md:pb-16 md:pt-14 lg:max-w-5xl lg:px-12 lg:pb-20 lg:pt-16",
                    hasEntered ? "faq1-fade--ready" : "faq1-fade"
                )}
            >
                {/* Dark-mode intro pill */}
                <div className="flex justify-center">
                    <span className="inline-flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/48">
                        {introLabel}
                    </span>
                </div>

                <header className="text-center">
                    <div className="space-y-3">
                        <p className={cn("text-[11px] font-semibold uppercase tracking-[0.15em]", palette.muted)}>{kicker}</p>
                        <h2 className={cn("text-3xl font-bold leading-tight tracking-[-0.03em] md:text-4xl lg:text-5xl", palette.heading)}
                            style={{ fontFamily: "var(--font-heading)" }}
                        >
                            {title}
                        </h2>
                        {subtitle ? (
                            <div className={cn("mx-auto max-w-xl text-[15px] leading-relaxed", palette.muted)}>{subtitle}</div>
                        ) : null}
                    </div>
                </header>

                <div className="flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="FAQ categories">
                    {keys.map((key) => {
                        const isSel = selected === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={isSel}
                                onClick={() => setSelected(key)}
                                className={cn(
                                    "relative inline-flex items-center rounded-xl border px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 backdrop-blur-xl",
                                    isSel
                                        ? "border-white/20 bg-gradient-to-b from-white/[0.12] to-white/[0.05] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgba(0,0,0,0.4)]"
                                        : "border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/90"
                                )}
                            >
                                <span className="relative z-10">{categories[key]}</span>
                            </button>
                        );
                    })}
                </div>

                <ul className="space-y-4" role="tabpanel">
                    {list.map((item, index) => {
                        const open = activeIndex === index;
                        const panelId = `faq-panel-${selected}-${index}`;
                        const buttonId = `faq-trigger-${selected}-${index}`;
                        const meta = item.meta ?? categories[selected];

                        return (
                            <li
                                key={`${selected}-${item.question}`}
                                className={cn(
                                    "group relative overflow-hidden rounded-[1.75rem] border bg-black/40 backdrop-blur-2xl transition-all duration-400 hover:-translate-y-1 hover:border-white/[0.12] focus-within:-translate-y-1",
                                    palette.border,
                                    palette.shadow
                                )}
                                onMouseMove={setCardGlow}
                                onMouseLeave={clearCardGlow}
                            >
                                <div
                                    className={cn(
                                        "pointer-events-none absolute inset-0 transition-opacity duration-500",
                                        open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}
                                    style={{
                                        background: `radial-gradient(240px circle at var(--faq-x, 50%) var(--faq-y, 50%), ${palette.glow}, transparent 70%)`,
                                    }}
                                />

                                <button
                                    type="button"
                                    id={buttonId}
                                    aria-controls={panelId}
                                    aria-expanded={open}
                                    onClick={() => toggleQuestion(index)}
                                    className="relative flex w-full items-start gap-5 px-6 py-6 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/35 md:gap-6 md:px-8 md:py-7"
                                >
                                    <span
                                        className={cn(
                                            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 md:h-12 md:w-12",
                                            open
                                                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                                : "border-white/[0.08] bg-white/[0.02] text-white/60 group-hover:bg-white/[0.05]"
                                        )}
                                    >
                                        <svg
                                            className={cn(
                                                "relative h-5 w-5 transition-transform duration-500",
                                                open ? "rotate-45" : ""
                                            )}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden
                                        >
                                            <path d="M12 5v14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                                            <path d="M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                                        </svg>
                                    </span>

                                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                            <h3 className={cn("text-[15px] font-semibold leading-tight tracking-[-0.01em] sm:text-[17px] md:text-[1.15rem] transition-colors duration-300", open ? "text-emerald-50" : "text-white/90")}>
                                                {item.question}
                                            </h3>
                                            {meta ? (
                                                <span
                                                    className={cn(
                                                        "inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.35em] transition-opacity duration-300 sm:ml-auto",
                                                        palette.border,
                                                        palette.muted
                                                    )}
                                                >
                                                    {meta}
                                                </span>
                                            ) : null}
                                        </div>

                                        <div
                                            id={panelId}
                                            role="region"
                                            aria-labelledby={buttonId}
                                            className={cn(
                                                "overflow-hidden text-sm leading-relaxed transition-[max-height] duration-500 ease-out md:text-[15px]",
                                                open ? "max-h-[min(28rem,70vh)]" : "max-h-0",
                                                palette.muted
                                            )}
                                        >
                                            <p className="pr-2 pb-1">{item.answer}</p>
                                        </div>
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default FaqMonochromeSection;
