import { useQuery } from '@tanstack/react-query';
import { fetchAllFeeds, RSSArticle } from '@/services/rssService';
import { fallbackNews } from '@/data/mockPublications';

/**
 * React hook for fetching RSS feeds from all Belgian sources.
 * - 30-minute stale time (conservative for 3 parallel feeds)
 * - Automatic retry with exponential backoff
 * - Falls back to static data on error
 */
export function useRSSFeed() {
    const query = useQuery<RSSArticle[]>({
        queryKey: ['rss', 'all-feeds'],
        queryFn: fetchAllFeeds,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 60 minutes cache
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    });

    // Map fallback data to RSSArticle shape if query fails
    const articles: RSSArticle[] = query.data ?? fallbackNews.map((n) => ({
        title: n.title,
        description: n.description,
        url: n.url,
        image: n.image,
        published_at: n.published_at,
        source: n.source,
        category: n.category,
    }));

    return {
        articles,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}
