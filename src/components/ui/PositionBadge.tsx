import React from 'react';
import { cn } from '@/lib/utils';

type PositionVariant = 'majority' | 'opposition' | 'testimony' | 'verified' | 'none';

interface PositionBadgeProps {
    label: string;
    variant: PositionVariant;
    className?: string;
}

const variantStyles: Record<PositionVariant, string> = {
    majority: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    opposition: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    testimony: 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
    verified: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    none: 'bg-muted text-muted-foreground border-border',
};

const variantIcons: Record<PositionVariant, string> = {
    majority: '🏛️',
    opposition: '⚖️',
    testimony: '💬',
    verified: '✓',
    none: '',
};

const PositionBadge: React.FC<PositionBadgeProps> = ({ label, variant, className }) => {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded border leading-none',
                variantStyles[variant],
                className
            )}
        >
            <span className="text-[8px]">{variantIcons[variant]}</span>
            {label}
        </span>
    );
};

export default PositionBadge;
