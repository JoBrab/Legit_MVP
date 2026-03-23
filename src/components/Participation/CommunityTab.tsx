import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Users, Plus, ChevronRight, Leaf, Heart, Train, Home, Landmark, TrendingUp,
  UserPlus, Check, Search, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import RoleBadge from '@/components/ui/RoleBadge';
import { UserRole } from '@/types';
import ChannelDetailView from '@/components/Participation/ChannelDetailView';
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
  isFavorite?: boolean;
}

interface SuggestedUser {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  organization?: string;
  engagementScore?: number;
  rank?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf, Heart, Train, Home, Landmark, TrendingUp, Users
};

const channels: ChannelItem[] = [];
const suggestedUsers: SuggestedUser[] = [];
const activePoliticians: SuggestedUser[] = [];
const verifiedMedia: SuggestedUser[] = [];
const topCitizens: SuggestedUser[] = [];

type NetworkTab = 'suggestions' | 'following' | 'followers';
type ChannelFilter = 'all' | 'canaux' | 'communautes' | 'unread' | 'favorites';
type SortOption = 'recent' | 'alpha' | 'members';

const CommunityTab: React.FC = () => {
  const [following, setFollowing] = useState<Set<string>>(new Set(['p2', 'm1']));
  const [networkTab, setNetworkTab] = useState<NetworkTab>('suggestions');
  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ChannelFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const toggleFollow = (userId: string) => {
    triggerHaptic('light');
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const filteredChannels = useMemo(() => {
    let result = channels.filter(ch => {
      const matchesSearch = !searchQuery ||
        ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ch.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      switch (activeFilter) {
        case 'canaux': return ch.type === 'canal';
        case 'communautes': return ch.type === 'communaute';
        case 'unread': return ch.pendingCount > 0;
        case 'favorites': return ch.isFavorite;
        default: return true;
      }
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'alpha': return a.name.localeCompare(b.name);
        case 'members': return b.memberCount - a.memberCount;
        default: return b.pendingCount - a.pendingCount;
      }
    });

    return result;
  }, [searchQuery, activeFilter, sortBy]);

  const filterChips: { key: ChannelFilter; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'canaux', label: 'Canaux' },
    { key: 'communautes', label: 'Communautés' },
    { key: 'unread', label: 'Non lus' },
    { key: 'favorites', label: '⭐ Favoris' },
  ];

  const sortLabels: Record<SortOption, string> = {
    recent: 'Activité récente',
    alpha: 'Alphabétique',
    members: 'Nombre de membres',
  };

  // If a channel is selected, show its full detail view
  if (selectedChannel) {
    return (
      <ChannelDetailView
        channel={selectedChannel}
        onBack={() => setSelectedChannel(null)}
      />
    );
  }

  const FollowButton: React.FC<{ userId: string; compact?: boolean }> = ({ userId, compact }) => {
    const isFollowing = following.has(userId);
    return (
      <Button
        size="sm"
        variant={isFollowing ? 'outline' : 'default'}
        className={cn(
          'min-h-[36px] text-xs transition-all duration-200',
          isFollowing
            ? 'border-primary text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive'
            : 'bg-primary text-primary-foreground hover:bg-primary-hover',
          compact ? 'px-3' : 'px-4'
        )}
        onClick={(e) => { e.stopPropagation(); toggleFollow(userId); }}
      >
        {isFollowing ? <><Check className="w-3 h-3 mr-1" />Abonné</> : <><UserPlus className="w-3 h-3 mr-1" />Suivre</>}
      </Button>
    );
  };

  const UserAvatar: React.FC<{ user: SuggestedUser; size?: string }> = ({ user, size = 'w-10 h-10' }) => (
    <div className={`${size} rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center`}>
      {user.avatar ? (
        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm font-semibold text-muted-foreground">{user.name.charAt(0)}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* SECTION A: Channels & Communities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Mes Canaux & Communautés</h2>
          <Button size="sm" variant="outline" className="min-h-[36px] border-primary text-primary hover:bg-primary/10">
            <Plus className="w-4 h-4 mr-1" /> Rejoindre
          </Button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="🔍 Rechercher un canal ou une communauté..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm bg-muted/30 border-border focus:border-primary"
          />
        </div>

        {/* Filter chips + sort */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1 -mx-1 px-1">
            {filterChips.map(chip => (
              <button
                key={chip.key}
                onClick={() => setActiveFilter(chip.key)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 min-h-[32px]',
                  activeFilter === chip.key
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-primary/30 text-primary hover:bg-primary/10'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg py-1 min-w-[180px] animate-scale-in">
                {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setShowSortMenu(false); }}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm transition-colors min-h-[40px]',
                      sortBy === key ? 'text-primary font-semibold bg-primary/5' : 'text-foreground hover:bg-muted'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Channel list */}
        <div className="space-y-2">
          {filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {searchQuery ? 'Aucun résultat' : 'Rejoignez un canal pour commencer à débattre'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Explorez les canaux populaires ci-dessous'}
              </p>
              {!searchQuery && (
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover min-h-[36px]">
                  Explorer les canaux populaires
                </Button>
              )}
            </div>
          ) : (
            filteredChannels.map((ch) => {
              const IconComponent = iconMap[ch.icon] || Users;
              return (
                <Card
                  key={ch.id}
                  className={cn(
                    'p-3 cursor-pointer transition-all duration-150 bg-card border-border group',
                    'hover:bg-accent/5 hover:border-primary/30 hover:scale-[1.02] hover:shadow-sm'
                  )}
                  onClick={() => { triggerHaptic('light'); setSelectedChannel(ch); }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0',
                      ch.type === 'canal' ? 'bg-primary/10' : 'bg-purple-100 dark:bg-purple-900/30'
                    )}>
                      <IconComponent className={cn(
                        'w-5 h-5',
                        ch.type === 'canal' ? 'text-primary' : 'text-purple-600 dark:text-purple-400'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-bold text-foreground truncate">{ch.name}</h3>
                        <Badge variant="outline" className={cn(
                          'text-[9px] px-2 py-0 h-[18px] flex-shrink-0 rounded-full',
                          ch.type === 'canal'
                            ? 'bg-[hsl(340,82%,95%)] text-[hsl(340,82%,35%)] border-[hsl(340,82%,85%)]'
                            : 'bg-[hsl(270,67%,95%)] text-[hsl(270,67%,35%)] border-[hsl(270,67%,85%)] dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                        )}>
                          {ch.type === 'canal' ? 'Canal' : 'Communauté'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">👥 {ch.memberCount} membres</span>
                        {ch.pendingCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0 h-[18px] rounded-full animate-pulse">
                            {ch.pendingCount} en attente
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-all duration-150 group-hover:translate-x-0.5" />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-border" />

      {/* SECTION B: Network */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Réseau</h2>

        <div className="flex gap-2">
          {([
            { key: 'suggestions' as NetworkTab, label: 'Suggestions' },
            { key: 'following' as NetworkTab, label: 'Je suis' },
            { key: 'followers' as NetworkTab, label: 'Me suivent' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setNetworkTab(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-[32px]',
                networkTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {networkTab === 'suggestions' && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Suggestions pour vous</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
                {suggestedUsers.map(user => (
                  <div key={user.id} className="flex flex-col items-center gap-1.5 min-w-[90px] max-w-[90px]">
                    <UserAvatar user={user} size="w-14 h-14" />
                    <p className="text-xs font-semibold text-foreground text-center truncate w-full">{user.name}</p>
                    <RoleBadge role={user.role} isVerified={user.isVerified} size="sm" />
                    <Button
                      size="sm"
                      className="w-full h-7 text-[10px] bg-primary text-primary-foreground hover:bg-primary-hover"
                      onClick={() => toggleFollow(user.id)}
                    >
                      {following.has(user.id) ? 'Abonné' : 'Suivre'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Politiques actifs</h3>
              <div className="space-y-2">
                {activePoliticians.map(user => (
                  <div key={user.id} className="flex items-center gap-3 py-1.5">
                    <UserAvatar user={user} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                        <RoleBadge role={user.role} isVerified={user.isVerified} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground">{user.organization}</p>
                    </div>
                    <FollowButton userId={user.id} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Médias vérifiés</h3>
              <div className="space-y-2">
                {verifiedMedia.map(user => (
                  <div key={user.id} className="flex items-center gap-3 py-1.5">
                    <UserAvatar user={user} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                        <RoleBadge role={user.role} isVerified={user.isVerified} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground">{user.organization}</p>
                    </div>
                    <FollowButton userId={user.id} />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Citoyens engagés cette semaine</h3>
              <div className="space-y-2">
                {topCitizens.map(user => (
                  <div key={user.id} className="flex items-center gap-3 py-1.5">
                    <span className="text-sm font-bold text-primary w-5 text-center flex-shrink-0">{user.rank}</span>
                    <UserAvatar user={user} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">Score: {user.engagementScore}%</p>
                    </div>
                    <FollowButton userId={user.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {networkTab === 'following' && (
          <div className="space-y-2 animate-fade-in">
            {[...activePoliticians, ...verifiedMedia, ...suggestedUsers].filter(u => following.has(u.id)).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Vous ne suivez personne pour le moment</p>
            ) : (
              [...activePoliticians, ...verifiedMedia, ...suggestedUsers].filter(u => following.has(u.id)).map(user => (
                <div key={user.id} className="flex items-center gap-3 py-1.5">
                  <UserAvatar user={user} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <RoleBadge role={user.role} isVerified={user.isVerified} size="sm" />
                    </div>
                  </div>
                  <FollowButton userId={user.id} />
                </div>
              ))
            )}
          </div>
        )}

        {networkTab === 'followers' && (
          <div className="space-y-2 animate-fade-in">
            {topCitizens.slice(0, 3).map(user => (
              <div key={user.id} className="flex items-center gap-3 py-1.5">
                <UserAvatar user={user} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <RoleBadge role={user.role} isVerified={user.isVerified} size="sm" />
                  </div>
                </div>
                <FollowButton userId={user.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityTab;
