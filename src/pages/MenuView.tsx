import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Settings,
  User,
  LogOut,
  Globe,
  Bell,
  Shield,
  Vote,
  Calendar,
  Users,
  ChevronRight,
} from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';

const MenuView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mock engagement level (0-100)
  const engagementLevel = 65;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Menu</h1>
        <p className="text-muted-foreground">Paramètres et informations</p>
      </div>

      {/* User Profile */}
      <Card className="p-6 space-y-4 bg-card border-border shadow-civic">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-legit flex items-center justify-center text-white text-2xl font-bold shadow-civic">
            {user?.displayName.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{user?.displayName}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            {user?.role && <RoleBadge role={user.role} isVerified={user.isVerified} size="md" />}
          </div>
        </div>

        {/* Engagement Gauge */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Engagement citoyen</span>
            <span className="font-semibold text-foreground">{engagementLevel}%</span>
          </div>

          <div className="relative">
            <Progress
              value={engagementLevel}
              className="h-3 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-green-500/20 border border-border/50"
            />
            <div
              className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${engagementLevel}%`,
                background: engagementLevel < 20
                  ? 'linear-gradient(to right, #ef4444, #f97316)'
                  : engagementLevel < 40
                    ? 'linear-gradient(to right, #f97316, #eab308)'
                    : engagementLevel < 60
                      ? 'linear-gradient(to right, #eab308, #84cc16)'
                      : engagementLevel < 80
                        ? 'linear-gradient(to right, #84cc16, #22c55e)'
                        : 'linear-gradient(to right, #22c55e, #16a34a)',
                boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)'
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Peu engagé</span>
            <span>Très engagé</span>
          </div>
        </div>

        <Button variant="outline" className="w-full border-border" onClick={() => navigate('/profile')}>
          <User className="w-4 h-4 mr-2" />
          Modifier mon profil
        </Button>
      </Card>


      {/* Settings */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Paramètres
        </h2>

        <Card className="p-4 space-y-4 bg-card border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="text-foreground">Traduction automatique</Label>
                <p className="text-xs text-muted-foreground">
                  Traduire les publications dans votre langue
                </p>
              </div>
            </div>
            <Switch checked={user?.autoTranslate} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label className="text-foreground">Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Recevoir les alertes importantes
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border cursor-pointer hover:bg-accent/5 -mx-4 px-4 py-2 rounded">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Label className="cursor-pointer text-foreground">Langue préférée</Label>
            </div>
            <Badge variant="outline">{user?.preferredLanguage.toUpperCase()}</Badge>
          </div>
        </Card>
      </div>

      {/* Legal & Ethics */}
      <Card className="p-4 space-y-3 bg-card border-border">
        <button className="w-full flex items-center justify-between text-left hover:bg-accent/5 p-2 rounded -m-2">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Charte Éthique</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button className="w-full flex items-center justify-between text-left hover:bg-accent/5 p-2 rounded -m-2">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Confidentialité</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </Card>

      {/* Logout */}
      <Button
        onClick={logout}
        variant="outline"
        className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Se déconnecter
      </Button>
    </div>
  );
};

export default MenuView;
