import React from 'react';
import { MessageSquare, Video, Newspaper } from 'lucide-react';

interface EmptyStateProps {
  type: 'feed' | 'messages' | 'video';
}

const config = {
  feed: {
    icon: Newspaper,
    title: 'Aucune publication pour le moment',
    description: 'Suis des hashtags pour voir du contenu !',
  },
  messages: {
    icon: MessageSquare,
    title: 'Aucune conversation',
    description: 'Rejoins un canal ou envoie un message pour commencer',
  },
  video: {
    icon: Video,
    title: 'Aucune vidéo disponible',
    description: 'Reviens bientôt pour découvrir de nouveaux contenus',
  },
};

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const { icon: Icon, title, description } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-[240px]">{description}</p>
    </div>
  );
};

export default EmptyState;
