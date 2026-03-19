import React, { useState } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Publication } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RoleBadge from '@/components/ui/RoleBadge';
import { ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprofondirModalProps {
    open: boolean;
    onClose: () => void;
    publication: Publication;
    onOpenComments: () => void;
}

const formatTimeAgo = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
};

const getSentiment = (reactions: Record<number, number>): { label: string; emoji: string } => {
    const total = Object.values(reactions).reduce((s, n) => s + n, 0);
    if (total === 0) return { label: 'neutre', emoji: '😐' };
    const positive = (reactions[4] || 0) + (reactions[5] || 0);
    const negative = (reactions[1] || 0) + (reactions[2] || 0);
    if (positive > total * 0.5) return { label: 'majoritairement favorable', emoji: '👍' };
    if (negative > total * 0.5) return { label: 'majoritairement critique', emoji: '👎' };
    return { label: 'avis partagés', emoji: '🤝' };
};

const extractUrls = (text: string): string[] => {
    const urlRegex = /https?:\/\/[^\s),]+/g;
    return text.match(urlRegex) || [];
};

const getDomain = (url: string): string => {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
};

// Simulated role-based reaction breakdown
const getRoleReactions = (publication: Publication) => {
    const total = Object.values(publication.reactions).reduce((s, n) => s + n, 0);
    return [
        { emoji: '🟢', label: 'Politiques', count: Math.floor(total * 0.15), color: 'text-emerald-600' },
        { emoji: '🟣', label: 'Société civile', count: Math.floor(total * 0.22), color: 'text-violet-600' },
        { emoji: '🩷', label: 'Citoyens', count: Math.floor(total * 0.63), color: 'text-[hsl(330,85%,50%)]' },
    ];
};

const ApprofondirModal: React.FC<ApprofondirModalProps> = ({
    open,
    onClose,
    publication,
    onOpenComments,
}) => {
    const totalReactions = Object.values(publication.reactions).reduce((s, n) => s + n, 0);
    const sentiment = getSentiment(publication.reactions);
    const content = publication.content.fr || '';
    const urls = extractUrls(content);
    const roleReactions = getRoleReactions(publication);
    const citedDiscussions = Math.floor(totalReactions * 0.012) + 1;

    return (
        <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
            <DrawerContent className="h-[92dvh] flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
                    <button onClick={onClose} className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">🔍 Approfondir</p>
                        <p className="text-xs text-muted-foreground truncate">{publication.author.displayName}</p>
                    </div>
                    <RoleBadge role={publication.author.role} isVerified={publication.author.isVerified} size="sm" />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                    {/* Section 1: Contexte */}
                    <section className="space-y-2">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            📊 Contexte
                        </h3>
                        <div className="bg-muted/30 rounded-xl p-3 space-y-2 border border-border/50">
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <span className="text-muted-foreground">🕐</span>
                                Publié {formatTimeAgo(publication.createdAt)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <span className="text-muted-foreground">{sentiment.emoji}</span>
                                <span>
                                    <strong>{totalReactions.toLocaleString('fr-BE')}</strong> réactions,{' '}
                                    <span className="text-muted-foreground">{sentiment.label}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-foreground">
                                <span className="text-muted-foreground">🔗</span>
                                Cité dans <strong>{citedDiscussions}</strong> autre{citedDiscussions > 1 ? 's' : ''} discussion{citedDiscussions > 1 ? 's' : ''}
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Réactions par acteur */}
                    <section className="space-y-2">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            💬 Réactions par acteur
                        </h3>
                        <div className="space-y-1.5">
                            {roleReactions.map((r) => (
                                <button
                                    key={r.label}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors text-left"
                                >
                                    <span className="text-base">{r.emoji}</span>
                                    <span className="text-sm font-medium text-foreground flex-1">{r.label}</span>
                                    <span className={cn('text-sm font-bold', r.color)}>
                                        {r.count.toLocaleString('fr-BE')} réactions
                                    </span>
                                    <span className="text-xs text-muted-foreground">›</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Section 3: Sources citées */}
                    {(urls.length > 0 || publication.sourceUrl) && (
                        <section className="space-y-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                📚 Sources citées
                            </h3>
                            <div className="space-y-1.5">
                                {publication.sourceUrl && (
                                    <a
                                        href={publication.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span className="text-sm text-primary font-medium truncate">{getDomain(publication.sourceUrl)}</span>
                                        <Badge variant="outline" className="text-[9px] ml-auto">Source principale</Badge>
                                    </a>
                                )}
                                {urls.filter(u => u !== publication.sourceUrl).map((url, i) => (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm text-muted-foreground truncate">{getDomain(url)}</span>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Bottom CTAs */}
                <div className="flex gap-2 px-4 py-3 border-t border-border bg-background flex-shrink-0">
                    {publication.sourceUrl ? (
                        <Button
                            className="flex-1 bg-[hsl(330,85%,52%)] hover:bg-[hsl(330,85%,45%)] text-white min-h-[44px]"
                            onClick={() => window.open(publication.sourceUrl, '_blank')}
                        >
                            Lire l'article complet →
                        </Button>
                    ) : (
                        <Button
                            className="flex-1 bg-[hsl(330,85%,52%)] hover:bg-[hsl(330,85%,45%)] text-white min-h-[44px]"
                            onClick={() => { onClose(); onOpenComments(); }}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Rejoindre le débat
                        </Button>
                    )}
                    {publication.sourceUrl && (
                        <Button
                            variant="outline"
                            className="flex-1 min-h-[44px] border-[hsl(330,85%,52%)]/30 text-[hsl(330,85%,52%)] hover:bg-[hsl(330,85%,52%)]/10"
                            onClick={() => { onClose(); onOpenComments(); }}
                        >
                            💬 Rejoindre le débat
                        </Button>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default ApprofondirModal;
