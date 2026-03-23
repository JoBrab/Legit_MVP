import React from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Newspaper } from 'lucide-react';
import { RSSArticle } from '@/services/rssService';
import RoleBadge from '@/components/ui/RoleBadge';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/utils/haptics';

interface NewsCardProps {
  article: RSSArticle;
}

// Helper to chunk description to max ~180 chars
function chunkText(text: string, maxLength: number = 180): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk = '';

  for (const word of words) {
    if ((currentChunk + ' ' + word).trim().length <= maxLength) {
      currentChunk = (currentChunk + ' ' + word).trim();
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = word;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${Math.max(1, diffMins)}min`;
    }
    if (diffHours < 24) {
      return `${diffHours}h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}j`;
  };

  if (!article.title || !article.url) {
    return null;
  }

  // Pre-process description (strip basic HTML)
  const cleanDescription = article.description ? article.description.replace(/<[^>]*>?/gm, '') : '';
  const descriptionChunks = chunkText(cleanDescription, 200).slice(0, 2); // Max 2 extra cards

  const slides: { type: 'title' | 'text', content: string }[] = [
    { type: 'title', content: article.title },
    ...descriptionChunks.map(chunk => ({ type: 'text' as const, content: chunk }))
  ];

  const sourceName = article.source || 'Média';

  return (
    <Card className="p-4 space-y-4 glass-card transition-all duration-200 border-none shadow-sm pb-5 relative">
      
      {/* 1. Header (Matching PublicationCard precisely) */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-9 h-9 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#1E88E5]/10 flex items-center justify-center text-[#1E88E5] text-sm font-semibold">
            {sourceName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#1a1a1a] text-base truncate">
              {sourceName}
            </span>
            <RoleBadge role="Press" isVerified={true} size="sm" />
          </div>
          <span className="text-xs text-[#888888]">
            {article.published_at ? formatDate(article.published_at) : 'À l\'instant'}
          </span>
        </div>
      </div>

      {/* 2. Carousel Container (Aspect 4/5 Portrait) */}
      <div 
        className="w-full flex overflow-x-auto snap-x snap-mandatory rounded-[16px] gap-2 hide-scrollbar pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className="relative min-w-full flex-shrink-0 aspect-[4/5] bg-muted overflow-hidden snap-center flex flex-col justify-end isolate rounded-[16px]"
          >
            {/* Background Image */}
            {article.image ? (
              <img 
                src={article.image} 
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover z-0"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E88E5]/20 to-[#1E88E5]/5 z-0">
                <Newspaper className="w-16 h-16 text-[#1E88E5]/30 mb-4" />
              </div>
            )}
            
            {/* Dark Overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />

            {/* Slide Content */}
            <div className="relative z-20 p-5 w-full flex flex-col justify-end h-full">
              
              {/* Pagination Dots */}
              {slides.length > 1 && (
                <div className="absolute top-4 right-4 flex gap-1.5 z-30">
                  {slides.map((_, dotIdx) => (
                    <div 
                      key={dotIdx} 
                      className={cn('w-1.5 h-1.5 rounded-full transition-colors shadow-sm', index === dotIdx ? 'bg-white' : 'bg-white/40')} 
                    />
                  ))}
                </div>
              )}

              {slide.type === 'title' ? (
                <div className="space-y-4">
                  {article.category && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 bg-white/20 backdrop-blur-md px-2 py-1 rounded-sm block w-fit">
                      {article.category}
                    </span>
                  )}
                  <h3 className="text-white text-[22px] sm:text-2xl font-bold leading-snug drop-shadow-lg">
                    {slide.content}
                  </h3>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerHaptic('light')}
                    className="inline-flex items-center gap-1.5 text-white/95 font-semibold text-sm border border-white/30 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full hover:bg-white hover:text-black transition-all duration-300 group w-fit mt-2"
                  >
                    Lire la suite 
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              ) : (
                <div className="space-y-4 mb-2 flex flex-col">
                  <p className="text-white/95 text-lg leading-relaxed font-medium drop-shadow-md italic">
                    "{slide.content}"
                  </p>
                  {index === slides.length - 1 && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerHaptic('light')}
                      className="inline-flex items-center gap-1.5 text-white/80 font-medium text-sm hover:underline transition-all mt-4 w-fit bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm self-start"
                    >
                      Article complet <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
    </Card>
  );
};

export default NewsCard;