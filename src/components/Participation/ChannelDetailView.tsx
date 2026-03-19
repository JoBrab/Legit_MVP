import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft, MoreVertical, MessageSquare, Megaphone, Users, Settings,
  Play, FileText, ThumbsUp, ThumbsDown, Calendar, Shield, ChevronDown,
  Leaf, Heart, Train, Home, Landmark, TrendingUp, LogOut
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ChannelItem {
  id: string;
  name: string;
  type: 'canal' | 'communaute';
  icon: string;
  memberCount: number;
  pendingCount: number;
  topic?: string;
  description?: string;
}

interface Props {
  channel: ChannelItem;
  onBack: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf, Heart, Train, Home, Landmark, TrendingUp, Users
};

const mockMembers = [
  { id: '1', name: 'Sarah D.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
  { id: '2', name: 'Jean M.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { id: '3', name: 'Amina K.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face' },
  { id: '4', name: 'Thomas V.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
  { id: '5', name: 'Pierre D.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face' },
  { id: '6', name: 'Marie L.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
  { id: '7', name: 'Sophie L.', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face' },
  { id: '8', name: 'Lucas B.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
];

const mockActivity = [
  { id: 'a1', type: 'message' as const, author: 'Marie D.', content: 'Nouvelle proposition pour la transition énergétique locale...', time: '2h' },
  { id: 'a2', type: 'publication' as const, author: 'Collectif Vert', content: 'Notre rapport sur les émissions de CO2 en Belgique vient d\'être publié.', time: '5h' },
  { id: 'a3', type: 'vote' as const, author: 'Thomas V.', content: 'A voté pour "Subvention panneaux solaires"', time: '1j' },
];

const mockPendingContent = [
  { id: 'p1', type: 'measure' as const, title: 'Subvention panneaux solaires', author: 'Collectif Énergie Verte', votesFor: 156, votesAgainst: 23, threshold: 200 },
  { id: 'p2', type: 'video' as const, title: 'Transition énergétique à Bruxelles', author: 'Marie D.', votesFor: 89, votesAgainst: 12, threshold: 100, thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300' },
];

const ChannelDetailView: React.FC<Props> = ({ channel, onBack }) => {
  const { toast } = useToast();
  const [isMember, setIsMember] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [votes, setVotes] = useState<Record<string, 'for' | 'against' | null>>({});
  const [showOptions, setShowOptions] = useState(false);

  const IconComponent = iconMap[channel.icon] || Users;
  const activeMembers = Math.floor(channel.memberCount * 0.4);

  const handleVote = (contentId: string, vote: 'for' | 'against') => {
    triggerHaptic('medium');
    setVotes(prev => ({ ...prev, [contentId]: prev[contentId] === vote ? null : vote }));
  };

  return (
    <div className="animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 -mx-4 px-4 pb-3 border-b border-border">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h2 className="flex-1 text-base font-bold text-foreground truncate">{channel.name}</h2>
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
          {showOptions && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[180px] animate-scale-in">
              <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted min-h-[40px]">🔔 Notifications</button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted min-h-[40px]">ℹ️ Informations</button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 min-h-[40px]">🚪 Quitter</button>
            </div>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className={cn(
          'w-20 h-20 rounded-3xl flex items-center justify-center mb-3',
          channel.type === 'canal' ? 'bg-primary/10' : 'bg-purple-100 dark:bg-purple-900/30'
        )}>
          <IconComponent className={cn(
            'w-10 h-10',
            channel.type === 'canal' ? 'text-primary' : 'text-purple-600 dark:text-purple-400'
          )} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">{channel.name}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
          <span className="font-medium">👥 {channel.memberCount} membres</span>
          <span>•</span>
          <span>{activeMembers} actifs</span>
          {channel.pendingCount > 0 && (
            <>
              <span>•</span>
              <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0 h-[18px] rounded-full">
                {channel.pendingCount} en attente
              </Badge>
            </>
          )}
        </div>
        <Badge variant="outline" className={cn(
          'text-xs px-3 py-0.5 rounded-full',
          channel.type === 'canal'
            ? 'bg-[hsl(340,82%,95%)] text-[hsl(340,82%,35%)] border-[hsl(340,82%,85%)]'
            : 'bg-[hsl(270,67%,95%)] text-[hsl(270,67%,35%)] border-[hsl(270,67%,85%)]'
        )}>
          {channel.type === 'canal' ? 'Canal' : 'Communauté'}
        </Badge>

        {channel.description && (
          <div className="mt-3 max-w-sm">
            <p className={cn('text-sm text-muted-foreground', !showFullDescription && 'line-clamp-2')}>
              {channel.description}
            </p>
            {channel.description.length > 100 && (
              <button onClick={() => setShowFullDescription(!showFullDescription)} className="text-xs text-primary font-medium mt-1">
                {showFullDescription ? 'Voir moins' : 'Voir plus'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { icon: MessageSquare, label: 'Chat', emoji: '💬' },
          { icon: Megaphone, label: 'Publications', emoji: '📢' },
          { icon: Users, label: 'Membres', emoji: '👥' },
          { icon: Settings, label: 'Paramètres', emoji: '⚙️' },
        ].map(action => (
          <button
            key={action.label}
            onClick={() => { triggerHaptic('light'); toast({ title: action.label, description: 'Bientôt disponible' }); }}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors min-h-[72px]"
          >
            <span className="text-lg">{action.emoji}</span>
            <span className="text-[11px] font-medium text-foreground">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Pending Content for Validation */}
      {mockPendingContent.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-bold text-foreground">📋 Contenus en attente</h3>
          {mockPendingContent.map(content => {
            const userVote = votes[content.id];
            const totalVotes = content.votesFor + content.votesAgainst;
            const forPercent = totalVotes > 0 ? Math.round((content.votesFor / totalVotes) * 100) : 0;
            const neededVotes = Math.ceil(activeMembers * 0.5);

            return (
              <Card key={content.id} className="p-3 space-y-2 bg-card">
                <div className="flex gap-3">
                  {content.type === 'video' && content.thumbnail ? (
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={content.thumbnail} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{content.title}</p>
                    <p className="text-xs text-muted-foreground">{content.author}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-primary h-full transition-all" style={{ width: `${forPercent}%` }} />
                    <div className="bg-destructive h-full transition-all" style={{ width: `${100 - forPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{totalVotes} / {neededVotes} votes</span>
                    <span>{forPercent}% pour</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handleVote(content.id, 'for')}
                    className={cn('flex-1 h-9 text-xs min-h-[36px]', userVote === 'for' ? 'bg-[hsl(var(--verified-green))]/20 border-[hsl(var(--verified-green))] text-[hsl(var(--verified-green))]' : 'hover:border-[hsl(var(--verified-green))] hover:text-[hsl(var(--verified-green))]')}
                  >
                    <ThumbsUp className="w-3.5 h-3.5 mr-1" /> Publier ({content.votesFor})
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handleVote(content.id, 'against')}
                    className={cn('flex-1 h-9 text-xs min-h-[36px]', userVote === 'against' ? 'bg-destructive/20 border-destructive text-destructive' : 'hover:border-destructive hover:text-destructive')}
                  >
                    <ThumbsDown className="w-3.5 h-3.5 mr-1" /> Rejeter ({content.votesAgainst})
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recent Activity */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-bold text-foreground">📣 Activité récente</h3>
        {mockActivity.map(item => (
          <div key={item.id} className="flex items-start gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-muted-foreground">{item.author.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{item.author}</span>
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.content}</p>
            </div>
            <span className="text-[11px] text-muted-foreground flex-shrink-0">{item.time}</span>
          </div>
        ))}
        <button className="text-xs text-primary font-medium hover:underline">Voir tout →</button>
      </div>

      {/* Members Preview */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-bold text-foreground">👥 Membres</h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {mockMembers.map(member => (
            <div key={member.id} className="flex flex-col items-center gap-1 min-w-[56px]">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                <img src={member.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">{member.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 min-w-[56px]">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">+{channel.memberCount - mockMembers.length}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">autres</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="space-y-2 mb-6">
        <h3 className="text-sm font-bold text-foreground">ℹ️ À propos</h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Créé en janvier 2025</p>
          <p className="flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Administré par l'équipe Legit</p>
          <p className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Seuil de validation : 50% des membres actifs</p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pb-4">
        {isMember ? (
          <Button
            variant="outline"
            className="w-full min-h-[44px] text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
            onClick={() => {
              triggerHaptic('medium');
              setIsMember(false);
              toast({ title: 'Canal quitté', description: `Vous avez quitté ${channel.name}` });
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Quitter le canal
          </Button>
        ) : (
          <Button
            className="w-full min-h-[44px] bg-primary text-primary-foreground hover:bg-primary-hover"
            onClick={() => {
              triggerHaptic('medium');
              setIsMember(true);
              toast({ title: 'Bienvenue !', description: `Vous avez rejoint ${channel.name}` });
            }}
          >
            <Users className="w-4 h-4 mr-2" /> Rejoindre
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChannelDetailView;
