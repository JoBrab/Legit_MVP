import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Publication, AgreementLevel } from '@/types';
import { mockPublications, trendingTopics } from '@/data/mockPublications';
import { RSSArticle } from '@/services/rssService';
import { distributeArticlesToClusters, ScoredArticle, bestHashtagForArticle } from '@/services/contentScoring';
import { politicianTweets, PoliticianTweet, getTweetsForCluster } from '@/data/mockTweets';
import { mockDebateEvents, DebateEvent } from '@/data/mockDebateEvents';
import { BlueskyPost } from '@/services/blueskyService';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ─── Types ─────────────────────────────────────────
export interface FeedCluster {
    tag: string;
    publications: Publication[];
    news: RSSArticle[];
    tweets: PoliticianTweet[];
    events: DebateEvent[];
    blueskyPosts: BlueskyPost[];
    totalContributions: number;
    isTrending: boolean;
    isFavorite: boolean;
}

// ─── Deterministic shuffle (Fisher-Yates with seed) ───
function seededShuffle<T>(arr: T[], seed: number): T[] {
    const out = [...arr];
    let s = seed;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

// Session seed (consistent within one browser session)
const SESSION_SEED = Math.floor(Math.random() * 100000);

export function usePublications() {
    const [publications, setPublications] = useState<Publication[]>(mockPublications);
    const [activeFilter, setActiveFilter] = useState<string | null>(trendingTopics[0] ?? null);

    // Supabase Backend Fetch (Replaces direct RSS/Bluesky fetching)
    const { data: serverPublications = [], isLoading: loadingServerData } = useQuery({
        queryKey: ['publications'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('publications')
                .select('*')
                .order('published_at', { ascending: false })
                .limit(100);
            
            if (error) {
                console.error("Supabase fetch error:", error);
                throw error;
            }
            
            const bskyCount = data.filter(p => p.source_type === 'bluesky').length;
            console.log(`[Dev Log] Fetched ${bskyCount} Bluesky posts from Supabase.`);
            
            return data;
        },
        staleTime: 5 * 60 * 1000,       // 5 minutes stale time
        refetchInterval: 3 * 60 * 1000, // 3 minutes background ping
        refetchOnWindowFocus: false,
    });

    // Map Supabase 'rss' to local RSSArticle type
    const newsArticles = useMemo(() => {
        return serverPublications
            .filter(p => p.source_type === 'rss')
            .map(p => ({
                id: p.id,
                title: p.title || '',
                description: p.excerpt || '',
                url: p.url,
                published_at: p.published_at,
                source: p.source_name,
                image: p.image_url,
                category: p.hashtags?.[0] || 'Actualité'
            } as RSSArticle));
    }, [serverPublications]);

    // Map Supabase 'bluesky' to local BlueskyPost type
    const blueskyPosts = useMemo(() => {
        return serverPublications
            .filter(p => p.source_type === 'bluesky')
            .map(p => ({
                id: p.url,
                url: p.url,
                authorName: p.source_name,
                authorHandle: `@${p.source_name.toLowerCase().replace(/\s+/g, '')}.bsky.social`,
                content: p.title || p.excerpt || '',
                createdAt: p.published_at,
                replyCount: 0,
                repostCount: 0,
                likeCount: p.reaction_counts?.support || 0,
                images: p.image_url ? [p.image_url] : []
            } as BlueskyPost));
    }, [serverPublications]);

    const loadingNews = loadingServerData && serverPublications.length === 0;
    const loadingBluesky = loadingServerData && serverPublications.length === 0;

    // User preferences (would come from profile in production)
    const [userFavoriteTopics] = useState<string[]>(['Logement', 'Santé']);

    // Cluster cache (15 min TTL)
    const clusterCache = useRef<{ clusters: FeedCluster[]; timestamp: number } | null>(null);
    const CACHE_TTL = 15 * 60 * 1000;

    // ─── Detect trending topic (most total reactions) ───
    const trendingTopic = useMemo(() => {
        const topicScores: Record<string, number> = {};
        publications.forEach(pub => {
            const tag = pub.hashtags[0] || 'Autre';
            const reactions = Object.values(pub.reactions).reduce((s, n) => s + n, 0);
            topicScores[tag] = (topicScores[tag] || 0) + reactions;
        });
        return Object.entries(topicScores)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || trendingTopics[0];
    }, [publications]);

    // ─── Score-based article distribution (memoized) ───
    const scoredNewsByCluster = useMemo(() => {
        if (newsArticles.length === 0) return {};
        return distributeArticlesToClusters(newsArticles, {
            articlesPerCluster: 3,
            maxPerSource: 2,
        });
    }, [newsArticles]);

    // ─── Build clustered feed ───
    const getClusteredFeed = useCallback((): FeedCluster[] => {
        // Check cache
        if (clusterCache.current && Date.now() - clusterCache.current.timestamp < CACHE_TTL) {
            if (!activeFilter) return clusterCache.current.clusters;
        }

        // Group ALL publications by primary hashtag (not filtered)
        const grouped: Record<string, Publication[]> = {};

        publications.forEach(pub => {
            const tag = pub.hashtags[0] || 'Autre';
            if (!grouped[tag]) grouped[tag] = [];
            grouped[tag].push(pub);
        });

        // Shuffle publications within each group (organic mixing)
        Object.keys(grouped).forEach(tag => {
            grouped[tag] = seededShuffle(grouped[tag], SESSION_SEED + tag.charCodeAt(0));
        });

        // Get scored news for each cluster
        const newsGrouped: Record<string, RSSArticle[]> = {};
        if (newsArticles.length > 0) {
            for (const [hashtag, scoredArticles] of Object.entries(scoredNewsByCluster)) {
                newsGrouped[hashtag] = scoredArticles.map((sa: ScoredArticle) => sa.article);
            }
        }

        // Group DebateEvents by theme
        const eventsGrouped: Record<string, DebateEvent[]> = {};
        mockDebateEvents.forEach(evt => {
            if (!eventsGrouped[evt.theme]) eventsGrouped[evt.theme] = [];
            eventsGrouped[evt.theme].push(evt);
        });

        // Group Bluesky posts by theme
        const bskyGrouped: Record<string, BlueskyPost[]> = {};
        blueskyPosts.forEach(post => {
            // We use the RSS matching logic to find the best cluster based on post content
            const pseudoArticle = { title: '', description: post.content } as RSSArticle;
            const bestTag = bestHashtagForArticle(pseudoArticle, 5)?.hashtag || 'Autre';
            if (!bskyGrouped[bestTag]) bskyGrouped[bestTag] = [];
            bskyGrouped[bestTag].push(post);
        });

        // Build clusters
        const allTags = [...new Set([
            ...trendingTopics,
            ...Object.keys(grouped),
            ...Object.keys(newsGrouped),
            ...Object.keys(eventsGrouped),
            ...Object.keys(bskyGrouped)
        ])];

        const buildCluster = (tag: string): FeedCluster => {
            const pubs = grouped[tag] || [];
            const news = newsGrouped[tag] || [];
            const tweets = getTweetsForCluster(tag);
            const events = eventsGrouped[tag] || [];
            const bsky = bskyGrouped[tag] || [];
            
            return {
                tag,
                publications: pubs,
                news,
                tweets,
                events,
                blueskyPosts: bsky,
                totalContributions: pubs.length + news.length + tweets.length + events.length + bsky.length,
                isTrending: tag === trendingTopic && !activeFilter,
                isFavorite: userFavoriteTopics.includes(tag),
            };
        };

        let clusters: FeedCluster[];

        if (activeFilter) {
            // Continuous feed: filtered cluster first, then ALL others
            const filteredCluster = buildCluster(activeFilter);
            const otherTags = allTags.filter(t => t !== activeFilter);

            // Order remaining: favorites → trending → rest
            const favoriteTags = userFavoriteTopics.filter(t => otherTags.includes(t));
            const trendTag = trendingTopic && !favoriteTags.includes(trendingTopic) && trendingTopic !== activeFilter ? [trendingTopic] : [];
            const remainingTags = otherTags.filter(t =>
                !favoriteTags.includes(t) && !trendTag.includes(t)
            );

            clusters = [
                filteredCluster,
                ...favoriteTags.map(buildCluster),
                ...trendTag.map(buildCluster),
                ...remainingTags.map(buildCluster),
            ];
        } else {
            // Order: favorites first, then trending, then rest
            const favoriteTags = userFavoriteTopics.filter(t => allTags.includes(t));
            const trendTag = trendingTopic && !favoriteTags.includes(trendingTopic) ? [trendingTopic] : [];
            const remainingTags = allTags.filter(t =>
                !favoriteTags.includes(t) && !trendTag.includes(t)
            );

            clusters = [
                ...favoriteTags.map(buildCluster),
                ...trendTag.map(buildCluster),
                ...remainingTags.map(buildCluster),
            ];
        }

        // Filter out empty clusters
        clusters = clusters.filter(c => c.totalContributions > 0);

        // Cache results
        if (!activeFilter) {
            clusterCache.current = { clusters, timestamp: Date.now() };
        }

        return clusters;
    }, [publications, activeFilter, newsArticles, scoredNewsByCluster, trendingTopic, userFavoriteTopics, blueskyPosts]);

    // Add a new publication
    const addPublication = useCallback((publication: Publication) => {
        setPublications(prev => [publication, ...prev]);
        clusterCache.current = null;
    }, []);

    // Handle support action — uses ref to avoid re-rendering the entire feed
    const supportRef = useRef<Record<string, number>>({});

    const handleSupport = useCallback((publicationId: string) => {
        // Store in ref (no re-render of parent) — the PublicationCard tracks its own state
        supportRef.current[publicationId] = (supportRef.current[publicationId] || 0) + 1;
    }, []);

    // Handle reaction — uses ref to avoid re-rendering the entire feed
    const userReactionsRef = useRef<Record<string, AgreementLevel>>({});

    const handleReaction = useCallback((publicationId: string, level: AgreementLevel) => {
        // Store in ref (no re-render of parent) — the PublicationCard manages its own local reaction state
        userReactionsRef.current[publicationId] = level;
    }, []);

    return {
        publications,
        newsArticles,
        loadingNews,
        loadingBluesky,
        activeFilter,
        setActiveFilter,
        getClusteredFeed,
        addPublication,
        handleSupport,
        handleReaction,
        trendingTopics,
        trendingTopic,
        userFavoriteTopics,
    };
}
