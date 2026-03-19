import React, { useState } from 'react';
import { Publication } from '@/types';
import { generateDebateSummary } from '@/utils/debateAnalysis';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp, Zap, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebateSummaryProps {
    tag: string;
    publications: Publication[];
}

const DebateSummary: React.FC<DebateSummaryProps> = ({ tag, publications }) => {
    const summary = generateDebateSummary(publications);
    const [showTooltip, setShowTooltip] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    if (publications.length < 2 || dismissed) return null;

    const activityPrefix = summary.activityChange >= 0 ? '+' : '';
    const activityEmoji = summary.activityChange >= 10 ? '📈' : summary.activityChange >= 0 ? '➡️' : '📉';

    return (
        <Collapsible defaultOpen>
            <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
                {/* Header — always visible */}
                <CollapsibleTrigger className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-muted/20 transition-colors min-h-[44px]">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 flex-1 text-left">
                        📊 #{tag} — Vue d'ensemble
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="px-4 pb-3 space-y-3">
                        {/* Source counts */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {summary.pressCount > 0 && (
                                <span>🔵 <strong className="text-foreground">{summary.pressCount}</strong> média{summary.pressCount > 1 ? 's' : ''}</span>
                            )}
                            {summary.politicianCount > 0 && (
                                <span>🟢 <strong className="text-foreground">{summary.politicianCount}</strong> politique{summary.politicianCount > 1 ? 's' : ''}</span>
                            )}
                            {summary.societyCount > 0 && (
                                <span>🟣 <strong className="text-foreground">{summary.societyCount}</strong> soc. civile</span>
                            )}
                            {summary.citizenCount > 0 && (
                                <span>🩷 <strong className="text-foreground">{summary.citizenCount}</strong> citoyen{summary.citizenCount > 1 ? 's' : ''}</span>
                            )}
                        </div>

                        {/* Key term + activity */}
                        <div className="space-y-1">
                            {summary.topTerm && (
                                <p className="text-xs text-muted-foreground">
                                    💬 Terme central : <strong className="text-foreground">{summary.topTerm.term}</strong> ({summary.topTerm.count}×)
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {activityEmoji} <span className={cn(
                                    'font-semibold',
                                    summary.activityChange >= 10 ? 'text-emerald-600' : summary.activityChange < 0 ? 'text-red-500' : 'text-foreground'
                                )}>{activityPrefix}{summary.activityChange}%</span> d'activité vs hier
                            </p>
                        </div>

                        {/* CTAs + disclaimer */}
                        <div className="flex items-center gap-2 pt-1">
                            <Button
                                size="sm"
                                className="bg-[hsl(330,85%,52%)] hover:bg-[hsl(330,85%,45%)] text-white text-xs min-h-[36px] gap-1.5"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Participer
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs min-h-[36px] gap-1.5 border-border"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                Parcourir tout
                            </Button>

                            {/* Disclaimer */}
                            <div className="ml-auto relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    aria-label="Méthodologie"
                                >
                                    <Info className="w-3.5 h-3.5" />
                                </button>
                                {showTooltip && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowTooltip(false)} />
                                        <div className="absolute bottom-8 right-0 z-50 w-64 p-3 bg-card border border-border rounded-lg shadow-lg text-[11px] text-muted-foreground leading-relaxed">
                                            Vue statistique générée automatiquement basée sur{' '}
                                            <strong className="text-foreground">{summary.totalPublications}</strong> contributions des dernières heures.{' '}
                                            <button className="text-[hsl(330,85%,52%)] hover:underline font-medium">Méthodologie</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
};

export default DebateSummary;
