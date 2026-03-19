import React from 'react';
import { calculateNuanceScore, getNuanceLabel } from '@/utils/debateAnalysis';
import { AgreementLevel } from '@/types';
import { cn } from '@/lib/utils';

interface NuanceIndicatorProps {
    reactions: Record<AgreementLevel, number>;
    size?: 'sm' | 'md';
}

const NuanceIndicator: React.FC<NuanceIndicatorProps> = ({ reactions, size = 'sm' }) => {
    const score = calculateNuanceScore(reactions);
    const { emoji, label } = getNuanceLabel(score);

    if (size === 'sm') {
        return (
            <span
                className="cursor-default"
                title={`${label} (${score}/100)`}
            >
                {emoji}
            </span>
        );
    }

    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground" title={`Score de nuance : ${score}/100`}>
            <span>{emoji}</span>
            <span className="font-medium">{label}</span>
        </div>
    );
};

export default NuanceIndicator;
