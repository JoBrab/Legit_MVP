import { AgreementLevel, Publication } from '@/types';

/**
 * Calculates a "nuance score" for a publication based on reaction distribution.
 * A flat distribution (equal reactions across all levels) = high nuance.
 * A polarized distribution (reactions clustered at extremes) = low nuance.
 * Returns a value between 0 and 100.
 */
export function calculateNuanceScore(reactions: Record<AgreementLevel, number>): number {
    const total = Object.values(reactions).reduce((sum, n) => sum + n, 0);
    if (total === 0) return 50;

    const levels: AgreementLevel[] = [1, 2, 3, 4, 5];
    const proportions = levels.map(l => (reactions[l] || 0) / total);

    const maxEntropy = Math.log2(5);
    let entropy = 0;
    for (const p of proportions) {
        if (p > 0) entropy -= p * Math.log2(p);
    }
    const normalizedEntropy = entropy / maxEntropy;

    const polarizationPenalty = (proportions[0] + proportions[4]) > 0.7 && proportions[0] > 0.15 && proportions[4] > 0.15
        ? 0.2 : 0;

    return Math.round(Math.max(0, Math.min(100, (normalizedEntropy - polarizationPenalty) * 100)));
}

/**
 * Returns a label and color for a nuance score.
 */
export function getNuanceLabel(score: number): { label: string; emoji: string; color: string } {
    if (score >= 65) return { label: 'Débat constructif', emoji: '🟢', color: 'text-green-600' };
    if (score >= 40) return { label: 'Avis partagés', emoji: '🟡', color: 'text-yellow-600' };
    return { label: 'Sujet polarisant', emoji: '🔴', color: 'text-red-500' };
}

/**
 * Extracts the most frequently used meaningful term from publication content.
 * Filters out common French stop words.
 */
export function extractTopTerm(publications: Publication[]): { term: string; count: number } | null {
    const stopWords = new Set([
        'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'en', 'à', 'au', 'aux',
        'ce', 'ces', 'cette', 'que', 'qui', 'quoi', 'pour', 'par', 'sur', 'dans', 'est',
        'sont', 'pas', 'plus', 'nous', 'notre', 'nos', 'avec', 'mais', 'ou', 'ne', 'se',
        'son', 'sa', 'ses', 'leur', 'leurs', 'il', 'elle', 'ils', 'elles', 'on', 'tout',
        'tous', 'toute', 'toutes', 'été', 'être', 'avoir', 'fait', 'faire', 'comme',
        'aussi', 'bien', 'très', 'trop', 'peu', 'dont', 'sans', 'si', 'entre', 'vers',
        'chez', 'sous', 'depuis', 'après', 'avant', 'chaque', 'même', 'cet', 'car',
        'donc', 'encore', 'déjà', 'ici', 'là', 'autre', 'autres', 'peut', 'faut',
        'dit', 'ans', 'c\'est', 'n\'est', 'qu\'on', 'd\'un', 'd\'une',
    ]);

    const wordCounts: Record<string, number> = {};

    publications.forEach(pub => {
        const text = (pub.content.fr || '').toLowerCase();
        // Remove special chars, emojis, URLs
        const cleaned = text
            .replace(/https?:\/\/\S+/g, '')
            .replace(/[^\wàâäéèêëïîôùûüçœæ\s'-]/g, ' ')
            .replace(/\s+/g, ' ');

        const words = cleaned.split(' ').filter(w => w.length > 3 && !stopWords.has(w));
        words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
    });

    const sorted = Object.entries(wordCounts).sort(([, a], [, b]) => b - a);
    if (sorted.length === 0) return null;

    const [term, count] = sorted[0];
    return { term: term.charAt(0).toUpperCase() + term.slice(1), count };
}

/**
 * Calculates a mock activity change percentage vs "yesterday".
 */
export function calculateActivityChange(publications: Publication[]): number {
    // Simulate based on publication count and reaction density
    const totalReactions = publications.reduce((sum, pub) =>
        sum + Object.values(pub.reactions).reduce((s, n) => s + n, 0), 0
    );
    // Pseudo-deterministic from data (not random)
    const seed = totalReactions % 47;
    return seed > 23 ? +(seed - 10) : -(23 - seed);
}

/**
 * Generates a compact, legally-safe debate summary for a group of publications.
 * No names, no editorial interpretation, only raw counts and metrics.
 */
export function generateDebateSummary(publications: Publication[]) {
    const byRole = {
        press: publications.filter(p => p.author.role === 'Press'),
        politicians: publications.filter(p => p.author.role === 'Politician' || p.author.role === 'Institution'),
        society: publications.filter(p => p.author.role === 'SocietyGroup'),
        citizens: publications.filter(p => p.author.role === 'Citizen'),
    };

    const totalReactions: Record<AgreementLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const pub of publications) {
        for (const level of [1, 2, 3, 4, 5] as AgreementLevel[]) {
            totalReactions[level] += pub.reactions[level] || 0;
        }
    }

    const globalNuance = calculateNuanceScore(totalReactions);
    const totalReactionCount = Object.values(totalReactions).reduce((s, n) => s + n, 0);
    const topTerm = extractTopTerm(publications);
    const activityChange = calculateActivityChange(publications);

    return {
        pressCount: byRole.press.length,
        politicianCount: byRole.politicians.length,
        societyCount: byRole.society.length,
        citizenCount: byRole.citizens.length,
        globalNuance,
        totalReactionCount,
        totalPublications: publications.length,
        topTerm,
        activityChange,
    };
}

/**
 * Extracts a position label from the author's organization field.
 */
export function getPositionLabel(publication: Publication): { label: string; variant: 'majority' | 'opposition' | 'testimony' | 'verified' | 'none' } | null {
    const role = publication.author.role;
    const org = publication.author.organization?.toLowerCase() || '';

    if (role === 'Politician' || role === 'Institution') {
        if (org.includes('majorité')) return { label: 'Majorité', variant: 'majority' };
        if (org.includes('opposition')) return { label: 'Opposition', variant: 'opposition' };
        return null;
    }

    // "Source vérifiée" and "Témoignage" are now handled by the subtle RoleBadge checkmark
    return null;
}
