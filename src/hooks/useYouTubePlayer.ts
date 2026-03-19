import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Types ───
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export interface YouTubePlayerInstance {
    playVideo: () => void;
    pauseVideo: () => void;
    mute: () => void;
    unMute: () => void;
    isMuted: () => boolean;
    getPlayerState: () => number;
    destroy: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
}

// Player states
export const YT_STATES = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
} as const;

let apiLoadPromise: Promise<void> | null = null;

/**
 * Loads the YouTube IFrame API script once, returns a promise that resolves
 * when `window.YT` is ready.
 */
function loadYouTubeAPI(): Promise<void> {
    if (apiLoadPromise) return apiLoadPromise;

    apiLoadPromise = new Promise((resolve) => {
        // Already loaded
        if (window.YT && window.YT.Player) {
            resolve();
            return;
        }

        // Set callback before loading script
        const existingCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            existingCallback?.();
            resolve();
        };

        // Load script if not already present
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.async = true;
            document.head.appendChild(tag);
        }
    });

    return apiLoadPromise;
}

/**
 * Hook to create and manage a YouTube IFrame player for a specific video.
 *
 * @param containerId - DOM element ID for the player container
 * @param videoId - YouTube video ID
 * @param options - Player options (autoplay, muted, etc.)
 */
export function useYouTubePlayer(
    containerId: string,
    videoId: string,
    options: {
        autoplay?: boolean;
        muted?: boolean;
        onReady?: (player: YouTubePlayerInstance) => void;
        onStateChange?: (state: number) => void;
        onEnd?: () => void;
    } = {}
) {
    const playerRef = useRef<YouTubePlayerInstance | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    useEffect(() => {
        let mounted = true;
        let player: any = null;

        const initPlayer = async () => {
            await loadYouTubeAPI();
            if (!mounted) return;

            const container = document.getElementById(containerId);
            if (!container) return;

            player = new window.YT.Player(containerId, {
                videoId,
                height: '100%',
                width: '100%',
                playerVars: {
                    autoplay: options.autoplay ? 1 : 0,
                    controls: 0,          // Hide YouTube controls
                    modestbranding: 1,     // Minimal YouTube branding
                    rel: 0,               // No related videos
                    showinfo: 0,          // No video title overlay
                    fs: 0,                // No fullscreen button
                    playsinline: 1,       // Play inline on mobile
                    loop: 1,              // Loop the video
                    playlist: videoId,    // Required for loop to work
                    mute: options.muted !== false ? 1 : 0,
                    disablekb: 1,         // Disable keyboard controls
                    iv_load_policy: 3,    // Disable annotations
                    origin: window.location.origin,
                },
                events: {
                    onReady: (event: any) => {
                        if (!mounted) return;
                        playerRef.current = event.target;
                        setIsReady(true);
                        options.onReady?.(event.target);
                    },
                    onStateChange: (event: any) => {
                        if (!mounted) return;
                        const state = event.data;
                        setIsPlaying(state === YT_STATES.PLAYING);
                        setIsBuffering(state === YT_STATES.BUFFERING);
                        options.onStateChange?.(state);

                        if (state === YT_STATES.ENDED) {
                            options.onEnd?.();
                        }
                    },
                },
            });
        };

        initPlayer();

        return () => {
            mounted = false;
            if (player && typeof player.destroy === 'function') {
                try {
                    player.destroy();
                } catch (e) {
                    // Ignore destroy errors
                }
            }
            playerRef.current = null;
        };
    }, [containerId, videoId]);

    const play = useCallback(() => {
        playerRef.current?.playVideo();
    }, []);

    const pause = useCallback(() => {
        playerRef.current?.pauseVideo();
    }, []);

    const mute = useCallback(() => {
        playerRef.current?.mute();
    }, []);

    const unmute = useCallback(() => {
        playerRef.current?.unMute();
    }, []);

    const toggleMute = useCallback(() => {
        if (playerRef.current?.isMuted()) {
            playerRef.current.unMute();
        } else {
            playerRef.current?.mute();
        }
    }, []);

    return {
        player: playerRef.current,
        isReady,
        isPlaying,
        isBuffering,
        play,
        pause,
        mute,
        unmute,
        toggleMute,
    };
}

export { loadYouTubeAPI };
