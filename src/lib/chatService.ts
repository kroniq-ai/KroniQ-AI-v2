/**
 * Chat Service
 * Uses Supabase for all data operations
 */

import {
  supabase,
  getCurrentUser,
  createProject as supabaseCreateProject,
  getProjects as supabaseGetProjects,
  getProject,
  updateProject as supabaseUpdateProject,
  deleteProject as supabaseDeleteProject,
  createMessage as supabaseCreateMessage,
  updateMessage as supabaseUpdateMessage,
  getMessages as supabaseGetMessages,
  getUserProfile as supabaseGetUserProfile,
  subscribeToProjects as supabaseSubscribeToProjects,
  subscribeToMessages as supabaseSubscribeToMessages,
  Project,
  Message,
  UserProfile
} from './supabaseClient';
import { generateAIProjectName } from './projectService';

// Re-export types
export type { Project, Message, UserProfile };

// Re-export generateAIProjectName
export { generateAIProjectName };

// Get current user ID from Supabase Auth
export const getCurrentUserId = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  return user?.id || null;
};

// Get user profile
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  return await supabaseGetUserProfile(userId);
};

// Create a new project
export const createProject = async (
  name: string,
  type: 'chat' | 'code' | 'design' | 'video' | 'image' | 'music' | 'voice' | 'ppt' = 'chat',
  description?: string
): Promise<Project> => {
  // Map 'design' to 'image' if needed
  let validType: any = type;
  if (type === 'design') validType = 'image';

  const project = await supabaseCreateProject(name, validType, description || '', 'default');
  if (!project) {
    throw new Error('Failed to create project');
  }
  return project;
};

// Get all projects for current user
export const getProjects = async (): Promise<Project[]> => {
  return await supabaseGetProjects();
};

// Subscribe to projects
export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  return supabaseSubscribeToProjects(callback);
};

// Add message to project
export const addMessage = async (
  projectId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  _userId?: string,
  fileAttachments?: any[],
  metadata?: Record<string, any>
): Promise<Message> => {
  const meta = metadata || {};

  if (fileAttachments && fileAttachments.length > 0) {
    meta.file_attachments = fileAttachments;
  }

  const message = await supabaseCreateMessage(projectId, role, content, meta);
  if (!message) {
    throw new Error('Failed to create message');
  }

  return {
    ...message,
    file_attachments: meta.file_attachments
  } as any;
};

// Get messages for a project
export const getMessages = async (projectId: string): Promise<Message[]> => {
  const messages = await supabaseGetMessages(projectId);
  return messages.map(msg => ({
    ...msg,
    file_attachments: msg.metadata?.file_attachments
  })) as any[];
};

export const subscribeToMessages = (
  projectId: string,
  callback: (messages: Message[]) => void
) => {
  return supabaseSubscribeToMessages(projectId, (messages) => {
    const mappedMessages = messages.map(msg => ({
      ...msg,
      file_attachments: msg.metadata?.file_attachments
    })) as any[];
    callback(mappedMessages);
  });
};

// Update message
export const updateMessage = async (
  projectId: string,
  messageId: string,
  updates: Partial<Pick<Message, 'content' | 'metadata'>>
): Promise<void> => {
  const anyUpdates = updates as any;
  const supabaseUpdates: any = {};

  if (anyUpdates.content !== undefined) supabaseUpdates.content = anyUpdates.content;

  if (anyUpdates.metadata) {
    supabaseUpdates.metadata = anyUpdates.metadata;
  }

  if (anyUpdates.file_attachments) {
    supabaseUpdates.metadata = {
      ...(supabaseUpdates.metadata || {}),
      file_attachments: anyUpdates.file_attachments
    };
  }

  if (anyUpdates.payload) {
    supabaseUpdates.metadata = {
      ...(supabaseUpdates.metadata || {}),
      ...anyUpdates.payload
    };
  }

  return await supabaseUpdateMessage(messageId, supabaseUpdates);
};

// Rename project
export const renameProject = async (projectId: string, newName: string): Promise<void> => {
  return await supabaseUpdateProject(projectId, { name: newName });
};

// Delete project
export const deleteProject = async (projectId: string): Promise<void> => {
  return await supabaseDeleteProject(projectId);
};

// Delete all projects for current user
export const deleteAllProjects = async (): Promise<number> => {
  const projects = await supabaseGetProjects();
  let deletedCount = 0;

  for (const project of projects) {
    try {
      await supabaseDeleteProject(project.id);
      deletedCount++;
      console.log(`🗑️ Deleted project: ${project.name}`);
    } catch (error) {
      console.error(`❌ Failed to delete project ${project.id}:`, error);
    }
  }

  console.log(`✅ Deleted ${deletedCount} projects total`);
  return deletedCount;
};
