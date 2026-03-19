import React, { useMemo, useState } from 'react';
import { Publication } from '@/types';
import { Badge } from '@/components/ui/badge';
import PublicationCard from './PublicationCard';
import NewsCard from './NewsCard';
import ConversationThread from './ConversationThread';
import TweetEmbed from './TweetEmbed';
import InterpellationCarousel from './InterpellationCarousel';
import { PoliticianTweet } from '@/data/mockTweets';
import { Search } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

// ─── Feed item types (now includes tweets) ───
type FeedItem =
    | { type: 'standalone'; publication: Publication }
    | { type: 'thread'; origin: Publication; replies: Publication[] }
    | { type: 'news'; article: any }
    | { type: 'tweet'; tweet: PoliticianTweet };

interface FeedClusterProps {
    tag: string;
    publications: Publication[];
    news: any[];
    tweets: PoliticianTweet[];
    isTrending: boolean;
    isFavorite: boolean;
    onSupport: (id: string) => void;
    onReaction: (id: string, level: number) => void;
    isLast?: boolean;
    isFiltered?: boolean;
}

/**
 * Simple deterministic shuffle for mixing feed items unpredictably.
 */
function shuffleItems(items: FeedItem[], seed: number): FeedItem[] {
    const out = [...items];
    let s = seed;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * Build all feed items from publications, news, and tweets.
 * Threads are detected, then everything is shuffled together.
 */
function buildFeedItems(
    publications: Publication[],
    news: any[],
    tweets: PoliticianTweet[],
    tag: string,
): FeedItem[] {
    const pubMap = new Map(publications.map(p => [p.id, p]));
    const usedInThread = new Set<string>();
    const items: FeedItem[] = [];

    // 1. Detect threads
    for (const pub of publications) {
        if (pub.replyIds && pub.replyIds.length > 0) {
            const replies = pub.replyIds
                .map(id => pubMap.get(id))
                .filter((r): r is Publication => r !== undefined);

            if (replies.length > 0) {
                usedInThread.add(pub.id);
                replies.forEach(r => usedInThread.add(r.id));
                items.push({ type: 'thread', origin: pub, replies });
            }
        }
    }

    // 2. Add news articles
    news.forEach(article => {
        items.push({ type: 'news', article });
    });

    // 3. Add tweet embeds
    tweets.forEach(tweet => {
        items.push({ type: 'tweet', tweet });
    });

    // 4. Add standalone publications (not part of threads)
    for (const pub of publications) {
        if (!usedInThread.has(pub.id)) {
            items.push({ type: 'standalone', publication: pub });
        }
    }

    // 5. Shuffle everything together for unpredictable order
    const seed = tag.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + Date.now() % 10000;
    return shuffleItems(items, seed);
}

const FeedCluster: React.FC<FeedClusterProps> = ({
    tag,
    publications,
    news,
    tweets,
    isTrending,
    onSupport,
    onReaction,
    isLast = false,
    isFiltered = false,
}) => {
    const [expanded, setExpanded] = useState(false);

    const feedItems = useMemo(
        () => buildFeedItems(publications, news, tweets, tag),
        [publications, news, tweets, tag]
    );

    // Randomized 2-4 items in collapsed state (seeded on tag for consistency)
    const initialCount = useMemo(() => {
        const s = tag.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        return 2 + (s % 3); // yields 2, 3, or 4
    }, [tag]);

    const visibleItems = expanded ? feedItems : feedItems.slice(0, initialCount);
    const hasMore = feedItems.length > initialCount && !expanded;

    return (
        <div className="relative">
            {/* Cluster Header — hidden when user filters on a specific hashtag */}
            {!isFiltered && (
                <div className="flex items-center gap-2 px-1 pb-3 pt-1">
                    <Badge
                        variant="outline"
                        className="text-sm font-semibold bg-background/80 backdrop-blur-sm border-border/50 rounded-xl"
                    >
                        #{tag}
                    </Badge>
                    {isTrending && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-[10px] px-2 py-0.5 gap-1 rounded-xl">
                            Tendance
                        </Badge>
                    )}
                </div>
            )}

            {/* Feed Items — mixed news, tweets, publications, threads */}
            <div className="space-y-3">
                {visibleItems.map((item, idx) => {
                    switch (item.type) {
                        case 'news':
                            return <NewsCard key={`news-${tag}-${idx}`} article={item.article} />;
                        case 'tweet':
                            return <TweetEmbed key={`tweet-${item.tweet.id}`} tweet={item.tweet} />;
                        case 'thread':
                            return (
                                <ConversationThread
                                    key={`thread-${item.origin.id}`}
                                    origin={item.origin}
                                    replies={item.replies}
                                    onSupport={onSupport}
                                    onReaction={onReaction}
                                />
                            );
                        case 'standalone': {
                            const isPolitical = item.publication.author.role === 'Politician' || item.publication.author.role === 'Institution';
                            if (isPolitical) {
                                return (
                                    <InterpellationCarousel
                                        key={`carousel-${item.publication.id}`}
                                        publication={item.publication}
                                        onSupport={onSupport}
                                        onReaction={onReaction}
                                    >
                                        <PublicationCard
                                            publication={item.publication}
                                            onSupport={onSupport}
                                            onReaction={onReaction}
                                        />
                                    </InterpellationCarousel>
                                );
                            }
                            return (
                                <PublicationCard
                                    key={item.publication.id}
                                    publication={item.publication}
                                    onSupport={onSupport}
                                    onReaction={onReaction}
                                />
                            );
                        }
                    }
                })}
            </div>

            {/* Approfondir ce sujet — at the end of each cluster */}
            {hasMore && (
                <button
                    onClick={() => { triggerHaptic('light'); setExpanded(true); }}
                    className="flex items-center justify-center gap-2 w-full mt-3 py-3 rounded-2xl border border-border/40 bg-muted/20 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-200"
                >
                    <Search className="w-4 h-4" />
                    Approfondir #{tag}
                </button>
            )}

            {/* Seamless transition to next cluster */}
            {!isLast && (
                <div className="py-4" />
            )}
        </div>
    );
};

export default FeedCluster;

