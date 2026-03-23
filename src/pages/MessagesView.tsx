import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Edit2 } from 'lucide-react';
import { ChatGroup } from '@/types';
import ConversationView from '@/components/Messages/ConversationView';
import NewConversationDialog from '@/components/Messages/NewConversationDialog';
import { triggerHaptic } from '@/utils/haptics';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Role config ───
const roleConfig: Record<string, { label: string; bg: string; text: string; avatarBg: string }> = {
  Politician: { label: 'Politique', bg: 'bg-blue-100', text: 'text-blue-700', avatarBg: 'bg-blue-50 text-blue-600' },
  Citizen: { label: 'Citoyen', bg: 'bg-[hsl(330,85%,93%)]', text: 'text-[hsl(330,85%,40%)]', avatarBg: 'bg-[hsl(330,85%,95%)] text-[hsl(330,85%,50%)]' },
  Press: { label: 'Média', bg: 'bg-orange-100', text: 'text-orange-700', avatarBg: 'bg-orange-50 text-orange-600' },
  SocietyGroup: { label: 'Société civile', bg: 'bg-violet-100', text: 'text-violet-700', avatarBg: 'bg-violet-50 text-violet-600' },
  Institution: { label: 'Institution', bg: 'bg-emerald-100', text: 'text-emerald-700', avatarBg: 'bg-emerald-50 text-emerald-600' },
};

const lastMessagePreviews: Record<string, string> = {
  '4': 'Sophie: Merci pour le partage, je regarde ça...',
  '6': 'Jean: On se retrouve à la réunion demain ?',
  '9': 'Vous: Bonjour, je voulais savoir...',
  '10': 'Amina: Les résultats du sondage sont là !',
  '11': 'Pierre: Merci pour ton aide hier',
};

const getRoleForName = (name: string): string => {
  if (['Georges-Louis Bouchez', 'Jean Martin', 'Paul Magnette'].includes(name)) return 'Politician';
  if (['RTBF Info', 'Le Soir'].includes(name)) return 'Press';
  if (['Oxfam Belgique', 'Habitat & Humanisme'].includes(name)) return 'SocietyGroup';
  return 'Citizen';
};

const formatTimestamp = (date: Date): string => {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' });
};

// ─── Swipeable Conversation Item ───
interface SwipeableItemProps {
  group: ChatGroup;
  onTap: () => void;
  onDelete: () => void;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ group, onTap, onDelete }) => {
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const role = getRoleForName(group.name);
  const cfg = roleConfig[role] || roleConfig.Citizen;
  const hasUnread = (group.unreadCount || 0) > 0;
  const preview = lastMessagePreviews[group.id] || 'Démarrez la conversation...';

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = 0;
    setSwiping(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;
    const diff = startXRef.current - e.touches[0].clientX;
    currentXRef.current = diff;
    // Only allow left swipe, max 100px
    setSwipeOffset(Math.max(0, Math.min(diff, 100)));
  }, [swiping]);

  const onTouchEnd = useCallback(() => {
    setSwiping(false);
    if (currentXRef.current > 60) {
      // Snap open to reveal delete
      setSwipeOffset(80);
    } else {
      setSwipeOffset(0);
    }
  }, []);

  const handleDelete = () => {
    triggerHaptic('medium');
    setSwipeOffset(0);
    onDelete();
  };

  return (
    <div className="relative overflow-hidden">
      {/* Delete action behind */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-red-500 text-white font-medium text-sm min-h-[48px]"
        style={{ width: '80px' }}
      >
        <button onClick={handleDelete} className="w-full h-full flex items-center justify-center min-h-[48px]">
          Supprimer
        </button>
      </div>

      {/* Sliding content */}
      <div
        ref={containerRef}
        className="relative bg-white transition-transform"
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          transition: swiping ? 'none' : 'transform 0.25s ease-out',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => { if (swipeOffset === 0) { triggerHaptic('light'); onTap(); } else setSwipeOffset(0); }}
      >
        <div className="flex items-center gap-3 px-4 py-3 min-h-[68px]">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold', cfg.avatarBg)}>
              {group.name.charAt(0)}
            </div>
            {hasUnread && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center text-[11px] font-bold px-1">
                {group.unreadCount}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={cn('text-[14px] truncate', hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800')}>
                {group.name}
              </span>
              <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0', cfg.bg, cfg.text)}>
                {cfg.label}
              </span>
            </div>
            <p className={cn('text-sm truncate', hasUnread ? 'text-gray-700' : 'text-gray-400')}>
              {preview}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex-shrink-0 self-start pt-1">
            <span className={cn('text-xs', hasUnread ? 'text-[#E91E63] font-semibold' : 'text-gray-400')}>
              {formatTimestamp(new Date(group.lastMessageAt))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main MessagesView ───
const MessagesView: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([
    {
      id: '9', name: 'Georges-Louis Bouchez', type: 'private',
      members: ['1', 'bouchez'],
      createdAt: new Date(Date.now() - 86400000 * 2),
      lastMessageAt: new Date(Date.now() - 3600000), unreadCount: 3,
    },
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

  const handleCreateConversation = (id: string, _type: 'private' | 'thematic') => {
    // Find contact name from contacts list
    const contactNames: Record<string, string> = {
      bouchez: 'Georges-Louis Bouchez',
      magnette: 'Paul Magnette',
      maouane: 'Rajae Maouane',
      'sarah-d': 'Sarah D.',
      'thomas-v': 'Thomas V.',
      'yasmine-b': 'Yasmine B.',
      rtbf: 'RTBF Info',
      lesoir: 'Le Soir',
      oxfam: 'Oxfam Belgique',
      habitat: 'Habitat & Humanisme',
    };

    const name = contactNames[id] || `Conversation avec ${id}`;
    const existing = chatGroups.find(g => g.name === name);
    if (existing) {
      setSelectedGroup(existing);
      return;
    }

    const newConv: ChatGroup = {
      id: `new-${Date.now()}`,
      name,
      type: 'private',
      members: ['1', id],
      createdAt: new Date(),
      lastMessageAt: new Date(),
      unreadCount: 0,
    };
    setChatGroups(prev => [newConv, ...prev].slice(0, 20)); // max 20
    setSelectedGroup(newConv);
    toast({ title: 'Conversation créée', description: `Échangez avec ${name}` });
  };

  const handleDelete = (groupId: string) => {
    setChatGroups(prev => prev.filter(g => g.id !== groupId));
    toast({ title: 'Conversation supprimée' });
  };

  const filteredGroups = useMemo(() => {
    return chatGroups
      .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const au = (a.unreadCount || 0) > 0 ? 1 : 0;
        const bu = (b.unreadCount || 0) > 0 ? 1 : 0;
        if (bu !== au) return bu - au;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
  }, [chatGroups, searchQuery]);

  // ─── If a conversation is selected, show it ───
  if (selectedGroup) {
    return <ConversationView group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-4 pt-14 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => { triggerHaptic('light'); setShowNewConversation(true); }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Nouvelle conversation"
        >
          <Edit2 className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* ─── Search ─── */}
      <div className="px-4 pb-2">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63]/40 transition-all"
        />
      </div>

      {/* ─── Conversations List ─── */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
            <Edit2 className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun message</h3>
          <p className="text-sm text-gray-400 mb-4">Commencez une conversation avec un citoyen ou un élu</p>
          <button
            onClick={() => setShowNewConversation(true)}
            className="px-5 py-2.5 bg-[#E91E63] text-white text-sm font-medium rounded-full hover:bg-[#C2185B] active:scale-95 transition-all min-h-[48px]"
          >
            Nouvelle conversation
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {filteredGroups.map(group => (
            <SwipeableItem
              key={group.id}
              group={group}
              onTap={() => setSelectedGroup(group)}
              onDelete={() => handleDelete(group.id)}
            />
          ))}
        </div>
      )}

      <NewConversationDialog
        open={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
};

export default MessagesView;
