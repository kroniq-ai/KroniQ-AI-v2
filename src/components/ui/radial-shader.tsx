"use client";

import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/* ================ SHADER ================= */
const SHADER_SRC = `#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3  iResolution;
uniform float iTime;
uniform int   iFrame;
uniform vec4  iMouse;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2  r  = iResolution.xy;
    float t  = iTime;
    vec3  FC = vec3(fragCoord, t);
    vec4  o  = vec4(0.0);

    vec2 p = FC.xy - r * 0.5;
    for (float i, a; i++ < 7.0; )
    {
        a = length(p) / r.y - (i * i) / 50.0;
        float denom = max(a, -a * 4.0) + 2.0 / r.y;

        a = atan(p.y, p.x) * 3.0 + t * sin(i * i) + i * i;
        float gate = smoothstep(0.0, 0.6, cos(a));

        o += 0.02 / denom * gate * (1.0 + sin(a - i + vec4(0.0, 0.2, 0.5, 0.0)));
    }

    o = tanh(o);
    fragColor = vec4(o.rgb, 1.0);
}

void main(){
  mainImage(fragColor, gl_FragCoord.xy);
}
`;

const VERT_SRC = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){ v_uv = a_pos*0.5+0.5; gl_Position = vec4(a_pos,0.0,1.0); }
`;

function safeCompile(gl: WebGL2RenderingContext, type: number, src: string) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    const ok = gl.getShaderParameter(sh, gl.COMPILE_STATUS);
    const log = gl.getShaderInfoLog(sh) || "";
    return { shader: ok ? sh : null, log };
}

function safeLink(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    const ok = gl.getProgramParameter(prog, gl.LINK_STATUS);
    const log = gl.getProgramInfoLog(prog) || "";
    return { program: ok ? prog : null, log };
}

function drawError(gl: WebGL2RenderingContext, msg: string) {
    console.error(msg);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.08, 0.02, 0.02, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

export type RadialShaderCanvasProps = {
    fragSource?: string;
    /** Caps internal canvas resolution; default follows DPR capped at ~1.5 */
    pixelRatio?: number;
    /** When set, limits draw rate (section backdrops); omit for full frame rate (demos). */
    maxFps?: number;
    /** When false, skip mouse uniforms (cheaper; use for backdrops under UI). */
    interactive?: boolean;
    className?: string;
    canvasClassName?: string;
};

export function RadialShaderCanvas({
    fragSource = SHADER_SRC,
    pixelRatio,
    maxFps,
    interactive = false,
    className,
    canvasClassName,
}: RadialShaderCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const startRef = useRef<number>(0);
    const frameRef = useRef<number>(0);
    const mouseRef = useRef({ x: 0, y: 0, l: 0, r: 0 });

    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const g = c.getContext("webgl2", { premultipliedAlpha: false, alpha: false, antialias: false });
        if (!g) return;

        /** Stable for nested callbacks (TS control-flow). */
        const canvasEl: HTMLCanvasElement = c;
        const glCtx: WebGL2RenderingContext = g;

        let disposed = false;
        let vao: WebGLVertexArrayObject | null = null;
        let vbo: WebGLBuffer | null = null;
        let program: WebGLProgram | null = null;
        let ro: ResizeObserver | null = null;
        let resizeScheduled = false;

        let mouseEventsBound = false;
        let ctxEventsBound = false;
        let onCtxMenu: ((e: Event) => void) | null = null;

        let pageVisible = !document.hidden;
        let canvasVisible = true;

        const getDpr = () => {
            const sys = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
            const cap = pixelRatio ?? Math.min(sys, 1.5);
            return Math.max(1, Math.min(2, cap));
        };

        function applySize() {
            resizeScheduled = false;
            if (disposed) return;
            const dpr = getDpr();
            const cssW = Math.max(1, canvasEl.clientWidth | 0);
            const cssH = Math.max(1, canvasEl.clientHeight | 0);
            const w = Math.max(1, Math.floor(cssW * dpr));
            const h = Math.max(1, Math.floor(cssH * dpr));
            if (canvasEl.width !== w || canvasEl.height !== h) {
                canvasEl.width = w;
                canvasEl.height = h;
                glCtx.viewport(0, 0, w, h);
            }
        }

        function scheduleSize() {
            if (resizeScheduled) return;
            resizeScheduled = true;
            requestAnimationFrame(applySize);
        }

        function onMove(e: MouseEvent) {
            const rect = canvasEl.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            mouseRef.current.x = Math.max(0, Math.min(x, rect.width));
            mouseRef.current.y = Math.max(0, Math.min(rect.height - y, rect.height));
        }

        function onDown(e: MouseEvent) {
            if (e.button === 0) mouseRef.current.l = 1;
            if (e.button === 2) mouseRef.current.r = 1;
        }

        function onUp(e: MouseEvent) {
            if (e.button === 0) mouseRef.current.l = 0;
            if (e.button === 2) mouseRef.current.r = 0;
        }

        function onContextLost(ev: Event) {
            ev.preventDefault();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        function onContextRestored() {
            scheduleSize();
            startRef.current = performance.now();
            frameRef.current = 0;
            if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
        }

        vao = glCtx.createVertexArray();
        vbo = glCtx.createBuffer();
        if (!vao || !vbo) {
            drawError(glCtx, "Failed to create VAO/VBO");
            return cleanup;
        }
        glCtx.bindVertexArray(vao);
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vbo);
        glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), glCtx.STATIC_DRAW);
        glCtx.enableVertexAttribArray(0);
        glCtx.vertexAttribPointer(0, 2, glCtx.FLOAT, false, 0, 0);

        const { shader: vs, log: vsLog } = safeCompile(glCtx, glCtx.VERTEX_SHADER, VERT_SRC);
        if (!vs) {
            drawError(glCtx, `Vertex compile error:\n${vsLog}`);
            return cleanup;
        }
        const { shader: fs, log: fsLog } = safeCompile(glCtx, glCtx.FRAGMENT_SHADER, fragSource);
        if (!fs) {
            drawError(glCtx, `Fragment compile error:\n${fsLog}`);
            glCtx.deleteShader(vs);
            return cleanup;
        }
        const linked = safeLink(glCtx, vs, fs);
        glCtx.deleteShader(vs);
        glCtx.deleteShader(fs);
        if (!linked.program) {
            drawError(glCtx, `Program link error:\n${linked.log}`);
            return cleanup;
        }
        program = linked.program;

        const uResolution = glCtx.getUniformLocation(program, "iResolution");
        const uTime = glCtx.getUniformLocation(program, "iTime");
        const uFrame = glCtx.getUniformLocation(program, "iFrame");
        const uMouse = glCtx.getUniformLocation(program, "iMouse");

        ro = new ResizeObserver(scheduleSize);
        ro.observe(canvasEl);
        scheduleSize();

        if (interactive) {
            canvasEl.addEventListener("mousemove", onMove);
            canvasEl.addEventListener("mousedown", onDown);
            canvasEl.addEventListener("mouseup", onUp);
            onCtxMenu = (e: Event) => e.preventDefault();
            canvasEl.addEventListener("contextmenu", onCtxMenu);
            mouseEventsBound = true;
        }

        canvasEl.addEventListener("webglcontextlost", onContextLost);
        canvasEl.addEventListener("webglcontextrestored", onContextRestored);
        ctxEventsBound = true;

        const io =
            typeof IntersectionObserver !== "undefined"
                ? new IntersectionObserver(
                      (entries) => {
                          const e = entries[0];
                          canvasVisible = e ? e.isIntersecting : true;
                      },
                      { root: null, rootMargin: "0px", threshold: 0 }
                  )
                : null;
        io?.observe(canvasEl);

        const onVis = () => {
            pageVisible = !document.hidden;
        };
        document.addEventListener("visibilitychange", onVis);

        let introPass = false;
        const checkIntro = () => { introPass = true; };
        window.addEventListener("voyd-intro-done", checkIntro);
        const fuse = setTimeout(checkIntro, 5500);

        startRef.current = performance.now();
        frameRef.current = 0;
        const minFrameMs = maxFps != null && maxFps > 0 ? 1000 / maxFps : 0;
        let lastDrawTime = 0;

        function tick(now: number) {
            if (disposed) return;
            if (!introPass) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
            if (glCtx.isContextLost()) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            if (!pageVisible || !canvasVisible) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            if (minFrameMs > 0 && now - lastDrawTime < minFrameMs) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }
            lastDrawTime = now;

            const t = (now - startRef.current) / 1000;
            frameRef.current += 1;

            try {
                if (resizeScheduled) applySize();
                glCtx.useProgram(program);

                const dpr = getDpr();
                const w = canvasEl.width;
                const h = canvasEl.height;

                uResolution && glCtx.uniform3f(uResolution, w, h, dpr);
                uTime && glCtx.uniform1f(uTime, t);
                uFrame && glCtx.uniform1i(uFrame, frameRef.current);
                if (uMouse) {
                    const m = mouseRef.current;
                    glCtx.uniform4f(uMouse, m.x * dpr, m.y * dpr, m.l, m.r);
                }

                glCtx.bindVertexArray(vao);
                glCtx.drawArrays(glCtx.TRIANGLES, 0, 3);
            } catch (err) {
                drawError(glCtx, (err as Error)?.message ?? String(err));
            }

            rafRef.current = requestAnimationFrame(tick);
        }
        rafRef.current = requestAnimationFrame(tick);

        function cleanup() {
            disposed = true;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("voyd-intro-done", checkIntro);
            clearTimeout(fuse);
            io?.disconnect();

            if (mouseEventsBound) {
                canvasEl.removeEventListener("mousemove", onMove);
                canvasEl.removeEventListener("mousedown", onDown);
                canvasEl.removeEventListener("mouseup", onUp);
                if (onCtxMenu) canvasEl.removeEventListener("contextmenu", onCtxMenu);
            }
            if (ctxEventsBound) {
                canvasEl.removeEventListener("webglcontextlost", onContextLost);
                canvasEl.removeEventListener("webglcontextrestored", onContextRestored);
            }

            if (ro) {
                try {
                    ro.disconnect();
                } catch {
                    /* noop */
                }
                ro = null;
            }
            if (vbo) {
                try {
                    glCtx.deleteBuffer(vbo);
                } catch {
                    /* noop */
                }
                vbo = null;
            }
            if (vao) {
                try {
                    glCtx.deleteVertexArray(vao);
                } catch {
                    /* noop */
                }
                vao = null;
            }
            if (program) {
                try {
                    glCtx.deleteProgram(program);
                } catch {
                    /* noop */
                }
                program = null;
            }
        }

        return cleanup;
    }, [fragSource, pixelRatio, maxFps, interactive]);

    return (
        <div className={cn("absolute inset-0", className)}>
            <canvas
                ref={canvasRef}
                className={cn("block h-full w-full", interactive ? "" : "pointer-events-none", canvasClassName)}
                style={{ width: "100%", height: "100%", display: "block" }}
            />
        </div>
    );
}

export type RadialShaderBackdropProps = {
    className?: string;
    interactive?: boolean;
    /** Lower = fewer pixels to shade (default backdrop uses 1). */
    pixelRatio?: number;
    maxFps?: number;
};

/** Fills parent; black base + radial WebGL2 field. */
export function RadialShaderBackdrop({
    className,
    interactive = false,
    pixelRatio,
    maxFps,
}: RadialShaderBackdropProps) {
    return (
        <div className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-black", className)} aria-hidden>
            <RadialShaderCanvas interactive={interactive} pixelRatio={pixelRatio} maxFps={maxFps} />
        </div>
    );
}

/** Full-viewport demo (optional). */
export default function RadialShaderDemo() {
    return (
        <div
            className="fixed inset-0 overflow-hidden bg-black"
            style={{ width: "100vw", height: "100dvh" }}
        >
            <RadialShaderCanvas interactive className="relative h-full w-full" />
        </div>
    );
}
