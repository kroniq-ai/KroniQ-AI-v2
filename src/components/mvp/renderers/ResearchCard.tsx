"use client";

import {
  Search,
  TrendingUp,
  Users,
  FileText,
  Cpu,
  Shield,
  Megaphone,
  Briefcase,
  Lightbulb,
} from "lucide-react";
import FormattedResponse from "@/components/mvp/FormattedResponse";

interface ResearchData {
  direct_response?: string;
  market_research?: {
    market_size?: string;
    market_trends?: string[];
    top_competitors?: Array<{
      name: string;
      url?: string;
      summary?: string;
      differentiator?: string;
      pricing?: string;
    }>;
    customer_pains?: string[];
    evidence?: Array<{ source?: string; quote?: string }>;
  };
  technical_research?: {
    recommended_stack?: string[];
    key_apis_integrations?: Array<{ name: string; purpose?: string; docs_url?: string }>;
    technical_risks?: string[];
    build_complexity?: string;
  };
  regulatory_compliance?: {
    relevant_regulations?: Array<{ name: string; applies_because?: string; key_requirements?: string }>;
    data_privacy_notes?: string;
    ip_considerations?: string;
  };
  go_to_market?: {
    target_segments?: Array<{ segment: string; size?: string; acquisition_channel?: string }>;
    pricing_benchmarks?: string[];
    distribution_channels?: string[];
    launch_timing_notes?: string;
  };
  resource_requirements?: {
    team_needed?: string;
    skills_required?: string[];
    timeline_benchmark?: string;
    cost_estimates?: { min?: string; realistic?: string; notes?: string };
  };
  key_findings?: string[];
  confidence?: string;
  // Legacy flat format (for backwards compat)
  market_size?: string;
  top_competitors?: Array<{ name: string; url?: string; summary?: string; differentiator?: string }>;
  customer_pains?: string[];
  evidence?: Array<{ source?: string; quote?: string }>;
}

interface Props {
  data: ResearchData | null;
  competitors?: Array<{ name: string; url?: string; summary?: string }>;
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="icon-container">{icon}</span>
        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </h4>
      </div>
      {children}
    </section>
  );
}

export default function ResearchCard({ data, competitors }: Props) {
  const mr = data?.market_research;
  const tr = data?.technical_research;
  const rc = data?.regulatory_compliance;
  const gtm = data?.go_to_market;
  const rr = data?.resource_requirements;

  const hasPlanInResponse = !!(mr || tr || rc || gtm || rr || (data?.key_findings?.length ?? 0));
  const isQuestionOnly = data?.direct_response && !hasPlanInResponse;

  const list = isQuestionOnly ? [] : (competitors && competitors.length > 0 ? competitors : mr?.top_competitors ?? data?.top_competitors ?? []);

  const marketSize = isQuestionOnly ? undefined : (mr?.market_size ?? data?.market_size);
  const customerPains = isQuestionOnly ? [] : (mr?.customer_pains ?? data?.customer_pains ?? []);
  const evidence = isQuestionOnly ? [] : (mr?.evidence ?? data?.evidence ?? []);

  const hasContent =
    data &&
    (data.direct_response ||
      marketSize ||
      list.length > 0 ||
      customerPains.length > 0 ||
      evidence.length > 0 ||
      mr?.market_trends?.length ||
      tr ||
      rc ||
      gtm ||
      rr ||
      data.key_findings?.length);

  if (!hasContent) {
    return (
      <p className="text-white/50 text-sm">Run KroniQ to generate research.</p>
    );
  }

  return (
    <div className="space-y-8 text-zinc-200">
      {/* Direct answer — when user asks a question */}
      {data?.direct_response && (
        <section>
          <FormattedResponse content={data.direct_response} />
        </section>
      )}
      {!isQuestionOnly && (
      <>
      {/* Key Findings */}
      {data?.key_findings && data.key_findings.length > 0 && (
        <Section icon={<Lightbulb size={18} className="text-white/70" />} title="Key Findings">
          <ul className="space-y-2">
            {data.key_findings.map((f, i) => (
              <li
                key={i}
                className="flex gap-3 p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 text-sm text-zinc-200 leading-relaxed"
              >
                <span className="text-zinc-500 shrink-0 font-medium">{i + 1}.</span>
                {f}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Market Research */}
      {(marketSize || list.length > 0 || customerPains.length > 0 || mr?.market_trends?.length) && (
        <>
          {marketSize && (
            <Section icon={<TrendingUp size={18} className="text-white/70" />} title="Market Size (TAM)">
              <div className="p-4 rounded-xl bg-white/[0.04]">
                <p className="text-white/90 leading-relaxed text-[15px]">{marketSize}</p>
              </div>
            </Section>
          )}

          {mr?.market_trends && mr.market_trends.length > 0 && (
            <Section icon={<TrendingUp size={18} className="text-white/70" />} title="Market Trends">
              <ul className="space-y-1">
                {mr.market_trends.map((t, i) => (
                  <li key={i} className="text-sm text-white/80 flex gap-2">
                    <span className="text-white/40">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {list.length > 0 && (
            <Section icon={<Search size={18} className="text-white/70" />} title="Top Competitors">
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] transition"
                  >
                    <a
                      href={c.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-white/95 hover:text-white block"
                    >
                      {c.name}
                    </a>
                    {(c.summary || (c as { differentiator?: string }).differentiator) && (
                      <p className="text-white/60 text-sm mt-1 line-clamp-2">
                        {c.summary ?? (c as { differentiator?: string }).differentiator}
                      </p>
                    )}
                    {(c as { pricing?: string }).pricing && (
                      <p className="text-white/45 text-xs mt-1">{(c as { pricing?: string }).pricing}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {customerPains.length > 0 && (
            <Section icon={<Users size={18} className="text-white/70" />} title="Customer Pain Points">
              <ul className="space-y-2">
                  {customerPains.map((p, i) => (
                  <li
                    key={i}
                    className="flex gap-3 p-3 rounded-xl bg-white/[0.04] text-sm text-white/85"
                  >
                    <span className="text-white/40 shrink-0">{i + 1}.</span>
                    {p}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}

      {/* Technical Research */}
      {tr && (tr.recommended_stack?.length || tr.key_apis_integrations?.length || tr.technical_risks?.length || tr.build_complexity) && (
        <Section icon={<Cpu size={18} className="text-white/70" />} title="Technical Research">
          <div className="space-y-4">
            {tr.recommended_stack && tr.recommended_stack.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-2">Recommended stack</p>
                <div className="flex flex-wrap gap-2">
                  {tr.recommended_stack.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.08] text-sm text-white/90"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {tr.key_apis_integrations && tr.key_apis_integrations.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-2">APIs & integrations</p>
                <ul className="space-y-1">
                  {tr.key_apis_integrations.map((a, i) => (
                    <li key={i} className="text-sm">
                      <a
                        href={a.docs_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/85 hover:text-white"
                      >
                        {a.name}
                      </a>
                      {a.purpose && (
                        <span className="text-white/50"> — {a.purpose}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tr.technical_risks && tr.technical_risks.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-2">Technical risks</p>
                <ul className="space-y-1">
                  {tr.technical_risks.map((r, i) => (
                    <li key={i} className="text-sm text-white/75 flex gap-2">
                      <span className="text-neutral-400">⚠</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tr.build_complexity && (
              <p className="text-sm text-white/70">
                <strong>Build complexity:</strong> {tr.build_complexity}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* Regulatory & Compliance */}
      {rc && (rc.relevant_regulations?.length || rc.data_privacy_notes || rc.ip_considerations) && (
        <Section icon={<Shield size={18} className="text-white/70" />} title="Regulatory & Compliance">
          <div className="space-y-4">
            {rc.relevant_regulations && rc.relevant_regulations.length > 0 && (
              <ul className="space-y-2">
                {rc.relevant_regulations.map((r, i) => (
                  <li key={i} className="p-3 rounded-xl bg-white/[0.04] text-sm">
                    <p className="font-medium text-white/90">{r.name}</p>
                    {r.applies_because && (
                      <p className="text-white/60 text-xs mt-0.5">{r.applies_because}</p>
                    )}
                    {r.key_requirements && (
                      <p className="text-white/70 mt-1">{r.key_requirements}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {rc.data_privacy_notes && (
              <p className="text-sm text-white/75">{rc.data_privacy_notes}</p>
            )}
            {rc.ip_considerations && (
              <p className="text-sm text-white/75">{rc.ip_considerations}</p>
            )}
          </div>
        </Section>
      )}

      {/* Go-to-Market */}
      {gtm && (gtm.target_segments?.length || gtm.pricing_benchmarks?.length || gtm.distribution_channels?.length || gtm.launch_timing_notes) && (
        <Section icon={<Megaphone size={18} className="text-white/70" />} title="Go-to-Market">
          <div className="space-y-4">
            {gtm.target_segments && gtm.target_segments.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-2">Target segments</p>
                <ul className="space-y-2">
                  {gtm.target_segments.map((s, i) => (
                    <li key={i} className="text-sm text-white/80">
                      <strong>{s.segment}</strong>
                      {s.size && <span className="text-white/50"> — {s.size}</span>}
                      {s.acquisition_channel && (
                        <span className="text-white/50"> · {s.acquisition_channel}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {gtm.pricing_benchmarks && gtm.pricing_benchmarks.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-2">Pricing benchmarks</p>
                <ul className="space-y-0.5">
                  {gtm.pricing_benchmarks.map((p, i) => (
                    <li key={i} className="text-sm text-white/75">• {p}</li>
                  ))}
                </ul>
              </div>
            )}
            {gtm.distribution_channels && gtm.distribution_channels.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-2">Distribution channels</p>
                <p className="text-sm text-white/75">{gtm.distribution_channels.join(", ")}</p>
              </div>
            )}
            {gtm.launch_timing_notes && (
              <p className="text-sm text-white/70 italic">{gtm.launch_timing_notes}</p>
            )}
          </div>
        </Section>
      )}

      {/* Resource Requirements */}
      {rr && (rr.team_needed || rr.skills_required?.length || rr.timeline_benchmark || rr.cost_estimates) && (
        <Section icon={<Briefcase size={18} className="text-white/70" />} title="Resource Requirements">
          <div className="space-y-4">
            {rr.team_needed && (
              <p className="text-sm text-white/85"><strong>Team:</strong> {rr.team_needed}</p>
            )}
            {rr.skills_required && rr.skills_required.length > 0 && (
              <div>
                <p className="text-xs text-white/50 mb-2">Skills required</p>
                <div className="flex flex-wrap gap-2">
                  {rr.skills_required.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.08] text-xs text-white/85">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {rr.timeline_benchmark && (
              <p className="text-sm text-white/75">{rr.timeline_benchmark}</p>
            )}
            {rr.cost_estimates && (rr.cost_estimates.min || rr.cost_estimates.realistic) && (
              <div className="p-4 rounded-xl bg-white/[0.04]">
                {rr.cost_estimates.min && <p className="text-sm">Min: {rr.cost_estimates.min}</p>}
                {rr.cost_estimates.realistic && <p className="text-sm">Realistic: {rr.cost_estimates.realistic}</p>}
                {rr.cost_estimates.notes && <p className="text-xs text-white/50 mt-1">{rr.cost_estimates.notes}</p>}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Evidence / Sources */}
      {evidence.length > 0 && (
        <Section icon={<FileText size={18} className="text-white/70" />} title="Evidence & Sources">
          <ul className="space-y-2">
            {evidence.map((e, i) => (
              <li key={i} className="p-3 rounded-xl bg-white/[0.04] text-sm">
                {e.source && (
                  <a
                    href={e.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white block truncate"
                  >
                    {e.source}
                  </a>
                )}
                {e.quote && (
                  <p className="text-white/60 mt-0.5 italic">&ldquo;{e.quote}&rdquo;</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data?.confidence === "low" && (
        <p className="text-neutral-400 text-sm italic">
          Low confidence — consider adding more context or re-running research.
        </p>
      )}
      </>
      )}
    </div>
  );
}
