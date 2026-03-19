import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Publication, AgreementLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ImagePlus, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { trendingTopics } from '@/data/mockPublications';

interface CreatePublicationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPublish: (publication: Publication) => void;
}

const REFLECTION_DELAY_MS = 10000; // 10 seconds

const CreatePublicationModal: React.FC<CreatePublicationModalProps> = ({ open, onOpenChange, onPublish }) => {
    const { user } = useAuth();
    const [newPublication, setNewPublication] = useState('');
    const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishSuccess, setPublishSuccess] = useState(false);
    const [sourceUrl, setSourceUrl] = useState('');

    // Reflection time state
    const [showReflection, setShowReflection] = useState(false);
    const [reflectionTimer, setReflectionTimer] = useState(REFLECTION_DELAY_MS / 1000);
    const [reflectionChecks, setReflectionChecks] = useState({
        argued: false,
        respectful: false,
        constructive: false,
    });

    const toggleHashtag = (tag: string) => {
        setSelectedHashtags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const startReflection = () => {
        if (!newPublication.trim()) return;
        setShowReflection(true);
        setReflectionTimer(REFLECTION_DELAY_MS / 1000);

        const interval = setInterval(() => {
            setReflectionTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const allChecked = reflectionChecks.argued && reflectionChecks.respectful && reflectionChecks.constructive;
    const canPublish = reflectionTimer === 0 && allChecked;

    const handlePublish = () => {
        if (!newPublication.trim() || !canPublish) return;

        setIsPublishing(true);

        setTimeout(() => {
            const publication: Publication = {
                id: Date.now().toString(),
                authorId: user!.id,
                author: user!,
                content: { fr: newPublication },
                hashtags: selectedHashtags,
                type: 'interpellation',
                status: 'pending',
                supportGoal: 100,
                supportCount: 0,
                reactions: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<AgreementLevel, number>,
                createdAt: new Date(),
                ...(sourceUrl && { hasSource: true, sourceUrl }),
            };

            onPublish(publication);
            resetForm();
            setPublishSuccess(true);
            setTimeout(() => {
                setPublishSuccess(false);
                onOpenChange(false);
            }, 1200);
        }, 800);
    };

    const resetForm = () => {
        setNewPublication('');
        setSelectedHashtags([]);
        setIsPublishing(false);
        setSourceUrl('');
        setShowReflection(false);
        setReflectionChecks({ argued: false, respectful: false, constructive: false });
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
            <DialogContent className="sm:max-w-lg h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[85vh] flex flex-col p-0 gap-0 rounded-none sm:rounded-lg">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <button onClick={() => { resetForm(); onOpenChange(false); }} className="p-1">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <h2 className="text-base font-bold text-foreground">Nouvelle publication</h2>
                    <div className="w-7" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold flex-shrink-0">
                            {user?.displayName.charAt(0)}
                        </div>
                        <Textarea
                            placeholder="Exprimez-vous, citoyen..."
                            value={newPublication}
                            onChange={(e) => setNewPublication(e.target.value)}
                            className="flex-1 min-h-[120px] bg-background border-input resize-none text-base"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Ajouter des hashtags:</p>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics.map((topic) => (
                                <Badge
                                    key={topic}
                                    variant="outline"
                                    className={`text-xs cursor-pointer transition-colors ${selectedHashtags.includes(topic)
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'text-primary border-primary/30 hover:bg-primary/10'
                                        }`}
                                    onClick={() => toggleHashtag(topic)}
                                >
                                    #{topic}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Source URL field */}
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            🔗 Source (recommandé)
                        </p>
                        <input
                            type="url"
                            placeholder="https://..."
                            value={sourceUrl}
                            onChange={(e) => setSourceUrl(e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ImagePlus className="w-5 h-5 mr-2" />
                        Ajouter image
                    </Button>

                    {/* Reflection screen */}
                    {showReflection && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-primary" />
                                <p className="text-sm font-semibold text-foreground">
                                    Prenez un moment pour relire
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Chez Legit, chaque message compte. Votre publication est-elle constructive ?
                            </p>

                            <div className="space-y-2">
                                {[
                                    { key: 'argued' as const, label: 'Mon propos est argumenté' },
                                    { key: 'respectful' as const, label: "Je n'attaque pas la personne" },
                                    { key: 'constructive' as const, label: "J'apporte quelque chose au débat" },
                                ].map(check => (
                                    <label
                                        key={check.key}
                                        className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={reflectionChecks[check.key]}
                                            onChange={(e) => setReflectionChecks(prev => ({
                                                ...prev,
                                                [check.key]: e.target.checked,
                                            }))}
                                            className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
                                        />
                                        {check.label}
                                    </label>
                                ))}
                            </div>

                            {reflectionTimer > 0 && (
                                <p className="text-xs text-muted-foreground text-center">
                                    ⏳ Temps de réflexion : {reflectionTimer}s
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border">
                    {!showReflection ? (
                        <Button
                            onClick={startReflection}
                            className="w-full rounded-full font-bold bg-primary hover:bg-primary-hover text-primary-foreground min-h-[44px] transition-all duration-200 ease-in-out"
                            disabled={!newPublication.trim()}
                        >
                            Continuer →
                        </Button>
                    ) : (
                        <Button
                            onClick={handlePublish}
                            className="w-full rounded-full font-bold bg-primary hover:bg-primary-hover text-primary-foreground min-h-[44px] transition-all duration-200 ease-in-out"
                            disabled={!canPublish || isPublishing}
                        >
                            {isPublishing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : publishSuccess ? (
                                <><Check className="w-5 h-5 mr-1 text-[hsl(var(--verified-green))]" /> Publié !</>
                            ) : !allChecked ? (
                                'Cochez les 3 points ci-dessus'
                            ) : reflectionTimer > 0 ? (
                                `Patientez ${reflectionTimer}s...`
                            ) : (
                                'Publier'
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePublicationModal;
