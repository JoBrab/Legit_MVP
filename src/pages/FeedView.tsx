import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MessageSquare, MoreVertical, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadYouTubeAPI, YouTubePlayerInstance, YT_STATES } from '@/hooks/useYouTubePlayer';

// ─── Types ───
interface VideoItem {
  id: number;
  youtubeId: string;
  authorName: string;
  authorType: string;
  isVerified: boolean;
  category: string;
  title: string;
  description: string;
  nuanceScore: number;
}

// ─── Real Belgian media YouTube Shorts ───
// Sourced from RTBF Info, BX1, STIB-MIVB channels
const videoItems: VideoItem[] = [
  {
    id: 1,
    youtubeId: 'pdbNfbSJK4g',  // BX1 — crise agricole / économie
    authorName: 'BX1',
    authorType: 'Média',
    isVerified: true,
    category: '#Budget',
    title: 'Crise agricole à Bruxelles',
    description: 'La crise agricole frappe aussi la capitale. Décryptage économique.',
    nuanceScore: 4,
  },
  {
    id: 2,
    youtubeId: 'sUC3mskTBXc',  // RTBF Info — logement non conforme
    authorName: 'RTBF Info',
    authorType: 'Média',
    isVerified: true,
    category: '#Logement',
    title: 'Logement non conforme : que faire ?',
    description: 'Les solutions en cas de logement non conforme en Belgique.',
    nuanceScore: 3,
  },
  {
    id: 3,
    youtubeId: 'aeDB-WUqHag',  // STIB-MIVB — Tram Bowling
    authorName: 'STIB-MIVB',
    authorType: 'Institution',
    isVerified: true,
    category: '#Mobilité',
    title: 'La STIB en mouvement',
    description: 'Les transports bruxellois au quotidien. Time flies.',
    nuanceScore: 5,
  },
  {
    id: 4,
    youtubeId: 'p_d7r4hUVow',  // RTBF Info — prix des médicaments
    authorName: 'RTBF Info',
    authorType: 'Média',
    isVerified: true,
    category: '#Santé',
    title: 'Médicaments plus chers ?',
    description: 'Les médicaments vont-ils devenir plus chers en Wallonie ?',
    nuanceScore: 4,
  },
  {
    id: 5,
    youtubeId: 'vriQb2pcx9w',  // RTBF Info — smartphones école
    authorName: 'RTBF Info',
    authorType: 'Média',
    isVerified: true,
    category: '#Éducation',
    title: 'Smartphones à l\'école',
    description: 'Les smartphones à l\'école et l\'attention des élèves : le débat.',
    nuanceScore: 4,
  },
  {
    id: 6,
    youtubeId: '73oJI-25kUM',  // RTBF Info — 6ème extinction de masse
    authorName: 'RTBF Info',
    authorType: 'Média',
    isVerified: true,
    category: '#Climat',
    title: '6ème extinction de masse',
    description: 'On est en train de vivre la 6ème extinction de masse. Décryptage.',
    nuanceScore: 3,
  },
  {
    id: 7,
    youtubeId: 'OtmHNEbqC6o',  // BX1 — policiers attaqués à Bruxelles
    authorName: 'BX1',
    authorType: 'Média',
    isVerified: true,
    category: '#Sécurité',
    title: 'Policiers attaqués à Bruxelles',
    description: 'Des policiers pris à partie dans les rues de Bruxelles.',
    nuanceScore: 2,
  },
  {
    id: 8,
    youtubeId: '_U9GPJeDqB4',  // BX1 — réaction bourgmestre Schaerbeek
    authorName: 'BX1',
    authorType: 'Média',
    isVerified: true,
    category: '#International',
    title: 'Réaction à l\'attentat',
    description: 'Le bourgmestre de Schaerbeek réagit. Sécurité et géopolitique.',
    nuanceScore: 3,
  },
  {
    id: 9,
    youtubeId: '3OPsD0Pd1U0',  // RTBF Info — transparence revenus médecins
    authorName: 'RTBF Info',
    authorType: 'Média',
    isVerified: true,
    category: '#Numérique',
    title: 'Transparence numérique',
    description: 'Plus de transparence sur les revenus des médecins grâce au numérique.',
    nuanceScore: 4,
  },
  {
    id: 10,
    youtubeId: 'TIn7L6pO-aU',  // RTBF Info — débat Marc Dutroux / justice
    authorName: 'RTBF Info',
    authorType: 'Média',
    isVerified: true,
    category: '#Culture',
    title: 'Débat : images et mémoire',
    description: 'Un débat culturel et sociétal sur les images et la mémoire collective.',
    nuanceScore: 5,
  },
];

const FeedView: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [supportedVideos, setSupportedVideos] = useState<Record<number, number>>({});
  const [animatingReaction, setAnimatingReaction] = useState<{ videoId: number; level: number } | null>(null);
  const [expandedNuance, setExpandedNuance] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [playersReady, setPlayersReady] = useState<Record<number, boolean>>({});
  const [playersBuffering, setPlayersBuffering] = useState<Record<number, boolean>>({});

  const playersRef = useRef<Record<number, YouTubePlayerInstance>>({});
  const startY = useRef(0);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const lastSwipeTime = useRef(0);

  // ─── Initialize YouTube API & create players ───
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await loadYouTubeAPI();
      if (!mounted) return;

      // Create players for current ± 1 videos
      const indicesToLoad = [
        currentIndex - 1,
        currentIndex,
        currentIndex + 1,
      ].filter(i => i >= 0 && i < videoItems.length);

      for (const idx of indicesToLoad) {
        const video = videoItems[idx];
        const containerId = `yt-player-${video.id}`;

        // Skip if already created
        if (playersRef.current[video.id]) continue;

        const container = document.getElementById(containerId);
        if (!container) continue;

        const player = new window.YT.Player(containerId, {
          videoId: video.youtubeId,
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: idx === currentIndex ? 1 : 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 0,
            playsinline: 1,
            loop: 1,
            playlist: video.youtubeId,
            mute: 1, // Always start muted for autoplay
            disablekb: 1,
            iv_load_policy: 3,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (!mounted) return;
              playersRef.current[video.id] = event.target;
              setPlayersReady(prev => ({ ...prev, [video.id]: true }));

              // If this is the current video, play it
              if (idx === currentIndex) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              if (!mounted) return;
              setPlayersBuffering(prev => ({
                ...prev,
                [video.id]: event.data === YT_STATES.BUFFERING,
              }));
            },
          },
        });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(init, 100);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [currentIndex]);

  // ─── Play/Pause based on currentIndex ───
  useEffect(() => {
    videoItems.forEach((video, idx) => {
      const player = playersRef.current[video.id];
      if (!player) return;

      try {
        if (idx === currentIndex) {
          player.playVideo();
          if (isMuted) player.mute();
          else player.unMute();
        } else {
          player.pauseVideo();
          player.seekTo(0, true);
        }
      } catch (e) {
        // Player not yet ready
      }
    });
  }, [currentIndex, isMuted]);

  // ─── Navigation ───
  const navigateToVideo = useCallback((newIndex: number) => {
    const now = Date.now();
    if (isAnimating || now - lastSwipeTime.current < 400) return;
    if (newIndex < 0 || newIndex >= videoItems.length) return;

    lastSwipeTime.current = now;
    setIsAnimating(true);
    setCurrentIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  // ─── Touch handlers ───
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const diffY = startY.current - e.changedTouches[0].clientY;
    const diffX = startX.current - e.changedTouches[0].clientX;

    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
      navigateToVideo(diffY > 0 ? currentIndex + 1 : currentIndex - 1);
    }
  };

  // ─── Wheel handler ───
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (Date.now() - lastSwipeTime.current < 600) return;

    if (e.deltaY > 20) navigateToVideo(currentIndex + 1);
    else if (e.deltaY < -20) navigateToVideo(currentIndex - 1);
  }, [currentIndex, navigateToVideo]);

  // ─── Actions ───
  const handleSupport = (videoId: number, level: number) => {
    setSupportedVideos(prev => ({ ...prev, [videoId]: level }));
    setAnimatingReaction({ videoId, level });
    setTimeout(() => setAnimatingReaction(null), 600);
    setExpandedNuance(null);
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      const currentVideo = videoItems[currentIndex];
      const player = playersRef.current[currentVideo.id];
      if (player) {
        try {
          if (newMuted) player.mute();
          else player.unMute();
        } catch (e) { }
      }
      return newMuted;
    });
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Video Feed — fully immersive, no top bar */}
      <div
        className="flex-1 relative overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translateY(-${currentIndex * 100}%)`,
            transition: 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {videoItems.map((video, index) => {
            const isNearCurrent = Math.abs(index - currentIndex) <= 1;

            return (
              <div
                key={video.id}
                className="absolute w-full bg-black"
                style={{
                  top: `${index * 100}%`,
                  height: '100%',
                  willChange: 'transform',
                }}
              >
                {/* YouTube Player Container */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  {isNearCurrent ? (
                    <div
                      id={`yt-player-${video.id}`}
                      className="w-full h-full"
                      style={{
                        // Scale up to cover the container (hides black bars)
                        transform: 'scale(1.5)',
                        pointerEvents: 'none',
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-black" />
                  )}
                </div>

                {/* Buffering Indicator */}
                {playersBuffering[video.id] && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                )}

                {/* Transparent Gesture Layer */}
                <div className="absolute inset-0 z-10" />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-50% to-black/90 pointer-events-none z-[5]" />

                {/* Position Dots */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 items-center">
                  {videoItems.map((_, dotIdx) => (
                    <div
                      key={dotIdx}
                      className={`rounded-full transition-all duration-300 ${dotIdx === currentIndex
                        ? 'w-2 h-5 bg-white'
                        : 'w-1.5 h-1.5 bg-white/40'
                        }`}
                    />
                  ))}
                </div>

                {/* Right Side Actions */}
                <div className="absolute right-3 bottom-4 flex flex-col gap-5 items-center z-50 pointer-events-auto">
                  {/* Mute */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all flex items-center justify-center shadow-lg border border-white/10"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                  </button>

                  {/* Nuance Scale */}
                  <div
                    className="relative"
                    onMouseEnter={() => setExpandedNuance(video.id)}
                    onMouseLeave={() => setExpandedNuance(null)}
                    onTouchStart={(e) => { e.stopPropagation(); setExpandedNuance(video.id); }}
                    onTouchEnd={(e) => { e.stopPropagation(); setTimeout(() => setExpandedNuance(null), 2000); }}
                  >
                    <button className={`w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-lg shadow-lg border border-white/10 transition-all duration-300 ${animatingReaction?.videoId === video.id ? 'scale-125' : ''
                      }`}>
                      {supportedVideos[video.id]
                        ? ['👍', '✓', '~', '✗', '👎'][5 - supportedVideos[video.id]]
                        : '👍'}
                    </button>

                    {expandedNuance === video.id && (
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 flex flex-col gap-2 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md shadow-xl border border-white/10 animate-scale-in origin-bottom">
                        {[5, 4, 3, 2, 1].map((level, idx) => {
                          const icons = ['👍', '✓', '~', '✗', '👎'];
                          const colors = [
                            'bg-[hsl(142,76%,36%)]',
                            'bg-[hsl(142,71%,45%)]',
                            'bg-[hsl(45,93%,47%)]',
                            'bg-[hsl(25,95%,53%)]',
                            'bg-[hsl(0,84%,60%)]',
                          ];
                          const isSelected = supportedVideos[video.id] === level;

                          return (
                            <button
                              key={level}
                              onClick={(e) => { e.stopPropagation(); handleSupport(video.id, level); }}
                              className={`w-9 h-9 rounded-full transition-all duration-200 ${colors[idx]} flex items-center justify-center text-white font-bold shadow-md ${isSelected ? 'ring-2 ring-white scale-110' : 'opacity-85 hover:opacity-100 hover:scale-105'
                                }`}
                            >
                              {icons[idx]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Comment */}
                  <button className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all flex items-center justify-center shadow-lg border border-white/10">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </button>

                  {/* More */}
                  <button
                    className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all flex items-center justify-center shadow-lg border border-white/10"
                    onClick={(e) => { e.stopPropagation(); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }}
                  >
                    <MoreVertical className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-2 left-0 right-14 px-3 text-white z-50 pointer-events-auto">
                  <div className="flex items-center gap-2.5 mb-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
                      className="w-10 h-10 rounded-full bg-gradient-legit flex items-center justify-center text-white text-xs font-bold border-2 border-white flex-shrink-0 shadow-lg hover:scale-110 transition-transform active:scale-95"
                    >
                      {video.authorName.charAt(0)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm truncate">{video.authorName}</p>
                        {video.isVerified && (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                        <Badge className="bg-white/20 text-white text-[10px] backdrop-blur-sm border-0 px-1.5 py-0 rounded-lg">
                          {video.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-white/70 truncate">{video.authorType}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-sm mb-0.5 drop-shadow-md line-clamp-1">
                    {video.title}
                  </p>
                  <p className="text-xs text-white/80 line-clamp-1 drop-shadow-sm">
                    {video.description}
                  </p>
                </div>

                {/* Copied Feedback */}
                {copiedLink && index === currentIndex && (
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-black/70 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm animate-fade-in">
                    Lien copié ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeedView;