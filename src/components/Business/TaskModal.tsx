/**
 * Task Modal - Create/Edit Tasks
 * Premium green design for task management
 */

import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, Flag, User, Sparkles } from 'lucide-react';

interface Task {
    id?: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done' | 'urgent';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignee?: string;
    dueDate?: string;
    linkedGoal?: string;
}

interface TaskModalProps {
    isDark: boolean;
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    editingTask?: Task | null;
}

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', description: 'When you have time' },
    { value: 'medium', label: 'Medium', description: 'This week' },
    { value: 'high', label: 'High', description: 'Priority item' },
    { value: 'urgent', label: 'Urgent', description: 'Do it now' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
    isDark,
    isOpen,
    onClose,
    onSave,
    editingTask,
}) => {
    const [formData, setFormData] = useState<Task>({
        title: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        dueDate: '',
    });

    useEffect(() => {
        if (editingTask) {
            setFormData(editingTask);
        } else {
            setFormData({
                title: '',
                status: 'todo',
                priority: 'medium',
                assignee: '',
                dueDate: '',
            });
        }
    }, [editingTask, isOpen]);

    const handleSubmit = () => {
        if (formData.title.trim()) {
            onSave({
                ...formData,
                id: editingTask?.id || `task-${Date.now()}`,
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`
                    relative w-full max-w-md rounded-2xl overflow-hidden
                    ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}
                `}
                style={{
                    boxShadow: isDark
                        ? '0 0 60px rgba(16, 185, 129, 0.1)'
                        : '0 20px 60px rgba(0,0,0,0.2)'
                }}
            >
                {/* Header */}
                <div className={`
                    flex items-center justify-between px-5 py-4 border-b
                    ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}
                `}>
                    <div className="flex items-center gap-3">
                        <div className={`
                            w-9 h-9 rounded-xl flex items-center justify-center
                            ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'}
                        `}>
                            <CheckSquare className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <h2
                            className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            {editingTask ? 'Edit Task' : 'New Task'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
                    >
                        <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Title */}
                    <div>
                        <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-500/40' : 'text-emerald-600'}`}>
                            Task Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="What needs to be done?"
                            autoFocus
                            className={`
                                w-full mt-2 px-4 py-3 rounded-xl text-sm font-medium
                                border transition-all duration-200
                                ${isDark
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-white placeholder-emerald-500/30 focus:border-emerald-500/50'
                                    : 'bg-emerald-50 border-emerald-100 text-gray-900 placeholder-emerald-400 focus:border-emerald-400'}
                                outline-none
                            `}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-500/40' : 'text-emerald-600'}`}>
                            <Flag className="w-3 h-3 inline mr-1" />
                            Priority
                        </label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {PRIORITY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFormData({ ...formData, priority: opt.value as Task['priority'] })}
                                    className={`
                                        p-2.5 rounded-lg text-center transition-all duration-200
                                        border
                                        ${formData.priority === opt.value
                                            ? (isDark
                                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                                : 'bg-emerald-100 border-emerald-400 text-emerald-700')
                                            : (isDark
                                                ? 'bg-emerald-500/5 border-emerald-500/10 text-white/50 hover:border-emerald-500/30'
                                                : 'bg-emerald-50 border-emerald-100 text-gray-500 hover:border-emerald-300')}
                                    `}
                                >
                                    <p className="text-xs font-semibold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                        {opt.label}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-500/40' : 'text-emerald-600'}`}>
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Due Date (optional)
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className={`
                                w-full mt-2 px-4 py-3 rounded-xl text-sm
                                border transition-all duration-200
                                ${isDark
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-white focus:border-emerald-500/50'
                                    : 'bg-emerald-50 border-emerald-100 text-gray-900 focus:border-emerald-400'}
                                outline-none
                            `}
                        />
                    </div>

                    {/* AI Suggestion */}
                    <div className={`
                        p-3 rounded-xl flex items-center gap-3
                        ${isDark ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-emerald-50 border border-emerald-100'}
                    `}>
                        <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        <p className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
                            Tip: Be specific. "Call 5 customers" is better than "Do outreach"
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className={`
                    px-5 py-4 border-t flex items-center justify-end gap-3
                    ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}
                `}>
                    <button
                        onClick={onClose}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.title.trim()}
                        className={`
                            px-5 py-2.5 rounded-xl text-sm font-semibold
                            transition-all duration-200
                            ${formData.title.trim()
                                ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                : (isDark
                                    ? 'bg-emerald-500/10 text-emerald-500/30'
                                    : 'bg-emerald-100 text-emerald-400')}
                        `}
                        style={{
                            boxShadow: formData.title.trim() && isDark
                                ? '0 0 20px rgba(16, 185, 129, 0.3)'
                                : 'none'
                        }}
                    >
                        {editingTask ? 'Save Changes' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
