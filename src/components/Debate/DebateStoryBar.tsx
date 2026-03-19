import React, { useState } from 'react';
import { DebateEvent, upcomingDebates } from '@/data/mockDebateEvents';
import DebateEventModal from './DebateEventModal';
import { Beer } from 'lucide-react';

/**
 * Story-style debate event bubbles displayed at the left of the trending bar.
 * Each bubble represents an upcoming live debate at a Brussels bar.
 */
const DebateStoryBar: React.FC = () => {
    const [selectedDebate, setSelectedDebate] = useState<DebateEvent | null>(null);

    if (upcomingDebates.length === 0) return null;

    return (
        <>
            <div className="flex gap-3 items-center py-1">
                {upcomingDebates.map((debate) => {
                    const day = debate.date.toLocaleDateString('fr-BE', { day: 'numeric' });
                    const month = debate.date.toLocaleDateString('fr-BE', { month: 'short' }).replace('.', '');
                    const spotsLeft = debate.capacity - debate.registeredCount;

                    return (
                        <button
                            key={debate.id}
                            onClick={() => setSelectedDebate(debate)}
                            className="flex flex-col items-center gap-1 flex-shrink-0 group"
                        >
                            {/* Story circle with gradient ring */}
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(330,85%,52%)] to-[hsl(230,65%,45%)] p-[2.5px] animate-pulse">
                                    <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center gap-0">
                                        <Beer className="w-4 h-4 text-primary" />
                                        <span className="text-[9px] font-bold text-foreground leading-tight">{day}</span>
                                        <span className="text-[8px] text-muted-foreground leading-tight">{month}</span>
                                    </div>
                                </div>
                                {/* Spots indicator */}
                                {spotsLeft <= 15 && (
                                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-bold px-1.5 py-0 rounded-full whitespace-nowrap">
                                        {spotsLeft} places
                                    </div>
                                )}
                            </div>
                            <span className="text-[9px] text-muted-foreground font-medium max-w-16 text-center leading-tight truncate group-hover:text-foreground transition-colors">
                                #{debate.hashtag}
                            </span>
                        </button>
                    );
                })}
                {/* Vertical separator */}
                <div className="w-px h-12 bg-border/40 flex-shrink-0 ml-1" />
            </div>

            <DebateEventModal
                debate={selectedDebate}
                onClose={() => setSelectedDebate(null)}
            />
        </>
    );
};

export default DebateStoryBar;
