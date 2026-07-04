"use client";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

const MORPH_TIME = 1.5;
const COOLDOWN_TIME = 0.5;

function useMorphingText(texts: string[]) {
    const textIndexRef = useRef(0);
    const morphRef = useRef(0);
    const cooldownRef = useRef(0);
    const timeRef = useRef(Date.now());
    const text1Ref = useRef<HTMLSpanElement>(null);
    const text2Ref = useRef<HTMLSpanElement>(null);

    const setStyles = useCallback(
        (fraction: number) => {
            const [t1, t2] = [text1Ref.current, text2Ref.current];
            if (!t1 || !t2) return;
            // Outgoing
            const inv = 1 - fraction;
            t1.style.filter = `blur(${Math.min(6 / Math.max(inv, 0.001) - 6, 80)}px)`;
            t1.style.opacity = `${Math.pow(inv, 0.4)}`;
            // Incoming
            t2.style.filter = `blur(${Math.min(6 / Math.max(fraction, 0.001) - 6, 80)}px)`;
            t2.style.opacity = `${Math.pow(fraction, 0.4)}`;
            t1.textContent = texts[textIndexRef.current % texts.length];
            t2.textContent = texts[(textIndexRef.current + 1) % texts.length];
        },
        [texts]
    );

    const doMorph = useCallback(() => {
        morphRef.current -= cooldownRef.current;
        cooldownRef.current = 0;
        let fraction = morphRef.current / MORPH_TIME;
        if (fraction > 1) { cooldownRef.current = COOLDOWN_TIME; fraction = 1; }
        setStyles(fraction);
        if (fraction === 1) textIndexRef.current++;
    }, [setStyles]);

    const doCooldown = useCallback(() => {
        morphRef.current = 0;
        const [t1, t2] = [text1Ref.current, text2Ref.current];
        if (t1 && t2) {
            t2.style.filter = "none";
            t2.style.opacity = "1";
            t1.style.filter = "none";
            t1.style.opacity = "0";
        }
    }, []);

    useEffect(() => {
        let rafId: number;
        const animate = () => {
            rafId = requestAnimationFrame(animate);
            const now = Date.now();
            const dt = (now - timeRef.current) / 1000;
            timeRef.current = now;
            cooldownRef.current -= dt;
            if (cooldownRef.current <= 0) doMorph();
            else doCooldown();
        };
        animate();
        return () => cancelAnimationFrame(rafId);
    }, [doMorph, doCooldown]);

    return { text1Ref, text2Ref };
}

interface MorphingTextProps {
    className?: string;
    texts: string[];
}

/**
 * Block-level blur-morph text — no SVG filter needed.
 */
export function MorphingText({ texts, className }: MorphingTextProps) {
    const { text1Ref, text2Ref } = useMorphingText(texts);

    useEffect(() => {
        if (text2Ref.current) text2Ref.current.textContent = texts[0];
        if (text1Ref.current) text1Ref.current.textContent = texts[0];
    }, [texts]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            className={cn("relative overflow-hidden", className)}
            style={{ height: "1.1em", fontFamily: "var(--font-heading)" }}
        >
            {/* t1 — outgoing (starts hidden) */}
            <span
                ref={text1Ref}
                className="absolute inset-0 flex items-center will-change-[filter,opacity]"
                style={{ opacity: 0 }}
            />
            {/* t2 — incoming (starts visible) */}
            <span
                ref={text2Ref}
                className="absolute inset-0 flex items-center will-change-[filter,opacity]"
                style={{ opacity: 1 }}
            >
                {/* Initial SSR content so it's visible before rAF starts */}
                {texts[0]}
            </span>
        </div>
    );
}
