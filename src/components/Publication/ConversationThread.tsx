import React, { useState } from 'react';
import { Publication } from '@/types';
import { MessageSquare, ChevronUp } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';
import NuanceIndicator from '@/components/ui/NuanceIndicator';
import PublicationCard from './PublicationCard';

interface ConversationThreadProps {
    origin: Publication;
    replies: Publication[];
    onSupport: (id: string) => void;
    onReaction: (id: string, level: number) => void;
}

const roleEmoji: Record<string, string> = {
    Press: '🔵',
    Politician: '🟢',
    Institution: '🟢',
    SocietyGroup: '🟣',
    Citizen: '🩷',
};

const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
};

const CompactReplyCard: React.FC<{
    publication: Publication;
    depth: number;
    onExpand: () => void;
    isExpanded: boolean;
    onSupport: (id: string) => void;
    onReaction: (id: string, level: number) => void;
}> = ({ publication, depth, onExpand, isExpanded, onSupport, onReaction }) => {
    const content = publication.content.fr || '';
    const totalReactions = Object.values(publication.reactions).reduce((s, n) => s + n, 0);
    const emoji = roleEmoji[publication.author.role] || '💬';

    if (isExpanded) {
        return (
            <div className="pl-3 border-l-[3px] border-border/60" style={{ marginLeft: `${Math.min(depth * 12, 36)}px` }}>
                <PublicationCard
                    publication={publication}
                    onSupport={onSupport}
                    onReaction={onReaction}
                />
                <button
                    onClick={onExpand}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground mt-1 ml-2 min-h-[28px] transition-colors"
                >
                    <ChevronUp className="w-3 h-3" /> Réduire
                </button>
            </div>
        );
    }

    return (
        <div
            className="pl-3 border-l-[3px] border-border/60 cursor-pointer group"
            style={{ marginLeft: `${Math.min(depth * 12, 36)}px` }}
            onClick={onExpand}
        >
            <div className="flex items-start gap-2 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-muted-foreground/50 text-xs mt-0.5 flex-shrink-0">↓</span>
                <span className="text-sm flex-shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-foreground truncate">{publication.author.displayName}</span>
                        <RoleBadge role={publication.author.role} isVerified={publication.author.isVerified} size="sm" />
                        <span className="text-[10px] text-muted-foreground ml-auto">{formatTime(publication.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed group-hover:text-foreground transition-colors">
                        {content}
                    </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                    <NuanceIndicator reactions={publication.reactions} size="sm" />
                    <span className="text-[10px] text-muted-foreground">{totalReactions}</span>
                </div>
            </div>
        </div>
    );
};

const ConversationThread: React.FC<ConversationThreadProps> = ({
    origin,
    replies,
    onSupport,
    onReaction,
}) => {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [showAllReplies, setShowAllReplies] = useState(false);

    const maxInlineReplies = 4;
    const visibleReplies = showAllReplies ? replies : replies.slice(0, maxInlineReplies);
    const hasMoreReplies = replies.length > maxInlineReplies && !showAllReplies;

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <div className="space-y-0">
            <PublicationCard
                publication={origin}
                onSupport={onSupport}
                onReaction={onReaction}
            />

            {visibleReplies.length > 0 && (
                <div className="mt-1 space-y-0">
                    {visibleReplies.map((reply) => (
                        <CompactReplyCard
                            key={reply.id}
                            publication={reply}
                            depth={1}
                            isExpanded={expandedIds.has(reply.id)}
                            onExpand={() => toggleExpand(reply.id)}
                            onSupport={onSupport}
                            onReaction={onReaction}
                        />
                    ))}
                </div>
            )}

            {hasMoreReplies && (
                <button
                    onClick={() => setShowAllReplies(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-[hsl(330,85%,52%)] hover:underline ml-4 mt-1 min-h-[36px] transition-colors"
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Continuer la conversation ({replies.length - maxInlineReplies} de plus)
                </button>
            )}
        </div>
    );
};

export default ConversationThread;
