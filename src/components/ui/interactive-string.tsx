"use client";

import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface Point {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
}

interface Mouse {
    x: number;
    y: number;
}

const PLUS_SIZE = 16;
const PLUS_OFFSET = 12;

function readForegroundColor(): string {
    if (typeof window === "undefined") return "#fafafa";
    const s = getComputedStyle(document.documentElement);
    const raw =
        s.getPropertyValue("--color-foreground").trim() ||
        s.getPropertyValue("--foreground").trim() ||
        "#fafafa";
    if (raw.startsWith("#")) return raw;
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 3) {
        const [r, g, b] = parts;
        return `rgb(${r}, ${g}, ${b})`;
    }
    return "#fafafa";
}

export interface EngravedStringProps extends React.HTMLAttributes<HTMLDivElement> {
    text: string;
    className?: string;
    canvasClassName?: string;
    /**
     * `parent` — listen on wrapper parent with capture (good behind CTA; does not steal clicks).
     * `window` — global pointer (full-page demo feel).
     */
    interaction?: "parent" | "window";
}

export function EngravedString({
    text,
    className,
    canvasClassName,
    interaction = "parent",
    style,
    ...props
}: EngravedStringProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<Mouse>({ x: -9999, y: -9999 });
    const linesFooterRef = useRef<Point[][]>([]);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const foregroundRef = useRef<string>("#fafafa");

    const cornersRef = useRef<{ x: number; y: number }[]>([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: 0 },
    ]);

    const drawWaveEffect = (context: CanvasRenderingContext2D, width: number, height: number): void => {
        const horizontalPadding = window.innerWidth < 1400 ? width * 0.03 : width * 0.197;
        const verticalPadding = height * 0.197;

        const linesCount = 60;
        const lineHeight = (height - verticalPadding * 2) / linesCount;
        const cellWidth = 5;
        const cols = Math.floor((width - horizontalPadding * 2) / cellWidth);

        const typeCanvasWidth = 120;
        const typeCanvasHeight = 50;
        const typeCanvas = document.createElement("canvas");
        const typeContext = typeCanvas.getContext("2d");

        if (!typeContext) return;

        typeCanvas.width = typeCanvasWidth;
        typeCanvas.height = typeCanvasHeight;

        const fontSize = typeCanvasWidth * 0.22;
        typeContext.fillStyle = "black";
        typeContext.fillRect(0, 0, typeCanvasWidth, typeCanvasHeight);
        typeContext.fillStyle = "white";
        typeContext.font = `bold ${fontSize}px var(--font-display), Outfit, system-ui, sans-serif`;
        typeContext.textBaseline = "middle";
        typeContext.textAlign = "center";
        typeContext.fillText(text, typeCanvasWidth / 2, typeCanvasHeight / 2);

        const typeData = typeContext.getImageData(0, 0, typeCanvasWidth, typeCanvasHeight).data;

        linesFooterRef.current = [];
        for (let i = 0; i < linesCount; i++) {
            const y = verticalPadding + i * lineHeight;
            const line: Point[] = [];

            for (let j = 0; j < cols; j++) {
                const x = horizontalPadding + j * cellWidth;

                const typeX = Math.floor((j / cols) * typeCanvasWidth);
                const typeY = Math.floor((i / linesCount) * typeCanvasHeight);
                const index = (typeY * typeCanvasWidth + typeX) * 4;
                const brightness = typeData[index] ?? 0;

                const heightOffset = (brightness / 255) * 20;
                const finalY = y - heightOffset;

                line.push({
                    x,
                    y: finalY,
                    baseX: x,
                    baseY: finalY,
                });
            }
            linesFooterRef.current.push(line);
        }

        if (linesFooterRef.current.length > 0 && linesFooterRef.current[0].length > 0) {
            const firstLine = linesFooterRef.current[0];
            const lastLine = linesFooterRef.current[linesFooterRef.current.length - 1];
            cornersRef.current = [
                { x: firstLine[0].x - PLUS_OFFSET, y: firstLine[0].y - PLUS_OFFSET },
                {
                    x: firstLine[firstLine.length - 1].x + PLUS_OFFSET,
                    y: firstLine[firstLine.length - 1].y - PLUS_OFFSET,
                },
                {
                    x: lastLine[lastLine.length - 1].x + PLUS_OFFSET,
                    y: lastLine[lastLine.length - 1].y + PLUS_OFFSET,
                },
                { x: lastLine[0].x - PLUS_OFFSET, y: lastLine[0].y + PLUS_OFFSET },
            ];
        }
    };

    const updateLines = (mouseX: number, mouseY: number, radius: number = 100, maxSpeed: number = 10): void => {
        linesFooterRef.current.forEach((lineFooter) => {
            lineFooter.forEach((point) => {
                const dx = point.x - mouseX;
                const dy = point.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (radius - distance) / radius;

                    point.x += Math.cos(angle) * force * maxSpeed;
                    point.y += Math.sin(angle) * force * maxSpeed;
                }

                const springX = (point.baseX - point.x) * 0.1;
                const springY = (point.baseY - point.y) * 0.1;

                point.x += springX;
                point.y += springY;
            });
        });
    };

    const drawPlus = (
        context: CanvasRenderingContext2D,
        x: number,
        y: number,
        size: number = PLUS_SIZE,
        color: string,
        lineWidth: number = 2
    ) => {
        const half = size / 2;
        context.save();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.beginPath();
        context.moveTo(x, y - half);
        context.lineTo(x, y + half);
        context.moveTo(x - half, y);
        context.lineTo(x + half, y);
        context.stroke();
        context.restore();
    };

    const drawPlusSigns = (context: CanvasRenderingContext2D) => {
        const foreground = foregroundRef.current;
        for (const corner of cornersRef.current) {
            drawPlus(context, corner.x, corner.y, PLUS_SIZE, foreground, 2.2);
        }
    };

    const drawLines = (context: CanvasRenderingContext2D, width: number, height: number): void => {
        context.clearRect(0, 0, width, height);

        const foreground = foregroundRef.current;

        linesFooterRef.current.forEach((lineFooter) => {
            if (lineFooter.length === 0) return;
            context.beginPath();
            context.moveTo(lineFooter[0].x, lineFooter[0].y);

            for (let i = 1; i < lineFooter.length; i++) {
                const prev = lineFooter[i - 1];
                const current = lineFooter[i];

                const midX = (prev.x + current.x) / 2;
                const midY = (prev.y + current.y) / 2;

                context.quadraticCurveTo(prev.x, prev.y, midX, midY);
            }

            context.strokeStyle = foreground;
            context.lineWidth = 0.5;
            context.stroke();
        });

        drawPlusSigns(context);
    };

    const resizeCanvas = (): void => {
        const canvas = canvasRef.current;
        const context = contextRef.current;

        if (!canvas || !context) return;

        const scaleFactor = Math.min(window.devicePixelRatio || 1, 2);
        const wrapper = wrapperRef.current;
        const width = wrapper ? wrapper.offsetWidth : canvas.offsetWidth;
        const height = wrapper ? wrapper.offsetHeight : canvas.offsetHeight;
        if (width < 2 || height < 2) return;

        canvas.width = width * scaleFactor;
        canvas.height = height * scaleFactor;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(scaleFactor, scaleFactor);

        drawWaveEffect(context, width, height);
    };

    useEffect(() => {
        const setForeground = () => {
            foregroundRef.current = readForegroundColor();
        };
        setForeground();

        const observer = new MutationObserver(setForeground);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        contextRef.current = context;

        let cancelled = false;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const syncPointer = (clientX: number, clientY: number) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = clientX - rect.left;
            mouseRef.current.y = clientY - rect.top;
        };

        const handleMouseMove = (e: MouseEvent) => {
            syncPointer(e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!e.touches[0]) return;
            syncPointer(e.touches[0].clientX, e.touches[0].clientY);
        };

        const parent = wrapperRef.current?.parentElement;
        const useWindow = interaction === "window" || !parent;

        const moveTarget: Window | HTMLElement = useWindow ? window : parent;
        const mouseCapture = useWindow ? false : true;
        const touchOpts: AddEventListenerOptions = { passive: true, capture: !useWindow };

        moveTarget.addEventListener("mousemove", handleMouseMove as EventListener, mouseCapture);
        moveTarget.addEventListener("touchmove", handleTouchMove as EventListener, touchOpts);
        window.addEventListener("resize", resizeCanvas);

        resizeCanvas();

        const animateFooterLines = (): void => {
            if (cancelled) return;
            const c = canvasRef.current;
            const ctx = contextRef.current;
            if (!c || !ctx) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = c.width / dpr;
            const height = c.height / dpr;

            if (linesFooterRef.current.length > 0) {
                if (!reduceMotion) {
                    updateLines(mouseRef.current.x, mouseRef.current.y);
                }
                drawLines(ctx, width, height);
            }

            animationFrameRef.current = requestAnimationFrame(animateFooterLines);
        };

        const start = async () => {
            if (document.fonts) {
                try {
                    await document.fonts.load("bold 26px Outfit");
                } catch {
                    /* ignore */
                }
            }
            if (cancelled) return;
            resizeCanvas();
            if (reduceMotion) {
                const c = canvasRef.current;
                const ctx = contextRef.current;
                if (c && ctx && linesFooterRef.current.length > 0) {
                    const dpr = Math.min(window.devicePixelRatio || 1, 2);
                    drawLines(ctx, c.width / dpr, c.height / dpr);
                }
                return;
            }
            animateFooterLines();
        };

        void start();

        return () => {
            cancelled = true;
            moveTarget.removeEventListener("mousemove", handleMouseMove as EventListener, mouseCapture);
            moveTarget.removeEventListener("touchmove", handleTouchMove as EventListener, touchOpts);
            window.removeEventListener("resize", resizeCanvas);
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            observer.disconnect();
        };
    }, [text, interaction]);

    return (
        <div
            ref={wrapperRef}
            className={cn("pointer-events-none relative isolate overflow-hidden", className)}
            style={style}
            {...props}
        >
            <canvas
                ref={canvasRef}
                className={cn("absolute inset-0 block size-full", canvasClassName)}
                aria-hidden
            />
        </div>
    );
}
