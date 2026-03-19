import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Publication, Interpellation } from '@/types';
import { getInterpellationsForPost } from '@/data/mockInterpellations';
import InterpellationSwipeCard from './InterpellationSwipeCard';
import { ChevronLeft, ChevronRight, ArrowLeft, X } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { cn } from '@/lib/utils';

interface InterpellationCarouselProps {
    publication: Publication;
    children: React.ReactNode;
    onSupport: (id: string) => void;
    onReaction: (id: string, level: number) => void;
}

const CARD_WIDTH_RATIO = 0.85; // each card = 85% of container → 15% post visible

const InterpellationCarousel: React.FC<InterpellationCarouselProps> = ({
    publication,
    children,
    onSupport,
}) => {
    const interpellations = getInterpellationsForPost(publication.id).slice(0, 3);
    const [activeIndex, setActiveIndex] = useState(-1); // -1 = post, 0/1/2 = cards
    const [hasInteracted, setHasInteracted] = useState(false);
    const [localInterpellations, setLocalInterpellations] = useState<Interpellation[]>(interpellations);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

    const count = localInterpellations.length;
    const showCarousel = count > 0;
    const isOpen = activeIndex >= 0;

    // Measure container width
    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const goTo = useCallback((index: number) => {
        const clamped = Math.max(-1, Math.min(index, count - 1));
        triggerHaptic('light');
        setActiveIndex(clamped);
        if (!hasInteracted) setHasInteracted(true);
    }, [count, hasInteracted]);

    const handleInterpellationSupport = (id: string) => {
        setLocalInterpellations(prev =>
            prev.map(i => i.id === id ? { ...i, supportCount: i.supportCount + 1 } : i)
        );
    };

    // Touch swipe detection
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const dt = Date.now() - touchStartRef.current.time;
        touchStartRef.current = null;

        if (Math.abs(dx) > 50 && Math.abs(dx) / Math.abs(dy + 1) > 1.5 && dt < 500) {
            if (dx < 0) goTo(activeIndex + 1);
            else goTo(activeIndex - 1);
        }
    };

    // Calculate translateX in pixels
    const getTranslateX = () => {
        if (activeIndex < 0 || !containerWidth) return 0;
        return -((activeIndex + 1) * CARD_WIDTH_RATIO * containerWidth);
    };

    if (!showCarousel) return <>{children}</>;

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* ═══ Sliding Track ═══ */}
            <div
                className="flex items-start transition-transform duration-300 ease-in-out"
                style={{
                    transform: `translateX(${getTranslateX()}px)`,
                }}
            >
                {/* ─── Political Post (full width) ─── */}
                <div
                    className="flex-shrink-0 relative"
                    style={{ width: containerWidth || '100%' }}
                >
                    {children}

                    {/* ⚡ Indicator badge — only when post is fully visible */}
                    {!isOpen && (
                        <button
                            onClick={() => goTo(0)}
                            className={cn(
                                'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                                'flex flex-col items-center justify-center',
                                'w-12 h-16 rounded-l-2xl',
                                'bg-gradient-to-b from-[#E91E63] to-[#9C27B0]',
                                'text-white shadow-lg shadow-pink-500/30',
                                'transition-transform duration-200 active:scale-95',
                                !hasInteracted && 'animate-interpellation-pulse'
                            )}
                        >
                            <span className="text-lg leading-none">⚡</span>
                            <ChevronRight className="w-4 h-4 mt-0.5" />
                            <span className="absolute -top-1 right-0 w-5 h-5 bg-white text-[#E91E63] rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm border border-pink-200">
                                {count}
                            </span>
                        </button>
                    )}

                    {/* Darken overlay on post when carousel is open → tap to go back */}
                    {isOpen && (
                        <button
                            onClick={() => goTo(-1)}
                            className="absolute inset-0 bg-black/20 z-10 transition-opacity duration-300 flex items-center justify-center"
                            aria-label="Retour au post"
                        >
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                                <ArrowLeft className="w-5 h-5 text-white drop-shadow-md" />
                                <span className="text-[9px] text-white font-medium drop-shadow-md">Retour</span>
                            </div>
                        </button>
                    )}
                </div>

                {/* ─── Interpellation Cards ─── */}
                {localInterpellations.map((interpellation, idx) => (
                    <div
                        key={interpellation.id}
                        className="flex-shrink-0 pl-2 pr-1"
                        style={{ width: containerWidth ? containerWidth * CARD_WIDTH_RATIO : '85%' }}
                    >
                        {/* Back header */}
                        <button
                            onClick={() => goTo(-1)}
                            className="flex items-center gap-1.5 mb-2 text-[#E91E63] hover:text-[#C2185B] transition-colors group"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                            <span className="text-xs font-medium">Retour au post</span>
                        </button>

                        <InterpellationSwipeCard
                            interpellation={interpellation}
                            index={idx}
                            total={count}
                            onSupport={handleInterpellationSupport}
                        />

                        {/* Dots + arrows navigation */}
                        <div className="flex items-center justify-center gap-3 mt-2">
                            <button
                                onClick={() => goTo(idx > 0 ? idx - 1 : -1)}
                                className="w-7 h-7 rounded-full bg-white shadow-sm border border-border/50 flex items-center justify-center text-[#E91E63] hover:bg-pink-50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1.5">
                                {localInterpellations.map((_, dotIdx) => (
                                    <button
                                        key={dotIdx}
                                        onClick={() => goTo(dotIdx)}
                                        className={cn(
                                            'h-2 rounded-full transition-all duration-200',
                                            activeIndex === dotIdx
                                                ? 'bg-[#E91E63] w-4'
                                                : 'bg-[#E91E63]/25 w-2'
                                        )}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => goTo(idx < count - 1 ? idx + 1 : -1)}
                                className="w-7 h-7 rounded-full bg-white shadow-sm border border-border/50 flex items-center justify-center text-[#E91E63] hover:bg-pink-50 transition-colors"
                            >
                                {idx < count - 1
                                    ? <ChevronRight className="w-4 h-4" />
                                    : <X className="w-3.5 h-3.5" />
                                }
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InterpellationCarousel;
