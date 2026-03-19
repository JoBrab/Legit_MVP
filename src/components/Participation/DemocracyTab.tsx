import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vote, ChevronRight, Sparkles, UserPlus, Check, Users, EyeOff, Mic } from 'lucide-react';
import { ParticipationInitiative } from '@/types';
import { triggerHaptic } from '@/utils/haptics';
import InitiativeDetailDialog from '@/components/Participation/InitiativeDetailDialog';
import RoleBadge from '@/components/ui/RoleBadge';
import { Checkbox } from '@/components/ui/checkbox';

const civicModules: ParticipationInitiative[] = [
  {
    id: '1', name: 'Budget participatif CQD Jacquet',
    description: 'Décidez ensemble des projets pour améliorer votre quartier',
    type: 'Budget participatif', location: 'Koekelberg', isActive: true,
    startDate: new Date('2025-01-15'), endDate: new Date('2025-06-30'),
    participantCount: 247, budget: '150 000€', progress: 45,
    status: 'En cours - Phase de vote',
  },
  {
    id: '2', name: 'Commissions délibératives régionales',
    description: 'Panels citoyens pour co-construire les politiques publiques',
    type: 'Panel citoyen', location: 'Région Bruxelles-Capitale', isActive: true,
    startDate: new Date('2024-09-01'), endDate: new Date('2025-12-31'),
    participantCount: 180, progress: 62, status: 'En cours - Délibération',
  },
  {
    id: '3', name: 'Budget de participation CQD Bizet',
    description: "Proposez et votez pour des projets d'aménagement",
    type: 'Budget participatif', location: 'Anderlecht', isActive: true,
    startDate: new Date('2023-11-01'), endDate: new Date('2025-10-31'),
    participantCount: 312, budget: '200 000€', progress: 78,
    status: 'En cours - Réalisation',
  },
  {
    id: '4', name: 'Vision Schaerbeek Formation',
    description: 'Participez à la définition du futur du site stratégique',
    type: 'Consultation publique', location: 'Schaerbeek (Haren)', isActive: true,
    startDate: new Date('2023-06-01'), participantCount: 453, progress: 55,
    status: 'En cours - Consultation',
  },
  {
    id: '5', name: 'Open Jury Bockstael',
    description: 'Panel citoyen pour le réaménagement du Boulevard Bockstael',
    type: 'Panel citoyen', location: 'Ville de Bruxelles', isActive: false,
    startDate: new Date('2023-03-15'), endDate: new Date('2023-09-30'),
    participantCount: 42, progress: 100, status: 'Terminée',
  },
];

const recommendations = [
  {
    id: 'r1', type: 'channel' as const,
    label: 'Ce canal correspond à vos intérêts',
    name: '#Logement Abordable', description: '678 membres • Actif',
    action: 'Rejoindre',
  },
  {
    id: 'r2', type: 'politician' as const,
    label: 'Cet élu représente votre commune',
    name: 'Rajae Maouane', description: 'Ecolo • Ixelles',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    action: 'Suivre',
  },
  {
    id: 'r3', type: 'society' as const,
    label: 'Cette asso agit sur vos sujets',
    name: 'GRACQ Cyclistes', description: 'Mobilité douce • 1.2k membres',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face',
    action: 'Suivre',
  },
];

const matchmakingTopics = [
  { id: 'sante', label: '🏥 Santé', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'economie', label: '💰 Économie', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'logement', label: '🏠 Logement', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'mobilite', label: '🚲 Mobilité', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'climat', label: '🌿 Climat', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'education', label: '📚 Éducation', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

const DemocracyTab: React.FC = () => {
  const [selectedInitiative, setSelectedInitiative] = useState<ParticipationInitiative | null>(null);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [duration, setDuration] = useState<15 | 30>(15);
  const [blurFace, setBlurFace] = useState(false);
  const [modifyVoice, setModifyVoice] = useState(false);

  const toggleJoin = (id: string) => {
    triggerHaptic('light');
    setJoined(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleStartMatchmaking = () => {
    if (!selectedTopic) return;
    triggerHaptic('medium');
    // TODO: connect to backend
  };

  return (
    <div className="space-y-6">
      {/* Matchmaking Délibératif */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Matchmaking Délibératif
        </h2>
        <Card className="p-4 bg-card border-border space-y-4">
          <p className="text-xs text-muted-foreground">
            Sélectionnez un sujet pour être mis en relation avec un autre citoyen et débattre ensemble.
          </p>

          {/* Topics */}
          <div className="flex flex-wrap gap-2">
            {matchmakingTopics.map(topic => (
              <button
                key={topic.id}
                onClick={() => { triggerHaptic('light'); setSelectedTopic(topic.id === selectedTopic ? null : topic.id); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 min-h-[36px] ${
                  selectedTopic === topic.id
                    ? 'ring-2 ring-primary ring-offset-1 ' + topic.color
                    : topic.color + ' opacity-70 hover:opacity-100'
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-foreground">Durée</p>
            <div className="flex gap-2">
              {([15, 30] as const).map(d => (
                <button
                  key={d}
                  onClick={() => { triggerHaptic('light'); setDuration(d); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all duration-200 min-h-[44px] ${
                    duration === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/40'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Privacy options */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">Anonymat</p>
            <label className="flex items-center gap-2.5 min-h-[44px] cursor-pointer">
              <Checkbox checked={blurFace} onCheckedChange={(v) => setBlurFace(!!v)} />
              <EyeOff className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Flouter mon visage</span>
            </label>
            <label className="flex items-center gap-2.5 min-h-[44px] cursor-pointer">
              <Checkbox checked={modifyVoice} onCheckedChange={(v) => setModifyVoice(!!v)} />
              <Mic className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Modifier ma voix</span>
            </label>
          </div>

          {/* Start button */}
          <Button
            className="w-full min-h-[44px] bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!selectedTopic}
            onClick={handleStartMatchmaking}
          >
            Trouver un interlocuteur
          </Button>
        </Card>
      </div>

      {/* Separator */}
      <div className="h-px bg-border" />

      {/* Democracy Initiatives */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Vote className="w-5 h-5 text-primary" />
          Démocratie Participative
        </h2>

        {civicModules.map(module => (
          <Card
            key={module.id}
            onClick={() => { triggerHaptic('light'); setSelectedInitiative(module); }}
            className="p-3 cursor-pointer hover:bg-accent/5 transition-all duration-200 bg-card border-border hover:border-primary/30 group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground text-sm truncate">{module.name}</h3>
                  <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${
                    module.isActive
                      ? 'bg-verified-green/10 text-verified-green border-verified-green/20'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {module.isActive ? 'En cours' : 'Terminée'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{module.location}</span>
                  <span>•</span>
                  <span className="flex-shrink-0">{module.participantCount} participants</span>
                  {module.budget && <><span>•</span><span className="flex-shrink-0">{module.budget}</span></>}
                </div>
                {module.progress !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${module.progress}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground flex-shrink-0">{module.progress}%</span>
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        ))}
      </div>

      {/* Separator */}
      <div className="h-px bg-border" />

      {/* Recommendations */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Faits pour vous
        </h2>

        {recommendations.map(rec => (
          <Card key={rec.id} className="p-3 bg-card border-border">
            <p className="text-[11px] text-primary font-medium mb-2">{rec.label}</p>
            <div className="flex items-center gap-3">
              {rec.avatar ? (
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img src={rec.avatar} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">#</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{rec.name}</p>
                <p className="text-xs text-muted-foreground">{rec.description}</p>
                {rec.type === 'politician' && <RoleBadge role="Politician" isVerified size="sm" className="mt-0.5" />}
                {rec.type === 'society' && <RoleBadge role="SocietyGroup" size="sm" className="mt-0.5" />}
              </div>
              <Button
                size="sm"
                variant={joined.has(rec.id) ? 'outline' : 'default'}
                className={`min-h-[36px] text-xs ${
                  joined.has(rec.id)
                    ? 'border-primary text-primary'
                    : 'bg-primary text-primary-foreground hover:bg-primary-hover'
                }`}
                onClick={() => toggleJoin(rec.id)}
              >
                {joined.has(rec.id) ? <><Check className="w-3 h-3 mr-1" /> Rejoint</> : rec.action}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <InitiativeDetailDialog
        initiative={selectedInitiative}
        open={!!selectedInitiative}
        onClose={() => setSelectedInitiative(null)}
      />
    </div>
  );
};

export default DemocracyTab;
