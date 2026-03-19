import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, Plus, ChevronRight, Send } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { ChatGroup } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ConversationView from '@/components/Messages/ConversationView';
import NewConversationDialog from '@/components/Messages/NewConversationDialog';
import PageHeader from '@/components/Layout/PageHeader';
import { triggerHaptic } from '@/utils/haptics';
import { useToast } from '@/hooks/use-toast';
import RoleBadge from '@/components/ui/RoleBadge';
import { useNavigate } from 'react-router-dom';

const getLastMessagePreview = (group: ChatGroup): string => {
  const previews: Record<string, string> = {
    '4': 'Sophie: Merci pour le partage, je regarde ça...',
    '6': 'Jean: On se retrouve à la réunion demain ?',
    '9': 'Vous: Bonjour, je voulais savoir...',
    '10': 'Amina: Les résultats du sondage sont là !',
    '11': 'Pierre: Merci pour ton aide hier',
  };
  const preview = previews[group.id] || 'Démarrez la conversation...';
  return preview.length > 50 ? preview.slice(0, 50) + '...' : preview;
};

const formatTimestamp = (date: Date): string => {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return date.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' });
};

interface SuggestedContact {
  id: string;
  name: string;
  avatar?: string;
  role: 'Citizen' | 'Politician' | 'Press' | 'SocietyGroup' | 'Institution';
  isVerified: boolean;
}

const suggestedContacts: SuggestedContact[] = [
  { id: 'sc1', name: 'Rajae Maouane', role: 'Politician', isVerified: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
  { id: 'sc2', name: 'Sarah D.', role: 'Citizen', isVerified: false, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
  { id: 'sc3', name: 'Thomas V.', role: 'Citizen', isVerified: false, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
];

const MessagesView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([
    {
      id: '4', name: 'Sophie Laurent', type: 'private',
      members: ['1', '9'],
      createdAt: new Date(Date.now() - 86400000 * 3),
      lastMessageAt: new Date(Date.now() - 86400000), unreadCount: 1,
    },
    {
      id: '6', name: 'Jean Martin', type: 'private',
      members: ['1', '22'],
      createdAt: new Date(Date.now() - 86400000 * 1),
      lastMessageAt: new Date(Date.now() - 14400000), unreadCount: 0,
    },
    {
      id: '9', name: 'Georges-Louis Bouchez', type: 'private',
      members: ['1', 'bouchez'],
      createdAt: new Date(Date.now() - 86400000 * 2),
      lastMessageAt: new Date(Date.now() - 3600000), unreadCount: 3,
    },
    {
      id: '10', name: 'Amina K.', type: 'private',
      members: ['1', 'amina-k'],
      createdAt: new Date(Date.now() - 86400000 * 5),
      lastMessageAt: new Date(Date.now() - 7200000), unreadCount: 0,
    },
    {
      id: '11', name: 'Pierre D.', type: 'private',
      members: ['1', 'pierre-d'],
      createdAt: new Date(Date.now() - 86400000 * 8),
      lastMessageAt: new Date(Date.now() - 86400000 * 2), unreadCount: 0,
    },
  ]);

  const handleCreateConversation = (id: string, type: 'private' | 'thematic') => {
    const newConversation: ChatGroup = {
      id: `${chatGroups.length + 20}`,
      name: `Conversation avec ${id}`,
      type: 'private',
      members: ['1', id],
      createdAt: new Date(),
      lastMessageAt: new Date(),
      unreadCount: 0,
    };
    setChatGroups([newConversation, ...chatGroups]);
    setSelectedGroup(newConversation);
    toast({ title: "Conversation créée", description: "Vous pouvez maintenant échanger des messages" });
  };

  const filteredGroups = useMemo(() => {
    return chatGroups
      .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const aUnread = (a.unreadCount || 0) > 0 ? 1 : 0;
        const bUnread = (b.unreadCount || 0) > 0 ? 1 : 0;
        if (bUnread !== aUnread) return bUnread - aUnread;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
  }, [chatGroups, searchQuery]);

  const getRoleForName = (name: string): { role: 'Citizen' | 'Politician' | 'Press' | 'SocietyGroup' | 'Institution'; isVerified: boolean } => {
    if (name === 'Georges-Louis Bouchez' || name === 'Jean Martin') return { role: 'Politician', isVerified: true };
    return { role: 'Citizen', isVerified: false };
  };

  const getRoleAvatarColor = (role: string, hasUnread: boolean) => {
    switch (role) {
      case 'Politician': case 'Institution': return hasUnread ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600';
      case 'Press': return hasUnread ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600';
      case 'SocietyGroup': return hasUnread ? 'bg-violet-100 text-violet-700' : 'bg-violet-50 text-violet-600';
      default: return hasUnread ? 'bg-[hsl(330,85%,93%)] text-[hsl(330,85%,40%)]' : 'bg-[hsl(330,85%,95%)] text-[hsl(330,85%,50%)]';
    }
  };

  if (selectedGroup) {
    return <ConversationView group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
  }

  const showSuggestions = filteredGroups.length >= 3;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Messages" />

      <div className="max-w-2xl mx-auto px-4 pt-2 space-y-3">
        {/* Action row */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Vos conversations privées</p>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary-hover text-primary-foreground min-h-[44px]"
            onClick={() => { triggerHaptic('light'); setShowNewConversation(true); }}
            aria-label="Créer une nouvelle conversation"
          >
            <Plus className="w-4 h-4 mr-1" /> Nouveau
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background border-input"
          />
        </div>

        {/* Conversations List */}
        {filteredGroups.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-bold mb-2 text-foreground">Aucun message pour le moment</h3>
            <p className="text-sm text-muted-foreground mb-4">Trouvez des personnes à contacter dans l'onglet Part.</p>
            <Button
              className="bg-primary hover:bg-primary-hover text-primary-foreground min-h-[44px]"
              onClick={() => navigate('/matchmaking')}
            >
              Découvrir le réseau
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredGroups.map((group, index) => {
              const { role, isVerified } = getRoleForName(group.name);
              const hasUnread = (group.unreadCount || 0) > 0;
              return (
                <React.Fragment key={group.id}>
                  <Card
                    className="cursor-pointer hover:bg-accent/10 transition-all duration-200 bg-card border-border hover:border-primary/30 group"
                    onClick={() => { triggerHaptic('light'); setSelectedGroup(group); }}
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold ${getRoleAvatarColor(role, hasUnread)}`}>
                            {group.name.charAt(0)}
                          </div>
                          {hasUnread && (
                            <div className="absolute -top-1 -right-1 bg-[hsl(330,85%,52%)] text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-[11px] font-bold px-1 shadow-md">
                              {group.unreadCount}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h3 className={`text-sm truncate ${(group.unreadCount || 0) > 0 ? 'font-bold text-foreground' : 'font-semibold text-foreground'}`}>
                              {group.name}
                            </h3>
                            <RoleBadge role={role} isVerified={isVerified} size="sm" />
                          </div>
                          <p className={`text-xs truncate ${(group.unreadCount || 0) > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {getLastMessagePreview(group)}
                          </p>
                        </div>

                        {/* Timestamp + chevron */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-xs ${(group.unreadCount || 0) > 0 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                            {formatTimestamp(new Date(group.lastMessageAt))}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Suggestions after ~60% of conversations */}
                  {showSuggestions && index === Math.floor(filteredGroups.length * 0.6) && (
                    <div className="py-3 space-y-3">
                      <div className="h-px bg-border" />
                      <h3 className="text-sm font-bold text-foreground">Personnes à contacter</h3>
                      {suggestedContacts.map(contact => (
                        <div key={contact.id} className="flex items-center gap-3 py-1">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                            {contact.avatar ? (
                              <img src={contact.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
                                {contact.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-foreground truncate">{contact.name}</p>
                              <RoleBadge role={contact.role} isVerified={contact.isVerified} size="sm" />
                            </div>
                          </div>
                          <Button
                            size="sm" variant="outline"
                            className="min-h-[36px] text-xs border-primary text-primary hover:bg-primary/10"
                            onClick={() => handleCreateConversation(contact.id, 'private')}
                          >
                            <Send className="w-3 h-3 mr-1" /> Message
                          </Button>
                        </div>
                      ))}
                      <div className="h-px bg-border" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <NewConversationDialog
          open={showNewConversation}
          onClose={() => setShowNewConversation(false)}
          onCreateConversation={handleCreateConversation}
        />
      </div>
    </div>
  );
};

export default MessagesView;
