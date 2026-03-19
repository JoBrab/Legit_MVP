import React, { useState } from 'react';
import { DebateEvent } from '@/data/mockDebateEvents';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
    MapPin, Clock, Users, Beer, CheckCircle,
    Landmark, Newspaper, GraduationCap, Calendar,
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

interface DebateEventModalProps {
    debate: DebateEvent | null;
    onClose: () => void;
}

const speakerRoleConfig = {
    politician: { icon: Landmark, label: 'Politique', color: 'text-emerald-600 bg-emerald-50' },
    journalist: { icon: Newspaper, label: 'Journaliste', color: 'text-blue-600 bg-blue-50' },
    expert: { icon: GraduationCap, label: 'Expert', color: 'text-violet-600 bg-violet-50' },
};

const DebateEventModal: React.FC<DebateEventModalProps> = ({ debate, onClose }) => {
    const [isRegistered, setIsRegistered] = useState(false);
    const [registeredCount, setRegisteredCount] = useState(0);

    React.useEffect(() => {
        if (debate) {
            setRegisteredCount(debate.registeredCount);
            setIsRegistered(false);
        }
    }, [debate]);

    if (!debate) return null;

    const spotsLeft = debate.capacity - registeredCount;
    const fillPercent = Math.round((registeredCount / debate.capacity) * 100);

    const handleRegister = () => {
        triggerHaptic('heavy');
        setIsRegistered(true);
        setRegisteredCount(prev => prev + 1);
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('fr-BE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <Drawer open={!!debate} onClose={onClose}>
            <DrawerContent className="max-h-[92vh]">
                <div className="overflow-y-auto max-h-[88vh]">
                    {/* Header */}
                    <DrawerHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Beer className="w-5 h-5 text-primary" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                Legit. Débat
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                                #{debate.hashtag}
                            </span>
                        </div>
                        <DrawerTitle className="text-xl font-bold text-foreground leading-tight">
                            {debate.title}
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="px-4 pb-6 space-y-5">
                        {/* Description */}
                        <p className="text-[15px] text-muted-foreground leading-relaxed">
                            {debate.description}
                        </p>

                        {/* Event Details */}
                        <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground capitalize">
                                        {formatDate(debate.date)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                                <p className="text-sm text-foreground">{debate.time}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{debate.venue.name}</p>
                                    <p className="text-xs text-muted-foreground">{debate.venue.address}, {debate.venue.neighborhood}</p>
                                </div>
                            </div>
                        </div>

                        {/* Speakers */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                Intervenants
                            </h3>
                            <div className="space-y-2.5">
                                {debate.speakers.map((speaker) => {
                                    const config = speakerRoleConfig[speaker.role];
                                    const Icon = config.icon;
                                    return (
                                        <div key={speaker.name} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/30">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground">{speaker.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {speaker.title} · {speaker.organization}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                {config.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Capacity gauge */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        <strong className="text-foreground">{registeredCount}</strong>/{debate.capacity} inscrits
                                    </span>
                                </div>
                                <span className={`text-xs font-medium ${spotsLeft <= 10 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                    {spotsLeft} place{spotsLeft > 1 ? 's' : ''} restante{spotsLeft > 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-[hsl(230,65%,45%)] rounded-full transition-all duration-500"
                                    style={{ width: `${fillPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Register Button */}
                        {isRegistered ? (
                            <div className="flex items-center justify-center gap-2 py-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                    Inscription confirmée !
                                </span>
                            </div>
                        ) : (
                            <Button
                                onClick={handleRegister}
                                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[hsl(330,85%,52%)] to-[hsl(230,65%,45%)] text-white font-semibold text-base shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200"
                                disabled={spotsLeft <= 0}
                            >
                                {spotsLeft <= 0 ? 'Complet' : "S'inscrire au débat"}
                            </Button>
                        )}

                        <p className="text-[11px] text-center text-muted-foreground">
                            Gratuit · Boissons à votre charge · Ouvert à tous
                        </p>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default DebateEventModal;
