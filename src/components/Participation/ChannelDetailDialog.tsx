import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, FileText, ThumbsUp, ThumbsDown, Play, MessageSquare, Users } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { useToast } from '@/hooks/use-toast';

interface ChannelContent {
  id: string;
  type: 'video' | 'measure';
  title: string;
  description: string;
  author: string;
  votesFor: number;
  votesAgainst: number;
  threshold: number;
  thumbnail?: string;
}

interface ChannelItem {
  id: string;
  name: string;
  type: 'canal' | 'communaute';
  icon: string;
  memberCount: number;
  pendingCount: number;
  topic?: string;
}

const mockContent: Record<string, ChannelContent[]> = {
  '1': [
    { id: 'v1', type: 'video', title: 'Transition énergétique à Bruxelles', description: 'Propositions concrètes pour accélérer la transition', author: 'Marie D.', votesFor: 89, votesAgainst: 12, threshold: 100, thumbnail: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300' },
    { id: 'm1', type: 'measure', title: 'Subvention panneaux solaires', description: 'Augmenter les subventions pour les copropriétés', author: 'Collectif Énergie Verte', votesFor: 156, votesAgainst: 23, threshold: 200 },
    { id: 'm1b', type: 'measure', title: 'Interdiction plastique unique', description: 'Interdire les plastiques à usage unique dans les marchés', author: 'Zéro Déchet BXL', votesFor: 134, votesAgainst: 45, threshold: 200 },
  ],
  '2': [
    { id: 'v2', type: 'video', title: 'Pistes cyclables sécurisées', description: 'Audit des points noirs pour les cyclistes', author: 'GRACQ', votesFor: 67, votesAgainst: 8, threshold: 100, thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300' },
  ],
  '3': [
    { id: 'm3', type: 'measure', title: 'Centres de santé mentale', description: 'Créer des centres accessibles dans chaque commune', author: 'Santé Pour Tous', votesFor: 201, votesAgainst: 34, threshold: 250 },
    { id: 'v3', type: 'video', title: 'Accès aux soins mentaux', description: 'Témoignage sur les difficultés d\'accès', author: 'Thomas L.', votesFor: 45, votesAgainst: 5, threshold: 80, thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300' },
  ],
  '5': [
    { id: 'm5', type: 'measure', title: 'Budget vert quartier', description: 'Allouer 30% du budget participatif aux projets verts', author: 'Comité Budget', votesFor: 89, votesAgainst: 12, threshold: 150 },
  ],
  '7': [
    { id: 'm7a', type: 'measure', title: 'Horaires flexibles hôpitaux', description: 'Revoir les horaires de garde pour le bien-être du personnel', author: 'Collectif Infirmiers', votesFor: 78, votesAgainst: 5, threshold: 100 },
    { id: 'm7b', type: 'measure', title: 'Prime logement soignants', description: 'Prime logement pour les soignants travaillant en zone tendue', author: 'Syndicat Santé', votesFor: 112, votesAgainst: 18, threshold: 150 },
  ],
};

interface Props {
  channel: ChannelItem | null;
  open: boolean;
  onClose: () => void;
}

const ChannelDetailDialog: React.FC<Props> = ({ channel, open, onClose }) => {
  const { toast } = useToast();
  const [votes, setVotes] = useState<Record<string, 'for' | 'against' | null>>({});

  if (!channel) return null;

  const contents = mockContent[channel.id] || [];

  const handleVote = (contentId: string, vote: 'for' | 'against') => {
    triggerHaptic('medium');
    setVotes(prev => ({
      ...prev,
      [contentId]: prev[contentId] === vote ? null : vote
    }));
  };

  const activeMembers = Math.floor(channel.memberCount * 0.4);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {channel.name}
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${
              channel.type === 'canal'
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
            }`}>
              {channel.type === 'canal' ? 'Canal' : 'Communauté'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 text-xs text-muted-foreground py-1">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {channel.memberCount} membres</span>
          <span>{activeMembers} actifs (30j)</span>
          <span>Seuil: 50%+</span>
        </div>

        <div className="space-y-3">
          {contents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun contenu en attente</p>
          ) : (
            contents.map(content => {
              const userVote = votes[content.id];
              const totalVotes = content.votesFor + content.votesAgainst;
              const forPercent = totalVotes > 0 ? Math.round((content.votesFor / totalVotes) * 100) : 0;
              const neededVotes = Math.ceil(activeMembers * 0.5);
              const progress = Math.min((totalVotes / neededVotes) * 100, 100);

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
                      <p className="font-semibold text-sm text-foreground truncate">{content.title}</p>
                      <p className="text-xs text-muted-foreground">{content.author}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{content.description}</p>

                  {/* Vote progress bar */}
                  <div className="space-y-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                      <div className="bg-primary h-full transition-all" style={{ width: `${forPercent}%` }} />
                      <div className="bg-destructive h-full transition-all" style={{ width: `${100 - forPercent}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{totalVotes} / {neededVotes} votes nécessaires</span>
                      <span>{forPercent}% pour</span>
                    </div>
                  </div>

                  {/* Vote buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => handleVote(content.id, 'for')}
                      className={`flex-1 h-9 text-xs min-h-[36px] ${
                        userVote === 'for'
                          ? 'bg-verified-green/20 border-verified-green text-verified-green'
                          : 'hover:border-verified-green hover:text-verified-green'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                      Publier ({content.votesFor})
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => handleVote(content.id, 'against')}
                      className={`flex-1 h-9 text-xs min-h-[36px] ${
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
            })
          )}

          <Button
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground min-h-[44px]"
            onClick={() => {
              triggerHaptic('medium');
              onClose();
              toast({ title: "Discussion ouverte", description: "Redirection vers la messagerie du canal..." });
            }}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Accéder à la discussion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelDetailDialog;
