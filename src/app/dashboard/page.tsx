"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/mvp/ProjectCard";
import IdeaInput from "@/components/mvp/IdeaInput";
import DashboardSkeleton from "@/components/mvp/DashboardSkeleton";
import { AppPlatformHeader } from "@/components/app/AppPlatformHeader";
import { glassDark } from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  idea_text: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      fetchProjects();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchProjects = async () => {
    setLoading(true);
    let res = await fetch("/api/projects", { credentials: "include", cache: "no-store" });
    if (res.status === 401) {
      const { data } = await createClient().auth.getSession();
      if (data.session) {
        await createClient().auth.refreshSession();
        res = await fetch("/api/projects", { credentials: "include", cache: "no-store" });
      }
      if (res.status === 401) {
        router.replace("/login");
        setLoading(false);
        return;
      }
    }
    const data = await res.json();
    if (Array.isArray(data)) setProjects(data);
    setLoading(false);
  };

  const handleCreateProject = async (idea: string, context?: string) => {
    setCreating(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea_text: idea,
        context_text: context,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to create project");
      setCreating(false);
      return;
    }
    const project = await res.json();
    setCreating(false);
    setShowNewProject(false);
    router.push(`/project/${project.id}`);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.12) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 100% 100%, rgba(34,211,238,0.08) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.2]" aria-hidden />

      <AppPlatformHeader
        title="Dashboard"
        trailing={
          <button
            type="button"
            onClick={handleLogout}
            className={cn(glassDark.navLink, "text-[13px] text-white/45")}
          >
            Log out
          </button>
        }
      />

      <main className="relative z-10 section-container section-spacing pt-6 md:pt-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <button
            onClick={() => setShowNewProject(true)}
            className="px-6 py-2.5 rounded-full bg-white/10 text-white font-semibold text-sm border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-white/15 transition-all"
          >
            New Project
          </button>
        </div>

        {showNewProject && (
          <div className="bg-black/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-3xl p-6 md:p-8 mb-10">
            <h2 className="text-lg font-semibold mb-6 text-white/90">Enter your idea</h2>
            <IdeaInput
              onSubmit={handleCreateProject}
              onCancel={() => setShowNewProject(false)}
              isLoading={creating}
            />
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : !projects.length ? (
          <div className="bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl text-center py-20 flex flex-col items-center justify-center">
            <p className="text-white/40 mb-6 font-medium">
              No projects yet. Create one to get started.
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              className="px-6 py-2.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-sm border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-emerald-500/30 transition-all"
            >
              New Project
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                id={p.id}
                title={p.title}
                idea_text={p.idea_text}
                status={p.status}
                created_at={p.created_at}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
