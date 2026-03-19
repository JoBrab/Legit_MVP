import React, { useEffect, useRef, useState, Component, ErrorInfo } from 'react';
import { Badge } from '@/components/ui/badge';
import { PoliticianTweet } from '@/data/mockTweets';

// ─── Error Boundary to prevent tweet crash from breaking the page ───
class TweetErrorBoundary extends Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error: Error, info: ErrorInfo) {
        console.warn('[TweetEmbed] Error caught by boundary:', error.message);
    }
    render() {
        return this.state.hasError ? this.props.fallback : this.props.children;
    }
}

// ─── Load Twitter widgets.js once (lazy) ───
let widgetsPromise: Promise<void> | null = null;

function loadTwitterWidgets(): Promise<void> {
    if (widgetsPromise) return widgetsPromise;

    widgetsPromise = new Promise<void>((resolve) => {
        // Already loaded
        if (typeof window !== 'undefined' && (window as any).twttr?.widgets) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => resolve(); // resolve anyway, we'll handle fallback
        document.head.appendChild(script);
    });

    return widgetsPromise;
}

// ─── Party color mapping ───
const PARTY_COLORS: Record<string, string> = {
    'N-VA': 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30',
    'MR': 'bg-blue-500/15 text-blue-700 border-blue-500/30',
    'PS': 'bg-red-500/15 text-red-700 border-red-500/30',
    'PTB': 'bg-red-600/15 text-red-800 border-red-600/30',
    'Les Engagés': 'bg-teal-500/15 text-teal-700 border-teal-500/30',
    'Vooruit': 'bg-red-400/15 text-red-600 border-red-400/30',
    'CD&V': 'bg-orange-500/15 text-orange-700 border-orange-500/30',
    'Ecolo': 'bg-green-500/15 text-green-700 border-green-500/30',
    'Groen': 'bg-green-600/15 text-green-800 border-green-600/30',
    'Vlaams Belang': 'bg-amber-600/15 text-amber-800 border-amber-600/30',
    'Open VLD': 'bg-sky-500/15 text-sky-700 border-sky-500/30',
};

// ─── Inner tweet renderer ───
interface TweetEmbedInnerProps {
    tweet: PoliticianTweet;
}

const TweetEmbedInner: React.FC<TweetEmbedInnerProps> = ({ tweet }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

    useEffect(() => {
        let cancelled = false;

        const embed = async () => {
            try {
                await loadTwitterWidgets();
                if (cancelled) return;

                const twttr = (window as any).twttr;
                if (!twttr?.widgets?.createTweet || !containerRef.current) {
                    setStatus('error');
                    return;
                }

                // Extract tweet ID from URL (last path segment)
                const parts = tweet.tweetUrl.split('/');
                const tweetId = parts[parts.length - 1]?.split('?')[0];
                if (!tweetId || !/^\d+$/.test(tweetId)) {
                    setStatus('error');
                    return;
                }

                // Clear container safely
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                const el = await twttr.widgets.createTweet(tweetId, containerRef.current, {
                    theme: 'light',
                    dnt: true,
                    align: 'center',
                    conversation: 'none',
                });

                if (!cancelled) {
                    setStatus(el ? 'loaded' : 'error');
                }
            } catch (err) {
                console.warn('[TweetEmbed] Failed to render tweet:', err);
                if (!cancelled) setStatus('error');
            }
        };

        embed();
        return () => { cancelled = true; };
    }, [tweet.tweetUrl]);

    return (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
            {/* Header: politician info */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {tweet.authorName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold truncate">{tweet.authorName}</span>
                        <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 rounded-lg border ${PARTY_COLORS[tweet.party] || 'bg-muted'}`}
                        >
                            {tweet.party}
                        </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{tweet.role}</p>
                </div>
                {/* X logo */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </div>

            {/* Tweet embed container */}
            <div className="min-h-[80px]">
                {status === 'loading' && (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}
                {status === 'error' && (
                    <div className="px-4 py-5 text-center">
                        <p className="text-sm text-muted-foreground">{tweet.summary}</p>
                        <a
                            href={tweet.tweetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs text-primary hover:underline"
                        >
                            Voir sur X →
                        </a>
                    </div>
                )}
                <div
                    ref={containerRef}
                    className="px-2 pb-2"
                    style={{ display: status === 'loaded' ? 'block' : 'none' }}
                />
            </div>
        </div>
    );
};

// ─── Exported component with error boundary ───
const TweetEmbed: React.FC<{ tweet: PoliticianTweet }> = ({ tweet }) => {
    const fallback = (
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden px-4 py-5 text-center">
            <p className="text-sm text-muted-foreground">{tweet.summary}</p>
            <a
                href={tweet.tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs text-primary hover:underline"
            >
                Voir sur X →
            </a>
        </div>
    );

    return (
        <TweetErrorBoundary fallback={fallback}>
            <TweetEmbedInner tweet={tweet} />
        </TweetErrorBoundary>
    );
};

export default TweetEmbed;
