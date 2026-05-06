"use client";

import { SiSlack, SiNotion, SiDiscord, SiGmail } from "react-icons/si";
import { Share2, Target } from "lucide-react";
import React from "react";

export function GridSlide() {
  return (
    <div className="w-full h-full p-4 md:p-6 pt-8 md:pt-6 flex flex-col items-center justify-start md:justify-center overflow-y-auto relative" style={{ scrollbarWidth: "none" }}>
      <div className="grid grid-cols-2 gap-4 w-full relative z-10">
        <IntegrationCard title="Socials" desc="Cross-platform" glow="rgba(244, 114, 182, 0.2)">
          <Share2 className="text-pink-400 w-5 h-5 relative z-10" />
        </IntegrationCard>
        <IntegrationCard title="Slack" desc="Team comms" glow="rgba(192, 132, 252, 0.2)">
          <SiSlack className="text-purple-400 w-5 h-5 relative z-10" />
        </IntegrationCard>
        <IntegrationCard title="Notion" desc="Workspace" glow="rgba(255, 255, 255, 0.15)">
          <SiNotion className="text-white w-5 h-5 relative z-10" />
        </IntegrationCard>
        <IntegrationCard title="Paid Ads" desc="Google & Meta" glow="rgba(16, 185, 129, 0.2)">
          <Target className="text-emerald-400 w-5 h-5 relative z-10" />
        </IntegrationCard>
        <IntegrationCard title="Discord" desc="Community" glow="rgba(129, 140, 248, 0.2)">
          <SiDiscord className="text-indigo-400 w-5 h-5 relative z-10" />
        </IntegrationCard>
        <IntegrationCard title="Gmail" desc="Cold outreach" glow="rgba(239, 68, 68, 0.2)">
          <SiGmail className="text-red-500 w-5 h-5 relative z-10" />
        </IntegrationCard>
      </div>
    </div>
  );
}

const IntegrationCard = ({
  title,
  desc,
  glow,
  children,
}: {
  title: string;
  desc: string;
  glow?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative group p-4 rounded-[20px] transition-all duration-500 hover:-translate-y-1 overflow-hidden cursor-pointer"
         style={{
           background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
           border: "1px solid rgba(255,255,255,0.08)",
           boxShadow: "0 8px 32px -8px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)",
           backdropFilter: "blur(24px) saturate(150%)",
         }}>
         
      {/* Top inner rim light */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      
      {/* Dynamic ambient glow that follows hover */}
      {glow && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
          style={{ background: `radial-gradient(circle at 50% 0%, ${glow} 0%, transparent 70%)` }} 
        />
      )}
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="size-11 rounded-[14px] flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
             style={{
                 background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
                 border: "1px solid rgba(255,255,255,0.12)",
                 boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.5)"
             }}>
            {children}
        </div>
        
        <div className="space-y-1 pt-1">
          <h3 className="text-[14px] font-bold text-white tracking-tight leading-none drop-shadow-sm">{title}</h3>
          <p className="text-[12px] text-white/50 leading-tight font-medium">{desc}</p>
        </div>
      </div>
    </div>
  );
};
