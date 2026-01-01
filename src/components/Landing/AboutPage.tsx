import React, { useState, useEffect, useRef } from 'react';
import { Target, Eye, Heart, Users, Award, Zap, Globe, Shield, Lightbulb, Brain, Sparkles, MessageSquare, Image as ImageIcon, Video, Music, Mic, FileText, Star, Rocket } from 'lucide-react';
import { MouseParticles } from './MouseParticles';
import { LandingFooter } from './LandingFooter';

// Scroll reveal hook
const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Glowing Stats Card
const GlowingStatCard: React.FC<{
  value: string;
  label: string;
  icon: React.ElementType;
  delay?: number;
}> = ({ value, label, icon: Icon, delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <div
      ref={ref}
      className={`relative group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Glowing background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative glass-panel rounded-2xl p-6 border border-white/10 hover:border-teal-500/30 transition-all duration-300 text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-teal-500/20">
          <Icon className="w-6 h-6 text-teal-400" />
        </div>
        <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          {value}
        </div>
        <div className="text-white/60 text-sm font-medium uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
};

// Glowing Value Card
const GlowingValueCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}> = ({ icon: Icon, title, description, gradient, delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <div
      ref={ref}
      className={`relative group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Glowing orb behind card */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

      <div className="relative glass-panel rounded-3xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-500 h-full group-hover:shadow-xl group-hover:shadow-teal-500/10">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} opacity-20 flex items-center justify-center mb-6 group-hover:opacity-40 group-hover:scale-110 transition-all duration-300 border border-white/10`}>
          <Icon className="w-8 h-8 text-teal-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-teal-400 transition-colors">{title}</h3>
        <p className="text-white/60 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

// Team Member Card with Glow
const TeamMemberCard: React.FC<{
  name: string;
  role: string;
  bio: string;
  icon: React.ElementType;
  delay?: number;
}> = ({ name, role, bio, icon: Icon, delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <div
      ref={ref}
      className={`relative group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Animated glow ring */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

      <div className="relative glass-panel rounded-3xl p-8 border border-white/10 hover:border-teal-500/30 transition-all duration-500 text-center h-full group-hover:shadow-2xl group-hover:shadow-teal-500/10">
        {/* Avatar with glowing ring */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full opacity-30 blur-lg group-hover:opacity-60 transition-opacity" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center border-2 border-teal-500/30 group-hover:scale-105 transition-transform">
            <Icon className="w-10 h-10 text-teal-400" />
          </div>
        </div>

        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{name}</h3>

        <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30 mb-5">
          <p className="text-teal-400 text-sm font-bold">{role}</p>
        </div>

        <p className="text-white/60 text-sm leading-relaxed">{bio}</p>
      </div>
    </div>
  );
};

// Platform Showcase Mockup
const PlatformShowcase = () => {
  const studios = [
    { icon: MessageSquare, name: 'Chat', color: 'from-teal-500 to-cyan-500' },
    { icon: ImageIcon, name: 'Image', color: 'from-cyan-500 to-teal-500' },
    { icon: Video, name: 'Video', color: 'from-teal-500 to-emerald-500' },
    { icon: Music, name: 'Music', color: 'from-emerald-500 to-teal-500' },
    { icon: Mic, name: 'Voice', color: 'from-cyan-500 to-blue-500' },
    { icon: FileText, name: 'PPT', color: 'from-teal-500 to-cyan-500' },
  ];

  return (
    <div className="relative">
      {/* Glowing background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-3xl blur-3xl" />

      <div className="relative glass-panel rounded-3xl border border-white/10 overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-teal-400 text-xs font-bold">6 CREATIVE STUDIOS</span>
          </div>
          <h3 className="text-2xl font-bold text-white">One Platform, Infinite Possibilities</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {studios.map((studio, idx) => {
            const Icon = studio.icon;
            return (
              <div
                key={idx}
                className="group relative p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-teal-500/10"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${studio.color} opacity-80 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-sm font-medium text-center">{studio.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const values = [
    {
      icon: Target,
      title: 'Innovation First',
      description: 'We push the boundaries of what\'s possible with AI, constantly evolving our platform with cutting-edge technology.',
      gradient: 'from-teal-500 to-cyan-600'
    },
    {
      icon: Heart,
      title: 'User-Centric Design',
      description: 'Every feature is crafted with our users in mind, ensuring an intuitive and delightful experience.',
      gradient: 'from-cyan-500 to-teal-600'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Your data security is paramount. We employ enterprise-grade encryption and never share your information.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Globe,
      title: 'Global Accessibility',
      description: 'Making powerful AI tools accessible to creators worldwide, regardless of technical expertise.',
      gradient: 'from-teal-500 to-emerald-600'
    }
  ];

  const team = [
    {
      name: 'Atirek Singh',
      role: 'CTO & Founder',
      bio: 'The visionary behind KroniQ. Started working on this groundbreaking idea in grade 9, bringing together his team to turn a dream into reality.',
      icon: Lightbulb
    },
    {
      name: 'Jitender Singh Dahiya',
      role: 'CEO & Founder',
      bio: 'The strategic mastermind behind KroniQ\'s business vision. Drives marketing initiatives and business development with decades of expertise.',
      icon: Rocket
    },
    {
      name: 'Aditya Narayan Uniyal',
      role: 'Co-CTO & Founder',
      bio: 'Engineered the AI systems and backend architecture alongside Atirek, bringing technical excellence to every layer of the platform.',
      icon: Brain
    }
  ];

  const milestones = [
    { year: 'Sep 14, 2025', event: 'The Idea — Vision to democratize AI creativity', icon: Zap },
    { year: 'Dec 7, 2025', event: 'Launched early bird waitlist for first 100 users', icon: Award },
    { year: 'Dec 11, 2025', event: 'MVP Launch — Core features released to the public', icon: Users },
  ];

  const stats = [
    { value: '70+', label: 'AI Models', icon: Brain },
    { value: '6', label: 'Creative Studios', icon: Sparkles },
    { value: '100%', label: 'Your Rights', icon: Shield },
    { value: '24/7', label: 'Always On', icon: Zap },
  ];

  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden">
      <MouseParticles />

      {/* Background with AI Fiesta-style grid */}
      <div className="fixed inset-0 bg-black">
        {/* Teal glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-teal-500/20 via-teal-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[200px]" />

        {/* Perspective Grid Lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)',
          }}
        />

        {/* Scattered dark rectangles */}
        {[
          { top: '12%', left: '6%', w: 50, h: 65, opacity: 0.35 },
          { top: '35%', left: '10%', w: 40, h: 50, opacity: 0.25 },
          { top: '60%', left: '4%', w: 45, h: 55, opacity: 0.3 },
          { top: '80%', left: '9%', w: 55, h: 70, opacity: 0.35 },
          { top: '18%', right: '7%', w: 50, h: 65, opacity: 0.35 },
          { top: '42%', right: '5%', w: 45, h: 55, opacity: 0.3 },
          { top: '68%', right: '11%', w: 50, h: 60, opacity: 0.35 },
          { top: '88%', right: '5%', w: 40, h: 50, opacity: 0.25 },
        ].map((rect, i) => (
          <div
            key={i}
            className="absolute rounded-lg bg-white/5 border border-white/5"
            style={{
              top: rect.top,
              left: rect.left,
              right: rect.right,
              width: rect.w,
              height: rect.h,
              opacity: rect.opacity,
            }}
          />
        ))}

        {/* Scattered particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.25,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className={`relative pt-40 pb-20 px-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 mb-8">
                <Star className="w-4 h-4 text-teal-400" />
                <span className="text-teal-400 text-sm font-bold tracking-wider">ABOUT KRONIQ</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                Building the Future of{' '}
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  AI Creation
                </span>
              </h1>

              <p className="text-xl text-white/60 leading-relaxed mb-8">
                We believe powerful AI tools should be accessible to everyone. KroniQ empowers creators, developers, and businesses to harness the full potential of artificial intelligence without complexity.
              </p>
            </div>

            {/* Right: Platform Showcase */}
            <PlatformShowcase />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <GlowingStatCard
                key={idx}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                delay={idx * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlowingValueCard
            icon={Target}
            title="Our Mission"
            description="To democratize AI technology by providing an intuitive, unified platform that empowers anyone to create, innovate, and build extraordinary things—regardless of their technical background or resources."
            gradient="from-teal-500 to-cyan-500"
            delay={0}
          />
          <GlowingValueCard
            icon={Eye}
            title="Our Vision"
            description="A world where every individual and organization can leverage AI to amplify their creativity, accelerate innovation, and solve complex problems—making the impossible, possible."
            gradient="from-cyan-500 to-teal-500"
            delay={100}
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Our Core <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Values</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <GlowingValueCard
                key={idx}
                icon={value.icon}
                title={value.title}
                description={value.description}
                gradient={value.gradient}
                delay={idx * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Our <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Journey</span>
            </h2>
            <p className="text-xl text-white/60">From inception to innovation</p>
          </div>

          <div className="relative">
            {/* Glowing timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 via-cyan-500 to-teal-500 transform -translate-x-1/2 rounded-full shadow-lg shadow-teal-500/50" />

            <div className="space-y-12">
              {milestones.map((milestone, idx) => {
                const Icon = milestone.icon;
                const isLeft = idx % 2 === 0;

                return (
                  <div
                    key={idx}
                    className={`relative flex items-center md:${isLeft ? 'flex-row' : 'flex-row-reverse'} justify-center md:justify-normal`}
                  >
                    <div className={`w-full md:w-5/12 ${isLeft ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} px-4 md:px-0`}>
                      <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative glass-panel rounded-2xl p-6 border border-white/10 hover:border-teal-500/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-teal-500/10">
                          <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-teal-500/20 group-hover:scale-110 transition-transform">
                              <Icon className="w-6 h-6 text-teal-400" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">{milestone.year}</span>
                          </div>
                          <p className="text-white/70 text-lg">{milestone.event}</p>
                        </div>
                      </div>
                    </div>

                    {/* Center Glowing Dot */}
                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 border-4 border-[#030306] z-10 shadow-lg shadow-teal-500/50 items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>

                    <div className="hidden md:block w-5/12" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Meet Our <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Team</span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Three visionaries who started with a dream and built the future of AI-powered creation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, idx) => (
              <TeamMemberCard
                key={idx}
                name={member.name}
                role={member.role}
                bio={member.bio}
                icon={member.icon}
                delay={idx * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

