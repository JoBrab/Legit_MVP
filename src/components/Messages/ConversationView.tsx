import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Paperclip, Smile, MoreVertical, Users } from 'lucide-react';
import { ChatGroup, Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { triggerHaptic } from '@/utils/haptics';

interface ConversationViewProps {
  group: ChatGroup;
  onBack: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ group, onBack }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      groupId: group.id,
      senderId: group.members[1] || '2',
      sender: {
        id: group.members[1] || '2',
        email: 'member@email.be',
        displayName: group.type === 'private' ? 'Marie D.' : 'Jean Politique',
        role: 'Citizen',
        isVerified: false,
        preferredLanguage: 'fr',
        autoTranslate: false,
        createdAt: new Date(),
      },
      content: group.type === 'thematic' 
        ? 'Bonjour à tous ! Que pensez-vous de la nouvelle proposition sur le climat ?'
        : group.type === 'community'
        ? 'Bienvenue dans la discussion communautaire de Bruxelles !'
        : 'Salut ! Merci pour ton message sur la mobilité.',
      createdAt: new Date(Date.now() - 7200000),
      isRead: true,
    },
    {
      id: '2',
      groupId: group.id,
      senderId: user?.id || '1',
      sender: user || {
        id: '1',
        email: 'user@email.be',
        displayName: 'Vous',
        role: 'Citizen',
        isVerified: false,
        preferredLanguage: 'fr',
        autoTranslate: false,
        createdAt: new Date(),
      },
      content: group.type === 'thematic'
        ? 'Je pense que c\'est une excellente initiative. Il faut agir rapidement.'
        : group.type === 'community'
        ? 'Merci ! Content de rejoindre cette communauté.'
        : 'Oui, je crois vraiment qu\'on doit améliorer les transports en commun.',
      createdAt: new Date(Date.now() - 3600000),
      isRead: true,
    },
    {
      id: '3',
      groupId: group.id,
      senderId: group.members[2] || '3',
      sender: {
        id: group.members[2] || '3',
        email: 'member2@email.be',
        displayName: group.type === 'private' ? 'Marie D.' : 'Sophie Martin',
        role: 'Citizen',
        isVerified: false,
        preferredLanguage: 'fr',
        autoTranslate: false,
        createdAt: new Date(),
      },
      content: group.type === 'thematic'
        ? 'Tout à fait d\'accord ! Les statistiques montrent que c\'est urgent.'
        : group.type === 'community'
        ? 'Y a-t-il des événements prévus prochainement ?'
        : 'On devrait organiser une pétition collective.',
      createdAt: new Date(Date.now() - 1800000),
      isRead: true,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    triggerHaptic('medium');

    const message: Message = {
      id: Date.now().toString(),
      groupId: group.id,
      senderId: user?.id || '1',
      sender: user || {
        id: '1',
        email: 'user@email.be',
        displayName: 'Vous',
        role: 'Citizen',
        isVerified: false,
        preferredLanguage: 'fr',
        autoTranslate: false,
        createdAt: new Date(),
      },
      content: newMessage,
      createdAt: new Date(),
      isRead: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getGroupIcon = () => {
    switch (group.type) {
      case 'thematic':
        return '💬';
      case 'community':
        return '🏛️';
      default:
        return '👤';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-card border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            triggerHaptic('light');
            onBack();
          }}
          className="hover:bg-accent"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="text-3xl">{getGroupIcon()}</div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">{group.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{group.members.length} membres</span>
            {group.topic && (
              <>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {group.topic}
                </Badge>
              </>
            )}
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-accent"
          onClick={() => triggerHaptic('light')}
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/10">
        {messages.map((message, index) => {
          const isOwn = message.senderId === (user?.id || '1');
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {!isOwn && (
                  <p className="text-xs text-muted-foreground mb-1 px-3 font-medium">
                    {message.sender.displayName}
                  </p>
                )}
                <div
                  className={`p-3 rounded-2xl shadow-sm transition-all hover:shadow-md ${
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card border border-border rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1.5 ${
                      isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString('fr-BE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border shadow-lg">
        <div className="flex items-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent hover:scale-110 transition-transform active:scale-95 flex-shrink-0"
            onClick={() => triggerHaptic('light')}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>

          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Écrivez un message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10 bg-background border-input rounded-full focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-accent hover:scale-110 transition-transform active:scale-95 rounded-full"
              onClick={() => triggerHaptic('light')}
            >
              <Smile className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary-hover text-primary-foreground flex-shrink-0 rounded-full w-12 h-12 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;