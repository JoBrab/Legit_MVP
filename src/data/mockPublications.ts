import { Publication } from '@/types';

// Export an empty array to remove hardcoded data
export const mockPublications: Publication[] = [];

// Base generic topic filters if no active hashtags come from RSS
export const trendingTopics = ['Politique', 'Climat', 'Économie', 'Social'];

// No fallback data if API limit or empty
export const fallbackNews: any[] = [];

// No fake network activity
export const networkActivity: any[] = [];
