import React, { useRef, useState, useEffect } from 'react';
import { ExternalLink, Newspaper, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RSSArticle } from '@/services/rssService';

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
                            <a
                                key={`${article.url}-${idx}`}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative flex-shrink-0 snap-start bg-zinc-900 rounded-2xl overflow-hidden shadow-md group border border-white/10"
                                style={{ width: '75vw', maxWidth: '300px' }}
                            >
                                {/* Aspect Ratio Container (4:5) */}
                                <div className="relative w-full" style={{ paddingBottom: '125%' }}>
                                    
                                    {/* Layer 1 - Background Image */}
                                    {article.image && (
                                        <div className="absolute inset-0 w-full h-full">
                                            <img
                                                src={article.image}
                                                alt={article.title}
                                                className={cn(
                                                    "w-full h-full object-cover object-center-top transition-transform duration-500 group-hover:scale-105",
                                                    isLong ? "blur-[12px] scale-110 object-center" : ""
                                                )}
                                            />
                                            {/* Sub-layer for secondary cards: darker uniform overlay */}
                                            {isLong && <div className="absolute inset-0 bg-black/75"></div>}
                                        </div>
                                    )}

                                    {!article.image && (
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                            <Newspaper className="w-12 h-12 text-white/20" />
                                        </div>
                                    )}

                                    {/* Layer 2 - Glassmorphism Overlay (only for short content) */}
                                    {!isLong && (
                                        <div 
                                            className="absolute inset-0 w-full h-full pointer-events-none"
                                            style={{
                                                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 100%)'
                                            }}
                                        />
                                    )}

                                    {/* Layer 3 - Content Overlay */}
                                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                                        
                                        {/* Top bar: Source + Tag */}
                                        <div className="flex items-start justify-between gap-2">
                                            {/* Top Left: Source Avatar & Info */}
                                            {isLong ? (
                                                <div className="w-full text-center mt-2">
                                                    <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{article.source}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                                                        style={{ background: 'linear-gradient(90deg, #b80050, #5400a8)' }}
                                                    >
                                                        {sourceInitial}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-white leading-tight shadow-sm drop-shadow-md">
                                                            {article.source}
                                                        </span>
                                                        <span className="text-[10px] text-white/70">
                                                            {formatDateRelative(article.published_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Top Right: Hashtag Badge (only on short cards or if we want it on both) */}
                                            {!isLong && (
                                                <div 
                                                    className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white shadow-sm whitespace-nowrap"
                                                    style={{ background: 'linear-gradient(90deg, #b80050, #5400a8)' }}
                                                >
                                                    #{tag}
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Content */}
                                        <div className="mt-auto">
                                            {isLong ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10 pb-6 px-2">
                                                    <p className="text-sm text-white/90 leading-relaxed font-medium">
                                                        {article.description.length > 200 
                                                            ? `${article.description.substring(0, 200)}...` 
                                                            : article.description}
                                                    </p>
                                                    <div className="text-xs text-white/80 font-semibold flex items-center gap-1 mt-auto pt-4 group-hover:text-white transition-colors">
                                                        Lire la suite <ArrowRight className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-sm font-bold text-white line-clamp-3 mb-3 leading-snug drop-shadow-md">
                                                        {article.title}
                                                    </h3>
                                                    <div className="flex items-center text-xs text-white/80 font-medium group-hover:text-white transition-colors drop-shadow-sm">
                                                        Lire l'article <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </a>
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
