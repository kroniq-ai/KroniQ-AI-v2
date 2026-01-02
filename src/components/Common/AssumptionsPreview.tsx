/**
 * AssumptionsPreview Component
 * Shows editable assumptions BEFORE generation starts
 */

import React, { useState } from 'react';
import { Sparkles, X, Check, Edit2 } from 'lucide-react';

export interface Assumption {
    key: string;
    value: string;
    editable: boolean;
}

export interface AssumptionsPreviewProps {
    assumptions: Assumption[];
    taskType: string;
    onConfirm: (updatedAssumptions: Assumption[]) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const AssumptionsPreview: React.FC<AssumptionsPreviewProps> = ({
    assumptions,
    taskType,
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    const [editedAssumptions, setEditedAssumptions] = useState<Assumption[]>(assumptions);

    const handleValueChange = (index: number, newValue: string) => {
        const updated = [...editedAssumptions];
        updated[index] = { ...updated[index], value: newValue };
        setEditedAssumptions(updated);
    };

    // Format task type for display
    const displayTaskType = (() => {
        switch (taskType) {
            case 'image':
                return 'image';
            case 'image_edit':
                return 'image edit';
            case 'video':
                return 'video';
            case 'music':
                return 'music track';
            case 'tts':
                return 'voice audio';
            case 'ppt':
                return 'presentation';
            default:
                return 'content';
        }
    })();

    return (
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/30 bg-black/40 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Before I create your {displayTaskType}...
                </h3>
                <button
                    onClick={onCancel}
                    className="text-white/50 hover:text-white transition-colors p-1"
                    disabled={isLoading}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Description */}
            <p className="text-white/60 text-sm mb-4">
                I'll use these settings. Edit anything you'd like to change:
            </p>

            {/* Assumptions List */}
            <div className="space-y-3 mb-4">
                {editedAssumptions.map((assumption, index) => (
                    <div key={assumption.key} className="flex items-center gap-3">
                        <span className="text-white/50 text-sm w-28 shrink-0">
                            {assumption.key}:
                        </span>
                        {assumption.editable ? (
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={assumption.value}
                                    onChange={(e) => handleValueChange(index, e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500/50 focus:outline-none transition-colors"
                                    disabled={isLoading}
                                />
                                <Edit2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                            </div>
                        ) : (
                            <span className="text-white/70 text-sm flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                                {assumption.value}
                                <span className="text-white/30 text-xs ml-2">(fixed)</span>
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={() => onConfirm(editedAssumptions)}
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Create with these settings
                        </>
                    )}
                </button>
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AssumptionsPreview;
