import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Edit2 } from 'lucide-react';
import { ChatGroup } from '@/types';
import ConversationView from '@/components/Messages/ConversationView';
import NewConversationDialog from '@/components/Messages/NewConversationDialog';
import { triggerHaptic } from '@/utils/haptics';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Role config ───
const roleConfig: Record<string, { label: string; badgeStyle: string; avatarStyle: string }> = {
  Politician: { label: 'Politique', badgeStyle: 'bg-[#5400a8]/10 text-[#5400a8]', avatarStyle: 'bg-[#E91E63] text-white' },
  Citizen: { label: 'Citoyen', badgeStyle: 'bg-gray-100 text-gray-600', avatarStyle: 'bg-gray-200 text-gray-600' },
  Press: { label: 'Média', badgeStyle: 'bg-[#1E88E5]/10 text-[#1E88E5]', avatarStyle: 'bg-[#1E88E5] text-white' },
  SocietyGroup: { label: 'Société civile', badgeStyle: 'bg-gray-100 text-gray-600', avatarStyle: 'bg-gray-300 text-gray-700' },
  Institution: { label: 'Institution', badgeStyle: 'bg-[#43A047]/10 text-[#43A047]', avatarStyle: 'bg-[#43A047] text-white' },
};

const lastMessagePreviews: Record<string, string> = {
  '4': 'Sophie: Merci pour le partage, je regarde ça...',
  '6': 'Jean: On se retrouve à la réunion demain ?',
  '9': 'Vous: Bonjour, je voulais savoir...',
  '10': 'Amina: Les résultats du sondage sont là !',
  '11': 'Pierre: Merci pour ton aide hier',
};

const getRoleForName = (name: string): string => {
  if (['Georges-Louis Bouchez', 'Jean Martin', 'Paul Magnette', 'Sophie Laurent'].includes(name)) return 'Politician';
  if (['RTBF Info', 'Le Soir'].includes(name)) return 'Press';
  if (['Oxfam Belgique', 'Habitat & Humanisme'].includes(name)) return 'SocietyGroup';
  return 'Citizen';
};

const formatTimestamp = (date: Date): string => {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}min`;
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
    <div className="relative overflow-hidden" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      {/* Delete action behind */}
      <div
        className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-center text-white font-medium text-sm z-0"
        style={{ width: '80px' }}
      >
        <button onClick={handleDelete} className="w-full h-full flex items-center justify-center">
          Supprimer
        </button>
      </div>

      {/* Sliding content */}
      <div
        ref={containerRef}
        className="relative bg-white transition-transform z-10 w-full"
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          transition: swiping ? 'none' : 'transform 0.25s ease-out',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => { if (swipeOffset === 0) { triggerHaptic('light'); onTap(); } else setSwipeOffset(0); }}
      >
        <div className="flex items-center px-[16px] min-h-[72px] w-full gap-3 py-2 cursor-pointer active:bg-gray-50">
          {/* Avatar and Role */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 w-[44px]">
            <div className="relative mb-1">
              <div className={cn('w-[44px] h-[44px] rounded-full flex items-center justify-center text-lg font-semibold', cfg.avatarStyle)}>
                {group.name.charAt(0)}
              </div>
              {hasUnread && (
                <div className="absolute top-0 right-0 -mr-1 -mt-1 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold px-1 border-2 border-white">
                  {group.unreadCount}
                </div>
              )}
            </div>
            <span className={cn('text-[10px] whitespace-nowrap px-1.5 py-[1px] leading-tight rounded-full font-medium', cfg.badgeStyle)}>
              {cfg.label}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center align-middle h-full py-1">
            <div className="flex justify-between items-baseline mb-0.5">
              <span className={cn('text-sm truncate mr-2', hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900')}>
                {group.name}
              </span>
              <span className={cn('text-xs flex-shrink-0', hasUnread ? 'text-[#E91E63] font-semibold' : 'text-gray-500')}>
                {formatTimestamp(new Date(group.lastMessageAt))}
              </span>
            </div>
            <p className={cn('text-xs line-clamp-1', hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500')}>
              {preview}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main MessagesView ───
const MessagesView: React.FC = () => {
  const { toast } = useToast();
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
  };

  const handleDelete = (groupId: string) => {
    setChatGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const sortedGroups = useMemo(() => {
    return [...chatGroups].sort((a, b) => {
      const au = (a.unreadCount || 0) > 0 ? 1 : 0;
      const bu = (b.unreadCount || 0) > 0 ? 1 : 0;
      if (bu !== au) return bu - au;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  }, [chatGroups]);

  // ─── If a conversation is selected, show it ───
  if (selectedGroup) {
    return <ConversationView group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
  }

  return (
    <div className="min-h-screen bg-white pb-20 pt-[env(safe-area-inset-top)] w-full">
      {/* ─── Header ─── */}
      <div 
        className="flex items-center justify-between px-[16px] h-[56px] bg-white sticky top-0 z-20 w-full"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        <button
          onClick={() => { triggerHaptic('light'); setShowNewConversation(true); }}
          className="w-10 h-10 flex items-center justify-end active:scale-95 transition-transform"
          aria-label="Nouvelle conversation"
        >
          <div className="w-8 h-8 rounded-full bg-[#E91E63]/10 flex items-center justify-center text-[#E91E63]">
            <Edit2 className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* ─── Conversations List ─── */}
      <div className="flex flex-col w-full">
        {sortedGroups.map(group => (
          <SwipeableItem
            key={group.id}
            group={group}
            onTap={() => setSelectedGroup(group)}
            onDelete={() => handleDelete(group.id)}
          />
        ))}
      </div>

      <NewConversationDialog
        open={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
};

export default MessagesView;
