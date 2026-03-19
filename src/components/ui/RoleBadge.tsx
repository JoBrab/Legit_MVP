import React from 'react';
import { CheckCircle } from 'lucide-react';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  isVerified?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const roleLabel: Record<UserRole, string> = {
  Citizen: 'Citoyen',
  Politician: 'Politique',
  Press: 'Média',
  Institution: 'Institution',
  SocietyGroup: 'Société civile',
};

/**
 * Minimal role badge: subtle gray text + optional green checkmark.
 * Designed to not compete visually with the content.
 */
const RoleBadge: React.FC<RoleBadgeProps> = ({ role, isVerified, size = 'sm', className }) => {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      <span className={cn(
        'text-muted-foreground font-medium',
        size === 'sm' ? 'text-[10px]' : 'text-xs',
      )}>
        {roleLabel[role]}
      </span>
      {isVerified && (
        <CheckCircle className={cn(
          'text-emerald-500 flex-shrink-0',
          size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5',
        )} />
      )}
    </span>
  );
};

export default RoleBadge;
