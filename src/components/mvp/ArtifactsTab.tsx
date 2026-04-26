"use client";

import { useState } from "react";
import { FolderDown, Code, FileText, Image, Download } from "lucide-react";

interface ArtifactsTabProps {
  project: {
    marketing_assets?: Array<{ type: string; content: string; metadata?: Record<string, unknown> }>;
    mvp_features?: Array<{ title: string; description?: string }>;
    competitors?: Array<{ name: string; url?: string }>;
  };
}

export default function ArtifactsTab({ project }: ArtifactsTabProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const codeScaffold = project.marketing_assets?.find((a) => a.type === "code_scaffold")?.content;
  const logo = project.marketing_assets?.find((a) => a.type === "logo")?.content;
  const socialPosts = project.marketing_assets?.filter((a) => a.type === "social_post") ?? [];
  const emailTemplates = project.marketing_assets?.filter((a) => a.type === "email_template") ?? [];

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <FolderDown size={20} className="text-zinc-400" />
        <h2 className="text-lg font-semibold text-zinc-100">Artifacts</h2>
      </div>

      <p className="text-zinc-400 text-sm">
        Download or copy your generated assets. Each tab also has inline copy buttons.
      </p>

      <div className="space-y-6">
        {codeScaffold && (
          <div className="rounded-2xl bg-zinc-800/60 border border-zinc-700/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Code size={18} className="text-zinc-400" />
              <h3 className="font-medium text-zinc-100">Landing Page HTML</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Single-page HTML from the Tech tab. Ready to deploy.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(codeScaffold, "landing.html")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm transition"
              >
                <Download size={16} />
                Download HTML
              </button>
              <button
                onClick={() => handleCopy(codeScaffold, "code")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm transition"
              >
                {copied === "code" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {logo && (
          <div className="rounded-2xl bg-zinc-800/60 border border-zinc-700/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Image size={18} className="text-zinc-400" />
              <h3 className="font-medium text-zinc-100">Logo</h3>
            </div>
            <div className="flex items-center gap-4">
              <img src={logo} alt="Project logo" className="h-20 w-auto rounded-lg" />
              <a
                href={logo}
                download="logo.png"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm transition"
              >
                <Download size={16} />
                Download
              </a>
            </div>
          </div>
        )}

        {socialPosts.length > 0 && (
          <div className="rounded-2xl bg-zinc-800/60 border border-zinc-700/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-zinc-400" />
              <h3 className="font-medium text-zinc-100">Social Posts ({socialPosts.length})</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-4">
              Copy from the Marketing tab for full formatting.
            </p>
            <div className="space-y-2">
              {socialPosts.slice(0, 3).map((a, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-zinc-900/50 text-zinc-300 text-sm line-clamp-2"
                >
                  {a.content.slice(0, 120)}…
                </div>
              ))}
            </div>
          </div>
        )}

        {emailTemplates.length > 0 && (
          <div className="rounded-2xl bg-zinc-800/60 border border-zinc-700/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-zinc-400" />
              <h3 className="font-medium text-zinc-100">Email Templates ({emailTemplates.length})</h3>
            </div>
            <p className="text-zinc-400 text-sm">
              Copy from the Marketing tab for subject + body.
            </p>
          </div>
        )}

        {!codeScaffold && !logo && socialPosts.length === 0 && emailTemplates.length === 0 && (
          <div className="rounded-2xl bg-zinc-800/40 border border-zinc-700/30 border-dashed p-12 text-center">
            <p className="text-zinc-500 text-sm">
              No artifacts yet. Run KroniQ or chat with agents to generate code, logo, and marketing assets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
