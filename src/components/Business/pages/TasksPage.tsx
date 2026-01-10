/**
 * Tasks Page - Execution System
 * Premium green-only design with glow effects and Inter typography
 */

import React, { useState } from 'react';
import { CheckSquare, Circle, Clock, Plus, Sparkles, Calendar, ChevronDown, Zap } from 'lucide-react';

interface TasksPageProps {
    isDark: boolean;
}

type TaskStatus = 'todo' | 'in-progress' | 'done' | 'urgent';
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
        'todo': <Circle className={`w-4 h-4 ${isDark ? 'text-emerald-500/30' : 'text-emerald-300'}`} />,
        'in-progress': <Clock className="w-4 h-4 text-emerald-400" />,
        'done': <CheckSquare className="w-4 h-4 text-emerald-500" />,
        'urgent': <Zap className="w-4 h-4 text-emerald-300 animate-pulse" />,
    };
    return icons[status];
};

const PriorityBadge: React.FC<{ priority: TaskPriority; isDark: boolean }> = ({ priority, isDark }) => {
    // All green shades - brightness indicates urgency
    const colors = {
        'low': isDark ? 'bg-emerald-500/10 text-emerald-500/40' : 'bg-emerald-50 text-emerald-400',
        'medium': isDark ? 'bg-emerald-500/15 text-emerald-400/60' : 'bg-emerald-100 text-emerald-500',
        'high': isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-200 text-emerald-600',
        'urgent': isDark ? 'bg-emerald-400/25 text-emerald-300' : 'bg-emerald-300 text-emerald-700',
    };
    return (
        <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[priority]}`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
            {priority}
        </span>
    );
};

const TaskRow: React.FC<{ task: Task; isDark: boolean; onStatusChange: (status: TaskStatus) => void }> = ({
    task, isDark, onStatusChange
}) => (
    <div className={`
        flex items-center gap-3 px-4 py-3.5 border-b transition-all duration-200 group
        ${isDark
            ? 'border-emerald-500/5 hover:bg-emerald-500/[0.03]'
            : 'border-gray-100 hover:bg-emerald-50/50'}
        ${task.status === 'done' ? 'opacity-40' : ''}
    `}>
        {/* Status Toggle */}
        <button
            onClick={() => onStatusChange(task.status === 'done' ? 'todo' : 'done')}
            className="flex-shrink-0 transition-transform duration-150 hover:scale-110"
        >
            <StatusIcon status={task.status} isDark={isDark} />
        </button>

        {/* Title */}
        <span
            className={`
                flex-1 text-sm font-medium
                ${task.status === 'done' ? 'line-through' : ''}
                ${isDark ? 'text-white' : 'text-gray-900'}
            `}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
            {task.title}
        </span>

        {/* Priority */}
        <PriorityBadge priority={task.priority} isDark={isDark} />

        {/* Due Date */}
        {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs font-medium ${isDark ? 'text-emerald-500/40' : 'text-emerald-400'}`}>
                <Calendar className="w-3 h-3" />
                {task.dueDate}
            </span>
        )}

        {/* Assignee */}
        {task.assignee && (
            <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}
            `}>
                {task.assignee.charAt(0)}
            </div>
        )}
    </div>
);

// Section Header Component
const SectionHeader: React.FC<{
    isDark: boolean;
    icon: React.ReactNode;
    title: string;
    count: number;
    intensity: 'high' | 'medium' | 'low';
}> = ({ isDark, icon, title, count, intensity }) => {
    const intensityStyles = {
        high: isDark ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
        medium: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100',
        low: isDark ? 'bg-emerald-500/5 text-emerald-500/60 border-emerald-500/10' : 'bg-gray-50 text-emerald-500 border-gray-100',
    };

    return (
        <div className={`
            px-4 py-2.5 rounded-t-xl flex items-center gap-2 border
            ${intensityStyles[intensity]}
        `}>
            {icon}
            <span className="text-sm font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {title}
            </span>
            <span className={`text-xs font-medium ${isDark ? 'opacity-50' : 'opacity-70'}`}>
                ({count})
            </span>
        </div>
    );
};

export const TasksPage: React.FC<TasksPageProps> = ({ isDark }) => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Finalize Q1 roadmap presentation', status: 'in-progress', priority: 'high', assignee: 'A', dueDate: 'Jan 10' },
        { id: '2', title: 'Review competitor pricing page', status: 'todo', priority: 'medium', assignee: 'B', dueDate: 'Jan 12' },
        { id: '3', title: 'Set up analytics tracking', status: 'todo', priority: 'high', dueDate: 'Jan 15' },
        { id: '4', title: 'Write investor update email', status: 'urgent', priority: 'urgent', assignee: 'A', dueDate: 'Jan 8' },
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
        <div className="flex-1 overflow-y-auto relative">
            {/* Background grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: isDark
                        ? `linear-gradient(rgba(16, 185, 129, 0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px)`
                        : 'none',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse 100% 50% at 50% 0%, black 0%, transparent 60%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 100% 50% at 50% 0%, black 0%, transparent 60%)'
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1
                            className={`text-2xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            Tasks
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                            {tasks.filter(t => t.status !== 'done').length} tasks remaining
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-200
                            ${isDark
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}
                        `}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            <Sparkles className="w-4 h-4" />
                            AI Daily Plan
                        </button>
                        <button
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                                bg-emerald-500 text-white hover:bg-emerald-400
                                transition-all duration-200
                            `}
                            style={{
                                fontFamily: 'Inter, system-ui, sans-serif',
                                boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            <Plus className="w-4 h-4" />
                            Add Task
                        </button>
                    </div>
                </div>

                {/* Urgent Section */}
                {tasksByStatus.urgent.length > 0 && (
                    <div className="mb-6">
                        <SectionHeader
                            isDark={isDark}
                            icon={<Zap className="w-4 h-4" />}
                            title="Urgent"
                            count={tasksByStatus.urgent.length}
                            intensity="high"
                        />
                        <div className={`
                            rounded-b-xl border-x border-b overflow-hidden
                            ${isDark ? 'border-emerald-400/20 bg-emerald-500/[0.02]' : 'border-emerald-200 bg-white'}
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

                {/* In Progress Section */}
                <div className="mb-6">
                    <SectionHeader
                        isDark={isDark}
                        icon={<Clock className="w-4 h-4" />}
                        title="In Progress"
                        count={tasksByStatus.active.length}
                        intensity="medium"
                    />
                    <div className={`
                        rounded-b-xl border-x border-b overflow-hidden
                        ${isDark ? 'border-emerald-500/10 bg-emerald-500/[0.01]' : 'border-gray-100 bg-white'}
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

                {/* To Do Section */}
                <div className="mb-6">
                    <SectionHeader
                        isDark={isDark}
                        icon={<Circle className="w-4 h-4" />}
                        title="To Do"
                        count={tasksByStatus.todo.length}
                        intensity="low"
                    />
                    <div className={`
                        rounded-b-xl border-x border-b overflow-hidden
                        ${isDark ? 'border-emerald-500/5 bg-emerald-500/[0.01]' : 'border-gray-100 bg-white'}
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
                        px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer list-none
                        transition-all duration-200
                        ${isDark
                            ? 'bg-emerald-500/5 text-emerald-500/40 hover:text-emerald-400 border border-emerald-500/10'
                            : 'bg-gray-50 text-emerald-400 hover:text-emerald-600'}
                    `}>
                        <CheckSquare className="w-4 h-4" />
                        <span className="text-sm font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            Completed
                        </span>
                        <span className="text-xs">({tasksByStatus.done.length})</span>
                        <ChevronDown className="w-4 h-4 ml-auto transition-transform group-open:rotate-180" />
                    </summary>
                    <div className={`
                        mt-2 rounded-xl border overflow-hidden
                        ${isDark ? 'border-emerald-500/5 bg-emerald-500/[0.01]' : 'border-gray-100 bg-white'}
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
