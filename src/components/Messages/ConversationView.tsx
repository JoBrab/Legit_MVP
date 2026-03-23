import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { ChatGroup, Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { triggerHaptic } from '@/utils/haptics';
import { cn } from '@/lib/utils';

interface ConversationViewProps {
  group: ChatGroup;
  onBack: () => void;
}

// ─── Role config ───
const roleConfig: Record<string, { label: string; bg: string; text: string }> = {
  Politician: { label: 'Politique', bg: 'bg-blue-100', text: 'text-blue-700' },
  Citizen: { label: 'Citoyen', bg: 'bg-[hsl(330,85%,93%)]', text: 'text-[hsl(330,85%,40%)]' },
  Press: { label: 'Média', bg: 'bg-orange-100', text: 'text-orange-700' },
  SocietyGroup: { label: 'Société civile', bg: 'bg-violet-100', text: 'text-violet-700' },
  Institution: { label: 'Institution', bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

// ─── Mock messages per group ───
function getMockMessages(group: ChatGroup, userId: string): Message[] {
  const otherRole = group.name.includes('Bouchez') || group.name.includes('Martin') ? 'Politician' : 'Citizen';
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
      { content: 'Merci pour le partage, je regarde ça...', isOwn: false, offset: 86400000 * 0.5 },
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

// ─── Check if two dates are in the same 5-min group ───
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

  const otherRole = group.name.includes('Bouchez') || group.name.includes('Martin') ? 'Politician' : 'Citizen';
  const roleCfg = roleConfig[otherRole] || roleConfig.Citizen;
  const isActive = group.name.includes('Bouchez') || group.name.includes('Sophie');

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 500); // 500 char limit
    setNewMessage(val);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 80) + 'px'; // max 3 lines
    }
  }, []);

  const handleSend = useCallback(() => {
    const text = newMessage.trim();
    if (!text) return;
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

    setMessages(prev => [...prev.slice(-49), msg]); // keep max 50
    setNewMessage('');
    setSendingId(id);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Simulate send complete
    setTimeout(() => setSendingId(null), 600);
  }, [newMessage, userId, group.id, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* ─── Fixed Header ─── */}
      <div className="flex items-center gap-3 px-3 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => { triggerHaptic('light'); onBack(); }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors min-w-[48px] min-h-[48px]"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
            {group.name.charAt(0)}
          </div>
          {isActive && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-[15px] text-gray-900 truncate">{group.name}</h2>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', roleCfg.bg, roleCfg.text)}>
              {roleCfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {isActive ? 'En ligne' : 'Vu récemment'}
          </p>
        </div>
      </div>

      {/* ─── Messages Area ─── */}
      <div className="flex-1 overflow-y-auto px-3 py-4" style={{ backgroundColor: '#F8F8F8' }}>
        {messages.map((msg, i) => {
          const isOwn = msg.senderId === userId;
          const prev = messages[i - 1];
          const showTimestamp = !prev || !sameTimeGroup(new Date(prev.createdAt), new Date(msg.createdAt));
          const isSending = msg.id === sendingId;

          return (
            <React.Fragment key={msg.id}>
              {showTimestamp && (
                <div className="text-center my-3">
                  <span className="text-[11px] text-gray-400">
                    {new Date(msg.createdAt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              <div className={cn('flex mb-1.5', isOwn ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] px-3.5 py-2.5 text-[14px] leading-relaxed transition-opacity duration-500',
                    isOwn
                      ? 'bg-[#E91E63] text-white rounded-[18px] rounded-br-[4px]'
                      : 'bg-white text-[#1a1a1a] rounded-[18px] rounded-bl-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
                    isSending && 'opacity-60'
                  )}
                >
                  {msg.content}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Input Area ─── */}
      <div
        className="flex items-end gap-2 px-3 py-2.5 bg-white border-t border-gray-100 flex-shrink-0"
        style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Votre message..."
            maxLength={500}
            rows={1}
            className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E91E63]/20 focus:border-[#E91E63]/40 transition-all min-h-[48px]"
            style={{ maxHeight: '80px' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E91E63] text-white flex items-center justify-center transition-all hover:bg-[#C2185B] active:scale-95 disabled:opacity-40 disabled:hover:bg-[#E91E63] disabled:active:scale-100"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ConversationView;