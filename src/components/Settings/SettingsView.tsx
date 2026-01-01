import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useToast } from '../../contexts/ToastContext';
import { useFont, FONT_LIBRARY, ContentType, DEFAULT_CONTENT_FONTS } from '../../contexts/FontContext';
import {
  X, Settings, Bell, User, Shield, Sparkles, Moon, Sun,
  ChevronDown, Check, Trash2, Type
} from 'lucide-react';
import { getProjects, deleteProject } from '../../lib/chatService';
import { supabase } from '../../lib/supabaseClient';

type Section = 'general' | 'personalization' | 'notifications' | 'data';

export const SettingsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();
  const { currentTheme, setTheme } = useTheme();
  const { fontSettings, setFontMode, setSingleFont, setContentFont, saveSettings: saveFontSettings, getFontFamily } = useFont();

  const [activeSection, setActiveSection] = useState<Section>('general');
  const [projects, setProjects] = useState<any[]>([]);

  // AI Personalization
  const [aiStyle, setAiStyle] = useState('default');
  const [aiWarmth, setAiWarmth] = useState('default');
  const [aiDetail, setAiDetail] = useState('default');
  const [customInstructions, setCustomInstructions] = useState('');

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);

  const [saving, setSaving] = useState(false);
  const isDark = currentTheme === 'cosmic-dark';

  // Font options from library
  const fontOptions = Object.entries(FONT_LIBRARY).map(([name, info]) => ({
    value: name,
    label: name,
    description: info.description,
    category: info.category,
  }));

  useEffect(() => {
    const loadData = async () => {
      const p = await getProjects();
      setProjects(p);

      if (currentUser?.id) {
        const { data } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (data) {
          setAiStyle(data.ai_style || 'default');
          setAiWarmth(data.ai_warmth || 'default');
          setAiDetail(data.ai_detail || 'default');
          setCustomInstructions(data.custom_instructions || '');
          setEmailNotifs(data.email_notifications ?? true);
          setProductUpdates(data.product_updates ?? true);
        }
      }
    };
    loadData();
  }, [currentUser]);

  const savePreferences = async () => {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      await supabase.from('user_preferences').upsert({
        user_id: currentUser.id,
        ai_style: aiStyle,
        ai_warmth: aiWarmth,
        ai_detail: aiDetail,
        custom_instructions: customInstructions,
        email_notifications: emailNotifs,
        product_updates: productUpdates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      // Also save font settings
      await saveFontSettings();
      showToast('success', 'Saved', 'Settings updated');
    } catch (e) {
      showToast('error', 'Error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteData = async () => {
    if (!confirm('Delete all your data? This cannot be undone.')) return;
    try {
      for (const p of projects) await deleteProject(p.id);
      await supabase.from('user_preferences').delete().eq('user_id', currentUser?.id);
      setProjects([]);
      showToast('success', 'Deleted', 'All data removed');
    } catch {
      showToast('error', 'Error', 'Failed to delete');
    }
  };

  const sections = [
    { id: 'general', icon: Settings, label: 'General' },
    { id: 'personalization', icon: Sparkles, label: 'Personalization' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'data', icon: Shield, label: 'Data & Privacy' },
  ];

  const Dropdown = ({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-700'}`}
        >
          <span>{options.find(o => o.value === value)?.label || value}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className={`absolute right-0 mt-1 z-20 rounded-lg shadow-xl border max-h-60 overflow-y-auto ${isDark ? 'bg-[#2a2a2a] border-white/10' : 'bg-white border-gray-200'}`}>
              {options.map(o => (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between gap-4 ${value === o.value
                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                    : isDark ? 'text-white/80 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {o.label}
                  {value === o.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const FontDropdown = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm min-w-[140px] ${isDark ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-700'}`}
          style={{ fontFamily: getFontFamily(value) }}
        >
          <Type className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{value}</span>
          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className={`absolute right-0 mt-1 z-20 rounded-lg shadow-xl border max-h-72 overflow-y-auto min-w-[200px] ${isDark ? 'bg-[#2a2a2a] border-white/10' : 'bg-white border-gray-200'}`}>
              {fontOptions.map(o => (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between gap-2 ${value === o.value
                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                    : isDark ? 'text-white/80 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  style={{ fontFamily: getFontFamily(o.value) }}
                >
                  <div className="flex flex-col">
                    <span>{o.label}</span>
                    <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{o.description}</span>
                  </div>
                  {value === o.value && <Check className="w-4 h-4 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : isDark ? 'bg-white/20' : 'bg-gray-300'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );

  const SettingRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className={`flex items-center justify-between py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
      <div className="flex-1 pr-4">
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
        {desc && <p className={`text-sm mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{desc}</p>}
      </div>
      {children}
    </div>
  );

  const contentTypeLabels: Record<ContentType, { label: string; desc: string }> = {
    general: { label: 'General Text', desc: 'Body text and paragraphs' },
    headers: { label: 'Headers', desc: 'Titles and headings' },
    code: { label: 'Code', desc: 'Code blocks and technical content' },
    creative: { label: 'Creative', desc: 'Creative writing and artistic content' },
    business: { label: 'Business', desc: 'Professional and formal content' },
    math: { label: 'Math/Science', desc: 'Mathematical and scientific formulas' },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/20" onClick={() => navigateTo('chat')} />

      {/* Glassmorphism Modal */}
      <div className={`
        relative w-full max-w-2xl max-h-[85vh] mx-4 rounded-3xl overflow-hidden flex
        ${isDark
          ? 'bg-white/10 border border-white/20'
          : 'bg-white/40 border border-white/50'}
        backdrop-blur-2xl shadow-2xl
      `}>
        {/* Sidebar with glass effect */}
        <div className={`w-48 flex-shrink-0 border-r ${isDark ? 'border-white/10 bg-white/5' : 'border-white/30 bg-white/30'}`}>
          <div className="p-4">
            <button onClick={() => navigateTo('chat')} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-200 text-gray-500'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="px-2 space-y-1">
            {sections.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as Section)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === id
                  ? isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-900'
                  : isDark ? 'text-white/60 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {sections.find(s => s.id === activeSection)?.label}
            </h2>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">

            {/* General */}
            {activeSection === 'general' && (
              <div>
                <SettingRow label="Appearance" desc="Choose your preferred theme">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('cosmic-dark')}
                      className={`p-2 rounded-lg border ${currentTheme === 'cosmic-dark' ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'border-white/10' : 'border-gray-200'}`}
                    >
                      <Moon className={`w-5 h-5 ${currentTheme === 'cosmic-dark' ? 'text-emerald-500' : isDark ? 'text-white/60' : 'text-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => setTheme('pure-white')}
                      className={`p-2 rounded-lg border ${currentTheme === 'pure-white' ? 'border-emerald-500 bg-emerald-500/10' : isDark ? 'border-white/10' : 'border-gray-200'}`}
                    >
                      <Sun className={`w-5 h-5 ${currentTheme === 'pure-white' ? 'text-emerald-500' : isDark ? 'text-white/60' : 'text-gray-500'}`} />
                    </button>
                  </div>
                </SettingRow>

                {/* Font Settings Section */}
                <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Type className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Font Settings</h3>
                  </div>

                  <SettingRow label="Font Mode" desc="Use one font everywhere or different fonts per content type">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFontMode('single')}
                        className={`px-3 py-1.5 rounded-lg text-sm ${fontSettings.mode === 'single'
                          ? 'bg-emerald-500 text-white'
                          : isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Single Font
                      </button>
                      <button
                        onClick={() => setFontMode('dynamic')}
                        className={`px-3 py-1.5 rounded-lg text-sm ${fontSettings.mode === 'dynamic'
                          ? 'bg-emerald-500 text-white'
                          : isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-700'}`}
                      >
                        Dynamic Fonts
                      </button>
                    </div>
                  </SettingRow>

                  {fontSettings.mode === 'single' ? (
                    <SettingRow label="Global Font" desc="This font will be used for all content">
                      <FontDropdown value={fontSettings.singleFont} onChange={setSingleFont} />
                    </SettingRow>
                  ) : (
                    <div className="space-y-2 mt-4">
                      <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        AI will automatically select the best font based on content type:
                      </p>
                      {(Object.keys(contentTypeLabels) as ContentType[]).map((type) => (
                        <div key={type} className={`flex items-center justify-between py-2 ${type !== 'math' ? `border-b ${isDark ? 'border-white/5' : 'border-gray-100'}` : ''}`}>
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{contentTypeLabels[type].label}</p>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{contentTypeLabels[type].desc}</p>
                          </div>
                          <FontDropdown
                            value={fontSettings.contentFonts[type] || DEFAULT_CONTENT_FONTS[type]}
                            onChange={(font) => setContentFont(type, font)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={savePreferences}
                    disabled={saving}
                    className="mt-4 w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Font Settings'}
                  </button>
                </div>

                <SettingRow label="Language" desc="Display language for the app">
                  <Dropdown value="en" options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }]} onChange={() => { }} />
                </SettingRow>
              </div>
            )}

            {/* Personalization */}
            {activeSection === 'personalization' && (
              <div>
                <p className={`text-sm mb-4 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                  Customize how KroniQ AI responds to you. These settings won't affect the AI's capabilities.
                </p>

                <SettingRow label="Response Style" desc="Set the overall tone of AI responses">
                  <Dropdown
                    value={aiStyle}
                    options={[
                      { value: 'default', label: 'Default' },
                      { value: 'professional', label: 'Professional' },
                      { value: 'casual', label: 'Casual' },
                      { value: 'creative', label: 'Creative' },
                    ]}
                    onChange={setAiStyle}
                  />
                </SettingRow>

                <SettingRow label="Warmth" desc="How friendly the responses feel">
                  <Dropdown
                    value={aiWarmth}
                    options={[
                      { value: 'default', label: 'Default' },
                      { value: 'warm', label: 'Warm' },
                      { value: 'neutral', label: 'Neutral' },
                    ]}
                    onChange={setAiWarmth}
                  />
                </SettingRow>

                <SettingRow label="Detail Level" desc="How detailed responses should be">
                  <Dropdown
                    value={aiDetail}
                    options={[
                      { value: 'default', label: 'Default' },
                      { value: 'concise', label: 'Concise' },
                      { value: 'detailed', label: 'Detailed' },
                    ]}
                    onChange={setAiDetail}
                  />
                </SettingRow>

                <div className="mt-6">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Custom Instructions</label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="Add any specific instructions for how you'd like AI to respond..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'} border focus:outline-none focus:border-emerald-500`}
                  />
                </div>

                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save preferences'}
                </button>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div>
                <SettingRow label="Email Notifications" desc="Get notified about important updates">
                  <Toggle checked={emailNotifs} onChange={(v) => { setEmailNotifs(v); savePreferences(); }} />
                </SettingRow>

                <SettingRow label="Product Updates" desc="Stay in the loop on new features and tips">
                  <Toggle checked={productUpdates} onChange={(v) => { setProductUpdates(v); savePreferences(); }} />
                </SettingRow>
              </div>
            )}

            {/* Data & Privacy */}
            {activeSection === 'data' && (
              <div>
                <SettingRow label="Chat History" desc={`You have ${projects.length} saved project(s)`}>
                  <span className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{projects.length} projects</span>
                </SettingRow>

                <div className={`mt-6 p-4 rounded-xl border ${isDark ? 'border-red-500/30 bg-red-500/5' : 'border-red-200 bg-red-50'}`}>
                  <h3 className="text-red-500 font-semibold mb-2">Danger Zone</h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Once deleted, your data cannot be recovered.
                  </p>
                  <button
                    onClick={handleDeleteData}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete all data
                  </button>
                </div>

                <div className={`mt-6 text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                  <p>Need help? Contact us at <a href="mailto:support@kroniqai.com" className="text-emerald-500 hover:underline">support@kroniqai.com</a></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
