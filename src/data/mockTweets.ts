export interface PoliticianTweet {
    id: string;
    tweetUrl: string;
    authorName: string;
    authorHandle: string;
    party: string;
    role: string;
    government: 'federal' | 'wallon' | 'flamand' | 'bruxellois' | 'opposition';
    clusters: string[];
    summary: string;
}

export const politicianTweets: PoliticianTweet[] = [
    {
        id: 'tw-1',
        tweetUrl: 'https://twitter.com/alexanderdecroo/status/1765053531627999653',
        authorName: 'Alexander De Croo',
        authorHandle: '@alexanderdecroo',
        party: 'Open Vld',
        role: 'Premier Ministre',
        government: 'federal',
        clusters: ['Mobilité', 'Budget', 'Climat', 'Santé', 'Logement'],
        summary: 'Engagement envers le climat...'
    },
    {
        id: 'tw-2',
        tweetUrl: 'https://twitter.com/GLBouchez/status/1766023758360699042',
        authorName: 'Georges-Louis Bouchez',
        authorHandle: '@GLBouchez',
        party: 'MR',
        role: 'Président',
        government: 'opposition',
        clusters: ['Budget', 'Logement', 'Économie', 'Social'],
        summary: 'Aide à la brique...'
    },
    {
        id: 'tw-3',
        tweetUrl: 'https://twitter.com/PaulMagnette/status/1765115296839655531',
        authorName: 'Paul Magnette',
        authorHandle: '@PaulMagnette',
        party: 'PS',
        role: 'Président',
        government: 'federal',
        clusters: ['Climat', 'Emploi', 'Social'],
        summary: 'Investissements publics...'
    }
];

export function getTweetsForCluster(hashtag: string): PoliticianTweet[] {
    return politicianTweets.filter(t => t.clusters.includes(hashtag));
}
