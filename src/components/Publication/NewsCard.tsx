import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Newspaper, Calendar } from 'lucide-react';
import { RSSArticle } from '@/services/rssService';

interface NewsCardProps {
  article: RSSArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}min`;
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

  return (
    <Card className="p-0 overflow-hidden glass-card transition-all hover:shadow-md group">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* Image */}
        {article.image ? (
          <div className="relative h-48 w-auto m-2 rounded-[12px] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E91E63]/15 to-[#5400a8]/15">
                      <svg class="w-12 h-12 text-[#5400a8]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          </div>
        ) : (
          <div className="relative h-32 w-auto m-2 rounded-[12px] overflow-hidden bg-gradient-to-br from-[#E91E63]/15 to-[#5400a8]/15 flex items-center justify-center">
            <Newspaper className="w-10 h-10 text-[#5400a8]/40" />
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-2.5">
          {/* Source and Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="font-medium">{article.source || 'Source'}</span>
            </div>
            {article.published_at && (
              <span>{formatDate(article.published_at)}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Description */}
          {article.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {article.description}
            </p>
          )}

          {/* Category & Link */}
          <div className="flex items-center justify-between pt-2">
            {article.category && (
              <span className="text-xs text-muted-foreground">{article.category}</span>
            )}
            <div className="flex items-center gap-1.5 text-primary text-sm font-medium ml-auto group-hover:gap-2 transition-all">
              <span>Lire l'article</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </a>
    </Card>
  );
};

export default NewsCard;