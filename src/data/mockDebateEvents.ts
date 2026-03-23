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

export const upcomingDebates: DebateEvent[] = [];

export function getNextDebate(): DebateEvent | null {
    return null;
}
