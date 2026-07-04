"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface OrbitingCirclesProps {
    className?: string;
    children?: React.ReactNode;
    reverse?: boolean;
    duration?: number;
    radius?: number;
    iconSize?: number;
    path?: boolean;
    pathClassName?: string;
}

export function OrbitingCircles({
    className,
    children,
    reverse = false,
    duration = 20,
    radius = 140,
    iconSize = 40,
    path = true,
    pathClassName,
}: OrbitingCirclesProps) {
    const count = React.Children.count(children);

    return (
        <>
            {path && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="pointer-events-none absolute inset-0 size-full"
                    aria-hidden
                >
                    <circle
                        className={cn("stroke-black/[0.07]", pathClassName)}
                        cx="50%"
                        cy="50%"
                        r={radius}
                        fill="none"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                    />
                </svg>
            )}
            {React.Children.map(children, (child, i) => {
                const delay = -(i / count) * duration;
                return (
                    /* Outer wrapper: rotates around center */
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: 0,
                            height: 0,
                            animationName: "orbit-rotate",
                            animationDuration: `${duration}s`,
                            animationTimingFunction: "linear",
                            animationIterationCount: "infinite",
                            animationDirection: reverse ? "reverse" : "normal",
                            animationDelay: `${delay}s`,
                        }}
                    >
                        {/* Inner: counter-rotates so icon stays upright, offset by radius */}
                        <div
                            style={{
                                position: "absolute",
                                top: -(iconSize / 2),
                                left: radius - iconSize / 2,
                                width: iconSize,
                                height: iconSize,
                                animationName: "orbit-counter",
                                animationDuration: `${duration}s`,
                                animationTimingFunction: "linear",
                                animationIterationCount: "infinite",
                                animationDirection: reverse ? "reverse" : "normal",
                                animationDelay: `${delay}s`,
                            }}
                            className={cn("flex items-center justify-center", className)}
                        >
                            {child}
                        </div>
                    </div>
                );
            })}
        </>
    );
}
