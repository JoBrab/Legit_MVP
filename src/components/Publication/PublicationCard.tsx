import React from 'react';
import { Publication, AgreementLevel } from '@/types';
import { Card } from '@/components/ui/card';
import { AlertTriangle, MessageSquare, Search, SmilePlus } from 'lucide-react';
import ReactionBar from './ReactionBar';
import CommentsDrawer from './CommentsDrawer';
import ApprofondirModal from './ApprofondirModal';
import InterpellationsSection from './InterpellationsSection';
import StatisticInfographic from './StatisticInfographic';
import RoleBadge from '@/components/ui/RoleBadge';
import PositionBadge from '@/components/ui/PositionBadge';
import { getPositionLabel } from '@/utils/debateAnalysis';
import { highlightKeywords } from '@/utils/highlightKeywords';
import { triggerHaptic } from '@/utils/haptics';
import { cn } from '@/lib/utils';

interface PublicationCardProps {
  publication: Publication;
  onSupport: (id: string) => void;
  onReaction: (id: string, level: number) => void;
}

const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  onSupport,
  onReaction,
}) => {
  const [hasReacted, setHasReacted] = React.useState(false);
  const [showReactionBar, setShowReactionBar] = React.useState(false);
  const [userReaction, setUserReaction] = React.useState<AgreementLevel | undefined>();
  const [showComments, setShowComments] = React.useState(false);
  const [showApprofondir, setShowApprofondir] = React.useState(false);
  const [isContentExpanded, setIsContentExpanded] = React.useState(false);

  const content = publication.content.fr || '';
  const shouldTruncate = content.length > 200;
  const totalReactions = Object.values(publication.reactions).reduce((s, n) => s + n, 0);
  const commentCount = Math.floor(totalReactions * 0.3) + 2;

  // Show "Approfondir" for Press/SocietyGroup with 20+ reactions
  const showApprofondirButton =
    (publication.author.role === 'Press' || publication.author.role === 'SocietyGroup') &&
    (totalReactions > 20 || commentCount > 5);

  const handleReaction = (level: AgreementLevel) => {
    triggerHaptic('medium');
    setHasReacted(true);
    setUserReaction(level);
    onReaction(publication.id, level);
    if ((publication.author.role === 'Citizen' || publication.author.role === 'SocietyGroup') && (level === 4 || level === 5)) {
      onSupport(publication.id);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
  };

  return (
    <>
      <Card className="p-4 space-y-3 glass-card transition-all duration-200">
        {/* Warning Messages */}
        {publication.warningType === 'hate-speech' && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 border border-destructive/30 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-xs text-destructive">Contenu potentiellement inapproprié</p>
          </div>
        )}
        {publication.warningType === 'missing-source' && (
          <div className="flex items-center gap-2 p-2 bg-warning-orange/10 border border-warning-orange/30 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-warning-orange flex-shrink-0" />
            <p className="text-xs text-warning-orange">Source non vérifiée</p>
          </div>
        )}

        {/* Author Header — clean, minimal */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 flex-shrink-0">
            {publication.author.avatar ? (
              <img
                src={publication.author.avatar}
                alt={publication.author.displayName}
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden'); }}
              />
            ) : null}
            <div className={`${publication.author.avatar ? 'hidden' : ''} w-9 h-9 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-semibold`}>
              {publication.author.displayName.charAt(0)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#1a1a1a] text-base truncate">
                {publication.author.displayName}
              </span>
              <RoleBadge role={publication.author.role} isVerified={publication.author.isVerified} size="sm" />
              {(() => {
                const position = getPositionLabel(publication);
                return position ? <PositionBadge label={position.label} variant={position.variant} /> : null;
              })()}
            </div>
            <span className="text-xs text-[#888888]">
              {formatTimeAgo(publication.createdAt)}
            </span>
          </div>
        </div>

        {/* Content — bigger, more readable */}
        <div className="space-y-3">
          <div>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-in-out',
                shouldTruncate && !isContentExpanded ? 'max-h-[5.5em]' : 'max-h-[2000px]'
              )}
            >
              <p className="text-foreground leading-relaxed text-base">
                {highlightKeywords(content, publication.hashtags)}
              </p>
            </div>
            {shouldTruncate && (
              <button
                onClick={() => { triggerHaptic('light'); setIsContentExpanded(!isContentExpanded); }}
                className="text-primary/70 text-sm font-medium mt-1 hover:text-primary transition-colors"
              >
                {isContentExpanded ? '↑ voir moins' : '…voir plus'}
              </button>
            )}
          </div>

          {/* Poll Results */}
          {publication.type === 'poll' && (
            <div className="glass-card bg-white/40 p-4 space-y-3 rounded-2xl">
              <p className="text-xs font-semibold text-[#888888] uppercase tracking-wide">Résultats du sondage • 330 participants</p>
              {[
                { label: 'Taxer les hauts revenus', pct: 57 },
                { label: 'Réduire les dépenses publiques', pct: 22 },
                { label: 'Réformer pensions/chômage', pct: 14 },
                { label: 'Défense & justice', pct: 7 },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground">{item.label}</span>
                    <span className="font-bold text-primary">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistic Infographic */}
          {publication.type === 'statistic' && publication.content.fr?.match(/(\d+)%/) && (
            <StatisticInfographic
              percentage={parseInt(publication.content.fr.match(/(\d+)%/)![1])}
              label={publication.content.fr.split(':')[1]?.split('.')[0]?.trim() || 'des belges concernés'}
              source={publication.author.organization || 'Source officielle'}
              sourceUrl={publication.sourceUrl}
            />
          )}

          {/* Media */}
          {publication.media && publication.media.length > 0 && publication.media[0] && (
            <img
              src={publication.media[0]}
              alt=""
              className="w-full max-h-72 object-cover rounded-xl"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>

        {/* Citizen Interpellations — now handled by InterpellationCarousel wrapper */}

        {/* ─── Action Bar below content ─── */}
        <div className="flex items-center gap-2 pt-1">
          {/* LEFT: Réagir (toggle reaction bar) */}
          <button
            onClick={() => { triggerHaptic('light'); setShowReactionBar(!showReactionBar); }}
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all duration-200 min-h-[48px]',
              showReactionBar || hasReacted
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <SmilePlus className="w-5 h-5" />
            Réagir
          </button>

          {/* CENTER/RIGHT: Commenter */}
          <button
            onClick={() => { triggerHaptic('light'); setShowComments(true); }}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-xl transition-all duration-200 min-h-[48px]"
          >
            <MessageSquare className="w-5 h-5" />
            {commentCount}
          </button>

          {/* RIGHT: Approfondir (only when applicable) */}
          {showApprofondirButton && (
            <button
              onClick={() => { triggerHaptic('light'); setShowApprofondir(true); }}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-xl transition-all duration-200 min-h-[48px] ml-auto"
            >
              <Search className="w-5 h-5" />
              Approfondir
            </button>
          )}
        </div>

        {/* Reaction Bar — always in DOM, animated with CSS grid for zero layout shift */}
        <div
          className="grid transition-all duration-300 ease-in-out"
          style={{ gridTemplateRows: showReactionBar ? '1fr' : '0fr' }}
        >
          <div className={cn(
            'overflow-hidden min-h-0 transition-opacity duration-300',
            showReactionBar ? 'opacity-100' : 'opacity-0'
          )}>
            <div className="pt-1">
              <ReactionBar reactions={publication.reactions} userReaction={userReaction} onReact={handleReaction} />
            </div>
          </div>
        </div>
      </Card>

      <CommentsDrawer open={showComments} onClose={() => setShowComments(false)} publication={publication} />
      <ApprofondirModal open={showApprofondir} onClose={() => setShowApprofondir(false)} publication={publication} onOpenComments={() => setShowComments(true)} />
    </>
  );
};

export default PublicationCard;
