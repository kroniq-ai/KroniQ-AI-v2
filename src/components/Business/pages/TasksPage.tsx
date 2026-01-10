/**
 * Tasks Page — Shared across all agents
 * Task management with priorities
 */

import React, { useState } from 'react';
import {
    CheckSquare,
    Plus,
    X,
    Square,
    CheckCircle,
    Clock,
    Star,
    Trash2
} from 'lucide-react';

interface TasksPageProps {
    isDark: boolean;
    agentType?: string;
}

interface Task {
    id: string;
    title: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
    agent?: string;
}

const PRIORITY_CONFIG = {
    high: { label: 'High', color: { dark: 'text-red-400 bg-red-500/20', light: 'text-red-600 bg-red-100' } },
    medium: { label: 'Medium', color: { dark: 'text-yellow-400 bg-yellow-500/20', light: 'text-yellow-600 bg-yellow-100' } },
    low: { label: 'Low', color: { dark: 'text-gray-400 bg-gray-500/20', light: 'text-gray-600 bg-gray-100' } }
};

export const TasksPage: React.FC<TasksPageProps> = ({ isDark, agentType }) => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', title: 'Review Q1 financial projections', completed: false, priority: 'high', dueDate: 'Today', agent: 'finance' },
        { id: '2', title: 'Launch Product Hunt campaign', completed: false, priority: 'high', dueDate: 'Tomorrow', agent: 'marketing' },
        { id: '3', title: 'Follow up with enterprise leads', completed: true, priority: 'medium', agent: 'customer' },
        { id: '4', title: 'Update brand guidelines doc', completed: false, priority: 'medium', dueDate: 'This week', agent: 'branding' },
        { id: '5', title: 'Fix Safari login bug', completed: false, priority: 'high', dueDate: 'Today', agent: 'product' },
        { id: '6', title: 'Plan next sprint', completed: false, priority: 'medium', agent: 'product' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', priority: 'medium' as const, dueDate: '' });

    // Filter by agent if specified
    const filteredTasks = agentType && agentType !== 'ceo'
        ? tasks.filter(t => t.agent === agentType)
        : tasks;

    const pendingTasks = filteredTasks.filter(t => !t.completed);
    const completedTasks = filteredTasks.filter(t => t.completed);

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const handleAddTask = () => {
        if (newTask.title) {
            setTasks(prev => [{
                id: Date.now().toString(),
                title: newTask.title,
                completed: false,
                priority: newTask.priority,
                dueDate: newTask.dueDate || undefined,
                agent: agentType
            }, ...prev]);
            setNewTask({ title: '', priority: 'medium', dueDate: '' });
            setShowAddModal(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CheckSquare className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            {agentType ? agentType.charAt(0).toUpperCase() + agentType.slice(1) : 'All'} Tasks
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tasks</h1>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400">
                    <Plus className="w-4 h-4" /> Add Task
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-yellow-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Pending</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{pendingTasks.length}</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-emerald-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Completed</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{completedTasks.length}</p>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-2">
                {pendingTasks.map(task => {
                    const prioConfig = PRIORITY_CONFIG[task.priority];
                    return (
                        <div
                            key={task.id}
                            className={`group p-4 rounded-2xl flex items-center gap-3 ${isDark ? 'bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30' : 'bg-white border border-gray-200 hover:border-emerald-300'} transition-colors`}
                        >
                            <button onClick={() => toggleTask(task.id)} className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-white/30 hover:text-emerald-400' : 'text-gray-300 hover:text-emerald-600'}`}>
                                <Square className="w-5 h-5" />
                            </button>
                            <div className="flex-1 min-w-0">
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</p>
                                {task.dueDate && (
                                    <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{task.dueDate}</span>
                                )}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${isDark ? prioConfig.color.dark : prioConfig.color.light}`}>
                                {prioConfig.label}
                            </span>
                            <button onClick={() => deleteTask(task.id)} className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg ${isDark ? 'hover:bg-white/5 text-white/30' : 'hover:bg-gray-100 text-gray-400'}`}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}

                {completedTasks.length > 0 && (
                    <>
                        <p className={`text-xs font-bold uppercase tracking-wider pt-4 pb-2 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Completed</p>
                        {completedTasks.map(task => (
                            <div
                                key={task.id}
                                className={`group p-4 rounded-2xl flex items-center gap-3 opacity-50 ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}
                            >
                                <button onClick={() => toggleTask(task.id)} className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                                <p className={`flex-1 line-through ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{task.title}</p>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Task</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Task</label>
                                <input type="text" value={newTask.title} onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))} placeholder="What needs to be done?" className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Priority</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['high', 'medium', 'low'] as const).map(p => (
                                        <button key={p} onClick={() => setNewTask(prev => ({ ...prev, priority: p }))} className={`py-2 px-3 rounded-xl text-xs font-medium capitalize ${newTask.priority === p ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Due Date</label>
                                <input type="text" value={newTask.dueDate} onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))} placeholder="e.g., Today, Tomorrow..." className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                        </div>
                        <button onClick={handleAddTask} disabled={!newTask.title} className={`w-full py-3 rounded-xl text-sm font-semibold ${newTask.title ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}>
                            Add Task
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TasksPage;
