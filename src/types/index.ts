export type UserRole = 'Citizen' | 'Politician' | 'Institution' | 'Press' | 'SocietyGroup';

export type AgreementLevel = 1 | 2 | 3 | 4 | 5; // 1=Pas d'accord, 2=Pas trop d'accord, 3=Neutre, 4=Un peu d'accord, 5=D'accord

export type PublicationStatus = 'pending' | 'published' | 'archived';

export type Language = 'fr' | 'nl' | 'en';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isVerified: boolean; // For Politicians, Institutions, Press
  avatar?: string;
  bio?: string;
  organization?: string; // Pour institutions, presse, organisations
  preferredLanguage: Language;
  autoTranslate: boolean;
  createdAt: Date;
}

export interface Publication {
  id: string;
  authorId: string;
  author: User;
  content: {
    fr?: string;
    nl?: string;
    en?: string;
  };
  media?: string[]; // URLs to images/infographics (no videos here)
  hashtags: string[]; // Trending topics
  type: 'interpellation' | 'announcement' | 'discussion' | 'poll' | 'statistic';
  status: PublicationStatus;
  supportGoal: number;
  supportCount: number;
  reactions: Record<AgreementLevel, number>;
  hasSource?: boolean; // Pour les statistiques
  sourceUrl?: string; // URL de la source pour statistiques
  warningType?: 'hate-speech' | 'missing-source' | null;
  createdAt: Date;
  relayedAt?: Date;
  officialResponse?: OfficialResponse;
  isPinned?: boolean;
  // Threading
  parentId?: string;
  replyIds?: string[];
  // Interpellations (political posts only)
  interpellations?: Interpellation[];
}

export interface OfficialResponse {
  politicianId: string;
  politician: User;
  content: {
    fr?: string;
    nl?: string;
    en?: string;
  };
  videoUrl?: string;
  createdAt: Date;
}

export interface VideoPost {
  id: string;
  authorId: string;
  author: User;
  title: {
    fr?: string;
    nl?: string;
    en?: string;
  };
  description: {
    fr?: string;
    nl?: string;
    en?: string;
  };
  videoUrl: string;
  thumbnail: string;
  topic: string;
  approvalCount: number;
  requiredApprovals: number;
  isApproved: boolean;
  createdAt: Date;
}

export interface ChatGroup {
  id: string;
  name: string;
  type: 'private' | 'community' | 'thematic';
  topic?: string;
  members: string[]; // User IDs
  createdAt: Date;
  lastMessageAt: Date;
  unreadCount?: number;
}

export interface Message {
  id: string;
  groupId: string;
  senderId: string;
  sender: User;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface MatchmakingSession {
  id: string;
  topic: string;
  participants: [string, string]; // Two user IDs
  duration: number; // in minutes
  startedAt: Date;
  endsAt: Date;
  isAnonymous: boolean;
  settings: {
    blurFace: boolean;
    modifyVoice: boolean;
  };
  recordingId?: string; // For moderation if reported
  status: 'active' | 'completed' | 'reported';
}

export interface CivicTechModule {
  id: string;
  name: {
    fr: string;
    nl: string;
    en: string;
  };
  description: {
    fr: string;
    nl: string;
    en: string;
  };
  type: 'direct_democracy' | 'participatory_budget' | 'citizen_assembly' | 'referendum';
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  participantCount: number;
}

export interface ParticipationInitiative {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  participantCount: number;
  budget?: string;
  progress?: number;
  status?: string;
}

export interface Interpellation {
  id: string;
  citizenId: string;
  citizen: User;
  content: string;
  supportCount: number;
  commentCount: number;
  createdAt: Date;
  politicianReply?: {
    content: string;
    createdAt: Date;
  };
}
