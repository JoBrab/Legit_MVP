import React, { useState } from 'react';
import { Publication, Interpellation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, ChevronRight } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';
import InterpellationsModal from './InterpellationsModal';
import { getInterpellationsForPost } from '@/data/mockInterpellations';
import { cn } from '@/lib/utils';

interface InterpellationsSectionProps {
    publication: Publication;
}

const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
};

const InterpellationsSection: React.FC<InterpellationsSectionProps> = ({ publication }) => {
    const [showModal, setShowModal] = useState(false);
    const [localInterpellations, setLocalInterpellations] = useState<Interpellation[]>(() =>
        getInterpellationsForPost(publication.id)
    );

    // Don't render if no interpellation has 50+ support
    if (localInterpellations.length === 0) return null;

    const top3 = localInterpellations.slice(0, 3);
    const hasMore = localInterpellations.length > 3;

    const handleSupport = (id: string) => {
        setLocalInterpellations(prev =>
            prev.map(i => i.id === id ? { ...i, supportCount: i.supportCount + 1 } : i)
        );
    };

    return (
        <>
            <div className="space-y-2 pt-1">
                {/* Section Header */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[hsl(330,85%,52%)] uppercase tracking-wider">
                        ⚡ {localInterpellations.length} interpellation{localInterpellations.length > 1 ? 's' : ''} citoyenne{localInterpellations.length > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Top 3 Inline Cards */}
                <div className="space-y-2">
                    {top3.map((interpellation) => (
                        <InlineInterpellationCard
                            key={interpellation.id}
                            interpellation={interpellation}
                            onSupport={handleSupport}
                        />
                    ))}
                </div>

                {/* "Voir toutes" button */}
                {hasMore && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[hsl(330,85%,52%)] hover:underline transition-colors min-h-[36px] px-1"
                    >
                        Voir toutes les interpellations
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <InterpellationsModal
                open={showModal}
                onClose={() => setShowModal(false)}
                interpellations={localInterpellations}
                politicianName={publication.author.displayName}
            />
        </>
    );
};

// ─── Inline Card (compact version) ───
const InlineInterpellationCard: React.FC<{
    interpellation: Interpellation;
    onSupport: (id: string) => void;
}> = ({ interpellation, onSupport }) => {
    const [expanded, setExpanded] = useState(false);
    const shouldTruncate = interpellation.content.length > 120;

    return (
        <div className={cn(
            'p-2.5 rounded-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2',
            interpellation.supportCount >= 100
                ? 'border-[hsl(45,93%,47%)] bg-[hsl(45,93%,97%,0.5)] shadow-[0_0_0_1px_hsl(45,93%,47%,0.2)]'
                : 'border-border/40 bg-muted/20'
        )}>
            {/* Replied badge */}
            {interpellation.politicianReply && (
                <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[9px] px-1.5 py-0 mb-1.5">
                    ✅ Réponse du politique
                </Badge>
            )}

            {/* Author row */}
            <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {interpellation.citizen.avatar ? (
                        <img src={interpellation.citizen.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                        <span className="text-[8px] font-semibold text-foreground">{interpellation.citizen.displayName.charAt(0)}</span>
                    )}
                </div>
                <span className="text-xs font-semibold text-foreground truncate">{interpellation.citizen.displayName}</span>
                <RoleBadge role="Citizen" isVerified={false} size="sm" />
                <span className="text-[10px] text-muted-foreground ml-auto">{formatTime(interpellation.createdAt)}</span>
            </div>

            {/* Content */}
            <div className="ml-6">
                <p className={cn(
                    'text-xs text-foreground leading-relaxed transition-all duration-300',
                    shouldTruncate && !expanded && 'line-clamp-2'
                )}>
                    {interpellation.content}
                </p>
                {shouldTruncate && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[hsl(330,85%,52%)] text-[10px] font-medium hover:underline"
                    >
                        {expanded ? '↑ voir moins' : '...voir plus'}
                    </button>
                )}

                {/* Stats + actions */}
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">
                        📊 <strong className="text-foreground">{interpellation.supportCount}</strong>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        💬 {interpellation.commentCount}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                        <button
                            onClick={() => onSupport(interpellation.id)}
                            className="flex items-center gap-0.5 text-[10px] font-medium text-[hsl(330,85%,52%)] bg-[hsl(330,85%,52%)]/10 hover:bg-[hsl(330,85%,52%)]/20 rounded px-2 py-1 min-h-[28px] transition-all duration-200 active:scale-95"
                        >
                            <ThumbsUp className="w-2.5 h-2.5" /> Soutenir
                        </button>
                        <button className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground rounded px-1.5 py-1 min-h-[28px] transition-colors">
                            <MessageSquare className="w-2.5 h-2.5" /> Réagir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterpellationsSection;
