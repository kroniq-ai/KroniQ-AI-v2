/**
 * Tasks Page - Execution System
 * Linear-inspired task management with AI support
 */

import React, { useState } from 'react';
import { CheckSquare, Circle, Clock, AlertCircle, Plus, Sparkles, User, Calendar, ChevronDown } from 'lucide-react';

interface TasksPageProps {
    isDark: boolean;
}

type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: string;
    dueDate?: string;
    linkedGoal?: string;
}

const StatusIcon: React.FC<{ status: TaskStatus; isDark: boolean }> = ({ status, isDark }) => {
    const icons = {
        'todo': <Circle className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />,
        'in-progress': <Clock className="w-4 h-4 text-amber-500" />,
        'done': <CheckSquare className="w-4 h-4 text-emerald-500" />,
        'blocked': <AlertCircle className="w-4 h-4 text-red-500" />,
    };
    return icons[status];
};

const PriorityBadge: React.FC<{ priority: TaskPriority; isDark: boolean }> = ({ priority, isDark }) => {
    const colors = {
        'low': isDark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500',
        'medium': isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600',
        'high': isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
        'urgent': isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
    };
    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors[priority]}`}>
            {priority}
        </span>
    );
};

const TaskRow: React.FC<{ task: Task; isDark: boolean; onStatusChange: (status: TaskStatus) => void }> = ({
    task, isDark, onStatusChange
}) => (
    <div className={`
        flex items-center gap-3 px-4 py-3 border-b transition-all duration-150 group
        ${isDark
            ? 'border-white/5 hover:bg-white/[0.02]'
            : 'border-gray-100 hover:bg-gray-50'}
        ${task.status === 'done' ? 'opacity-50' : ''}
    `}>
        {/* Status Toggle */}
        <button
            onClick={() => onStatusChange(task.status === 'done' ? 'todo' : 'done')}
            className="flex-shrink-0"
        >
            <StatusIcon status={task.status} isDark={isDark} />
        </button>

        {/* Title */}
        <span className={`
            flex-1 text-sm
            ${task.status === 'done' ? 'line-through' : ''}
            ${isDark ? 'text-white' : 'text-gray-900'}
        `}>
            {task.title}
        </span>

        {/* Priority */}
        <PriorityBadge priority={task.priority} isDark={isDark} />

        {/* Due Date */}
        {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                <Calendar className="w-3 h-3" />
                {task.dueDate}
            </span>
        )}

        {/* Assignee */}
        {task.assignee && (
            <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs
                ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'}
            `}>
                {task.assignee.charAt(0)}
            </div>
        )}
    </div>
);

export const TasksPage: React.FC<TasksPageProps> = ({ isDark }) => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Finalize Q1 roadmap presentation', status: 'in-progress', priority: 'high', assignee: 'A', dueDate: 'Jan 10' },
        { id: '2', title: 'Review competitor pricing page', status: 'todo', priority: 'medium', assignee: 'B', dueDate: 'Jan 12' },
        { id: '3', title: 'Set up analytics tracking', status: 'todo', priority: 'high', dueDate: 'Jan 15' },
        { id: '4', title: 'Write investor update email', status: 'blocked', priority: 'urgent', assignee: 'A', dueDate: 'Jan 8' },
        { id: '5', title: 'Launch landing page A/B test', status: 'done', priority: 'medium', assignee: 'C', dueDate: 'Jan 5' },
        { id: '6', title: 'Customer interview calls (3)', status: 'in-progress', priority: 'high', dueDate: 'Jan 11' },
    ]);

    const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    };

    const tasksByStatus = {
        urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done'),
        active: tasks.filter(t => t.status === 'in-progress'),
        todo: tasks.filter(t => t.status === 'todo' && t.priority !== 'urgent'),
        done: tasks.filter(t => t.status === 'done'),
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Tasks
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            {tasks.filter(t => t.status !== 'done').length} tasks remaining
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className={`
                            flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm
                            ${isDark ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}>
                            <Sparkles className="w-4 h-4" />
                            AI Daily Plan
                        </button>
                        <button className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                            bg-emerald-500 text-white hover:bg-emerald-400
                            shadow-lg shadow-emerald-500/20
                        `}>
                            <Plus className="w-4 h-4" />
                            Add Task
                        </button>
                    </div>
                </div>

                {/* Urgent Section */}
                {tasksByStatus.urgent.length > 0 && (
                    <div className="mb-6">
                        <div className={`
                            px-3 py-2 rounded-t-xl flex items-center gap-2
                            ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}
                        `}>
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Urgent</span>
                        </div>
                        <div className={`
                            rounded-b-xl border overflow-hidden
                            ${isDark ? 'border-red-500/20' : 'border-red-200'}
                        `}>
                            {tasksByStatus.urgent.map(task => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    isDark={isDark}
                                    onStatusChange={(status) => handleStatusChange(task.id, status)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Section */}
                <div className="mb-6">
                    <div className={`
                        px-3 py-2 rounded-t-xl flex items-center gap-2
                        ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}
                    `}>
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">In Progress</span>
                        <span className={`text-xs ${isDark ? 'text-amber-400/50' : 'text-amber-500'}`}>
                            ({tasksByStatus.active.length})
                        </span>
                    </div>
                    <div className={`
                        rounded-b-xl border overflow-hidden
                        ${isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-100 bg-white'}
                    `}>
                        {tasksByStatus.active.map(task => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                isDark={isDark}
                                onStatusChange={(status) => handleStatusChange(task.id, status)}
                            />
                        ))}
                    </div>
                </div>

                {/* Todo Section */}
                <div className="mb-6">
                    <div className={`
                        px-3 py-2 rounded-t-xl flex items-center gap-2
                        ${isDark ? 'bg-white/5 text-white/60' : 'bg-gray-50 text-gray-600'}
                    `}>
                        <Circle className="w-4 h-4" />
                        <span className="text-sm font-medium">To Do</span>
                        <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            ({tasksByStatus.todo.length})
                        </span>
                    </div>
                    <div className={`
                        rounded-b-xl border overflow-hidden
                        ${isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-100 bg-white'}
                    `}>
                        {tasksByStatus.todo.map(task => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                isDark={isDark}
                                onStatusChange={(status) => handleStatusChange(task.id, status)}
                            />
                        ))}
                    </div>
                </div>

                {/* Done Section - Collapsible */}
                <details className="group">
                    <summary className={`
                        px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer list-none
                        ${isDark ? 'bg-white/5 text-white/40 hover:text-white/60' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}
                    `}>
                        <CheckSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">Completed</span>
                        <span className="text-xs">({tasksByStatus.done.length})</span>
                        <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
                    </summary>
                    <div className={`
                        mt-2 rounded-xl border overflow-hidden
                        ${isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-100 bg-white'}
                    `}>
                        {tasksByStatus.done.map(task => (
                            <TaskRow
                                key={task.id}
                                task={task}
                                isDark={isDark}
                                onStatusChange={(status) => handleStatusChange(task.id, status)}
                            />
                        ))}
                    </div>
                </details>
            </div>
        </div>
    );
};

export default TasksPage;
