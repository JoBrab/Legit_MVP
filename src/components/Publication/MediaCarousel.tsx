import React, { useRef, useState, useEffect } from 'react';
import { ExternalLink, Newspaper, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RSSArticle } from '@/services/rssService';
import { Card } from '@/components/ui/card';
import RoleBadge from '@/components/ui/RoleBadge';

interface MediaCarouselProps {
    articles: RSSArticle[];
    tag: string;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ articles, tag }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Track scroll position for active dot
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const cardWidth = scrollRef.current.children[0]?.clientWidth || 0;
        if (cardWidth > 0) {
            const index = Math.round(scrollLeft / cardWidth);
            setActiveIndex(index);
        }
    };

    if (!articles || articles.length === 0) {
        return null; // Don't render empty carousels
    }

    const formatDateRelative = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `il y a ${diffMins}min`;
        }
        if (diffHours < 24) {
            return `il y a ${diffHours}h`;
        }
        const diffDays = Math.floor(diffHours / 24);
        return `il y a ${diffDays}j`;
    };

    return (
        <div className="relative w-full mb-4">
            {/* Carousel Container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {/* 
                    PEEK PATTERN:
                    To show 1.15 cards, we set the width of each card to about 85% of the container. 
                    Adding a right padding/margin to the last item ensures it aligns properly.
                */}
                <div className="flex gap-3 px-4 w-full" style={{ paddingRight: '15%' }}>
                    {articles.map((article, idx) => {
                        const isLong = article.description && article.description.length > 100;
                        const sourceInitial = article.source ? article.source.charAt(0).toUpperCase() : 'N';
                        
                        return (
                            <Card
                                key={`${article.url}-${idx}`}
                                className="flex-shrink-0 snap-center w-[85vw] max-w-[320px] p-3 space-y-3 glass-card overflow-hidden"
                            >
                                {/* 1. Profile Header */}
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm"
                                        style={{ background: 'linear-gradient(90deg, #b80050, #5400a8)' }}
                                    >
                                        {sourceInitial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-foreground text-base truncate">
                                                {article.source || 'Média'}
                                            </span>
                                            <RoleBadge role="Press" isVerified={true} size="sm" />
                                        </div>
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            {formatDateRelative(article.published_at)} • #{tag}
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Image Container (DebateEventCard style) */}
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative flex flex-col justify-end w-full aspect-[4/5] rounded-2xl overflow-hidden group border border-border/10 cursor-pointer shadow-sm bg-zinc-900"
                                >
                                    {/* Image Base */}
                                    {article.image ? (
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                            <Newspaper className="w-16 h-16 text-white/10" />
                                        </div>
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                                    {/* Content */}
                                    <div className="relative z-10 p-4 w-full">
                                        <h3 className="text-[20px] font-bold text-white leading-tight drop-shadow-md mb-3 line-clamp-4">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center text-xs text-white/80 font-medium group-hover:text-white transition-colors">
                                            Lire l'article <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                        </div>
                                    </div>
                                </a>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Dots Navigation */}
            {articles.length > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-1 pb-1">
                    {articles.map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                activeIndex === idx ? "bg-[#b80050] scale-110" : "bg-gray-400/40"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaCarousel;
