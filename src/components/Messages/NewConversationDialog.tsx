import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, Users, MessageSquare, Leaf, Train, Home,
  GraduationCap, Heart, TrendingUp, Building2, User
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import type { LucideIcon } from 'lucide-react';

// Icon lookup map — replaces `import * as Icons` which pulled the entire library (~300KB)
const iconMap: Record<string, LucideIcon> = {
  User,
  Users,
  Building2,
  GraduationCap,
  Leaf,
  Train,
  Home,
  Heart,
  TrendingUp,
};

interface UserData {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface NewConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateConversation: (userId: string, type: 'private' | 'thematic') => void;
}

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({ open, onClose, onCreateConversation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'private' | 'thematic'>('private');

  const users: UserData[] = [
    { id: '2', name: 'Marie Dubois', role: 'Citoyenne', avatar: 'User' },
    { id: '3', name: 'Jean Martin', role: 'Citoyen', avatar: 'User' },
    { id: '4', name: 'Sophie Laurent', role: 'Élue locale', avatar: 'Building2' },
    { id: '5', name: 'Pierre Durand', role: 'Expert', avatar: 'GraduationCap' },
    { id: '6', name: 'Emma Leroy', role: 'Citoyenne', avatar: 'User' },
    { id: '7', name: 'Lucas Bernard', role: 'Militant associatif', avatar: 'Users' },
  ];

  const topics = [
    { id: 'climat', name: 'Climat & Environnement', icon: 'Leaf' },
    { id: 'transport', name: 'Mobilité', icon: 'Train' },
    { id: 'logement', name: 'Logement', icon: 'Home' },
    { id: 'education', name: 'Éducation', icon: 'GraduationCap' },
    { id: 'sante', name: 'Santé', icon: 'Heart' },
    { id: 'economie', name: 'Économie', icon: 'TrendingUp' },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (id: string) => {
    triggerHaptic('medium');
    onCreateConversation(id, selectedType);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nouvelle conversation</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Créez une conversation privée ou rejoignez un groupe thématique
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Selection */}
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'private' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                triggerHaptic('light');
                setSelectedType('private');
              }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Privée
            </Button>
            <Button
              variant={selectedType === 'thematic' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                triggerHaptic('light');
                setSelectedType('thematic');
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Thématique
            </Button>
          </div>

          {selectedType === 'private' ? (
            <>
              {/* Search Users */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input"
                />
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredUsers.map((user) => {
                  const IconComponent = iconMap[user.avatar] || User;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleCreate(user.id)}
                      className="w-full p-4 rounded-xl border border-border hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 text-left flex items-center gap-4 group hover:shadow-md"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {topics.map((topic) => {
                const IconComponent = iconMap[topic.icon] || MessageSquare;
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleCreate(topic.id)}
                    className="w-full p-4 rounded-xl border border-border hover:bg-accent/5 hover:border-primary/30 transition-all duration-300 text-left flex items-center gap-4 group hover:shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground">{topic.name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;
