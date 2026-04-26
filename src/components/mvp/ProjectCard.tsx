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
      className="block glass-card hover:border-white/12 transition"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white truncate">{title}</h3>
          <p className="text-sm text-white/60 mt-1 line-clamp-2">{idea_text}</p>
          <p className="text-xs text-white/40 mt-2">
            {new Date(created_at).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`text-xs font-medium uppercase tracking-wider shrink-0 ${statusColor}`}
        >
          {status}
        </span>
      </div>
    </Link>
  );
}
