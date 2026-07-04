"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { cn } from "@/lib/utils";

export interface ShaderAnimationProps {
    className?: string;
    /** Map output to white (and grays) only. */
    monochrome?: boolean;
    maxDpr?: number;
    renderScale?: number;
    fpsCap?: number;
    /**
     * `loading` = full-viewport intro/loading: no mosaic quantize (stays visually centered),
     * stronger radial rings, white mono output.
     */
    variant?: "default" | "loading";
}

/**
 * Full-viewport animated line shader (Three.js). `variant="loading"` matches intro/route loading.
 */
export function ShaderAnimation({
    className,
    monochrome = false,
    maxDpr = 1.5,
    renderScale = 0.72,
    fpsCap = 28,
    variant = "default",
}: ShaderAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [surfaceReady, setSurfaceReady] = useState(false);

    useEffect(() => {
        const id = requestAnimationFrame(() => setSurfaceReady(true));
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isLoading = variant === "loading";

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const scene = new THREE.Scene();
        const geometry = new THREE.PlaneGeometry(2, 2);

        const resolutionBuf = new THREE.Vector2();
        const uniforms = {
            time: { value: 1.0 },
            resolution: { value: new THREE.Vector2() },
            uMono: { value: monochrome ? 1.0 : 0.0 },
            uLoading: { value: isLoading ? 1.0 : 0.0 },
        };

        const vertexShader = /* glsl */ `
			void main() {
				gl_Position = vec4(position, 1.0);
			}
		`;

        const fragmentShader = /* glsl */ `
			precision highp float;

			uniform vec2 resolution;
			uniform float time;
			uniform float uMono;
			uniform float uLoading;

			float random(in float x) {
				return fract(sin(x) * 1e4);
			}

			float random(vec2 st) {
				return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
			}

			void main(void) {
				vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);

				if (uLoading < 0.5) {
					vec2 fMosaicScal = vec2(4.0, 2.0);
					vec2 vScreenSize = vec2(256.0, 256.0);
					uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
					uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);
				}

				float r = length(uv);
				float t = time * (uLoading > 0.5 ? 0.09 : 0.05) + random(uv.x + uv.y) * 0.2;
				float lineWidth = uLoading > 0.5 ? 0.0015 : 0.00075;

				vec3 color = vec3(0.0);
				for (int j = 0; j < 3; j++) {
					for (int i = 0; i < 5; i++) {
						float fj = float(j);
						float fi = float(i);
						float wave = fract(t - 0.012 * fj + fi * 0.018);
						float denom = abs(wave - r * (uLoading > 0.5 ? 1.15 : 1.0));
						color[j] += lineWidth * float(i * i) / max(denom, 1e-5);
					}
				}

				vec3 rgb = vec3(color[2], color[1], color[0]);

				if (uMono > 0.5) {
					float L = max(max(rgb.r, rgb.g), rgb.b);
					L = clamp(L * (uLoading > 0.5 ? 1.35 : 1.15), 0.0, 1.0);
					gl_FragColor = vec4(vec3(L), 1.0);
				} else {
					gl_FragColor = vec4(rgb, 1.0);
				}
			}
		`;

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            depthTest: false,
            depthWrite: false,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: false,
                alpha: false,
                powerPreference: "default",
                stencil: false,
                depth: false,
            });
        } catch {
            // WebGL unavailable (context loss, headless, blocked by browser settings).
            // Fail silently — the PageTransition fuse will still clear the overlay.
            geometry.dispose();
            material.dispose();
            return;
        }
        const dpr = Math.min(window.devicePixelRatio, maxDpr);
        renderer.setPixelRatio(dpr);
        renderer.setClearColor(0x000000, 1);
        container.appendChild(renderer.domElement);

        // Handle GPU context loss (e.g. low-power GPU, background tab on iOS).
        const onContextLost = (e: Event) => {
            e.preventDefault();
            cancelAnimationFrame(raf);
        };
        renderer.domElement.addEventListener("webglcontextlost", onContextLost);

        const canvas = renderer.domElement;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.imageRendering = "auto";

        const rs = Math.min(1, Math.max(0.35, renderScale));

        let resizeRaf = 0;
        const setSize = () => {
            let w = container.clientWidth;
            let h = container.clientHeight;
            if (w < 2 || h < 2) {
                w = window.innerWidth;
                h = window.innerHeight;
            }
            if (w < 2 || h < 2) return;
            const rw = Math.max(2, Math.floor(w * rs));
            const rh = Math.max(2, Math.floor(h * rs));
            renderer.setSize(rw, rh, false);
            // Must match actual framebuffer (includes devicePixelRatio) — gl_FragCoord is in buffer pixels.
            renderer.getDrawingBufferSize(resolutionBuf);
            uniforms.resolution.value.copy(resolutionBuf);
        };

        setSize();
        requestAnimationFrame(setSize);

        const scheduleResize = () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(() => {
                resizeRaf = 0;
                setSize();
            });
        };

        const ro = new ResizeObserver(() => scheduleResize());
        ro.observe(container);

        let raf = 0;
        let lastRenderTime = performance.now();

        const tick = (dt: number) => {
            if (!reduceMotion) {
                // Delta time guarantees constant speed even if React thread drops frames.
                // 0.0035 loading speed = ~1.5 - 2 slow, elegant laps.
                const speedMult = isLoading ? 0.0035 : 0.001;
                uniforms.time.value += dt * speedMult;
            }
            renderer.render(scene, camera);
        };

        const minFrameMs = fpsCap > 0 ? 1000 / fpsCap : 0;

        const animate = (now: number) => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") {
                lastRenderTime = now; // Maintain delta across bg tabs
                raf = requestAnimationFrame(animate);
                return;
            }
            
            const dt = now - lastRenderTime;
            if (minFrameMs > 0 && dt < minFrameMs) {
                raf = requestAnimationFrame(animate);
                return;
            }
            
            // Cap massive jumps if JS thread blocked
            tick(Math.min(dt, 200)); 
            lastRenderTime = now;
            
            raf = requestAnimationFrame(animate);
        };

        const onVisibility = () => {
            if (document.visibilityState !== "hidden" && !reduceMotion) {
                lastRenderTime = performance.now();
            }
        };

        if (reduceMotion) {
            tick(0);
        } else {
            raf = requestAnimationFrame(animate);
            document.addEventListener("visibilitychange", onVisibility);
        }

        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
            cancelAnimationFrame(raf);
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            ro.disconnect();
            renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
            scene.remove(mesh);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [monochrome, maxDpr, renderScale, fpsCap, variant]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "transition-opacity duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100",
                surfaceReady ? "opacity-100" : "opacity-0",
                className
            )}
        />
    );
}
