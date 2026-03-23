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

export const politicianTweets: PoliticianTweet[] = [];

export function getTweetsForCluster(hashtag: string): PoliticianTweet[] {
    return [];
}
