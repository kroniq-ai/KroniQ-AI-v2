"use client";

import { useState } from "react";
import { Code, Layers, Terminal } from "lucide-react";
import FormattedResponse from "@/components/mvp/FormattedResponse";

interface TechData {
  direct_response?: string;
  stack?: string[];
  arch_text?: string;
  code_scaffold?: string;
  dev_tasks?: Array<{ title: string; command?: string }>;
}

interface Props {
  data: TechData | null;
  codeScaffold?: string; // From marketing_assets
}

export default function TechCard({ data, codeScaffold }: Props) {
  const hasPlanInResponse = !!(data?.stack?.length || data?.arch_text || data?.code_scaffold || data?.dev_tasks?.length);
  const isQuestionOnly = data?.direct_response && !hasPlanInResponse;
  const code = isQuestionOnly ? undefined : (codeScaffold ?? data?.code_scaffold);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (code) {
      const blob = new Blob([code], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "landing.html";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!data && !code) {
    return (
      <p className="text-white/50 text-sm">Run KroniQ to generate tech plan.</p>
    );
  }

  return (
    <div className="space-y-8">
      {data?.direct_response && (
        <section>
          <FormattedResponse content={data.direct_response} />
        </section>
      )}
      {!isQuestionOnly && (
      <>
      {/* Tech Stack */}
      {data?.stack && data.stack.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <Layers size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Recommended Stack
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.stack.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-sm text-white/90"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Architecture */}
      {data?.arch_text && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="icon-container">
              <Terminal size={18} className="text-white/70" />
            </span>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Architecture
            </h4>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.04]">
            <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono">
              {data.arch_text}
            </pre>
          </div>
        </section>
      )}

      {/* Website Preview */}
      {code && (
        <section>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="icon-container">
                <Code size={18} className="text-white/70" />
              </span>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">
                Live Preview
              </h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 transition"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="text-xs px-3 py-1.5 rounded-lg btn-gradient !py-1.5 !px-3"
              >
                Download HTML
              </button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-white shadow-lg">
            <iframe
              srcDoc={code}
              title="Website preview"
              className="w-full h-[400px] border-0"
              sandbox="allow-scripts"
            />
          </div>
        </section>
      )}

      {/* Code Scaffold (collapsible) */}
      {code && (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-2">
            Source Code
          </h4>
          <div className="relative rounded-xl overflow-hidden border border-white/[0.08]">
            <pre className="text-xs text-white/70 overflow-x-auto overflow-y-auto max-h-[300px] p-4 bg-[#0d1117]">
              <code>{code}</code>
            </pre>
          </div>
        </section>
      )}

      {data?.dev_tasks && data.dev_tasks.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-3">
            Dev Tasks
          </h4>
          <ul className="space-y-2">
            {data.dev_tasks.map((t, i) => (
              <li
                key={i}
                className="flex gap-3 p-3 rounded-xl bg-white/[0.04] text-sm"
              >
                <span className="text-white/50 shrink-0">{i + 1}.</span>
                <span className="text-white/90">{t.title}</span>
                {t.command && (
                  <code className="text-white/50 font-mono text-xs truncate">
                    {t.command}
                  </code>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      </>
      )}
    </div>
  );
}
