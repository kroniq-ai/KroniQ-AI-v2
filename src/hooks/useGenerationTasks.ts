/**
 * useGenerationTasks Hook
 * React hook for managing persistent generation tasks
 * 
 * Features:
 * - Tracks active tasks in state
 * - Subscribes to realtime updates
 * - Resumes pending tasks on mount
 * - Auto-cleanup on unmount
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    GenerationTask,
    CreateTaskParams,
    createAndProcessTask,
    getActiveTasks,
    getCompletedTasks,
    subscribeToTaskUpdates,
    resumePendingTasks,
} from '../lib/generationTaskService';

interface UseGenerationTasksOptions {
    projectId?: string;
    autoResume?: boolean;
}

export function useGenerationTasks(options: UseGenerationTasksOptions = {}) {
    const { user } = useAuth();
    const [activeTasks, setActiveTasks] = useState<GenerationTask[]>([]);
    const [completedTasks, setCompletedTasks] = useState<GenerationTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Handle task updates from realtime
    const handleTaskUpdate = useCallback((updatedTask: GenerationTask) => {
        if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
            // Move from active to completed
            setActiveTasks(prev => prev.filter(t => t.id !== updatedTask.id));

            if (updatedTask.status === 'completed') {
                setCompletedTasks(prev => [updatedTask, ...prev]);
            }

            // Dispatch custom event for UI components
            window.dispatchEvent(new CustomEvent('taskCompleted', {
                detail: updatedTask
            }));
        } else {
            // Update in active tasks
            setActiveTasks(prev =>
                prev.map(t => t.id === updatedTask.id ? updatedTask : t)
            );
        }
    }, []);

    // Load tasks and subscribe to updates
    useEffect(() => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        let cleanup: (() => void) | null = null;

        const init = async () => {
            setIsLoading(true);

            // Load active tasks
            const active = await getActiveTasks(user.id);
            setActiveTasks(active);

            // Load completed tasks for this project
            if (options.projectId) {
                const completed = await getCompletedTasks(options.projectId);
                setCompletedTasks(completed);
            }

            // Subscribe to realtime updates
            cleanup = subscribeToTaskUpdates(user.id, handleTaskUpdate);

            // Resume any pending tasks (auto-process on load)
            if (options.autoResume !== false) {
                await resumePendingTasks(user.id);
            }

            setIsLoading(false);
        };

        init();

        return () => {
            if (cleanup) cleanup();
        };
    }, [user?.id, options.projectId, options.autoResume, handleTaskUpdate]);

    // Create a new task
    const createTask = useCallback(async (
        taskType: GenerationTask['task_type'],
        prompt: string,
        params?: Record<string, any>
    ): Promise<GenerationTask | null> => {
        if (!user?.id) return null;

        const taskParams: CreateTaskParams = {
            userId: user.id,
            projectId: options.projectId,
            taskType,
            prompt,
            params,
        };

        const task = await createAndProcessTask(taskParams);

        if (task) {
            // Add to active tasks immediately
            setActiveTasks(prev => [task, ...prev]);
        }

        return task;
    }, [user?.id, options.projectId]);

    // Get task by ID
    const getTaskById = useCallback((taskId: string): GenerationTask | undefined => {
        return activeTasks.find(t => t.id === taskId) ||
            completedTasks.find(t => t.id === taskId);
    }, [activeTasks, completedTasks]);

    // Check if there are any active generations
    const hasActiveGenerations = activeTasks.length > 0;

    // Get active task for specific type
    const getActiveTaskByType = useCallback((type: GenerationTask['task_type']): GenerationTask | undefined => {
        return activeTasks.find(t => t.task_type === type);
    }, [activeTasks]);

    return {
        // State
        activeTasks,
        completedTasks,
        isLoading,
        hasActiveGenerations,

        // Actions
        createTask,
        getTaskById,
        getActiveTaskByType,
    };
}

/**
 * Hook for listening to task completion events
 * Useful for updating chat messages when generations complete
 */
export function useTaskCompletionListener(
    onComplete: (task: GenerationTask) => void
) {
    useEffect(() => {
        const handler = (event: CustomEvent<GenerationTask>) => {
            onComplete(event.detail);
        };

        window.addEventListener('taskCompleted', handler as EventListener);

        return () => {
            window.removeEventListener('taskCompleted', handler as EventListener);
        };
    }, [onComplete]);
}
