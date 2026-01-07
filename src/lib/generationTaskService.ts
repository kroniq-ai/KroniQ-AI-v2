/**
 * Generation Task Service
 * Handles persistent AI generation tasks that survive page refreshes
 * 
 * Flow:
 * 1. Client creates task (saved to DB as 'pending')
 * 2. Client calls processTask which runs the generation
 * 3. Task is updated to 'completed' or 'failed'
 * 4. Realtime subscription notifies other tabs/reloads
 */

import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Types
export interface GenerationTask {
    id: string;
    user_id: string;
    project_id?: string;
    message_id?: string;
    task_type: 'image' | 'video' | 'music' | 'tts' | 'ppt' | 'chat';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    input_prompt: string;
    input_params?: Record<string, any>;
    result_url?: string;
    result_content?: string;
    error_message?: string;
    tokens_deducted?: number;
    created_at: string;
    started_at?: string;
    completed_at?: string;
}

export interface CreateTaskParams {
    userId: string;
    projectId?: string;
    messageId?: string;
    taskType: GenerationTask['task_type'];
    prompt: string;
    params?: Record<string, any>;
}

// ===== TASK CRUD OPERATIONS =====

/**
 * Create a new generation task
 * Returns immediately with task ID - processing happens separately
 */
export async function createTask(params: CreateTaskParams): Promise<GenerationTask | null> {
    try {
        const { data, error } = await supabase
            .from('generation_tasks')
            .insert({
                user_id: params.userId,
                project_id: params.projectId,
                message_id: params.messageId,
                task_type: params.taskType,
                input_prompt: params.prompt,
                input_params: params.params || {},
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            console.error('❌ [TaskService] Failed to create task:', error);
            return null;
        }

        console.log('✅ [TaskService] Task created:', data.id);
        return data as GenerationTask;
    } catch (err) {
        console.error('❌ [TaskService] Exception creating task:', err);
        return null;
    }
}

/**
 * Get a task by ID
 */
export async function getTask(taskId: string): Promise<GenerationTask | null> {
    try {
        const { data, error } = await supabase
            .from('generation_tasks')
            .select('*')
            .eq('id', taskId)
            .single();

        if (error) return null;
        return data as GenerationTask;
    } catch {
        return null;
    }
}

/**
 * Get pending or processing tasks for a user
 */
export async function getActiveTasks(userId: string): Promise<GenerationTask[]> {
    try {
        const { data, error } = await supabase
            .from('generation_tasks')
            .select('*')
            .eq('user_id', userId)
            .in('status', ['pending', 'processing'])
            .order('created_at', { ascending: false });

        if (error) return [];
        return (data || []) as GenerationTask[];
    } catch {
        return [];
    }
}

/**
 * Get recently completed tasks for a project
 * Useful for loading results after page refresh
 */
export async function getCompletedTasks(
    projectId: string,
    since?: Date
): Promise<GenerationTask[]> {
    try {
        let query = supabase
            .from('generation_tasks')
            .select('*')
            .eq('project_id', projectId)
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(20);

        if (since) {
            query = query.gte('completed_at', since.toISOString());
        }

        const { data, error } = await query;
        if (error) return [];
        return (data || []) as GenerationTask[];
    } catch {
        return [];
    }
}

/**
 * Update task status to processing
 */
export async function markTaskProcessing(taskId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('generation_tasks')
            .update({ status: 'processing', started_at: new Date().toISOString() })
            .eq('id', taskId);

        return !error;
    } catch {
        return false;
    }
}

/**
 * Mark task as completed with result
 */
export async function completeTask(
    taskId: string,
    result: { url?: string; content?: string; tokensDeducted?: number }
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('generation_tasks')
            .update({
                status: 'completed',
                result_url: result.url,
                result_content: result.content,
                tokens_deducted: result.tokensDeducted || 0,
                completed_at: new Date().toISOString(),
            })
            .eq('id', taskId);

        if (!error) {
            console.log('✅ [TaskService] Task completed:', taskId);
        }
        return !error;
    } catch {
        return false;
    }
}

/**
 * Mark task as failed
 */
export async function failTask(taskId: string, errorMessage: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('generation_tasks')
            .update({
                status: 'failed',
                error_message: errorMessage,
                completed_at: new Date().toISOString(),
            })
            .eq('id', taskId);

        if (!error) {
            console.log('❌ [TaskService] Task failed:', taskId, errorMessage);
        }
        return !error;
    } catch {
        return false;
    }
}

// ===== REALTIME SUBSCRIPTION =====

let realtimeChannel: RealtimeChannel | null = null;

/**
 * Subscribe to task updates for a user
 * Calls onUpdate when any task changes status
 */
export function subscribeToTaskUpdates(
    userId: string,
    onUpdate: (task: GenerationTask) => void
): () => void {
    // Cleanup existing subscription
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
    }

    // Create new subscription
    realtimeChannel = supabase
        .channel(`tasks:${userId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'generation_tasks',
                filter: `user_id=eq.${userId}`,
            },
            (payload) => {
                console.log('📡 [TaskService] Task update received:', payload.new);
                onUpdate(payload.new as GenerationTask);
            }
        )
        .subscribe();

    // Return cleanup function
    return () => {
        if (realtimeChannel) {
            supabase.removeChannel(realtimeChannel);
            realtimeChannel = null;
        }
    };
}

// ===== TASK PROCESSING =====

/**
 * Process a single task (run the actual generation)
 * This can be called from the client or from an Edge Function
 */
export async function processTask(task: GenerationTask): Promise<boolean> {
    console.log('🚀 [TaskService] Processing task:', task.id, task.task_type);

    // Mark as processing
    await markTaskProcessing(task.id);

    try {
        let result: { url?: string; content?: string; tokensDeducted?: number } = {};

        switch (task.task_type) {
            case 'image': {
                // Import image service dynamically
                const { generateImageForTier } = await import('./imageService');
                const tier = (task.input_params?.tier as 'FREE' | 'PRO' | 'PREMIUM') || 'FREE';
                const imageResult = await generateImageForTier(task.input_prompt, tier);
                result.url = imageResult.url;
                result.tokensDeducted = 5000; // Default token cost for images
                break;
            }

            case 'video': {
                // Import video service dynamically
                const { generateVideoForTier } = await import('./videoService');
                const videoTier = (task.input_params?.tier as 'FREE' | 'PRO' | 'PREMIUM') || 'PRO';
                const videoResult = await generateVideoForTier(task.input_prompt, videoTier);
                result.url = videoResult.url;
                result.tokensDeducted = 50000; // Default token cost for videos
                break;
            }

            case 'music': {
                // Import music service dynamically
                const { generateMusic } = await import('./musicService');
                const musicResult = await generateMusic({ prompt: task.input_prompt });
                result.url = musicResult.url;
                result.tokensDeducted = 10000;
                break;
            }

            case 'chat': {
                // Chat tasks are usually handled inline, but this is for background processing
                const { getOpenRouterResponse } = await import('./openRouterService');
                const model = task.input_params?.model || 'anthropic/claude-3.5-sonnet-20241022';
                const response = await getOpenRouterResponse(task.input_prompt, [], undefined, model);
                result.content = response;
                result.tokensDeducted = 1000;
                break;
            }

            default:
                throw new Error(`Unsupported task type: ${task.task_type}`);
        }

        // Mark as completed
        await completeTask(task.id, result);
        return true;

    } catch (error: any) {
        console.error('❌ [TaskService] Task processing failed:', error);
        await failTask(task.id, error.message || 'Unknown error');
        return false;
    }
}

/**
 * Check for any pending tasks and process them
 * Called on app load to resume interrupted generations
 */
export async function resumePendingTasks(userId: string): Promise<void> {
    console.log('🔄 [TaskService] Checking for pending tasks...');

    const pendingTasks = await getActiveTasks(userId);

    if (pendingTasks.length === 0) {
        console.log('✅ [TaskService] No pending tasks');
        return;
    }

    console.log(`📋 [TaskService] Found ${pendingTasks.length} pending/processing tasks`);

    // Process each pending task
    for (const task of pendingTasks) {
        if (task.status === 'pending') {
            // Start processing
            processTask(task).catch(err => {
                console.error('❌ [TaskService] Failed to process task:', task.id, err);
            });
        }
        // For 'processing' tasks, they might be in progress from before refresh
        // We'll let them complete or timeout naturally
    }
}

/**
 * Create and immediately start processing a task
 * Returns the task object so UI can track it
 */
export async function createAndProcessTask(params: CreateTaskParams): Promise<GenerationTask | null> {
    const task = await createTask(params);

    if (!task) {
        return null;
    }

    // Start processing in background (don't await)
    processTask(task).catch(err => {
        console.error('❌ [TaskService] Background processing failed:', err);
    });

    return task;
}
