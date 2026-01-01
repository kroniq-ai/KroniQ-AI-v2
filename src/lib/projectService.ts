/**
 * Project Service
 * Uses Supabase for project and message operations
 */

import { supabase, getCurrentUser, createProject as supabaseCreateProject, createMessage, getProjects, getMessages } from './supabaseClient';
import { callOpenRouter } from './openRouterService';

function detectProjectType(message: string): 'chat' | 'code' | 'design' | 'video' {
  const lowerMessage = message.toLowerCase();

  const codeKeywords = ['code', 'program', 'function', 'script', 'algorithm', 'debug',
    'javascript', 'python', 'typescript', 'react', 'api', 'database',
    'implement', 'build', 'develop', 'coding'];

  const designKeywords = ['design', 'layout', 'ui', 'ux', 'interface', 'mockup',
    'wireframe', 'prototype', 'visual', 'graphic', 'logo',
    'website design', 'app design'];

  const videoKeywords = ['video', 'animation', 'motion', 'clip', 'trailer',
    'edit', 'footage', 'film', 'movie', 'cinematic'];

  if (codeKeywords.some(k => lowerMessage.includes(k))) return 'code';
  if (designKeywords.some(k => lowerMessage.includes(k))) return 'design';
  if (videoKeywords.some(k => lowerMessage.includes(k))) return 'video';

  return 'chat';
}

/**
 * Generate a professional project name using AI
 */
export async function generateAIProjectName(message: string): Promise<string> {
  try {
    const prompt = `Generate a short, professional project name (2-4 words max) based on this message. Return ONLY the name, nothing else:
"${message.substring(0, 200)}"`;

    const response = await callOpenRouter({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 20,
      temperature: 0.7
    });

    const aiName = response.choices?.[0]?.message?.content?.trim();

    if (aiName && aiName.length > 0 && aiName.length <= 50) {
      return aiName.replace(/["']/g, '');
    }
  } catch (error) {
    console.error('Failed to generate AI project name:', error);
  }

  return generateProjectName(detectProjectType(message), message);
}

function generateProjectName(type: string, message: string): string {
  const words = message.split(' ').filter(w => w.length > 3).slice(0, 3);
  const baseWords = words.join(' ');

  const typePrefix: Record<string, string> = {
    'code': 'Code',
    'design': 'Design',
    'video': 'Video',
    'chat': 'Chat'
  };

  return `${typePrefix[type] || 'Project'}: ${baseWords || 'New'}`;
}

/**
 * Create a new project
 */
export async function createProject(
  userId: string,
  message: string,
  aiModel: 'openai' | 'claude' | 'gemini' = 'openai'
): Promise<string> {
  const projectType = detectProjectType(message);
  const projectName = await generateAIProjectName(message);

  const project = await supabaseCreateProject(
    projectName,
    projectType,
    '',
    aiModel
  );

  if (!project) {
    throw new Error('Failed to create project');
  }

  // Add the initial user message
  await createMessage(project.id, 'user', message);

  return project.id;
}

/**
 * Add a message to a project
 */
export async function addMessageToProject(
  projectId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  await createMessage(projectId, role, content);
}

/**
 * Subscribe to projects for a user
 */
export function subscribeToProjects(
  userId: string,
  callback: (projects: any[]) => void
): (() => void) {
  // Initial fetch
  getProjects().then(callback);

  // Subscribe to changes
  const channel = supabase
    .channel(`projects-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `user_id=eq.${userId}`
      },
      () => {
        getProjects().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to messages for a project
 */
export function subscribeToMessages(
  projectId: string,
  callback: (messages: any[]) => void
): (() => void) {
  // Initial fetch
  getMessages(projectId).then(callback);

  // Subscribe to changes
  const channel = supabase
    .channel(`messages-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`
      },
      () => {
        getMessages(projectId).then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

function selectAIModel(): 'openai' | 'claude' | 'gemini' {
  const models = ['openai', 'claude', 'gemini'] as const;
  return models[Math.floor(Math.random() * models.length)];
}

export { getProjects, getMessages };
