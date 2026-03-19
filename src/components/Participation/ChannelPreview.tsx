import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, FileText, MessageSquare, ThumbsUp, ThumbsDown, Users, Play, ChevronRight, Leaf, Heart, GraduationCap, TrendingUp, Train, Home } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface ChannelContent {
  id: string;
  type: 'video' | 'measure';
  title: string;
  description: string;
  author: string;
  votesFor: number;
  votesAgainst: number;
  threshold: number;
  createdAt: Date;
  thumbnail?: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'thematic' | 'community';
  icon: string;
  memberCount: number;
  pendingVideos: ChannelContent[];
  pendingMeasures: ChannelContent[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Leaf, Heart, GraduationCap, TrendingUp, Train, Home
};

const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'Climat & Environnement',
    type: 'thematic',
    icon: 'Leaf',
    memberCount: 1247,
    pendingVideos: [
      {
        id: 'v1',
        type: 'video',
        title: 'Transition énergétique à Bruxelles',
        description: 'Propositions concrètes pour accélérer la transition vers les énergies renouvelables',
        author: 'Marie D.',
        votesFor: 89,
        votesAgainst: 12,
        threshold: 100,
        createdAt: new Date(Date.now() - 3600000 * 2),
        thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300'
      },
    ],
    pendingMeasures: [
      {
        id: 'm1',
        type: 'measure',
        title: 'Subvention panneaux solaires',
        description: 'Augmenter les subventions pour l\'installation de panneaux solaires dans les copropriétés',
        author: 'Collectif Énergie Verte',
        votesFor: 156,
        votesAgainst: 23,
        threshold: 200,
        createdAt: new Date(Date.now() - 86400000),
      },
    ]
  },
  {
    id: '2',
    name: 'Santé & Bien-être',
    type: 'thematic',
    icon: 'Heart',
    memberCount: 892,
    pendingVideos: [
      {
        id: 'v2',
        type: 'video',
        title: 'Accès aux soins de santé mentale',
        description: 'Témoignage sur les difficultés d\'accès aux psychologues',
        author: 'Thomas L.',
        votesFor: 67,
        votesAgainst: 8,
        threshold: 100,
        createdAt: new Date(Date.now() - 7200000),
        thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300'
      },
    ],
    pendingMeasures: [
      {
        id: 'm2',
        type: 'measure',
        title: 'Centres de santé de proximité',
        description: 'Création de maisons médicales de garde dans chaque commune',
        author: 'Association Santé Pour Tous',
        votesFor: 201,
        votesAgainst: 34,
        threshold: 250,
        createdAt: new Date(Date.now() - 172800000),
      },
    ]
  },
  {
    id: '3',
    name: 'Quartier Ixelles',
    type: 'community',
    icon: 'Home',
    memberCount: 534,
    pendingVideos: [],
    pendingMeasures: [
      {
        id: 'm3',
        type: 'measure',
        title: 'Piétonisation Place Flagey',
        description: 'Rendre la Place Flagey piétonne les week-ends',
        author: 'Comité de quartier',
        votesFor: 112,
        votesAgainst: 45,
        threshold: 150,
        createdAt: new Date(Date.now() - 259200000),
      },
    ]
  }
];

interface ChannelPreviewProps {
  onOpenDiscussion: (channelId: string) => void;
}

const ChannelPreview: React.FC<ChannelPreviewProps> = ({ onOpenDiscussion }) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [votes, setVotes] = useState<Record<string, 'for' | 'against' | null>>({});

  const handleVote = (contentId: string, vote: 'for' | 'against') => {
    triggerHaptic('medium');
    setVotes(prev => ({
      ...prev,
      [contentId]: prev[contentId] === vote ? null : vote
    }));
  };

  const renderContentCard = (content: ChannelContent) => {
    const userVote = votes[content.id];
    const progress = ((content.votesFor - content.votesAgainst) / content.threshold) * 100;
    
    return (
      <div key={content.id} className="p-3 bg-muted/30 rounded-xl space-y-2">
        <div className="flex gap-3">
          {content.type === 'video' && content.thumbnail && (
            <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
              <img src={content.thumbnail} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          {content.type === 'measure' && (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{content.title}</p>
            <p className="text-xs text-muted-foreground truncate">{content.author}</p>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">{content.description}</p>
        
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-verified-green rounded-full transition-all"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{content.votesFor - content.votesAgainst} / {content.threshold} votes</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
        
        {/* Vote buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVote(content.id, 'for')}
            className={`flex-1 h-8 text-xs ${
              userVote === 'for' 
                ? 'bg-verified-green/20 border-verified-green text-verified-green' 
                : 'hover:border-verified-green hover:text-verified-green'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
            Publier ({content.votesFor})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVote(content.id, 'against')}
            className={`flex-1 h-8 text-xs ${
              userVote === 'against' 
                ? 'bg-destructive/20 border-destructive text-destructive' 
                : 'hover:border-destructive hover:text-destructive'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5 mr-1" />
            Rejeter ({content.votesAgainst})
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Mes Canaux & Communautés
      </h2>
      
      <div className="space-y-2">
        {mockChannels.slice(0, 3).map((channel) => {
          const IconComponent = iconMap[channel.icon] || Leaf;
          const pendingCount = channel.pendingVideos.length + channel.pendingMeasures.length;
          
          return (
            <Card
              key={channel.id}
              className="p-3 cursor-pointer hover:bg-accent/5 transition-all bg-card border-border hover:border-primary/30 hover:shadow-md"
              onClick={() => {
                triggerHaptic('light');
                setSelectedChannel(channel);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground text-sm truncate">{channel.name}</h3>
                    <Badge variant="outline" className="text-[10px] px-1.5 h-4">
                      {channel.type === 'thematic' ? 'Thématique' : 'Communauté'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{channel.memberCount} membres</span>
                    {pendingCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-medium">{pendingCount} en attente</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Channel Detail Dialog */}
      <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedChannel && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(iconMap[selectedChannel.icon] || Leaf, { className: 'w-5 h-5 text-primary' })}
                  {selectedChannel.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Pending Videos */}
                {selectedChannel.pendingVideos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <Video className="w-4 h-4 text-primary" />
                      Vidéos en attente de publication
                    </h4>
                    {selectedChannel.pendingVideos.map(renderContentCard)}
                  </div>
                )}
                
                {/* Pending Measures */}
                {selectedChannel.pendingMeasures.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                      <FileText className="w-4 h-4 text-primary" />
                      Mesures en attente de publication
                    </h4>
                    {selectedChannel.pendingMeasures.map(renderContentCard)}
                  </div>
                )}
                
                {selectedChannel.pendingVideos.length === 0 && selectedChannel.pendingMeasures.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun contenu en attente de vote
                  </p>
                )}
                
                {/* Access Discussion Button */}
                <Button
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                  onClick={() => {
                    triggerHaptic('medium');
                    setSelectedChannel(null);
                    onOpenDiscussion(selectedChannel.id);
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Accéder à la discussion
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChannelPreview;
