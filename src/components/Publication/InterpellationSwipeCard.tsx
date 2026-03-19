import React, { useState } from 'react';
import { Interpellation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/utils/haptics';

interface InterpellationSwipeCardProps {
    interpellation: Interpellation;
    index: number;
    total: number;
    onSupport: (id: string) => void;
}

const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
};

const InterpellationSwipeCard: React.FC<InterpellationSwipeCardProps> = ({
    interpellation,
    index,
    total,
    onSupport,
}) => {
    const [expanded, setExpanded] = useState(false);
    const shouldTruncate = interpellation.content.length > 120;

    return (
        <div className="flex flex-col bg-white rounded-2xl border-2 border-[#E91E63] shadow-md p-4 max-h-[70vh] overflow-y-auto">
            {/* Breadcrumb */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-[#E91E63] uppercase tracking-wider">
                    ⚡ Interpellation {index + 1}/{total}
                </span>
                {interpellation.politicianReply && (
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[9px] px-1.5 py-0">
                        ✅ Réponse
                    </Badge>
                )}
            </div>

            {/* Author */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {interpellation.citizen.avatar ? (
                        <img
                            src={interpellation.citizen.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-sm font-semibold text-foreground">
                            {interpellation.citizen.displayName.charAt(0)}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold truncate">
                            {interpellation.citizen.displayName}
                        </span>
                        <RoleBadge role="Citizen" isVerified={false} size="sm" />
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                        {formatTime(interpellation.createdAt)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 mb-3">
                <p className={cn(
                    'text-sm text-foreground leading-relaxed transition-all duration-300',
                    shouldTruncate && !expanded && 'line-clamp-3'
                )}>
                    {interpellation.content}
                </p>
                {shouldTruncate && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[#E91E63] text-[11px] font-medium hover:underline mt-1"
                    >
                        {expanded ? '↑ Voir moins' : '…Voir plus'}
                    </button>
                )}

                {/* Politician reply */}
                {interpellation.politicianReply && (
                    <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">💬 Réponse du politique</p>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                            {interpellation.politicianReply.content}
                        </p>
                        <p className="text-[10px] text-emerald-600 mt-1">
                            {formatTime(interpellation.politicianReply.createdAt)}
                        </p>
                    </div>
                )}
            </div>

            {/* Stats + Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground">
                    📊 <strong className="text-foreground">{interpellation.supportCount}</strong> soutiens
                </span>
                <span className="text-xs text-muted-foreground">
                    💬 {interpellation.commentCount}
                </span>
                <div className="flex items-center gap-1.5 ml-auto">
                    <button
                        onClick={() => { triggerHaptic('medium'); onSupport(interpellation.id); }}
                        className="flex items-center gap-1 text-[11px] font-medium text-[#E91E63] bg-[#E91E63]/10 hover:bg-[#E91E63]/20 rounded-lg px-3 py-1.5 transition-all duration-200 active:scale-95"
                    >
                        <ThumbsUp className="w-3 h-3" /> Soutenir
                    </button>
                    <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground rounded-lg px-2 py-1.5 transition-colors">
                        <MessageSquare className="w-3 h-3" /> Réagir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InterpellationSwipeCard;
