import { Interpellation } from '@/types';

/**
 * Mock interpellations for political posts.
 * Keyed by publication ID so they can be looked up.
 */
export const mockInterpellations: Record<string, Interpellation[]> = {
    // Georges-Louis Bouchez — Budget post
    'b-pol-1': [
        {
            id: 'int-b1-1',
            citizenId: 'citizen-01',
            citizen: {
                id: 'citizen-01',
                email: 'sophie.l@example.com',
                displayName: 'Sophie Lemaire',
                role: 'Citizen',
                isVerified: false,
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
                preferredLanguage: 'fr',
                autoTranslate: false,
                createdAt: new Date('2024-03-01'),
            },
            content: "Monsieur le Président, vous parlez de réduction des dépenses mais quels postes précis seront touchés ? Les citoyens méritent de la transparence, pas des slogans. La dernière fois qu'on a promis des économies, ce sont les services publics de proximité qui ont trinqué.",
            supportCount: 142,
            commentCount: 34,
            createdAt: new Date(Date.now() - 7200000),
            politicianReply: {
                content: "Merci pour votre question légitime. Nous détaillerons les postes dans le rapport budgétaire qui sera publié la semaine prochaine. La transparence est notre priorité.",
                createdAt: new Date(Date.now() - 3600000),
            },
        },
        {
            id: 'int-b1-2',
            citizenId: 'citizen-02',
            citizen: {
                id: 'citizen-02',
                email: 'marc.d@example.com',
                displayName: 'Marc Dupont',
                role: 'Citizen',
                isVerified: false,
                preferredLanguage: 'fr',
                autoTranslate: false,
                createdAt: new Date('2024-05-15'),
            },
            content: "Les indépendants et PME sont les premiers impactés par les hausses fiscales. Avez-vous consulté les fédérations patronales avant de proposer ce budget ?",
            supportCount: 87,
            commentCount: 15,
            createdAt: new Date(Date.now() - 14400000),
        },
        {
            id: 'int-b1-3',
            citizenId: 'citizen-03',
            citizen: {
                id: 'citizen-03',
                email: 'nadia.b@example.com',
                displayName: 'Nadia Bensaïd',
                role: 'Citizen',
                isVerified: false,
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
                preferredLanguage: 'fr',
                autoTranslate: false,
                createdAt: new Date('2024-01-20'),
            },
            content: "Et l'impact sur les familles monoparentales ? Aucune mention dans votre proposition. Ces ménages représentent 15% des foyers belges.",
            supportCount: 156,
            commentCount: 28,
            createdAt: new Date(Date.now() - 10800000),
        },
    ],

    // Paul Magnette — Budget post
    'b-pol-2': [
        {
            id: 'int-b2-1',
            citizenId: 'citizen-04',
            citizen: {
                id: 'citizen-04',
                email: 'jan.v@example.com',
                displayName: 'Jan Vermeersch',
                role: 'Citizen',
                isVerified: false,
                preferredLanguage: 'fr',
                autoTranslate: true,
                createdAt: new Date('2024-06-01'),
            },
            content: "La justice fiscale est un beau slogan, mais concrètement, comment empêcher l'exil fiscal des hauts revenus vers le Luxembourg ou les Pays-Bas ?",
            supportCount: 109,
            commentCount: 22,
            createdAt: new Date(Date.now() - 18000000),
        },
        {
            id: 'int-b2-2',
            citizenId: 'citizen-05',
            citizen: {
                id: 'citizen-05',
                email: 'camille.r@example.com',
                displayName: 'Camille Rousseau',
                role: 'Citizen',
                isVerified: false,
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
                preferredLanguage: 'fr',
                autoTranslate: false,
                createdAt: new Date('2024-04-10'),
            },
            content: "En tant qu'enseignante, je vois les dégâts de l'austérité chaque jour en classe. 30 élèves par classe, matériel obsolète. Votre programme prévoit-il un refinancement de l'enseignement ?",
            supportCount: 180,
            commentCount: 41,
            createdAt: new Date(Date.now() - 5400000),
            politicianReply: {
                content: "Mme Rousseau, l'enseignement est une priorité absolue. Nous proposons une augmentation de 8% du budget éducation, financée par la contribution des grandes fortunes.",
                createdAt: new Date(Date.now() - 2700000),
            },
        },
        {
            id: 'int-b2-3',
            citizenId: 'citizen-06',
            citizen: {
                id: 'citizen-06',
                email: 'ahmed.k@example.com',
                displayName: 'Ahmed Khalil',
                role: 'Citizen',
                isVerified: false,
                preferredLanguage: 'fr',
                autoTranslate: false,
                createdAt: new Date('2024-07-20'),
            },
            content: "Les zones rurales sont complètement oubliées dans ce budget. Pas un mot sur la mobilité en dehors des grandes villes.",
            supportCount: 52,
            commentCount: 8,
            createdAt: new Date(Date.now() - 25200000),
        },
    ],

    // Mobilité — politician post
    'm-pol-1': [
        {
            id: 'int-m1-1',
            citizenId: 'citizen-07',
            citizen: {
                id: 'citizen-07',
                email: 'lisa.m@example.com',
                displayName: 'Lisa Martens',
                role: 'Citizen',
                isVerified: false,
                preferredLanguage: 'fr',
                autoTranslate: false,
                createdAt: new Date('2024-02-14'),
            },
            content: "Bruxelles–Namur en 45 min ? Actuellement c'est plutôt 75 min avec les retards. Concentrons-nous d'abord sur la fiabilité avant de rêver de vitesse.",
            supportCount: 118,
            commentCount: 19,
            createdAt: new Date(Date.now() - 36000000),
        },
        {
            id: 'int-m1-2',
            citizenId: 'citizen-08',
            citizen: {
                id: 'citizen-08',
                email: 'thomas.w@example.com',
                displayName: 'Thomas Willems',
                role: 'Citizen',
                isVerified: false,
                preferredLanguage: 'fr',
                autoTranslate: false,
                createdAt: new Date('2024-08-05'),
            },
            content: "Et le vélo ? Aucune piste cyclable sécurisée sur les axes principaux. Le plan mobilité doit être multimodal, pas juste ferroviaire.",
            supportCount: 73,
            commentCount: 11,
            createdAt: new Date(Date.now() - 43200000),
        },
    ],
};

/**
 * Get interpellations for a given publication ID.
 * Returns only those with 50+ support, sorted: replied first, then by support desc.
 */
export function getInterpellationsForPost(publicationId: string): Interpellation[] {
    const all = mockInterpellations[publicationId] || [];
    return all
        .filter(i => i.supportCount >= 50)
        .sort((a, b) => {
            // Replied first
            if (a.politicianReply && !b.politicianReply) return -1;
            if (!a.politicianReply && b.politicianReply) return 1;
            // Then by support count
            return b.supportCount - a.supportCount;
        });
}
