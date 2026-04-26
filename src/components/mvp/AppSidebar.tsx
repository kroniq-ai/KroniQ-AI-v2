"use client";

import Link from "next/link";
import {
  Search,
  Layout,
  Cpu,
  Megaphone,
  Wallet,
  FolderDown,
  Home,
  Plus,
} from "lucide-react";

const TABS = [
  { id: "research" as const, label: "Research", Icon: Search },
  { id: "product" as const, label: "Product", Icon: Layout },
  { id: "tech" as const, label: "Tech", Icon: Cpu },
  { id: "marketing" as const, label: "Marketing", Icon: Megaphone },
  { id: "finance" as const, label: "Finance", Icon: Wallet },
  { id: "artifacts" as const, label: "Artifacts", Icon: FolderDown },
] as const;

interface AppSidebarProps {
  projectId: string;
  projectTitle: string;
  activeTab: string;
  onTabChange: (tab: (typeof TABS)[number]["id"]) => void;
  agentRunning?: string | null;
}

const AGENT_TAB_MAP: Record<string, (typeof TABS)[number]["id"]> = {
  research: "research",
  product: "product",
  cto: "tech",
  cmo: "marketing",
  cfo: "finance",
};

export default function AppSidebar({
  projectId,
  projectTitle,
  activeTab,
  onTabChange,
  agentRunning,
}: AppSidebarProps) {
  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="p-4 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-100 hover:text-white">
          <Home size={18} />
          <span className="font-medium">KroniQ</span>
        </Link>
        <p className="text-xs text-zinc-500 mt-2 truncate" title={projectTitle}>
          {projectTitle}
        </p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          const isRunning = agentRunning && AGENT_TAB_MAP[agentRunning] === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {label}
              {isRunning && (
                <span className="ml-auto w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-zinc-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition"
        >
          <Plus size={18} />
          New Project
        </Link>
      </div>
    </aside>
  );
}
