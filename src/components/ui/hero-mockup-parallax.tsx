"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

export function HeroMockupParallax() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const mockupContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current;
    const mockupElement = mockupContainerRef.current;

    if (triggerElement && mockupElement) {
      // Parallax effect: Move the ENTIRE mockup container up as you scroll
      gsap.fromTo(
        mockupElement,
        { y: 200 }, // Start shifted down
        {
          y: -400, // Move UP
          ease: "none",
          scrollTrigger: {
            trigger: triggerElement,
            start: "top bottom", 
            end: "bottom top", 
            scrub: 0.5, 
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      if (mockupElement) gsap.killTweensOf(mockupElement);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      ref={parallaxRef} 
      className="relative mt-20 w-full flex justify-center z-20" 
    >
      {/* Bottom gradient — fades mockup into page */}
      <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
          style={{ height: "100%", background: "linear-gradient(to bottom, transparent 0%, #000000 100%)" }}
      />
      
      {/* Parallax Container */}
      <div ref={mockupContainerRef} className="relative w-[95%]">
        {/* Glow behind image */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15)_0%,transparent_60%)] z-0 pointer-events-none" />
        
        {/* Premium bordered image wrapper */}
        <div className="relative z-10 p-2 md:p-3 rounded-[24px] md:rounded-[40px] bg-white/[0.03] border border-white/[0.08] shadow-[0_0_60px_-15px_rgba(255,255,255,0.1)] backdrop-blur-xl">
            {/* Inner glow line on the border */}
            <div className="absolute inset-0 rounded-[24px] md:rounded-[40px] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]" />
            
            <img
                src="https://tailark.com/_next/image?url=%2Fmail2.png&w=3840&q=75"
                alt="KroniQ autonomous CMO dashboard"
                className="w-full h-auto object-cover block rounded-[16px] md:rounded-[32px] border border-black/50"
                style={{ filter: "brightness(0.9) saturate(0.95)" }}
                loading="eager"
            />
        </div>
      </div>
    </motion.div>
  );
}
