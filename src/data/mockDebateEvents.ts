export interface DebateEvent {
  id: string;
  title: string;
  speakers: string[];
  date: Date;
  location: string;
  theme: string;
  imageUrl: string;
}

export const mockDebateEvents: DebateEvent[] = [
  {
    id: 'evt-1',
    title: 'Crise du Logement : Quelles solutions pour la génération Z ?',
    speakers: ['Sarah De Clercq (Urbaniste)', 'Marc Vandenberg (Syndicat Locataires)', 'Céline Fremault (Politique)'],
    date: new Date(Date.now() + 86400000 * 3), // +3 days
    location: 'Le Pantin (Bar, Ixelles)',
    theme: 'Logement',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'evt-2',
    title: 'Fin du monde vs Faim du mois : Trouver l\'équilibre',
    speakers: ['François Gemenne (Chercheur)', 'Julien F. (FGTB)', 'Lucie R. (Citoyenne)'],
    date: new Date(Date.now() + 86400000 * 7), // +7 days
    location: 'Café Belga (Bar, Flagey)',
    theme: 'Climat',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  }
];
