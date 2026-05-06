"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Bot, Database, Mail, UserPlus, FileText, CheckCircle2 } from 'lucide-react';
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

import { ChatSlide } from "@/components/ui/slides/ChatSlide";
import { MemorySlide } from "@/components/ui/slides/MemorySlide";
import { RadialOrbitalTimeline } from "@/components/ui/slides/RadialOrbitalTimeline";
import { GridSlide } from "@/components/ui/slides/GridSlide";

// --- Data for each slide ---
const slidesData = [
  {
    title: "Brief once, run forever.",
    description: "Describe your company, ICP, and growth goal in plain English. KroniQ builds a full campaign plan — channels, sequences, messaging — aligned to your voice.",
    component: <ChatSlide />,
    bgColor: "#000000",
    textColor: "#ffffff",
  },
  {
    title: "One memory. Every campaign.",
    description: "Your context, outcomes, and history live in a persistent memory layer. Every agent draws from the same truth — no more re-explaining yourself to every tool.",
    component: <MemorySlide />,
    bgColor: "#000000",
    textColor: "#ffffff",
  },
  {
    title: "Parallel. Simultaneous. Zero effort.",
    description: "Research, outreach, and content run in parallel — cross-checking each other before anything sends. You set rules. Nothing goes out without meeting your criteria.",
    component: <RadialOrbitalTimeline />,
    bgColor: "#000000",
    textColor: "#ffffff",
  },
  {
    title: "Leads while you sleep.",
    description: "Bright Data + LinkedIn surface your ICP continuously overnight. In the morning you're choosing who to contact — not spending hours building lists from scratch.",
    component: <GridSlide />,
    bgColor: "#000000",
    textColor: "#ffffff",
  },
];


export function ScrollingFeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      // Calculate how far we've scrolled through the container
      // rect.top is 0 when the container hits the top of the viewport
      const scrollProgress = -rect.top / (rect.height - window.innerHeight);
      
      if (scrollProgress >= 0 && scrollProgress <= 1) {
        const newActiveIndex = Math.min(
          slidesData.length - 1,
          Math.max(0, Math.floor(scrollProgress * slidesData.length))
        );
        setActiveIndex(newActiveIndex);
      } else if (scrollProgress < 0) {
        setActiveIndex(0);
      } else {
        setActiveIndex(slidesData.length - 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const gridPatternStyle = {
    '--grid-color': 'rgba(255, 255, 255, 0.03)',
    backgroundImage: `
      linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
    `,
    backgroundSize: '3.5rem 3.5rem',
  };

  return (
    <div 
      id="how-it-works"
      ref={scrollContainerRef}
      className="w-full relative bg-black"
      style={{ height: `${slidesData.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center bg-black text-white transition-colors duration-700 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full max-w-7xl mx-auto">
          
          {/* Left Column: Text Content, Pagination & Button */}
          <div className="relative flex flex-col justify-center p-6 pt-24 md:p-16 md:border-r border-white/5 z-20 bg-black/60 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none">
            
            {/* Pagination Bars */}
            <div className="flex space-x-2 mb-12">
              {slidesData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                      const container = scrollContainerRef.current;
                      if(container){
                          const rect = container.getBoundingClientRect();
                          const absoluteTop = window.scrollY + rect.top;
                          const stepHeight = (rect.height - window.innerHeight) / slidesData.length;
                          // Scroll to the start of this specific slide
                          window.scrollTo({ top: absoluteTop + (stepHeight * index) + 10, behavior: 'smooth' });
                      }
                  }}
                  className={`h-1 rounded-full transition-all duration-500 ease-in-out ${
                    index === activeIndex ? 'w-12 bg-white' : 'w-6 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            <div className="relative h-[260px] sm:h-[220px] md:h-[320px] w-full mt-2">
              {slidesData.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col justify-start ${
                    index === activeIndex
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8 pointer-events-none'
                  }`}
                >
                  <h2 
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
                  >
                    {slide.title}
                  </h2>
                  <p className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl max-w-md text-white/60 leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Get Started Button */}
            <div className="mt-4 md:mt-8 z-30">
              <div className="inline-block" onClick={() => {
                  window.location.href = '#waitlist';
              }}>
                <LiquidMetalButton label="Join Waitlist" />
              </div>
            </div>
          </div>

          {/* Right Column: Custom Component Content with Grid Background */}
          <div className="flex items-center justify-center p-4 pb-12 md:p-8 lg:p-16 relative w-full h-full border-t md:border-t-0 border-white/5" style={gridPatternStyle}>
            <div className="relative w-full max-w-[450px] h-[350px] md:h-[550px] overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-full h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateY(-${activeIndex * 100}%)` }}
              >
                {slidesData.map((slide, index) => (
                  <div key={index} className="w-full h-full">
                    {slide.component}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
