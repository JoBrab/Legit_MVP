import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, MessageCircle, RefreshCw, Heart, AlertTriangle } from 'lucide-react';
import { BlueskyPost } from '@/services/blueskyService';
import RoleBadge from '@/components/ui/RoleBadge';
import { triggerHaptic } from '@/utils/haptics';
import { cn } from '@/lib/utils';
import { highlightKeywords } from '@/utils/highlightKeywords';

interface BlueskyEmbedProps {
    post: BlueskyPost;
}

const formatNumber = (num: number) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};

const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
};

const BlueskyEmbed: React.FC<BlueskyEmbedProps> = ({ post }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // We limit the text to ~200 chars by default, like publications
    const shouldTruncate = post.content.length > 200;

    return (
        <Card className="p-4 space-y-3 glass-card transition-all duration-200 border-none relative mt-2 bg-[#0085ff]/5 dark:bg-[#0085ff]/10">
            {/* Header: Author Info */}
            <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 flex-shrink-0">
                    {post.authorAvatar ? (
                        <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-9 h-9 rounded-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden'); }}
                        />
                    ) : null}
                    <div className={`${post.authorAvatar ? 'hidden' : ''} w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-semibold`}>
                        {post.authorName.charAt(0)}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground text-base truncate">
                            {post.authorName}
                        </span>
                        <RoleBadge role="Politician" isVerified={true} size="sm" />
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer hover:underline" onClick={() => window.open(`https://bsky.app/profile/${post.authorHandle.replace('@', '')}`, '_blank')}>
                        {post.authorHandle} • {formatTimeAgo(post.createdAt)}
                    </span>
                </div>
                
                {/* Brand Indicator */}
                <div className="flex items-center justify-center bg-blue-500/10 rounded-full p-1.5 ml-auto">
                    {/* A simple placeholder logo for Bluesky, we use a blue generic icon since lucide doesn't have a butterfly */}
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.093 0 2.227 0 6.023c0 2.05.997 6.002 2.376 7.643 2.14 2.543 5.378 2.094 6.376 1.838v1.365c-3.13-.191-7.443-1.638-9.351-5.118-.186-.337-.394-1.127-.47-1.895-.125-.97-.249-2.185.127-3.09C.202 3.829 2.563 3.65 4.5 4.49c3.084 1.34 5.918 5.61 7.5 8.358 1.581-2.748 4.416-7.017 7.5-8.358 1.937-.84 4.298-.66 5.442 2.276.376.905.252 2.12.127 3.09-.076.768-.284 1.558-.47 1.895-1.908 3.48-6.221 4.927-9.351 5.118v-1.365c.998.256 4.236.705 6.376-1.838 1.379-1.641 2.376-5.593 2.376-7.643 0-3.796-2.566-4.93-5.202-2.782-2.752 1.942-5.711 5.881-6.798 7.995z"/>
                    </svg>
                </div>
            </div>

            {/* Content Container */}
            <div className="space-y-3">
                <div
                    className={cn(
                        'overflow-hidden transition-all duration-300 ease-in-out',
                        shouldTruncate && !isExpanded ? 'max-h-[5.5em]' : 'max-h-[2000px]'
                    )}
                >
                    {/* Use highlightKeywords to colorize hashtags/mentions if desired, though standard text is fine */}
                    <p className="text-foreground leading-relaxed text-[15px] whitespace-pre-wrap">
                        {post.content}
                    </p>
                </div>
                {shouldTruncate && (
                    <button
                        onClick={() => { triggerHaptic('light'); setIsExpanded(!isExpanded); }}
                        className="text-primary/80 text-sm font-semibold mt-1 hover:text-primary transition-colors focus:outline-none"
                    >
                        {isExpanded ? '↑ Voir moins' : '… Voir plus'}
                    </button>
                )}

                {/* Optional Embed Images */}
                {post.images && post.images.length > 0 && (
                    <div className={cn("grid gap-2 mt-2", post.images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                        {post.images.slice(0, 4).map((img, i) => (
                            <img
                                key={i}
                                src={img}
                                alt="Post image"
                                className="w-full h-auto max-h-64 object-cover rounded-xl border border-white/10 shadow-sm"
                                loading="lazy"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Actions (Cosmetic + Link to source) */}
            <div className="flex items-center justify-between pt-2">
                 <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-pointer group">
                        <MessageCircle className="w-4 h-4 group-hover:bg-blue-500/10 rounded-full" />
                        <span className="text-xs font-medium">{formatNumber(post.replyCount)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-green-500 transition-colors cursor-pointer group">
                        <RefreshCw className="w-4 h-4 group-hover:bg-green-500/10 rounded-full" />
                        <span className="text-xs font-medium">{formatNumber(post.repostCount)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer group">
                        <Heart className="w-4 h-4 group-hover:bg-red-500/10 rounded-full" />
                        <span className="text-xs font-medium">{formatNumber(post.likeCount)}</span>
                    </div>
                 </div>

                 <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerHaptic('light')}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-full transition-all"
                >
                    Voir sur Bluesky
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </Card>
    );
};

export default BlueskyEmbed;
