import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, MapPin, Edit2, MessageSquare, UserPlus, UserMinus, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import RoleBadge from '@/components/ui/RoleBadge';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProfileUser {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  location?: string;
  bio?: string;
  publicationsCount: number;
  followersCount: number;
  followingCount: number;
  engagementLevel: number;
  followedTopics: string[];
  recentPosts: { id: string; title: string; date: Date; thumbnail?: string }[];
}

const mockOwnProfile: ProfileUser = {
  id: '1',
  displayName: 'Utilisateur Legit',
  email: 'demo@legit.be',
  role: 'Citizen',
  isVerified: false,
  location: 'Bruxelles, Ixelles',
  bio: 'Citoyen engagé pour une démocratie plus transparente et participative.',
  publicationsCount: 12,
  followersCount: 248,
  followingCount: 56,
  engagementLevel: 65,
  followedTopics: ['Budget', 'Mobilité', 'Climat', 'Logement', 'Santé', 'Éducation'],
  recentPosts: [
    { id: '1', title: 'Les transports en commun à Bruxelles doivent être repensés...', date: new Date(Date.now() - 86400000 * 2) },
    { id: '2', title: 'Budget participatif 2025 : mes propositions pour Ixelles', date: new Date(Date.now() - 86400000 * 5) },
    { id: '3', title: 'Réunion citoyenne ce samedi au parc du Cinquantenaire', date: new Date(Date.now() - 86400000 * 8) },
    { id: '4', title: 'La qualité de l\'air s\'améliore dans le quartier européen', date: new Date(Date.now() - 86400000 * 12) },
    { id: '5', title: 'Pétition pour plus de pistes cyclables sécurisées', date: new Date(Date.now() - 86400000 * 15) },
  ],
};

const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  // For now, always show own profile. Later: check URL param for other user
  const isOwnProfile = true;
  const profile = mockOwnProfile;

  const initials = profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Retour" className="min-w-[44px] min-h-[44px]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg flex-1 truncate">{profile.displayName}</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Options" className="min-w-[44px] min-h-[44px]">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Signaler</DropdownMenuItem>
              <DropdownMenuItem>Bloquer</DropdownMenuItem>
              <DropdownMenuItem>Partager le profil</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
        {/* Identity Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">{profile.displayName}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>

          <RoleBadge role={profile.role} isVerified={profile.isVerified} size="md" />

          {profile.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.bio && (
            <p className="text-sm text-muted-foreground max-w-sm">{profile.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Publications', value: profile.publicationsCount },
            { label: 'Abonnés', value: profile.followersCount },
            { label: 'Abonnements', value: profile.followingCount },
          ].map((stat) => (
            <Card key={stat.label} className="p-3 text-center bg-card border-border">
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-normal">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        {isOwnProfile ? (
          <Button
            variant="outline"
            className="w-full min-h-[44px] border-border"
            onClick={() => navigate('/profile/edit')}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier mon profil
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              className={`flex-1 min-h-[44px] ${isFollowing ? 'bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive' : 'bg-primary text-primary-foreground hover:bg-primary-hover'}`}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? <UserMinus className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              {isFollowing ? 'Ne plus suivre' : 'Suivre'}
            </Button>
            <Button variant="outline" className="flex-1 min-h-[44px] border-border">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        )}

        {/* Engagement */}
        <Card className="p-4 space-y-3 bg-card border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">Engagement citoyen</span>
            <span className="font-bold text-foreground">{profile.engagementLevel}%</span>
          </div>
          <div className="relative">
            <Progress value={profile.engagementLevel} className="h-3 bg-muted" />
            <div
              className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${profile.engagementLevel}%`,
                background:
                  profile.engagementLevel < 40
                    ? 'linear-gradient(to right, hsl(var(--destructive)), hsl(30 80% 55%))'
                    : profile.engagementLevel < 70
                    ? 'linear-gradient(to right, hsl(45 90% 50%), hsl(80 60% 50%))'
                    : 'linear-gradient(to right, hsl(120 60% 50%), hsl(140 70% 40%))',
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Citoyen peu actif</span>
            <span>Citoyen très actif</span>
          </div>
        </Card>

        {/* Followed Topics */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground">🏷️ Sujets suivis</h3>
          <div className="flex flex-wrap gap-2">
            {profile.followedTopics.map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                className="text-xs px-3 py-1 h-7 border-primary/20 bg-primary/5 text-primary cursor-pointer hover:bg-primary/10 transition-colors"
              >
                #{topic}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recent Publications */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground">📝 Publications récentes</h3>
          <div className="space-y-2">
            {profile.recentPosts.map((post) => (
              <Card key={post.id} className="p-3 bg-card border-border hover:border-primary/30 cursor-pointer transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Image className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground font-normal">{formatDate(post.date)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
