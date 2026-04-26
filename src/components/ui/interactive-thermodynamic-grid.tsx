"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type ThermodynamicPalette = "thermal" | "frost";

export interface ThermodynamicGridProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Cell size in CSS pixels. Higher = smaller cells / finer grid.
     * Default: 20 (interactive), tuned with palette.
     */
    resolution?: number;
    /**
     * Cooling rate (0 to 1). Higher = trails fade faster.
     * Default: 0.98
     */
    coolingFactor?: number;
    /**
     * When false: opaque #050505 base, cold grid only, no mouse — for section backdrops
     * where cards must receive pointer events. Draws once per resize (no animation loop).
     */
    interactive?: boolean;
    /** `frost`: whitish/cool highlights; `thermal`: original magma look */
    palette?: ThermodynamicPalette;
}

function heatColor(t: number, palette: ThermodynamicPalette): string {
    if (palette === "frost") {
        /* Keep mouse trails subtle on #000 */
        const a = 0.04 + t * 0.38;
        const r = Math.round(220 + t * 20);
        const g = Math.round(224 + t * 16);
        const b = Math.round(232 + t * 10);
        return `rgba(${r},${g},${b},${a})`;
    }
    const r = Math.min(255, Math.max(0, t * 2.5 * 255));
    const g = Math.min(255, Math.max(0, (t * 2.5 - 1) * 255));
    const b = Math.min(255, Math.max(0, (t * 2.5 - 2) * 255 + t * 50));
    return `rgb(${r + 10}, ${g + 10}, ${b + 15})`;
}

function coldDotColor(palette: ThermodynamicPalette): string {
    /* Subtle on #000; higher opacity reads as a gray “fog” */
    return palette === "frost" ? "rgba(255,255,255,0.09)" : "#18181b";
}

export function ThermodynamicGrid({
    className,
    resolution = 20,
    coolingFactor = 0.97,
    interactive = true,
    palette = "frost",
    style,
    ...props
}: ThermodynamicGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        if (!interactive) {
            const ctx = canvas.getContext("2d", { alpha: false });
            if (!ctx) return;

            let cols = 0;
            let rows = 0;
            let width = 0;
            let height = 0;
            const staticDotRgba =
                palette === "thermal"
                    ? "rgba(180, 140, 90, 0.18)"
                    : "rgba(255, 255, 255, 0.14)";

            const draw = () => {
                if (width < 1 || height < 1) return;
                ctx.fillStyle = "#000000";
                ctx.fillRect(0, 0, width, height);
                ctx.fillStyle = staticDotRgba;
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        if (col % 2 === 0 && row % 2 === 0) {
                            const x = col * resolution;
                            const y = row * resolution;
                            ctx.fillRect(x + resolution / 2 - 1, y + resolution / 2 - 1, 2, 2);
                        }
                    }
                }
            };

            const resize = () => {
                const newWidth = Math.max(0, container.offsetWidth);
                const newHeight = Math.max(0, container.offsetHeight);
                if (width === newWidth && height === newHeight) return;

                width = newWidth;
                height = newHeight;
                if (width < 1 || height < 1) {
                    draw();
                    return;
                }
                canvas.width = width;
                canvas.height = height;
                cols = Math.ceil(width / resolution);
                rows = Math.ceil(height / resolution);
                draw();
            };

            const scheduleResize = () => {
                requestAnimationFrame(() => {
                    resize();
                    requestAnimationFrame(resize);
                });
            };

            const ro = new ResizeObserver(() => scheduleResize());
            ro.observe(container);
            window.addEventListener("resize", scheduleResize, { passive: true });
            scheduleResize();
            const t = window.setTimeout(scheduleResize, 120);
            return () => {
                ro.disconnect();
                window.removeEventListener("resize", scheduleResize);
                window.clearTimeout(t);
            };
        }

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let grid: Float32Array = new Float32Array(0);
        let cols = 0;
        let rows = 0;
        let width = 0;
        let height = 0;

        const mouse = { x: -1000, y: -1000, prevX: -1000, prevY: -1000, active: false };

        const resize = () => {
            const newWidth = container.offsetWidth;
            const newHeight = container.offsetHeight;
            if (width === newWidth && height === newHeight) return;

            width = newWidth;
            height = newHeight;
            canvas.width = width;
            canvas.height = height;
            cols = Math.ceil(width / resolution);
            rows = Math.ceil(height / resolution);
            grid = new Float32Array(cols * rows).fill(0);
            kick();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
        };

        const handleMouseLeave = () => {
            mouse.active = false;
        };

        let rafId = 0;

        const hotCut = palette === "frost" ? 0.04 : 0.05;
        /** Stop the loop when cooled — avoids full-grid redraw at 60fps when nothing changes. */
        const IDLE_HEAT = 0.0008;

        const kick = () => {
            if (rafId || !canvas.isConnected) return;
            rafId = requestAnimationFrame(update);
        };

        const update = () => {
            rafId = 0;

            if (mouse.active) {
                const dx = mouse.x - mouse.prevX;
                const dy = mouse.y - mouse.prevY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const steps = Math.ceil(dist / (resolution / 2));

                for (let s = 0; s <= steps; s++) {
                    const t = steps > 0 ? s / steps : 0;
                    const x = mouse.prevX + dx * t;
                    const y = mouse.prevY + dy * t;

                    const col = Math.floor(x / resolution);
                    const row = Math.floor(y / resolution);

                    const radius = 2;
                    const heatGain = palette === "frost" ? 0.2 : 0.3;
                    for (let i = -radius; i <= radius; i++) {
                        for (let j = -radius; j <= radius; j++) {
                            const c = col + i;
                            const rowIdx = row + j;
                            if (c >= 0 && c < cols && rowIdx >= 0 && rowIdx < rows) {
                                const idx = c + rowIdx * cols;
                                const d = Math.sqrt(i * i + j * j);
                                if (d <= radius) {
                                    grid[idx] = Math.min(1.0, grid[idx] + heatGain * (1 - d / radius));
                                }
                            }
                        }
                    }
                }
            }

            mouse.prevX = mouse.x;
            mouse.prevY = mouse.y;

            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, width, height);

            let maxHeat = 0;
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const idx = col + row * cols;
                    const temp = grid[idx];

                    grid[idx] *= coolingFactor;
                    if (grid[idx] > maxHeat) maxHeat = grid[idx];

                    if (temp > hotCut) {
                        const x = col * resolution;
                        const y = row * resolution;
                        const sizeMult = palette === "frost" ? 0.35 : 0.5;
                        const size = resolution * (0.8 + temp * sizeMult);
                        const offset = (resolution - size) / 2;

                        ctx.fillStyle = heatColor(temp, palette);
                        ctx.beginPath();
                        ctx.rect(x + offset, y + offset, size, size);
                        ctx.fill();
                    } else if (col % 2 === 0 && row % 2 === 0) {
                        const x = col * resolution;
                        const y = row * resolution;
                        ctx.fillStyle = coldDotColor(palette);
                        ctx.fillRect(x + resolution / 2 - 1, y + resolution / 2 - 1, 2, 2);
                    }
                }
            }

            const stillAnimating = mouse.active || maxHeat > IDLE_HEAT;
            if (stillAnimating && typeof document !== "undefined" && document.visibilityState !== "hidden") {
                rafId = requestAnimationFrame(update);
            }
        };

        const handleMouseMoveEfficient = (e: MouseEvent) => {
            handleMouseMove(e);
            kick();
        };

        const onVisibility = () => {
            if (document.visibilityState !== "hidden") kick();
        };

        window.addEventListener("resize", resize);
        container.addEventListener("mousemove", handleMouseMoveEfficient, { passive: true });
        container.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("visibilitychange", onVisibility);

        resize();

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener("resize", resize);
            container.removeEventListener("mousemove", handleMouseMoveEfficient);
            container.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [resolution, coolingFactor, interactive, palette]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "absolute inset-0 overflow-hidden",
                interactive ? "z-[1]" : "z-0",
                !interactive && "pointer-events-none bg-black",
                className
            )}
            style={style}
            {...props}
        >
            <canvas ref={canvasRef} className="block h-full w-full" />
        </div>
    );
}

export default ThermodynamicGrid;
