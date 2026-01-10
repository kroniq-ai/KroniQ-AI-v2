/**
 * Voice Page — Branding Agent
 * Brand voice and tone guidelines
 */

import React, { useState } from 'react';
import {
    Volume2,
    Edit3,
    CheckCircle,
    XCircle,
    Sparkles,
    Plus
} from 'lucide-react';

interface VoicePageProps {
    isDark: boolean;
}

interface VoiceTrait {
    id: string;
    trait: string;
    description: string;
    doExample: string;
    dontExample: string;
}

export const VoicePage: React.FC<VoicePageProps> = ({ isDark }) => {
    const [voiceTraits, setVoiceTraits] = useState<VoiceTrait[]>([
        {
            id: '1',
            trait: 'Conversational',
            description: 'We speak like a helpful friend, not a corporate robot',
            doExample: "Hey! Let's get you set up in just a few clicks.",
            dontExample: "Welcome. Please complete the registration process to proceed."
        },
        {
            id: '2',
            trait: 'Confident',
            description: 'We know our stuff and share it with clarity',
            doExample: "Here's exactly what you need to do next.",
            dontExample: "Maybe you could try doing something like this?"
        },
        {
            id: '3',
            trait: 'Empowering',
            description: 'We help users feel capable and in control',
            doExample: "You've got this! Your business is going to love these insights.",
            dontExample: "This complex feature might be difficult to understand."
        },
        {
            id: '4',
            trait: 'Concise',
            description: "We respect people's time and get to the point",
            doExample: "Done! Your changes are saved.",
            dontExample: "Your changes have been successfully saved to our servers and will be reflected across your account."
        },
    ]);

    const [toneSliders] = useState([
        { name: 'Formal ↔ Casual', value: 75 },
        { name: 'Serious ↔ Playful', value: 40 },
        { name: 'Respectful ↔ Irreverent', value: 30 },
        { name: 'Matter-of-fact ↔ Enthusiastic', value: 65 },
    ]);

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <Volume2 className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                        Branding Agent
                    </span>
                </div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Brand Voice</h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>How your brand sounds and feels</p>
            </div>

            {/* Tone Spectrum */}
            <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <h2 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tone Spectrum</h2>
                <div className="space-y-4">
                    {toneSliders.map(slider => (
                        <div key={slider.name}>
                            <div className="flex justify-between text-xs mb-2">
                                <span className={isDark ? 'text-white/40' : 'text-gray-500'}>{slider.name.split(' ↔ ')[0]}</span>
                                <span className={isDark ? 'text-white/40' : 'text-gray-500'}>{slider.name.split(' ↔ ')[1]}</span>
                            </div>
                            <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                    style={{ width: `${slider.value}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Voice Traits */}
            <div className={`flex-1 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <div className={`px-6 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'} flex items-center justify-between`}>
                    <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Voice Traits</h2>
                    <button className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        <Plus className="w-3 h-3" /> Add Trait
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {voiceTraits.map(trait => (
                        <div key={trait.id} className={`p-5 rounded-xl ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{trait.trait}</h3>
                                    <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{trait.description}</p>
                                </div>
                                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-200'}`}>
                                    <Edit3 className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <CheckCircle className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                        <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Do</span>
                                    </div>
                                    <p className={`text-sm italic ${isDark ? 'text-emerald-300/80' : 'text-emerald-800'}`}>"{trait.doExample}"</p>
                                </div>
                                <div className={`p-3 rounded-lg ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <XCircle className={`w-3.5 h-3.5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                                        <span className={`text-[10px] font-bold uppercase ${isDark ? 'text-red-400' : 'text-red-700'}`}>Don't</span>
                                    </div>
                                    <p className={`text-sm italic ${isDark ? 'text-red-300/80' : 'text-red-800'}`}>"{trait.dontExample}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VoicePage;
