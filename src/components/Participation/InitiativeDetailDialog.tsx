import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, Users, TrendingUp, ExternalLink, Clock } from 'lucide-react';
import { ParticipationInitiative } from '@/types';
import { triggerHaptic } from '@/utils/haptics';

interface InitiativeDetailDialogProps {
  initiative: ParticipationInitiative | null;
  open: boolean;
  onClose: () => void;
}

const InitiativeDetailDialog: React.FC<InitiativeDetailDialogProps> = ({ initiative, open, onClose }) => {
  if (!initiative) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl">{initiative.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-sm ${
              initiative.isActive 
                ? 'bg-verified-green/10 text-verified-green border-verified-green/20' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {initiative.isActive ? 'En cours' : 'Terminée'}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {initiative.type}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {initiative.description}
            </p>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Localisation</p>
                  <p className="font-medium text-foreground">{initiative.location}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Participants</p>
                  <p className="font-medium text-foreground">{initiative.participantCount}</p>
                </div>
              </div>
            </Card>

            {initiative.budget && (
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-medium text-foreground">{initiative.budget}</p>
                  </div>
                </div>
              </Card>
            )}

            {initiative.endDate && (
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date de fin</p>
                    <p className="font-medium text-foreground">
                      {new Date(initiative.endDate).toLocaleDateString('fr-BE')}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Progress */}
          {initiative.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Avancement</h3>
                <span className="text-sm font-medium text-foreground">{initiative.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${initiative.progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{initiative.status}</p>
            </div>
          )}

          {/* Timeline */}
          {initiative.startDate && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Calendrier</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Du {new Date(initiative.startDate).toLocaleDateString('fr-BE')}
                  {initiative.endDate && ` au ${new Date(initiative.endDate).toLocaleDateString('fr-BE')}`}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={() => triggerHaptic('medium')}
            >
              <Users className="w-4 h-4 mr-2" />
              Participer
            </Button>
            <Button 
              variant="outline"
              onClick={() => triggerHaptic('light')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              En savoir plus
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InitiativeDetailDialog;
