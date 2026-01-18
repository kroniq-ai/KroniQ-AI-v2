import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project } from '../types';
import { getProject } from '../lib/supabaseClient';

type ViewType = 'chat' | 'projects' | 'voice' | 'code' | 'design' | 'video' | 'ppt' | 'image' | 'music' | 'billing' | 'admin' | 'analytics' | 'settings' | 'profile' | 'backup' | 'business';

interface NavigationContextType {
  currentView: ViewType;
  activeProject: Project | null;
  navigateTo: (view: ViewType, project?: Project) => void;
  setActiveProject: (project: Project | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

// Parse URL to get view and project ID
const parseUrl = (): { view: ViewType; projectId: string | null } => {
  if (typeof window === 'undefined') return { view: 'chat', projectId: null };

  const path = window.location.pathname;

  // Match /chat/:projectId
  const chatMatch = path.match(/^\/chat\/([^/]+)$/);
  if (chatMatch) {
    return { view: 'chat', projectId: chatMatch[1] };
  }

  // Match other views like /image, /video, /settings, etc.
  const viewMatch = path.match(/^\/([a-z]+)$/);
  if (viewMatch) {
    const view = viewMatch[1] as ViewType;
    if (['image', 'video', 'music', 'ppt', 'settings', 'billing', 'profile', 'analytics', 'admin', 'projects', 'voice', 'code', 'design', 'backup', 'business'].includes(view)) {
      return { view, projectId: null };
    }
  }

  // Default to chat view
  return { view: 'chat', projectId: null };
};

// Update URL without page reload
const updateUrl = (view: ViewType, projectId?: string | null) => {
  if (typeof window === 'undefined') return;

  let newPath = '/';

  if (view === 'chat' && projectId) {
    newPath = `/chat/${projectId}`;
  } else if (view !== 'chat') {
    newPath = `/${view}`;
  }

  // Only update if different from current
  if (window.location.pathname !== newPath) {
    window.history.pushState({ view, projectId }, '', newPath);
  }
};

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from URL first, then fallback to localStorage
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    const { view } = parseUrl();
    return view;
  });

  const [activeProject, setActiveProjectState] = useState<Project | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('kroniq_active_project');
    return saved ? JSON.parse(saved) : null;
  });

  const [urlProjectId, setUrlProjectId] = useState<string | null>(() => {
    const { projectId } = parseUrl();
    return projectId;
  });

  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // Load project from URL if specified - fetch from Supabase if not in localStorage
  useEffect(() => {
    const loadProjectFromUrl = async () => {
      if (urlProjectId && !activeProject && !isLoadingProject) {
        // Project ID is in URL but not loaded - try to load from localStorage first
        const saved = localStorage.getItem('kroniq_active_project');
        if (saved) {
          const project = JSON.parse(saved);
          if (project.id === urlProjectId) {
            setActiveProjectState(project);
            return;
          }
        }

        // Project isn't in localStorage - fetch from Supabase
        console.log('📂 [NavigationContext] Fetching project from URL:', urlProjectId);
        setIsLoadingProject(true);
        try {
          const project = await getProject(urlProjectId);
          if (project) {
            console.log('✅ [NavigationContext] Loaded project from Supabase:', project.name);
            setActiveProjectState(project);
          } else {
            console.warn('⚠️ [NavigationContext] Project not found:', urlProjectId);
          }
        } catch (error) {
          console.error('❌ [NavigationContext] Failed to load project:', error);
        } finally {
          setIsLoadingProject(false);
        }
      }
    };

    loadProjectFromUrl();
  }, [urlProjectId, activeProject, isLoadingProject]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kroniq_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    if (activeProject) {
      localStorage.setItem('kroniq_active_project', JSON.stringify(activeProject));
      // Update URL when project changes
      if (currentView === 'chat') {
        updateUrl('chat', activeProject.id);
      }
    } else {
      localStorage.removeItem('kroniq_active_project');
    }
  }, [activeProject, currentView]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const { view, projectId } = parseUrl();
      setCurrentView(view);
      setUrlProjectId(projectId);

      if (!projectId && currentView === 'chat') {
        // Navigated to /chat without project ID - clear active project
        setActiveProjectState(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const navigateTo = useCallback((view: ViewType, project?: Project) => {
    setCurrentView(view);

    if (project !== undefined) {
      setActiveProjectState(project);
      updateUrl(view, project?.id);
    } else if (view === 'chat') {
      // Clear active project when navigating to chat without a specific project (New Chat)
      setActiveProjectState(null);
      updateUrl('chat');
    } else {
      updateUrl(view);
    }
  }, []);

  const setActiveProject = useCallback((project: Project | null) => {
    setActiveProjectState(project);
    if (currentView === 'chat' && project) {
      updateUrl('chat', project.id);
    }
  }, [currentView]);

  return (
    <NavigationContext.Provider value={{ currentView, activeProject, navigateTo, setActiveProject }}>
      {children}
    </NavigationContext.Provider>
  );
};
