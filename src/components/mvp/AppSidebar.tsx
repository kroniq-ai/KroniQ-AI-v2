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
    <aside className="w-64 shrink-0 flex flex-col border-r border-white/[0.08] bg-black/60 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20">
      <div className="p-5 border-b border-white/[0.08]">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors">
          <Home size={18} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          <span className="font-bold tracking-tight">KroniQ</span>
        </Link>
        <p className="text-xs text-white/40 mt-3 truncate font-medium" title={projectTitle}>
          {projectTitle}
        </p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          const isRunning = agentRunning && AGENT_TAB_MAP[agentRunning] === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.4)] border border-white/[0.05]"
                  : "text-white/40 hover:text-white/90 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon size={18} className={`shrink-0 transition-all ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`} />
              <span className="tracking-wide">{label}</span>
              {isRunning && (
                <span className="ml-auto flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/[0.08]">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/[0.05] hover:border-white/20 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
        >
          <Plus size={16} />
          <span>New Project</span>
        </Link>
      </div>
    </aside>
  );
}
