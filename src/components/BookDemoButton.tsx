"use client";

import { motion } from "framer-motion";
import { useRef, useState, ReactNode } from "react";

interface BookDemoButtonProps {
    variant?: "primary" | "secondary" | "outline";
    size?: "default" | "large";
    children?: ReactNode;
    className?: string;
}

export default function BookDemoButton({
    variant = "primary",
    size = "default",
    children,
    className = "",
}: BookDemoButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [showRipple, setShowRipple] = useState(false);
    const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setTilt({ x: y * -8, y: x * 8 });
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setRipplePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
    };

    const sizeStyles =
        size === "large"
            ? "px-10 py-4 text-sm tracking-[0.15em]"
            : "px-7 py-3 text-xs tracking-[0.15em]";

    const variantStyles = {
        primary:
            "bg-white text-black font-semibold hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] border border-white/20",
        secondary:
            "bg-transparent text-white font-medium border border-white/[0.12] hover:border-white/25 hover:bg-white/[0.04]",
        outline:
            "bg-transparent text-white font-medium border border-white/[0.08] hover:border-[var(--accent)]/30 hover:text-[var(--accent)]",
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            onClick={handleClick}
            animate={{
                rotateX: tilt.x,
                rotateY: tilt.y,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            whileTap={{ scale: 0.97 }}
            className={`
        relative overflow-hidden rounded-full uppercase
        transition-all duration-300
        ${sizeStyles}
        ${variantStyles[variant]}
        ${className}
      `}
            style={{ transformPerspective: 600 }}
        >
            {/* Shine sweep */}
            <span
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
                    transform: "translateX(-100%)",
                    animation: "none",
                }}
            />

            {/* Ripple */}
            {showRipple && (
                <span
                    className="absolute rounded-full bg-white/20 animate-ping pointer-events-none"
                    style={{
                        left: ripplePos.x - 10,
                        top: ripplePos.y - 10,
                        width: 20,
                        height: 20,
                    }}
                />
            )}

            <span className="relative z-10">
                {children || "Book a demo"}
            </span>
        </motion.button>
    );
}
