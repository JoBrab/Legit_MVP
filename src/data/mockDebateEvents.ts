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
    role: 'politician' | 'journalist' | 'expert' | string;
    title: string;
    organization: string;
    avatar?: string;
  }[] | string[];
  capacity: number;
  registeredCount: number;
  coverImage?: string;
  // Legacy support for my previous simple interface
  theme?: string;
  imageUrl?: string;
  location?: string;
}

export const mockDebateEvents: DebateEvent[] = [
  {
    id: 'evt-1',
    title: 'Crise du Logement : Quelles solutions pour la génération Z ?',
    hashtag: 'Logement',
    description: 'Débat sur les solutions concrètes pour le logement à Bruxelles.',
    date: new Date(Date.now() + 86400000 * 3),
    time: '19:00',
    venue: {
      name: 'Le Pantin',
      address: 'Place Flagey, Ixelles',
      neighborhood: 'Ixelles',
    },
    speakers: [
      { name: 'Sarah De Clercq', role: 'expert', title: 'Urbaniste', organization: 'ULB' },
      { name: 'Marc Vandenberg', role: 'expert', title: 'Animateur', organization: 'Syndicat Locataires' },
      { name: 'Céline Fremault', role: 'politician', title: 'Députée', organization: 'Les Engagés' },
    ],
    capacity: 100,
    registeredCount: 88,
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    theme: 'Logement',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    location: 'Le Pantin (Bar, Ixelles)',
  },
  {
    id: 'evt-2',
    title: 'Fin du monde vs Faim du mois : Trouver l\'équilibre',
    hashtag: 'Climat',
    description: 'Comment concilier urgence climatique et justice sociale ?',
    date: new Date(Date.now() + 86400000 * 7),
    time: '20:00',
    venue: {
      name: 'Café Belga',
      address: 'Place Flagey, Ixelles',
      neighborhood: 'Flagey',
    },
    speakers: [
      { name: 'François Gemenne', role: 'expert', title: 'Chercheur', organization: 'IPCC' },
      { name: 'Julien F.', role: 'expert', title: 'Représentant', organization: 'FGTB' },
      { name: 'Lucie R.', role: 'expert', title: 'Citoyenne', organization: 'Collectif' },
    ],
    capacity: 200,
    registeredCount: 145,
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    theme: 'Climat',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    location: 'Café Belga (Bar, Flagey)',
  }
];

export const upcomingDebates = mockDebateEvents;

export function getNextDebate(): DebateEvent | null {
    return mockDebateEvents[0] || null;
}

