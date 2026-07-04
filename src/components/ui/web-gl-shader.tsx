"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { cn } from "@/lib/utils";

export type WebGLShaderProps = {
    className?: string;
    /** Full viewport fixed vs filling a relative parent */
    fixed?: boolean;
};

/**
 * Full-screen quad + raw fragment shader (ribbon math from design reference).
 * WebGL2: GLSL ES 3.00 (`glslVersion`), monochrome white on black.
 */
export function WebGLShader({ className, fixed = false }: WebGLShaderProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene | null;
        camera: THREE.OrthographicCamera | null;
        renderer: THREE.WebGLRenderer | null;
        mesh: THREE.Mesh | null;
        uniforms: {
            resolution: { value: THREE.Vector2 };
            time: { value: number };
            xScale: { value: number };
            yScale: { value: number };
            distortion: { value: number };
            uGain: { value: number };
        } | null;
    }>({
        scene: null,
        camera: null,
        renderer: null,
        mesh: null,
        uniforms: null,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const { current: refs } = sceneRef;

        const TIME_SPEED = 0.6;
        const MAX_DT = 1 / 45;
        const BUFFER_SCALE = 1;

        let lastTime = performance.now();
        let isPageVisible = !document.hidden;
        let isIntersecting = true;
        let resizeRaf: number | null = null;

        const vertexShader = `
      in vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

        const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;
      uniform float uGain;

      layout(location = 0) out vec4 fragColor;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

        float d = length(p) * distortion;

        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

        float lum = (r + g + b) / 3.0;
        float w = clamp(lum * uGain, 0.0, 1.0);
        fragColor = vec4(w, w, w, 1.0);
      }
    `;

        const measureCssSize = () => {
            const host = canvas.parentElement ?? canvas;
            const r = host.getBoundingClientRect();
            const w = Math.max(1, Math.round(r.width));
            const h = Math.max(1, Math.round(r.height));
            return { w, h };
        };

        const handleResize = () => {
            if (!refs.renderer || !refs.uniforms || !canvas) return;
            const { w: cssW, h: cssH } = measureCssSize();
            const bw = Math.max(1, Math.floor(cssW * BUFFER_SCALE));
            const bh = Math.max(1, Math.floor(cssH * BUFFER_SCALE));

            refs.renderer.setPixelRatio(1);
            refs.renderer.setSize(bw, bh, false);
            refs.renderer.setViewport(0, 0, bw, bh);
            refs.uniforms.resolution.value.set(bw, bh);
        };

        const scheduleResize = () => {
            if (resizeRaf != null) return;
            resizeRaf = requestAnimationFrame(() => {
                resizeRaf = null;
                handleResize();
            });
        };

        const tick = () => {
            if (!refs.uniforms || !refs.renderer || !refs.scene || !refs.camera) return;
            if (!isIntersecting) {
                lastTime = performance.now();
                return;
            }

            const now = performance.now();
            let dt = (now - lastTime) / 1000;
            lastTime = now;
            if (dt > MAX_DT) dt = MAX_DT;

            refs.uniforms.time.value += dt * TIME_SPEED;
            refs.renderer.render(refs.scene, refs.camera);
        };

        const syncAnimationLoop = () => {
            const r = refs.renderer;
            if (!r) return;
            if (isPageVisible) {
                lastTime = performance.now();
                r.setAnimationLoop(tick);
            } else {
                r.setAnimationLoop(null);
            }
        };

        const initScene = () => {
            refs.scene = new THREE.Scene();
            refs.renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: false,
                antialias: false,
                depth: false,
                stencil: false,
                powerPreference: "high-performance",
                premultipliedAlpha: false,
            });
            refs.renderer.setClearColor(0x000000, 1);

            refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
            refs.camera.position.z = 1;

            refs.uniforms = {
                resolution: { value: new THREE.Vector2(1, 1) },
                time: { value: 0.0 },
                xScale: { value: 1.0 },
                yScale: { value: 0.5 },
                distortion: { value: 0.05 },
                uGain: { value: 0.22 },
            };

            const position = new Float32Array([
                -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
            ]);

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));

            const material = new THREE.RawShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: refs.uniforms,
                side: THREE.DoubleSide,
                glslVersion: THREE.GLSL3,
            });

            refs.mesh = new THREE.Mesh(geometry, material);
            refs.scene.add(refs.mesh);

            handleResize();
            syncAnimationLoop();
            requestAnimationFrame(handleResize);
        };

        const onVisibility = () => {
            isPageVisible = !document.hidden;
            syncAnimationLoop();
        };

        const io = new IntersectionObserver(
            ([entry]) => {
                isIntersecting = entry?.isIntersecting ?? false;
            },
            { rootMargin: "600px", threshold: 0 }
        );
        io.observe(canvas);

        initScene();

        window.addEventListener("resize", scheduleResize, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        const ro =
            typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleResize) : null;
        if (ro) {
            if (canvas.parentElement) ro.observe(canvas.parentElement);
            else ro.observe(canvas);
        }

        return () => {
            io.disconnect();
            ro?.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("resize", scheduleResize);
            if (resizeRaf != null) cancelAnimationFrame(resizeRaf);
            refs.renderer?.setAnimationLoop(null);
            if (refs.mesh) {
                refs.scene?.remove(refs.mesh);
                refs.mesh.geometry.dispose();
                if (refs.mesh.material instanceof THREE.Material) {
                    refs.mesh.material.dispose();
                }
            }
            refs.renderer?.dispose();
            refs.scene = null;
            refs.camera = null;
            refs.renderer = null;
            refs.mesh = null;
            refs.uniforms = null;
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={cn(
                "pointer-events-none block min-h-full min-w-full w-full transform-gpu [image-rendering:auto]",
                fixed ? "fixed inset-0 h-full" : "absolute inset-0 h-full",
                className
            )}
            style={{ width: "100%", height: "100%", display: "block", minWidth: "100%" }}
            aria-hidden
        />
    );
}
