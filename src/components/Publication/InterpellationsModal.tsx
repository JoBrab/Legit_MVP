import React, { useState } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ThumbsUp, MessageSquare } from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';
import { Interpellation } from '@/types';
import { cn } from '@/lib/utils';

interface InterpellationsModalProps {
    open: boolean;
    onClose: () => void;
    interpellations: Interpellation[];
    politicianName: string;
}

const formatTime = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
};

const InterpellationItem: React.FC<{
    interpellation: Interpellation;
    onSupport: (id: string) => void;
}> = ({ interpellation, onSupport }) => {
    const [expanded, setExpanded] = useState(false);
    const shouldTruncate = interpellation.content.length > 120;

    return (
        <div className={cn(
            'p-3 rounded-xl border transition-all duration-200',
            interpellation.supportCount >= 100
                ? 'border-[hsl(45,93%,47%)] bg-[hsl(45,93%,97%)] shadow-[0_0_0_1px_hsl(45,93%,47%,0.3)]'
                : 'border-border/60 bg-card'
        )}>
            {/* Politician reply badge */}
            {interpellation.politicianReply && (
                <div className="flex items-center gap-1.5 mb-2">
                    <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[10px] px-2 py-0.5">
                        ✅ Réponse du politique
                    </Badge>
                </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {interpellation.citizen.avatar ? (
                        <img src={interpellation.citizen.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                        <span className="text-[10px] font-semibold text-foreground">{interpellation.citizen.displayName.charAt(0)}</span>
                    )}
                </div>
                <span className="text-sm font-semibold text-foreground">{interpellation.citizen.displayName}</span>
                <RoleBadge role="Citizen" isVerified={false} size="sm" />
                <span className="text-[11px] text-muted-foreground ml-auto">{formatTime(interpellation.createdAt)}</span>
            </div>

            {/* Content */}
            <div className="ml-9">
                <p className={cn(
                    'text-sm text-foreground leading-relaxed transition-all duration-300',
                    shouldTruncate && !expanded && 'line-clamp-2'
                )}>
                    {interpellation.content}
                </p>
                {shouldTruncate && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[hsl(330,85%,52%)] text-xs font-medium mt-0.5 hover:underline"
                    >
                        {expanded ? '↑ voir moins' : '...voir plus'}
                    </button>
                )}

                {/* Politician reply */}
                {interpellation.politicianReply && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/50">
                        <p className="text-xs text-emerald-800 leading-relaxed">{interpellation.politicianReply.content}</p>
                        <p className="text-[10px] text-emerald-600 mt-1">{formatTime(interpellation.politicianReply.createdAt)}</p>
                    </div>
                )}

                {/* Stats + actions */}
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                        📊 <strong className="text-foreground">{interpellation.supportCount}</strong> soutiens
                    </span>
                    <span className="text-xs text-muted-foreground">
                        💬 {interpellation.commentCount}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto">
                        <button
                            onClick={() => onSupport(interpellation.id)}
                            className="flex items-center gap-1 text-xs font-medium text-[hsl(330,85%,52%)] bg-[hsl(330,85%,52%)]/10 hover:bg-[hsl(330,85%,52%)]/20 rounded-lg px-2.5 py-1.5 min-h-[32px] transition-colors"
                        >
                            <ThumbsUp className="w-3 h-3" /> Soutenir
                        </button>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground rounded-lg px-2 py-1.5 min-h-[32px] transition-colors">
                            <MessageSquare className="w-3 h-3" /> Réagir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InterpellationsModal: React.FC<InterpellationsModalProps> = ({
    open,
    onClose,
    interpellations,
    politicianName,
}) => {
    const [localInterpellations, setLocalInterpellations] = useState(interpellations);

    const handleSupport = (id: string) => {
        setLocalInterpellations(prev =>
            prev.map(i => i.id === id ? { ...i, supportCount: i.supportCount + 1 } : i)
        );
    };

    return (
        <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
            <DrawerContent className="h-[92dvh] flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
                    <button onClick={onClose} className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">⚡ Interpellations citoyennes</p>
                        <p className="text-xs text-muted-foreground truncate">Post de {politicianName}</p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                        {localInterpellations.length} total
                    </Badge>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {localInterpellations.map(interpellation => (
                        <InterpellationItem
                            key={interpellation.id}
                            interpellation={interpellation}
                            onSupport={handleSupport}
                        />
                    ))}
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default InterpellationsModal;
