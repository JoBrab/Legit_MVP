import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Send, Clock } from 'lucide-react';
import { ChatGroup, Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { triggerHaptic } from '@/utils/haptics';
import { cn } from '@/lib/utils';

interface ConversationViewProps {
  group: ChatGroup;
  onBack: () => void;
}

// ─── Role config ───
const roleConfig: Record<string, { label: string; badgeStyle: string; avatarStyle: string }> = {
  Politician: { label: 'Politique', badgeStyle: 'bg-[#5400a8]/10 text-[#5400a8]', avatarStyle: 'bg-[#E91E63] text-white' },
  Citizen: { label: 'Citoyen', badgeStyle: 'bg-gray-100 text-gray-600', avatarStyle: 'bg-gray-200 text-gray-600' },
  Press: { label: 'Média', badgeStyle: 'bg-[#1E88E5]/10 text-[#1E88E5]', avatarStyle: 'bg-[#1E88E5] text-white' },
  SocietyGroup: { label: 'Société civile', badgeStyle: 'bg-gray-100 text-gray-600', avatarStyle: 'bg-gray-300 text-gray-700' },
  Institution: { label: 'Institution', badgeStyle: 'bg-[#43A047]/10 text-[#43A047]', avatarStyle: 'bg-[#43A047] text-white' },
};

function getMockMessages(group: ChatGroup, userId: string): Message[] {
  // same mock logic as before but mapped to 5 mins spacing to show timestamps
  const otherRole = group.name.includes('Bouchez') || group.name.includes('Martin') || group.name.includes('Sophie') ? 'Politician' : 'Citizen';
  const other = {
    id: group.members[1] || '2',
    email: 'other@legit.be',
    displayName: group.name,
    role: otherRole as any,
    isVerified: otherRole === 'Politician',
    preferredLanguage: 'fr' as const,
    autoTranslate: false,
    createdAt: new Date(),
  };
  const me = {
    id: userId,
    email: 'me@legit.be',
    displayName: 'Vous',
    role: 'Citizen' as const,
    isVerified: false,
    preferredLanguage: 'fr' as const,
    autoTranslate: false,
    createdAt: new Date(),
  };

  const now = Date.now();
  const conversations: Record<string, { content: string; isOwn: boolean; offset: number }[]> = {
    '4': [
      { content: 'Bonjour ! J\'ai vu votre publication sur la mobilité.', isOwn: false, offset: 7200000 },
      { content: 'Oui, je pense que Bruxelles a besoin d\'un vrai plan vélo.', isOwn: true, offset: 7000000 },
      { content: 'Tout à fait. Le réseau cyclable est trop morcelé.', isOwn: false, offset: 3600000 },
      { content: 'On devrait organiser une pétition !', isOwn: true, offset: 3500000 },
      { content: 'Merci pour le partage, je regarde ça...', isOwn: false, offset: 100000 }, // Recent
    ],
    '9': [
      { content: 'Monsieur Bouchez, votre position sur le budget est-elle définitive ?', isOwn: true, offset: 86400000 },
      { content: 'Notre plan budgétaire protège les classes moyennes. Les chiffres parlent.', isOwn: false, offset: 80000000 },
      { content: 'Les associations de terrain observent pourtant un impact négatif.', isOwn: true, offset: 72000000 },
      { content: 'Nous avons des mesures compensatoires prévues au T2.', isOwn: false, offset: 3600000 },
      { content: 'Bonjour, je voulais savoir quand aura lieu la table ronde ?', isOwn: true, offset: 1800000 },
    ],
    default: [
      { content: 'Salut ! Comment vas-tu ?', isOwn: false, offset: 7200000 },
      { content: 'Très bien merci ! Tu as vu la dernière actu ?', isOwn: true, offset: 5400000 },
      { content: 'Oui, c\'est intéressant. On en reparle ?', isOwn: false, offset: 3600000 },
    ],
  };

  const thread = conversations[group.id] || conversations.default;
  return thread.map((msg, i) => ({
    id: `${group.id}-${i}`,
    groupId: group.id,
    senderId: msg.isOwn ? userId : other.id,
    sender: msg.isOwn ? me : other,
    content: msg.content,
    createdAt: new Date(now - msg.offset),
    isRead: true,
  }));
}

function sameTimeGroup(a: Date, b: Date): boolean {
  return Math.abs(a.getTime() - b.getTime()) < 5 * 60 * 1000;
}

const ConversationView: React.FC<ConversationViewProps> = ({ group, onBack }) => {
  const { user } = useAuth();
  const userId = user?.id || '1';
  const [messages, setMessages] = useState<Message[]>(() => getMockMessages(group, userId));
  const [newMessage, setNewMessage] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const otherRole = group.name.includes('Bouchez') || group.name.includes('Martin') || group.name.includes('Sophie') ? 'Politician' : 'Citizen';
  const roleCfg = roleConfig[otherRole] || roleConfig.Citizen;
  const isActive = group.name.includes('Bouchez') || group.name.includes('Sophie');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sendingId]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 500) {
      setNewMessage(val);
      const ta = textareaRef.current;
      if (ta) {
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 80) + 'px'; // up to ~3 lines
      }
    }
  }, []);

  const handleSend = useCallback(() => {
    const text = newMessage.trim();
    if (!text || text.length > 500) return;
    triggerHaptic('medium');

    const id = Date.now().toString();
    const msg: Message = {
      id,
      groupId: group.id,
      senderId: userId,
      sender: user || {
        id: userId, email: 'me@legit.be', displayName: 'Vous',
        role: 'Citizen', isVerified: false, preferredLanguage: 'fr',
        autoTranslate: false, createdAt: new Date(),
      },
      content: text,
      createdAt: new Date(),
      isRead: false,
    };

    setMessages(prev => [...prev.slice(-49), msg]); // Keep max 50
    setNewMessage('');
    setSendingId(id);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setTimeout(() => {
      setSendingId(null);
    }, 400); // exactly 400ms simulating send
  }, [newMessage, userId, group.id, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] fixed inset-0 z-50 bg-[#F5F5F7] w-full" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* ─── Fixed Header ─── */}
      <div 
        className="flex items-center gap-3 px-[16px] h-[56px] bg-white flex-shrink-0 w-full"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <button
          onClick={() => { triggerHaptic('light'); onBack(); }}
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        <div className="relative flex-shrink-0">
          <div className={cn('w-[36px] h-[36px] rounded-full flex items-center justify-center text-sm font-semibold', roleCfg.avatarStyle)}>
            {group.name.charAt(0)}
          </div>
          {isActive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] bg-[#43A047] rounded-full border-[2px] border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-gray-900 truncate">{group.name}</h2>
          </div>
          <span className={cn('text-[10px] font-medium leading-[14px] px-1.5 py-[1px] mt-[1px] w-fit rounded-full', roleCfg.badgeStyle)}>
            {roleCfg.label}
          </span>
        </div>
      </div>

      {/* ─── Messages Area ─── */}
      <div className="flex-1 overflow-y-auto w-full" style={{ backgroundColor: '#F5F5F7', padding: '16px' }}>
        {messages.map((msg, i) => {
          const isOwn = msg.senderId === userId;
          const prev = messages[i - 1];
          const showTimestamp = !prev || !sameTimeGroup(new Date(prev.createdAt), new Date(msg.createdAt));
          const isSending = msg.id === sendingId;

          return (
            <React.Fragment key={msg.id}>
              {showTimestamp && (
                <div className="flex justify-center w-full my-4">
                  <span className="text-xs text-gray-400 font-medium tracking-wide">
                    {new Date(msg.createdAt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              <div className={cn('flex mb-2', isOwn ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] px-[14px] py-[10px] text-[15px] leading-relaxed transition-opacity duration-[400ms] relative',
                    isOwn
                      ? 'text-white'
                      : 'bg-white text-[#1a1a1a]',
                    isSending ? 'opacity-60' : 'opacity-100'
                  )}
                  style={{
                    borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    ...(isOwn 
                      ? { backgroundImage: 'linear-gradient(90deg, #b80050, #5400a8)' }
                      : { boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }
                    )
                  }}
                >
                  {msg.content}
                  {isSending && (
                    <Clock className="w-3 h-3 text-white/70 absolute bottom-1 right-2" />
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* ─── Input Area ─── */}
      <div
        className="flex flex-col bg-white flex-shrink-0 w-full"
        style={{ 
          borderTop: '1px solid rgba(0,0,0,0.06)', 
          paddingBottom: 'env(safe-area-inset-bottom)',
          backgroundColor: '#FFFFFF'
        }}
      >
        {newMessage.length > 400 && (
          <div className="px-4 pt-1 flex justify-end">
            <span className={cn('text-[11px] font-medium', newMessage.length >= 500 ? 'text-red-500' : 'text-gray-400')}>
              {newMessage.length} / 500
            </span>
          </div>
        )}
        <div className="flex items-end gap-2 px-[16px] py-[8px]">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Votre message"
              maxLength={500}
              rows={1}
              className="w-full resize-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none block leading-relaxed"
              style={{ 
                maxHeight: '80px',
                minHeight: '40px',
                padding: '10px 16px',
                borderRadius: '20px',
                backgroundColor: '#F5F5F7'
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="flex-shrink-0 w-[36px] h-[36px] rounded-full text-white flex items-center justify-center transition-opacity disabled:opacity-40 disabled:bg-gray-300 mb-0.5 active:scale-95"
            style={{ 
              backgroundImage: newMessage.trim() ? 'linear-gradient(90deg, #b80050, #5400a8)' : 'none',
              backgroundColor: newMessage.trim() ? 'transparent' : '#e5e7eb'
            }}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;