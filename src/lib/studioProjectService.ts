/**
 * Studio Project Service
 * Handles studio-specific project operations using Supabase
 */

import { supabase } from './supabaseClient';

export type StudioType = 'image' | 'video' | 'music' | 'tts' | 'voice' | 'ppt' | 'chat';

export interface StudioProject {
  id: string;
  user_id: string;
  name: string;
  type: StudioType;
  description?: string;
  ai_model?: string;
  status: string;
  session_state?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectOptions {
  userId: string;
  studioType: StudioType;
  name: string;
  description?: string;
  model?: string;
  sessionState: any;
}

export interface UpdateProjectStateOptions {
  projectId: string;
  sessionState: any;
}

/**
 * Create a new studio project with metadata
 */
export async function createStudioProject(
  options: CreateProjectOptions
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  try {
    const { userId, studioType, name, description, model, sessionState } = options;

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name,
        type: studioType,
        description: description || name,
        ai_model: model || 'default',
        status: 'active',
        session_state: sessionState || {},
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Error creating project:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Project created:', data.id);
    return { success: true, projectId: data.id };

  } catch (error: any) {
    console.error('❌ Exception creating studio project:', error);
    return { success: false, error: error.message || 'Failed to create project' };
  }
}

/**
 * Update project session state
 */
export async function updateProjectState(
  options: UpdateProjectStateOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    const { projectId, sessionState } = options;

    const { error } = await supabase
      .from('projects')
      .update({
        session_state: sessionState,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) {
      console.error('❌ Error updating project:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error: any) {
    console.error('❌ Exception updating project state:', error);
    return { success: false, error: error.message || 'Failed to update project' };
  }
}

/**
 * Load project with metadata
 */
export async function loadProject(
  projectId: string
): Promise<{ success: boolean; project?: StudioProject; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('❌ Error loading project:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'Project not found' };
    }

    const studioProject: StudioProject = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      type: data.type,
      description: data.description,
      ai_model: data.ai_model,
      status: data.status,
      session_state: data.session_state || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return { success: true, project: studioProject };

  } catch (error: any) {
    console.error('❌ Exception loading project:', error);
    return { success: false, error: error.message || 'Failed to load project' };
  }
}

/**
 * Get all projects for a user by studio type
 */
export async function getUserProjects(
  userId: string,
  studioType?: StudioType
): Promise<{ success: boolean; projects?: StudioProject[]; error?: string }> {
  try {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (studioType) {
      query = query.eq('type', studioType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching projects:', error);
      return { success: false, error: error.message };
    }

    const studioProjects: StudioProject[] = (data || []).map(proj => ({
      id: proj.id,
      user_id: proj.user_id,
      name: proj.name,
      type: proj.type,
      description: proj.description,
      ai_model: proj.ai_model,
      status: proj.status,
      session_state: proj.session_state || {},
      createdAt: new Date(proj.created_at),
      updatedAt: new Date(proj.updated_at),
    }));

    return { success: true, projects: studioProjects };

  } catch (error: any) {
    console.error('❌ Exception fetching projects:', error);
    return { success: false, error: error.message || 'Failed to fetch projects' };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('❌ Error deleting project:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error: any) {
    console.error('❌ Exception deleting project:', error);
    return { success: false, error: error.message || 'Failed to delete project' };
  }
}

/**
 * Generate a project name based on content
 */
export function generateStudioProjectName(
  studioType: StudioType,
  prompt: string,
  maxLength: number = 50
): string {
  const typeLabels: Record<StudioType, string> = {
    image: 'Image',
    video: 'Video',
    music: 'Music',
    tts: 'Voice',
    voice: 'Voice',
    ppt: 'Presentation',
    chat: 'Chat'
  };

  const label = typeLabels[studioType];
  const truncatedPrompt = prompt.length > maxLength
    ? prompt.substring(0, maxLength) + '...'
    : prompt;

  return `${label}: ${truncatedPrompt}`;
}
