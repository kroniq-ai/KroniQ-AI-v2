"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Link as LinkIcon, Zap, CheckCircle2, Send, Mail, UserPlus, FileText } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { KroniQMarkBadgePng } from "@/components/brand/kroniq-logo-png";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType<any>;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

const DEFAULT_TIMELINE_DATA: TimelineItem[] = [
  {
    id: 1,
    title: "Sourcing Leads",
    date: "09:00 AM",
    content: "Scanning LinkedIn and Apollo for B2B SaaS founders.",
    category: "Data",
    icon: UserPlus,
    relatedIds: [2],
    status: "completed",
    energy: 95,
  },
  {
    id: 2,
    title: "Drafting Sequences",
    date: "09:15 AM",
    content: "Generating highly personalized opening lines.",
    category: "Content",
    icon: FileText,
    relatedIds: [1, 3],
    status: "in-progress",
    energy: 70,
  },
  {
    id: 3,
    title: "Sending Emails",
    date: "09:30 AM",
    content: "Dispatching via connected Gmail infrastructure.",
    category: "Outreach",
    icon: Mail,
    relatedIds: [2],
    status: "pending",
    energy: 40,
  },
  {
    id: 4,
    title: "CRM Sync",
    date: "10:00 AM",
    content: "Pushing all activities back to HubSpot.",
    category: "Sync",
    icon: Zap,
    relatedIds: [3],
    status: "pending",
    energy: 20,
  },
];

export function RadialOrbitalTimeline({
  timelineData = DEFAULT_TIMELINE_DATA,
}: { timelineData?: TimelineItem[] }) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [viewMode] = useState<"orbital">("orbital");
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  
  const rotationAngleRef = useRef(0);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    if (autoRotate && viewMode === "orbital") {
      lastTimeRef.current = performance.now();
      
      const animate = (time: number) => {
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;
        
        // 8 degrees per second for smooth buttery rotation
        const angleChange = (8 / 1000) * deltaTime;
        rotationAngleRef.current = (rotationAngleRef.current + angleChange) % 360;
        
        setRotationAngle(rotationAngleRef.current);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [autoRotate, viewMode]);

  useEffect(() => {
    if (!autoRotate) {
      rotationAngleRef.current = rotationAngle;
    }
  }, [rotationAngle, autoRotate]);

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 135; // Reduced radius so text doesn't cut off on the sides
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.3, Math.min(1, 0.3 + 0.7 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center overflow-visible scale-[0.55] md:scale-100 origin-center"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Core Orb - Logo Only */}
          <div className="absolute flex items-center justify-center z-10 pointer-events-none">
            <div className="relative rounded-full border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center justify-center overflow-hidden bg-black">
               <KroniQMarkBadgePng size={80} className="relative z-10 grayscale brightness-110" />
            </div>
          </div>

          {/* Orbital Ring */}
          <div className="absolute w-[270px] h-[270px] rounded-full border border-white/[0.08] shadow-[0_0_15px_rgba(255,255,255,0.02)]"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const Icon = item.icon as any;

            return (
              <div
                key={item.id}
                ref={(el) => { nodeRefs.current[item.id] = el; }}
                className="absolute cursor-pointer group"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                  transition: autoRotate ? 'opacity 0.3s ease' : 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`
                  w-11 h-11 rounded-full flex items-center justify-center
                  border transition-all duration-500 transform group-hover:scale-110 
                  ${isExpanded 
                    ? "bg-white/10 text-white border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-110" 
                    : isRelated 
                      ? "bg-white/[0.05] text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                      : "bg-black/60 backdrop-blur-2xl text-white/50 border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)]"}
                `}
                >
                  <Icon size={18} />
                </div>

                <div
                  className={`
                  absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-[11px] font-medium tracking-wider
                  transition-all duration-300
                  ${isExpanded ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] scale-105" : "text-white/40 group-hover:text-white/80"}
                `}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-56 bg-black/80 backdrop-blur-2xl border-white/[0.1] shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-visible z-[201] rounded-2xl pointer-events-none">
                    <CardHeader className="pb-2 p-4">
                      <div className="flex justify-between items-center">
                        <Badge className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-white/10 text-white border-none backdrop-blur-md">
                          {item.status === "completed" ? "Complete" : item.status === "in-progress" ? "Executing" : "Queued"}
                        </Badge>
                      </div>
                      <CardTitle className="text-[14px] mt-3 font-semibold text-white tracking-tight">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-[12px] font-medium text-white/50 p-4 pt-0 leading-relaxed">
                      <p>{item.content}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
