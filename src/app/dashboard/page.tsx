"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProjectCard from "@/components/mvp/ProjectCard";
import IdeaInput from "@/components/mvp/IdeaInput";
import DashboardSkeleton from "@/components/mvp/DashboardSkeleton";

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
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="section-container py-4 flex justify-between items-center">
          <Link href="/" className="font-display font-bold text-xl">
            KroniQ
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">Dashboard</span>
            <button
              onClick={handleLogout}
              className="text-sm text-white/60 hover:text-white transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="section-container section-spacing">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <button
            onClick={() => setShowNewProject(true)}
            className="btn-gradient px-5 py-2.5"
          >
            New Project
          </button>
        </div>

        {showNewProject && (
          <div className="glass-card mb-8">
            <h2 className="text-lg font-semibold mb-4">Enter your idea</h2>
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
          <div className="glass-card text-center py-16">
            <p className="text-white/60 mb-4">
              No projects yet. Create one to get started.
            </p>
            <button
              onClick={() => setShowNewProject(true)}
              className="btn-gradient px-5 py-2.5"
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
