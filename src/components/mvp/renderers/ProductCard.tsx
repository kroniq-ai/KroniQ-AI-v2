"use client";

import { useState } from "react";
import { User, CheckSquare, Map, FileText, Image, Loader2 } from "lucide-react";
import FormattedResponse from "@/components/mvp/FormattedResponse";

interface ProductData {
  direct_response?: string;
  personas?: Array<{ name: string; problem?: string; jobs_to_be_done?: string }>;
  mvp_features?: Array<{
    title: string;
    desc?: string;
    must_have?: boolean;
    est_hours?: number;
  }>;
  roadmap?: Array<{ week: number; tasks?: string[] }>;
  wireframe_notes?: string;
}

interface Props {
  data: ProductData | null;
  mvpFeatures?: Array<{
    title: string;
    description?: string;
    priority?: number;
    est_hours?: number;
  }>;
  logoUrl?: string | null;
  onGenerateLogo?: () => Promise<void>;
}

export default function ProductCard({ data, mvpFeatures, logoUrl, onGenerateLogo }: Props) {
  const [logoGenerating, setLogoGenerating] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const hasPlanInResponse = (data?.personas?.length ?? 0) > 0 || (data?.mvp_features?.length ?? 0) > 0 || (data?.roadmap?.length ?? 0) > 0;
  const isQuestionOnly = data?.direct_response && !hasPlanInResponse;
  const features = isQuestionOnly ? [] : ((mvpFeatures && mvpFeatures.length > 0) ? mvpFeatures : data?.mvp_features ?? []);

  if (!data && features.length === 0) {
    return (
      <p className="text-white/50 text-sm">Run KroniQ to generate MVP features.</p>
    );
  }

  return (
    <div className="space-y-8 text-zinc-200">
      {data?.direct_response && (
        <section>
          <FormattedResponse content={data.direct_response} />
        </section>
      )}
      {!isQuestionOnly && (
      <>
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="icon-container">
            <Image size={18} className="text-white/70" />
          </span>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Brand / Logo
          </h4>
        </div>
        <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.08] border-dashed text-center">
          {logoUrl ? (
            <div className="space-y-3">
              <img
                src={logoUrl}
                alt="Project logo"
                className="mx-auto max-h-32 w-auto rounded-lg object-contain"
              />
              <button
                onClick={async () => {
                  if (!onGenerateLogo) return;
                  setLogoGenerating(true);
                  setLogoError(null);
                  try {
                    await onGenerateLogo();
                  } catch (e) {
                    setLogoError(e instanceof Error ? e.message : "Failed");
                  } finally {
                    setLogoGenerating(false);
                  }
                }}
                disabled={!onGenerateLogo || logoGenerating}
                className="text-xs text-white/50 hover:text-white/70 disabled:opacity-50 flex items-center gap-1 mx-auto"
              >
                {logoGenerating ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Regenerating…
                  </>
                ) : (
                  "Regenerate"
                )}
              </button>
            </div>
          ) : (
            <>
              {logoError && (
                <p className="text-neutral-400 text-xs mb-2">{logoError}</p>
              )}
              <p className="text-white/60 text-sm mb-3">
                Generate a logo with kie.ai
              </p>
              <button
                onClick={async () => {
                  if (!onGenerateLogo) return;
                  setLogoGenerating(true);
                  setLogoError(null);
                  try {
                    await onGenerateLogo();
                  } catch (e) {
                    setLogoError(e instanceof Error ? e.message : "Failed");
                  } finally {
                    setLogoGenerating(false);
                  }
                }}
                disabled={!onGenerateLogo || logoGenerating}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white/80 transition disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {logoGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Generate Logo"
                )}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Personas */}
      {data?.personas && data.personas.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <User size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              User Personas
            </h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.personas.map((p, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/40"
              >
                <p className="font-medium text-white/95">{p.name}</p>
                {p.problem && (
                  <p className="text-white/60 text-sm mt-1">{p.problem}</p>
                )}
                {p.jobs_to_be_done && (
                  <p className="text-white/50 text-xs mt-2 italic">
                    Jobs: {p.jobs_to_be_done}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MVP Features */}
      {features.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <CheckSquare size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              MVP Features
            </h4>
          </div>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li
                key={i}
                className="flex gap-3 p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/40"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white/80">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-white/95">{f.title}</p>
                  {((f as { description?: string }).description ?? (f as { desc?: string }).desc) && (
                    <p className="text-white/60 text-sm mt-0.5">
                      {(f as { description?: string }).description ?? (f as { desc?: string }).desc}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {f.est_hours != null && (
                      <span className="text-[10px] uppercase tracking-wider text-white/40 bg-white/5 px-2 py-0.5 rounded">
                        ~{f.est_hours}h
                      </span>
                    )}
                    {(f as { must_have?: boolean }).must_have !== false && (
                      <span className="text-[10px] uppercase tracking-wider text-neutral-300 bg-white/10 px-2 py-0.5 rounded">
                        Must have
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 3-Week Roadmap */}
      {data?.roadmap && data.roadmap.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <Map size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              3-Week Roadmap
            </h4>
          </div>
          <div className="space-y-4">
            {data.roadmap.map((r, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 w-16 text-center">
                  <span className="text-xs font-semibold text-white/50 uppercase">
                    Week {r.week}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  {r.tasks?.map((t, j) => (
                    <p key={j} className="text-sm text-white/80 flex gap-2">
                      <span className="text-white/40">•</span>
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data?.wireframe_notes && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <FileText size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Wireframe Notes
            </h4>
          </div>
          <p className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 text-zinc-200 text-sm leading-relaxed">
            {data.wireframe_notes}
          </p>
        </section>
      )}
      </>
      )}
    </div>
  );
}
