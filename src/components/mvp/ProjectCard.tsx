"use client";

import Link from "next/link";

interface ProjectCardProps {
  id: string;
  title: string;
  idea_text: string;
  status: string;
  created_at: string;
}

export default function ProjectCard({
  id,
  title,
  idea_text,
  status,
  created_at,
}: ProjectCardProps) {
  const statusColor =
    status === "completed"
      ? "text-neutral-200"
      : status === "running"
        ? "text-neutral-400"
        : status === "failed"
          ? "text-neutral-500"
          : "text-white/50";

  return (
    <Link
      href={`/project/${id}`}
      className="block bg-black/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.4)] hover:bg-black/60 hover:border-white/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_32px_rgba(0,0,0,0.6)] transition-all duration-300 group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors truncate">{title}</h3>
          <p className="text-sm text-white/50 mt-1.5 leading-relaxed line-clamp-2">{idea_text}</p>
          <p className="text-xs text-white/30 mt-4 font-medium uppercase tracking-widest">
            {new Date(created_at).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest shrink-0 border ${
            status === "completed"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : status === "running"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
                : status === "failed"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-white/5 text-white/40 border-white/10"
          }`}
        >
          {status}
        </span>
      </div>
    </Link>
  );
}
