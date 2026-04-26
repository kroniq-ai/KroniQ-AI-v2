"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CEOAssistant from "@/components/mvp/CEOAssistant";
import AppSidebar from "@/components/mvp/AppSidebar";
import AgentChatPanel from "@/components/mvp/AgentChatPanel";
import ProjectPageSkeleton from "@/components/mvp/ProjectPageSkeleton";
import ArtifactsTab from "@/components/mvp/ArtifactsTab";

interface ProjectData {
  id: string;
  title: string;
  idea_text: string;
  status: string;
  jobs: Array<{
    id: string;
    agent_name: string;
    prompt?: string | null;
    status: string;
    response_ref?: { raw?: string; error?: string };
  }>;
  competitors: Array<{ name: string; url?: string; summary?: string }>;
  mvp_features: Array<{
    title: string;
    description?: string;
    priority: number;
    est_hours?: number;
  }>;
  marketing_assets: Array<{
    type: string;
    content: string;
    metadata?: Record<string, unknown>;
  }>;
  financials: {
    pricing_options?: unknown[];
    unit_economics?: unknown;
    initial_costs?: unknown[];
  } | null;
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [agentRunning, setAgentRunning] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "research" | "product" | "tech" | "marketing" | "finance" | "artifacts"
  >("research");

  const fetchProject = async () => {
    const doFetch = () =>
      fetch(`/api/projects/${id}`, { credentials: "include", cache: "no-store" });
    let res = await doFetch();
    if (res.status === 401) {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await supabase.auth.refreshSession();
        res = await doFetch();
      }
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
    }
    if (res.status === 404) {
      router.replace("/dashboard");
      return;
    }
    const data = await res.json();
    setProject(data);
  };

  useEffect(() => {
    fetchProject().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!project) return;
    const interval = setInterval(() => {
      if (project.status === "running" || agentRunning) fetchProject();
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.status, agentRunning]);

  const handleRun = async (userConstraints?: string) => {
    setRunning(true);
    const res = await fetch(`/api/projects/${id}/run`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        userConstraints ? { user_constraints: userConstraints } : {}
      ),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Run failed");
      setRunning(false);
      return;
    }
    await fetchProject();
    setRunning(false);
  };

  const handleAgentPrompt = async (agent: string, prompt: string) => {
    setAgentRunning(agent);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000); // 2 min timeout
    try {
      const res = await fetch(`/api/projects/${id}/agent`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, prompt }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Agent failed");
      }
      await fetchProject();
    } finally {
      setAgentRunning(null);
    }
  };

  const handleCEOCommand = (instruction: string) => {
    handleRun(instruction);
  };

  const handleGenerateLogo = async () => {
    const res = await fetch(`/api/projects/${id}/logo`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Logo generation failed");
    await fetchProject();
  };

  const isBusy = running || project?.status === "running";

  if (loading || !project) {
    return <ProjectPageSkeleton />;
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden">
      <AppSidebar
        projectId={id}
        projectTitle={project.title}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        agentRunning={agentRunning}
      />

      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-zinc-950">
        <header className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
          <p className="text-zinc-400 text-sm max-w-2xl truncate">
            {project.idea_text}
          </p>
          <button
            onClick={() => handleRun()}
            disabled={isBusy}
            className="btn-gradient px-5 py-2.5 rounded-xl disabled:opacity-50 shrink-0 text-sm font-medium"
          >
            {isBusy ? "Running…" : "Run KroniQ"}
          </button>
        </header>

        {isBusy && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/40">
            <p className="text-neutral-400 text-sm">
              Research → Product → CTO → Marketing → Finance
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              This may take 1–2 minutes. Refreshing automatically.
            </p>
          </div>
        )}

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {activeTab === "research" && (
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <AgentChatPanel
              agent="research"
              agentLabel="Research"
              jobs={project.jobs}
              project={project}
              onSend={(p) => handleAgentPrompt("research", p)}
              disabled={agentRunning !== null}
              isRunning={agentRunning === "research"}
              placeholder="e.g. Add more competitors, focus on India market..."
            />
            </div>
          )}
          {activeTab === "product" && (
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <AgentChatPanel
              agent="product"
              agentLabel="Product"
              jobs={project.jobs}
              project={project}
              logoUrl={project.marketing_assets?.find((a) => a.type === "logo")?.content}
              onGenerateLogo={handleGenerateLogo}
              onSend={(p) => handleAgentPrompt("product", p)}
              disabled={agentRunning !== null}
              isRunning={agentRunning === "product"}
              placeholder="e.g. Add a dark mode feature, prioritize mobile..."
            />
            </div>
          )}
          {activeTab === "tech" && (
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <AgentChatPanel
              agent="cto"
              agentLabel="CTO"
              jobs={project.jobs}
              project={project}
              onSend={(p) => handleAgentPrompt("cto", p)}
              disabled={agentRunning !== null}
              isRunning={agentRunning === "cto"}
              placeholder="e.g. Make it a single-page app, add a contact form..."
            />
            </div>
          )}
          {activeTab === "marketing" && (
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <AgentChatPanel
              agent="cmo"
              agentLabel="CMO"
              jobs={project.jobs}
              project={project}
              onSend={(p) => handleAgentPrompt("cmo", p)}
              disabled={agentRunning !== null}
              isRunning={agentRunning === "cmo"}
              placeholder="e.g. Add 3 more LinkedIn posts, tone down the hype..."
            />
            </div>
          )}
          {activeTab === "finance" && (
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <AgentChatPanel
              agent="cfo"
              agentLabel="CFO"
              jobs={project.jobs}
              project={project}
              onSend={(p) => handleAgentPrompt("cfo", p)}
              disabled={agentRunning !== null}
              isRunning={agentRunning === "cfo"}
              placeholder="e.g. Add a freemium tier, focus on B2B..."
            />
            </div>
          )}
          {activeTab === "artifacts" && (
            <div className="flex-1 min-h-0 overflow-auto p-6">
              <ArtifactsTab project={project} />
            </div>
          )}
        </div>
      </main>

      <CEOAssistant
        projectId={id}
        onCommand={handleCEOCommand}
        isRunning={isBusy}
      />
    </div>
  );
}
