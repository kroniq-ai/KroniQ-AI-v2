import React, { useState, useRef } from 'react';
import { Bug, X, Send, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';

export const BugReportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Screenshot must be less than 5MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadScreenshot = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `bug-reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bug-screenshots')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('bug-screenshots')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Screenshot upload failed:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      showToast('Please describe the bug', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let screenshotUrl = null;
      if (screenshot) {
        screenshotUrl = await uploadScreenshot(screenshot);
      }

      const browserInfo = `${navigator.userAgent} | Screen: ${window.innerWidth}x${window.innerHeight}`;

      const { error } = await supabase.from('bug_reports').insert({
        user_id: user?.uid || null,
        user_email: user?.email || null,
        description: description.trim(),
        screenshot_url: screenshotUrl,
        page_url: window.location.href,
        browser_info: browserInfo,
        status: 'new',
      });

      if (error) throw error;

      showToast('Bug report submitted! Thank you for your feedback.', 'success');
      setDescription('');
      setScreenshot(null);
      setScreenshotPreview(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      showToast('Failed to submit bug report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Fixed Bottom-Right Bug Report Button - AI Fiesta Style */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[#0a0a0a] border border-white/10 hover:border-red-500/50 shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Report a bug"
      >
        <Bug className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
      </button>

      {/* Bug Report Modal - Bottom Right Slide Up */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal - Positioned Bottom Right */}
          <div className="fixed bottom-6 right-6 z-[61] w-full max-w-sm animate-slide-up">
            <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <Bug className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Report a Bug</h3>
                    <p className="text-xs text-white/50">Help us improve KroniQ</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Describe the bug *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What happened? What did you expect?"
                    className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-teal-500/50 focus:bg-white/[0.07] text-white placeholder-white/30 focus:outline-none transition-all resize-none text-sm"
                    required
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Screenshot (optional)
                  </label>

                  {screenshotPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot preview"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeScreenshot}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/70 hover:bg-black transition-colors flex items-center justify-center text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-20 border border-dashed border-white/20 hover:border-teal-500/50 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 text-white/40 hover:text-white/60"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-xs">Click to upload</span>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Submit Button - Teal Accent */}
                <button
                  type="submit"
                  disabled={isSubmitting || !description.trim()}
                  className="w-full py-3 rounded-full font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
