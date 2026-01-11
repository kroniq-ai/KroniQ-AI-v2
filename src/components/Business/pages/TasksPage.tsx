/**
 * TasksPage - Advanced Task Management
 * Outcome ownership, priority levels, due dates, overdue alerts, AI suggestions
 * Premium green glowing design
 */

import React, { useState, useMemo } from 'react';
import {
    CheckSquare,
    Plus,
    X,
    Clock,
    AlertTriangle,
    Calendar,
    Target,
    User,
    Bot,
    Users,
    Filter,
    Search,
    ArrowUpRight,
    Check,
    Circle,
    ChevronRight,
    Flag,
    MoreHorizontal,
    Sparkles,
    Trash2
} from 'lucide-react';
import type { AgentType } from '../../../lib/agents/types';

interface TasksPageProps {
    isDark: boolean;
    agentType?: AgentType;
}

interface Task {
    id: string;
    title: string;
    description?: string;
    outcome?: string;
    priority: 'high' | 'medium' | 'low';
    status: 'todo' | 'in-progress' | 'done';
    owner: 'you' | 'ai' | 'team';
    ownerName?: string;
    dueDate?: string;
    createdAt: string;
    tags?: string[];
}

// ===== PRIORITY BADGE =====
const PriorityBadge: React.FC<{ priority: Task['priority']; isDark: boolean }> = ({ priority, isDark }) => {
    const config = {
        high: { color: isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200', icon: '🔴' },
        medium: { color: isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-600 border-yellow-200', icon: '🟡' },
        low: { color: isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-50 text-gray-600 border-gray-200', icon: '⚪' }
    };

    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize border ${config[priority].color}`}>
            {priority}
        </span>
    );
};

// ===== OWNER BADGE =====
const OwnerBadge: React.FC<{ owner: Task['owner']; name?: string; isDark: boolean }> = ({ owner, name, isDark }) => {
    const config = {
        you: { icon: User, label: 'You', color: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' },
        ai: { icon: Bot, label: 'KroniQ AI', color: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700' },
        team: { icon: Users, label: name || 'Team', color: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700' }
    };

    const { icon: Icon, label, color } = config[owner];

    return (
        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
};

// ===== TASK ROW =====
const TaskRow: React.FC<{
    isDark: boolean;
    task: Task;
    onToggle: () => void;
    onEdit: () => void;
}> = ({ isDark, task, onToggle, onEdit }) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    const isDone = task.status === 'done';

    return (
        <div className={`
            group p-4 rounded-xl border transition-all duration-200
            ${isOverdue
                ? (isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50/50 border-red-200')
                : isDone
                    ? (isDark ? 'bg-white/[0.01] border-white/5 opacity-60' : 'bg-gray-50/50 border-gray-100 opacity-60')
                    : (isDark ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30' : 'bg-white border-gray-100 hover:border-emerald-200')
            }
        `}>
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={onToggle}
                    className={`
                        w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                        transition-all duration-200
                        ${isDone
                            ? 'border-emerald-500 bg-emerald-500'
                            : (isDark ? 'border-white/20 hover:border-emerald-500/50' : 'border-gray-300 hover:border-emerald-400')
                        }
                    `}
                >
                    {isDone && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className={`font-medium ${isDone ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {task.title}
                        </p>
                        <PriorityBadge priority={task.priority} isDark={isDark} />
                        <OwnerBadge owner={task.owner} name={task.ownerName} isDark={isDark} />
                    </div>

                    {task.outcome && (
                        <p className={`text-xs mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                            <span className="font-medium">Done:</span> {task.outcome}
                        </p>
                    )}

                    {task.dueDate && (
                        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : (isDark ? 'text-white/30' : 'text-gray-400')
                            }`}>
                            {isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                            {isOverdue ? 'Overdue • ' : ''}{task.dueDate}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <button
                    onClick={onEdit}
                    className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
                >
                    <MoreHorizontal className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                </button>
            </div>

            {/* Overdue Suggestion */}
            {isOverdue && (
                <div className={`mt-3 pt-3 border-t ${isDark ? 'border-red-500/20' : 'border-red-200'}`}>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-red-400" />
                        <p className={`text-xs ${isDark ? 'text-red-400/80' : 'text-red-600'}`}>
                            Consider escalating or reassigning this task
                        </p>
                        <button className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                            Reassign
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===== ADD TASK MODAL =====
const AddTaskModal: React.FC<{
    isDark: boolean;
    isOpen: boolean;
    onClose: () => void;
    onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}> = ({ isDark, isOpen, onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [outcome, setOutcome] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('medium');
    const [owner, setOwner] = useState<Task['owner']>('you');
    const [dueDate, setDueDate] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (title) {
            onAdd({
                title,
                outcome: outcome || undefined,
                priority,
                status: 'todo',
                owner,
                dueDate: dueDate || undefined,
            });
            setTitle(''); setOutcome(''); setPriority('medium'); setOwner('you'); setDueDate('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}
                style={{ boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.15)' : '0 25px 80px rgba(0,0,0,0.2)' }}>

                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Task</h2>
                    <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                        <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Task *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                                }`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                            What does "done" look like?
                        </label>
                        <input
                            type="text"
                            value={outcome}
                            onChange={(e) => setOutcome(e.target.value)}
                            placeholder="Specific, measurable outcome..."
                            className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                                }`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Owner</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['you', 'ai', 'team'] as const).map(o => (
                                <button
                                    key={o}
                                    onClick={() => setOwner(o)}
                                    className={`py-3 rounded-xl text-xs font-medium capitalize flex items-center justify-center gap-1.5 ${owner === o ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                        }`}
                                >
                                    {o === 'you' && <User className="w-3 h-3" />}
                                    {o === 'ai' && <Bot className="w-3 h-3" />}
                                    {o === 'team' && <Users className="w-3 h-3" />}
                                    {o === 'ai' ? 'KroniQ' : o}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Priority</label>
                            <div className="grid grid-cols-3 gap-1">
                                {(['high', 'medium', 'low'] as const).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`py-2 rounded-lg text-[10px] font-medium capitalize ${priority === p ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200'
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!title}
                    className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${title ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')
                        }`}
                >
                    <Plus className="w-4 h-4" /> Add Task
                </button>
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
export const TasksPage: React.FC<TasksPageProps> = ({ isDark, agentType }) => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Review Q1 marketing budget', outcome: 'Approved budget doc in shared drive', priority: 'high', status: 'todo', owner: 'you', dueDate: '2025-01-08', createdAt: '2025-01-01' },
        { id: '2', title: 'Prepare investor update', priority: 'high', status: 'in-progress', owner: 'you', dueDate: '2025-01-15', createdAt: '2025-01-02' },
        { id: '3', title: 'Generate weekly customer report', outcome: 'Report sent to team Slack', priority: 'medium', status: 'todo', owner: 'ai', createdAt: '2025-01-05' },
        { id: '4', title: 'Follow up with at-risk customers', priority: 'high', status: 'todo', owner: 'team', ownerName: 'Sarah', dueDate: '2025-01-10', createdAt: '2025-01-03' },
        { id: '5', title: 'Update landing page copy', priority: 'low', status: 'done', owner: 'you', createdAt: '2025-01-01' },
        { id: '6', title: 'Research competitor pricing', priority: 'medium', status: 'todo', owner: 'ai', createdAt: '2025-01-06' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [filterOwner, setFilterOwner] = useState<Task['owner'] | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate stats
    const stats = useMemo(() => {
        const total = tasks.filter(t => t.status !== 'done').length;
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
        const aiOwned = tasks.filter(t => t.owner === 'ai' && t.status !== 'done').length;
        const completed = tasks.filter(t => t.status === 'done').length;
        return { total, overdue, aiOwned, completed };
    }, [tasks]);

    const filteredTasks = tasks.filter(t => {
        const matchesFilter = filterOwner === 'all' || t.owner === filterOwner;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t =>
            t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t
        ));
    };

    const handleAddTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
        setTasks(prev => [{ ...task, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...prev]);
    };

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CheckSquare className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            {agentType ? `${agentType} • ` : ''}Tasks
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Task Management
                    </h1>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400"
                    style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none' }}
                >
                    <Plus className="w-4 h-4" /> Add Task
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-emerald-500/15 to-[#0d0d0d] border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Open Tasks</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${stats.overdue > 0
                        ? (isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
                        : (isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100')
                    }`}>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Overdue</p>
                    <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-400' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                        {stats.overdue}
                    </p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>AI Owned</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{stats.aiOwned}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Completed</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats.completed}</p>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                            }`}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {(['all', 'you', 'ai', 'team'] as const).map(o => (
                        <button
                            key={o}
                            onClick={() => setFilterOwner(o)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium capitalize flex items-center gap-1.5 ${filterOwner === o
                                    ? 'bg-emerald-500 text-white'
                                    : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                }`}
                        >
                            {o === 'you' && <User className="w-3 h-3" />}
                            {o === 'ai' && <Bot className="w-3 h-3" />}
                            {o === 'team' && <Users className="w-3 h-3" />}
                            {o === 'ai' ? 'KroniQ' : o}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {filteredTasks.filter(t => t.status !== 'done').map(task => (
                    <TaskRow
                        key={task.id}
                        isDark={isDark}
                        task={task}
                        onToggle={() => toggleTask(task.id)}
                        onEdit={() => { }}
                    />
                ))}

                {/* Completed Section */}
                {filteredTasks.filter(t => t.status === 'done').length > 0 && (
                    <div className="pt-4">
                        <p className={`text-xs font-medium mb-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            Completed ({filteredTasks.filter(t => t.status === 'done').length})
                        </p>
                        {filteredTasks.filter(t => t.status === 'done').map(task => (
                            <TaskRow
                                key={task.id}
                                isDark={isDark}
                                task={task}
                                onToggle={() => toggleTask(task.id)}
                                onEdit={() => { }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AddTaskModal
                isDark={isDark}
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddTask}
            />
        </div>
    );
};

export default TasksPage;
