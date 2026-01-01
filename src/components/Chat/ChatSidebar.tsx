import React, { useState, useEffect } from 'react';
import { Plus, Search, LogOut, MessageSquare, Code, Palette, Video, Music, Mic, Presentation, Image as ImageIcon, Trash2, Edit2, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Project } from '../../lib/supabaseClient';
import { ConfirmDialog } from '../Common/ConfirmDialog';
import { TokenBalanceDisplay } from '../Common/TokenBalanceDisplay';

interface ChatSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onNewChat: () => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  projects,
  activeProjectId,
  onNewChat,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
}) => {
  const { signOut } = useAuth();
  const { navigateTo } = useNavigation();
  const { currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const isLight = currentTheme === 'pure-white';

  // Token balance is now handled by TokenBalanceDisplay component

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const hamburger = document.getElementById('mobile-hamburger');
      if (sidebar && !sidebar.contains(e.target as Node) && hamburger && !hamburger.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'code': return Code;
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'music': return Music;
      case 'voice': return Mic;
      case 'tts': return Mic;
      case 'ppt': return Presentation;
      // Legacy types for backward compatibility
      case 'design': return Palette;
      default: return MessageSquare;
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedProjects = filteredProjects.reduce((groups, project) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse project date - handle both Supabase timestamp and Firebase timestamp
    let projectDate: Date;
    if (project.updated_at) {
      // Supabase timestamp (ISO string)
      projectDate = new Date(project.updated_at);
    } else if ((project as any).updatedAt?.toDate) {
      // Firebase timestamp
      projectDate = (project as any).updatedAt.toDate();
    } else {
      projectDate = new Date();
    }
    projectDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - projectDate.getTime()) / (1000 * 60 * 60 * 24));

    let group = '';
    if (diffDays === 0) {
      group = 'Today';
    } else if (diffDays === 1) {
      group = 'Yesterday';
    } else if (diffDays < 7) {
      group = 'This Week';
    } else {
      // Format as "1 Oct", "15 Nov", etc.
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      group = `${projectDate.getDate()} ${months[projectDate.getMonth()]}`;
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(project);
    return groups;
  }, {} as Record<string, Project[]>);

  // Sort groups: Today, Yesterday, This Week, then dates in reverse chronological order
  const groupOrder = ['Today', 'Yesterday', 'This Week', ...Object.keys(groupedProjects)
    .filter(g => !['Today', 'Yesterday', 'This Week'].includes(g))
    .sort((a, b) => {
      // Parse dates like "1 Oct" and compare
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const [dayA, monthA] = a.split(' ');
      const [dayB, monthB] = b.split(' ');
      const dateA = new Date(new Date().getFullYear(), months.indexOf(monthA), parseInt(dayA));
      const dateB = new Date(new Date().getFullYear(), months.indexOf(monthB), parseInt(dayB));
      return dateB.getTime() - dateA.getTime(); // Reverse chronological
    })
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        id="mobile-hamburger"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`md:hidden fixed top-2 left-2 z-30 w-10 h-10 flex items-center justify-center rounded-full border backdrop-blur-xl transition-all active:scale-95 shadow-lg ${isLight
          ? 'bg-white/90 border-gray-200 text-gray-700 hover:bg-white'
          : 'glass-panel border-white/10 text-white hover:bg-white/10'}`}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className={`md:hidden fixed inset-0 backdrop-blur-sm z-40 animate-fade-in ${isLight ? 'bg-black/30' : 'bg-black/60'}`} />
      )}

      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group h-screen backdrop-blur-xl border-r flex flex-col transition-all duration-500 ease-out z-50
          md:relative fixed top-0 left-0
          ${isLight
            ? 'bg-white/95 border-gray-200'
            : 'bg-black/20 border-white/10'
          }
          ${isMobileOpen
            ? 'translate-x-0 w-72 shadow-2xl shadow-[#00FFF0]/5'
            : 'md:translate-x-0 -translate-x-full md:w-16 md:hover:w-72 md:hover:shadow-2xl md:hover:shadow-[#00FFF0]/5 w-72'
          }
        `}
      >
        <div className={`p-4 border-b flex items-center justify-center ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          <div className="flex items-center justify-center">
            <img
              src={isLight ? "/kroniq-logo-light.png" : "/kroniq-logo-white.png"}
              alt="KroniQ AI Logo"
              width={128}
              height={128}
              className={`object-contain transition-all duration-300 ${isLight ? 'w-32 h-32' : 'w-20 h-20 drop-shadow-[0_0_20px_rgba(0,255,240,0.9)]'}`}
              onError={(e) => { (e.target as HTMLImageElement).src = '/kroniq-logo-white.png'; }}
            />
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              setIsMobileOpen(false);
            }}
            className={`relative w-full flex items-center gap-2 active:scale-95 rounded-xl text-sm font-semibold transition-all duration-300 border group ${isLight
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100'
              : 'bg-gradient-to-r from-[#00FFF0]/20 to-[#8A2BE2]/20 hover:from-[#00FFF0]/30 hover:to-[#8A2BE2]/30 text-white border-white/10 hover:border-[#00FFF0]/50 hover:shadow-lg hover:shadow-[#00FFF0]/20'
              } ${isMobileOpen || isHovered ? 'px-4 py-3 justify-start' : 'md:p-3 px-4 py-3 md:justify-center justify-start'
              }`}
            title={!isHovered && !isMobileOpen ? 'New Chat' : ''}
          >
            <Plus className="w-5 h-5 flex-shrink-0 transition-transform group-hover:rotate-90 duration-300" />
            {(isMobileOpen || isHovered) && <span className="animate-fade-in">New Chat</span>}
            <div className="absolute inset-0 bg-gradient-to-r from-[#00FFF0]/0 via-[#00FFF0]/10 to-[#00FFF0]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
          </button>
        </div>

        {(isMobileOpen || isHovered) && projects.length > 0 && (
          <div className="px-3 pb-3 animate-fade-in">
            <div className={`relative rounded-lg ${isLight ? 'bg-gray-100 border border-gray-200' : 'glass-panel'}`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-gray-400' : 'text-white/40'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className={`w-full pl-9 pr-3 py-2 bg-transparent border-none text-sm focus:outline-none ${isLight ? 'text-gray-900 placeholder-gray-400' : 'text-white placeholder-white/40'}`}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
          {projects.length === 0 ? (
            <div className="flex items-center justify-center h-32 px-4">
              {(isMobileOpen || isHovered) && (
                <p className={`text-xs text-center animate-fade-in ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
                  Start a new chat to begin
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {groupOrder.map(group => {
                const groupProjects = groupedProjects[group];
                if (!groupProjects || groupProjects.length === 0) return null;

                return (
                  <div key={group}>
                    {(isMobileOpen || isHovered) && (
                      <div className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider animate-fade-in ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
                        {group}
                      </div>
                    )}
                    <div className="space-y-1">
                      {groupProjects.map((project: Project) => {
                        const Icon = getProjectIcon(project.type);
                        const isActive = activeProjectId === project.id;

                        return (
                          <div key={project.id} className="relative group/item">
                            <button
                              onClick={() => {
                                onSelectProject(project.id);
                                setIsMobileOpen(false);
                              }}
                              className={`relative w-full flex items-start gap-2.5 rounded-lg transition-all duration-300 group text-left border overflow-hidden active:scale-95 ${isActive
                                ? isLight
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-md'
                                  : 'bg-white/10 text-white border-[#00FFF0]/40 shadow-lg shadow-[#00FFF0]/10'
                                : isLight
                                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent hover:border-gray-200'
                                  : 'text-white/70 hover:bg-white/10 hover:text-white border-transparent hover:border-white/10'
                                } ${isMobileOpen || isHovered ? 'px-3 py-2.5 pr-20' : 'md:p-2.5 px-3 py-2.5 md:justify-center'}`}
                              title={!isHovered && !isMobileOpen ? project.name : ''}
                            >
                              {isActive && (
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLight ? 'bg-emerald-500' : 'bg-gradient-to-b from-[#00FFF0] to-[#8A2BE2]'}`} />
                              )}
                              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-all duration-300 ${isActive
                                ? isLight ? 'text-emerald-600 scale-110' : 'text-[#00FFF0] scale-110'
                                : isLight ? 'group-hover:text-emerald-600 group-hover:scale-110' : 'group-hover:text-[#00FFF0] group-hover:scale-110'
                                }`} />
                              {(isMobileOpen || isHovered) && (
                                <div className="flex-1 min-w-0 animate-fade-in">
                                  <p className="text-xs font-semibold truncate">{project.name}</p>
                                  <p className={`text-[10px] mt-0.5 capitalize tracking-wide ${isLight ? 'text-gray-400' : 'text-white/50'}`}>{project.type} Project</p>
                                </div>
                              )}
                            </button>
                            {(isMobileOpen || isHovered) && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 md:opacity-0 md:group-hover/item:opacity-100 opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProjectId(project.id);
                                    setEditingName(project.name);
                                  }}
                                  className={`p-1.5 rounded-lg transition-all duration-200 ${isLight ? 'hover:bg-gray-200 text-gray-400 hover:text-gray-600' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
                                  title="Rename project"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('🗑️ Delete button clicked for project:', project.id, project.name);
                                    setProjectToDelete({ id: project.id, name: project.name || 'this project' });
                                  }}
                                  className={`p-1.5 rounded-lg transition-all duration-200 ${isLight ? 'hover:bg-red-100 text-gray-400 hover:text-red-500' : 'hover:bg-red-500/20 text-white/40 hover:text-red-400'}`}
                                  title="Delete project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={`p-3 border-t space-y-2 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
          {(isMobileOpen || isHovered) && (
            <TokenBalanceDisplay isExpanded={true} />
          )}

          <button
            onClick={() => {
              navigateTo('settings');
              setIsMobileOpen(false);
            }}
            className={`w-full flex items-center gap-2 rounded-xl active:scale-95 transition-all text-sm border button-press ${isLight
              ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent hover:border-gray-200'
              : 'text-white/70 hover:text-white hover:bg-white/10 border-transparent hover:border-white/20'
              } ${isMobileOpen || isHovered ? 'px-3 py-2.5 justify-start' : 'md:p-2.5 px-3 py-2.5 md:justify-center justify-start'
              }`}
            title={!isHovered && !isMobileOpen ? 'Settings' : ''}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {(isMobileOpen || isHovered) && <span className="animate-fade-in">Settings</span>}
          </button>

          <button
            onClick={signOut}
            className={`w-full flex items-center gap-2 rounded-xl active:scale-95 transition-all text-sm border button-press ${isLight
              ? 'text-red-500 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-200'
              : 'text-white/70 hover:text-red-400 hover:bg-red-500/10 border-transparent hover:border-red-500/30'
              } ${isMobileOpen || isHovered ? 'px-3 py-2.5 justify-start' : 'md:p-2.5 px-3 py-2.5 md:justify-center justify-start'
              }`}
            title={!isHovered && !isMobileOpen ? 'Sign Out' : ''}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(isMobileOpen || isHovered) && <span className="animate-fade-in">Sign Out</span>}
          </button>
        </div>

        {projectToDelete && (
          <ConfirmDialog
            title="Delete Project"
            message={`Are you sure you want to delete "${projectToDelete.name}"?\n\nThis action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
            onConfirm={() => {
              onDeleteProject(projectToDelete.id);
              setProjectToDelete(null);
            }}
            onCancel={() => setProjectToDelete(null)}
          />
        )}

        {editingProjectId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-panel rounded-2xl p-6 max-w-md w-full mx-4 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Rename Project</h3>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editingName.trim()) {
                    onRenameProject(editingProjectId, editingName.trim());
                    setEditingProjectId(null);
                  }
                  if (e.key === 'Escape') {
                    setEditingProjectId(null);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#00FFF0]/50 mb-4"
                placeholder="Enter new project name"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingProjectId(null)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingName.trim()) {
                      onRenameProject(editingProjectId, editingName.trim());
                      setEditingProjectId(null);
                    }
                  }}
                  disabled={!editingName.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00FFF0] to-[#8A2BE2] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#00FFF0]/20"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
