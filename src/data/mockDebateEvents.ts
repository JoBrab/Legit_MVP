/**
 * Mock data for upcoming political debate events at Brussels bars.
 * These are "Legit. Débats" — live civic debates in informal settings.
 */

export interface DebateEvent {
    id: string;
    title: string;
    hashtag: string;
    description: string;
    date: Date;
    time: string;
    venue: {
        name: string;
        address: string;
        neighborhood: string;
    };
    speakers: {
        name: string;
        role: 'politician' | 'journalist' | 'expert';
        title: string;
        organization: string;
        avatar?: string;
    }[];
    capacity: number;
    registeredCount: number;
    coverImage?: string;
}

export const upcomingDebates: DebateEvent[] = [
    {
        id: 'debate-1',
        title: 'Faut-il taxer les plus riches pour sauver la sécu ?',
        hashtag: 'Budget',
        description: 'Le gouvernement Arizona a annoncé 23 milliards d\'économies. Pensions, allocations, soins de santé : qui paie quoi ? Venez débattre avec nos intervenants dans une ambiance décontractée autour d\'une bière.',
        date: new Date('2026-03-15T20:00:00'),
        time: '20h00',
        venue: {
            name: 'Le Café Belga',
            address: 'Place Eugène Flagey 18',
            neighborhood: 'Ixelles',
        },
        speakers: [
            {
                name: 'Catherine Fonck',
                role: 'politician',
                title: 'Députée fédérale',
                organization: 'Les Engagés',
            },
            {
                name: 'Mehdi Khelfat',
                role: 'journalist',
                title: 'Rédacteur en chef',
                organization: 'RTBF Info',
            },
            {
                name: 'Bruno Colmant',
                role: 'expert',
                title: 'Économiste',
                organization: 'ULB',
            },
        ],
        capacity: 60,
        registeredCount: 42,
    },
    {
        id: 'debate-2',
        title: 'Bruxelles : comment se déplacer en 2030 ?',
        hashtag: 'Mobilité',
        description: 'Métro 3, zone 30, pistes cyclables : la mobilité bruxelloise est en pleine mutation. Quels choix pour une ville respirable ? Un débat citoyen ouvert à tous.',
        date: new Date('2026-03-22T19:30:00'),
        time: '19h30',
        venue: {
            name: 'Bar du Matin',
            address: 'Place du Châtelain 5',
            neighborhood: 'Ixelles',
        },
        speakers: [
            {
                name: 'Elke Van den Brandt',
                role: 'politician',
                title: 'Ministre de la Mobilité',
                organization: 'Groen',
            },
            {
                name: 'Juliette Bretan',
                role: 'journalist',
                title: 'Journaliste mobilité',
                organization: 'Le Soir',
            },
            {
                name: 'Xavier Tackoen',
                role: 'expert',
                title: 'Expert en mobilité urbaine',
                organization: 'Espaces-Mobilités',
            },
        ],
        capacity: 45,
        registeredCount: 31,
    },
];

/**
 * Get the next upcoming debate event
 */
export function getNextDebate(): DebateEvent | null {
    const now = new Date();
    const upcoming = upcomingDebates
        .filter(d => d.date > now)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    return upcoming[0] || null;
}
