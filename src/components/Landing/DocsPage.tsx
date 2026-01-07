import React, { useState } from 'react';
import { Book, HelpCircle, Shield, Coins, Zap, Search, ChevronRight, ExternalLink, MessageSquare, FileText } from 'lucide-react';
import { MouseParticles } from './MouseParticles';
import { LandingFooter } from './LandingFooter';
import { supabase } from '../../lib/supabaseClient';

export const DocsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  // Ticket modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus('submitting');

    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_email: ticketEmail,
        subject: ticketSubject,
        message: ticketMessage,
        category: ticketCategory,
      });

      if (error) throw error;

      setTicketStatus('success');
      // Reset form after 2 seconds
      setTimeout(() => {
        setShowTicketModal(false);
        setTicketEmail('');
        setTicketSubject('');
        setTicketMessage('');
        setTicketCategory('general');
        setTicketStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit ticket:', err);
      setTicketStatus('error');
    }
  };
  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Book },
    { id: 'studios', title: 'AI Studios', icon: Zap },
    { id: 'tokens', title: 'Tokens & Billing', icon: Coins },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'faq', title: 'FAQ', icon: HelpCircle },
  ];

  const content: Record<string, any> = {
    'getting-started': {
      title: 'Getting Started',
      sections: [
        {
          heading: 'Welcome to KroniQ AI',
          content: 'KroniQ is your all-in-one AI platform with access to 70+ cutting-edge models. Create text, images, videos, music, voice, and presentations — all from a single unified interface.\n\n**What makes us different:**\n• 70+ AI models in one subscription\n• 6 creative studios (Chat, Image, Video, Music, Voice, PPT)\n• Smart auto-routing picks the best model for you\n• Free tier with 15,000 daily tokens'
        },
        {
          heading: 'Quick Start Guide',
          content: '1. **Sign Up** — Create an account with Google (instant setup)\n2. **Get Free Tokens** — New users receive 15,000 tokens daily\n3. **Pick a Studio** — Choose Chat, Image, Video, Music, Voice, or PPT\n4. **Create** — Enter your prompt and let AI do the magic\n\n**Pro tip:** Enable "Smart Select" in Chat Studio to let KroniQ automatically route your prompts to the best AI model.'
        },
        {
          heading: 'System Requirements',
          content: '• Any modern browser (Chrome, Firefox, Safari, Edge)\n• Stable internet connection\n• No software downloads — everything runs in the cloud\n• Works on desktop, tablet, and mobile'
        }
      ]
    },
    'studios': {
      title: 'AI Studios Overview',
      sections: [
        {
          heading: 'Chat Studio — 70+ AI Models',
          content: 'Access the world\'s best AI assistants in one place.\n\n**Available Models:**\n• OpenAI: GPT-4o, GPT-4o mini, GPT-5 series\n• Anthropic: Claude Haiku, Sonnet, Opus\n• Google: Gemini Flash, Pro, Ultra\n• Meta: Llama 3.2, Llama 4\n• Others: DeepSeek, Mistral, Qwen, Grok, Perplexity\n\n**Features:** Smart model routing, file uploads, web search, code execution'
        },
        {
          heading: 'Image Studio — 10+ Models',
          content: 'Generate stunning visuals with industry-leading image AI.\n\n**Available Models:**\n• DALL-E 3 (OpenAI)\n• Flux Pro & Context Pro\n• Imagen 4 (Google)\n• Seedream (ByteDance)\n• Grok Imagine (xAI)\n\n**Features:** Multiple aspect ratios, up to 4K resolution, style presets'
        },
        {
          heading: 'Video Studio — 6+ Models',
          content: 'Create AI-generated videos with cutting-edge models.\n\n**Available Models:**\n• Sora 2 (OpenAI)\n• Veo 3.1 Fast & Quality (Google)\n• Kling 2.6\n• Runway Gen-4\n• Wan 2.5\n\n**Features:** Text-to-video, camera motion control, up to 10 second clips'
        },
        {
          heading: 'Music Studio — Suno AI & Lyria',
          content: 'Compose original music and soundtracks.\n\n**Capabilities:**\n• Full songs with lyrics in any genre\n• Background music and instrumentals\n• AI-generated vocals\n• Commercial usage rights included\n\n**Models:** Suno AI, Google Lyria'
        },
        {
          heading: 'Voice Studio — 50+ Voices',
          content: 'Convert text to natural-sounding speech.\n\n**Powered by:** ElevenLabs\n\n**Features:**\n• 50+ natural voices in multiple languages\n• Adjustable speed and tone\n• Download as MP3\n• Perfect for podcasts, videos, and audiobooks'
        },
        {
          heading: 'PPT Studio — AI Presentations',
          content: 'Generate professional presentations instantly.\n\n**How it works:**\n1. Describe your topic or paste content\n2. AI creates slides with layouts & content\n3. Download as .pptx file\n\n**Features:** Auto-layouts, AI-written content, professional themes'
        }
      ]
    },
    'tokens': {
      title: 'Tokens & Billing',
      sections: [
        {
          heading: 'Understanding Tokens',
          content: 'Tokens are the universal currency on KroniQ. Different AI operations cost different amounts based on model complexity.\n\n**Typical Token Costs:**\n• Chat messages: 50-500 tokens\n• Image generation: 1,000-5,000 tokens\n• Video generation: 10,000+ tokens\n• Music/TTS: 2,000-5,000 tokens\n\nYour balance updates in real-time as you create.'
        },
        {
          heading: 'Subscription Plans',
          content: '**Free Tier** — $0/month\n• 15,000 tokens per month\n• 50 chat messages/month\n• 2 images/month\n• Access to basic models\n\n**Starter** — $5/month\n• 100,000 tokens per month\n• 45 chat messages/month\n• 14 images, 9 videos, 9 songs/month\n• All AI models included\n\n**Pro** — $12/month\n• 220,000 tokens per month\n• 110 chat messages/month\n• 33 images, 21 videos, 20 songs/month\n• All premium models\n\n**Premium** — $24/month\n• 560,000 tokens per month\n• 220 chat messages/month\n• 66 images, 42 videos, 41 songs/month\n• Priority processing'
        },
        {
          heading: 'Monthly Reset',
          content: 'Your token and generation limits reset at the start of each billing month.\n\n**What resets monthly:**\n• Token balance (back to your plan limit)\n• Image/video/chat generation counts\n\n**What never expires:**\n• Your projects and saved creations\n• Account settings and preferences'
        }
      ]
    },
    'security': {
      title: 'Security & Privacy',
      sections: [
        {
          heading: 'Data Protection',
          content: 'Your privacy is our top priority.\n\n**Encryption:** All data encrypted in transit (TLS 1.3) and at rest (AES-256)\n**Model Privacy:** Your prompts are never used to train AI models\n**Ownership:** You retain full commercial rights to generated content\n**Storage:** Projects stored securely on encrypted servers'
        },
        {
          heading: 'Account Security',
          content: '• Secure OAuth authentication via Google\n• Automatic session timeout for protection\n• Row-level security on all database operations\n• No passwords stored — OAuth only'
        },
        {
          heading: 'Content Moderation',
          content: 'All content is moderated to prevent misuse:\n\n• AI-powered content filtering\n• Prohibited content detection\n• Terms of Service enforcement\n• Report system for violations'
        }
      ]
    },
    'faq': {
      title: 'Frequently Asked Questions',
      sections: [
        {
          heading: 'Can I use generated content commercially?',
          content: 'Yes! You have full commercial rights to everything you create on KroniQ. Use it for your business, social media, products, or any other purpose.'
        },
        {
          heading: 'How do I download my creations?',
          content: 'Every creation is automatically saved. Click the download button on any generated content to save it to your device. Images save as PNG, videos as MP4, audio as MP3.'
        },
        {
          heading: 'What happens when I run out of tokens?',
          content: 'Free users wait for the daily reset at midnight UTC. Paid subscribers can upgrade their plan for more tokens, or wait for the daily reset.'
        },
        {
          heading: 'Which AI model should I use?',
          content: 'Enable "Smart Select" to let KroniQ automatically choose the best model. Or pick manually:\n\n• **GPT-4o** — General purpose, fast\n• **Claude** — Creative writing, analysis\n• **Gemini** — Multimodal, research\n• **DeepSeek** — Coding, math'
        },
        {
          heading: 'How do I cancel my subscription?',
          content: 'Go to Settings → Billing → Manage Subscription. You can cancel anytime. You\'ll keep access until the end of your billing period.'
        },
        {
          heading: 'Is there a mobile app?',
          content: 'KroniQ works great on mobile browsers! No app download needed. Just visit kroniqai.com on your phone or tablet.'
        }
      ]
    }
  };

  const activeContent = content[activeSection];

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
          { top: '15%', left: '4%', w: 45, h: 60, opacity: 0.35 },
          { top: '40%', left: '8%', w: 35, h: 45, opacity: 0.25 },
          { top: '65%', left: '3%', w: 50, h: 65, opacity: 0.3 },
          { top: '20%', right: '6%', w: 50, h: 60, opacity: 0.35 },
          { top: '50%', right: '4%', w: 40, h: 50, opacity: 0.3 },
          { top: '75%', right: '8%', w: 45, h: 55, opacity: 0.25 },
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
        {Array.from({ length: 25 }).map((_, i) => (
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

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 mb-6">
            <Book className="w-4 h-4 text-teal-400" />
            <span className="text-teal-400 text-xs font-bold tracking-widest uppercase">Documentation</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            KroniQ <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Knowledge Base</span>
          </h1>

          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            Everything you need to master AI-powered creativity. Explore guides, tutorials, and API references.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/30 to-cyan-500/30 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative flex items-center bg-[#0a0a0f] border border-white/10 rounded-xl p-4 shadow-2xl group-hover:border-teal-500/30 transition-colors">
              <Search className="w-6 h-6 text-white/40 mr-4" />
              <input
                type="text"
                placeholder="Search documentation..."
                className="bg-transparent border-none outline-none text-white w-full placeholder-white/40 text-lg"
              />
              <span className="text-xs text-white/30 border border-white/10 px-2 py-1 rounded hidden md:block">⌘K</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="glass-panel rounded-2xl p-4 border border-white/10 sticky top-28 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-left group
                        ${isActive
                          ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-white border border-teal-500/30 shadow-lg shadow-teal-500/10'
                          : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                    >
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-400' : 'text-white/40 group-hover:text-white'}`} />
                      <span className="font-medium">{section.title}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 bg-[#0d1117]/80 backdrop-blur-xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center border border-teal-500/20">
                  {(() => {
                    const iconMap: any = { 'getting-started': Book, 'studios': Zap, 'tokens': Coins, 'security': Shield, 'faq': HelpCircle };
                    const CurrentIcon = iconMap[activeSection];
                    return <CurrentIcon className="w-8 h-8 text-teal-400" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{activeContent.title}</h2>
                  <p className="text-white/50 mt-1">{activeContent.sections.length} article{activeContent.sections.length > 1 ? 's' : ''} in this section</p>
                </div>
              </div>

              <div className="space-y-12">
                {activeContent.sections.map((section: any, idx: number) => (
                  <div key={idx} className="group">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 group-hover:text-teal-400 transition-colors">
                      <ChevronRight className="w-5 h-5 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {section.heading}
                    </h3>
                    <div className="text-white/70 text-lg leading-relaxed whitespace-pre-line pl-4 border-l-2 border-white/10 group-hover:border-teal-500 transition-colors">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback Section */}
              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-white/40 text-sm">Was this helpful?</span>
                <div className="flex gap-2">
                  <button className="px-5 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-sm font-medium transition-colors border border-teal-500/20">
                    Yes, thanks!
                  </button>
                  <button className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-colors">
                    Needs improvement
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="https://discord.gg/5CPkVBpp"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-teal-500/10"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4 text-teal-400 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                  Community Support
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-white/50 text-sm">Join our Discord community to chat with other creators and get help.</p>
              </a>
              <button
                onClick={() => setShowTicketModal(true)}
                className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-cyan-500/10 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                  Submit a Ticket
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-white/50 text-sm">Need direct help? Open a support ticket and we'll respond within 24 hours.</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowTicketModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-white mb-2">Submit a Support Ticket</h3>
            <p className="text-white/50 text-sm mb-6">We'll respond within 24 hours</p>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Your Email</label>
                <input
                  type="email"
                  value={ticketEmail}
                  onChange={(e) => setTicketEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-teal-500/50"
                >
                  <option value="general">General Question</option>
                  <option value="billing">Billing & Subscription</option>
                  <option value="technical">Technical Issue</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="bug_report">Bug Report</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Message</label>
                <textarea
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50 resize-none"
                />
              </div>

              {ticketStatus === 'success' && (
                <div className="p-3 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 text-sm">
                  ✓ Ticket submitted successfully! We'll get back to you soon.
                </div>
              )}
              {ticketStatus === 'error' && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  ✗ Failed to submit ticket. Please try again or email support@kroniqai.com
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketStatus === 'submitting'}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {ticketStatus === 'submitting' ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
