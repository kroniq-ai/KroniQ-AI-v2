/**
 * UsageSummary Component
 * Displays remaining usage after generation with warning if <5% remaining
 */

import React from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface UsageSummaryProps {
    type: string;
    used: number;
    remaining: number;
    total: number;
    warningShown?: boolean;
    className?: string;
}

export const UsageSummary: React.FC<UsageSummaryProps> = ({
    type,
    remaining,
    total,
    warningShown = false,
    className = '',
}) => {
    const percentage = total > 0 ? (remaining / total) * 100 : 100;
    const isLow = percentage <= 5;
    const isCritical = percentage <= 2;

    // Format type name for display
    const displayType = (() => {
        switch (type) {
            case 'image':
            case 'image_edit':
                return 'images';
            case 'video':
                return 'videos';
            case 'music':
                return 'music tracks';
            case 'tts':
                return 'voice generations';
            case 'ppt':
                return 'presentations';
            case 'tokens':
            case 'chat':
                return 'tokens';
            default:
                return type;
        }
    })();

    // Format large numbers
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toString();
    };

    return (
        <div className={`flex items-center gap-2 text-xs mt-2 ${isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white/40'
            } ${className}`}>
            {(isLow || warningShown) && <AlertTriangle className="w-3 h-3" />}
            {!isLow && !warningShown && <TrendingUp className="w-3 h-3 opacity-50" />}
            <span>
                {formatNumber(remaining)}/{formatNumber(total)} {displayType} remaining
            </span>
            {isLow && (
                <Link
                    to="/pricing"
                    className="text-emerald-400 hover:underline ml-1"
                >
                    Upgrade
                </Link>
            )}
        </div>
    );
};

export default UsageSummary;
