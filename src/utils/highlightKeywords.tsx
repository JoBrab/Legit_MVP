/**
 * Utility to bold key words/phrases in text content based on hashtag keyword dictionaries.
 * Returns an array of React elements (spans) with important terms wrapped in <strong>.
 */

import React from 'react';
import { HASHTAG_KEYWORDS } from '@/services/contentScoring';

/**
 * Build a set of "important" keywords that should be bolded in content.
 * Picks the most distinctive keywords (length >= 4) to avoid bolding common words.
 */
function getKeywordsForBolding(hashtags: string[]): Set<string> {
    const keywords = new Set<string>();

    for (const tag of hashtags) {
        const tagKeywords = HASHTAG_KEYWORDS[tag];
        if (!tagKeywords) continue;

        for (const kw of tagKeywords) {
            // Only bold keywords with 4+ characters and no spaces (single words)
            // Multi-word keywords are less likely to match naturally
            if (kw.length >= 4 && !kw.includes(' ')) {
                keywords.add(kw.toLowerCase());
            }
        }
    }

    return keywords;
}

/**
 * Highlight keywords in text by wrapping them in <strong> tags.
 * Returns an array of React elements for rendering.
 *
 * @param text - The text content to process
 * @param hashtags - The hashtags to pull keywords from
 * @param maxBolds - Maximum number of words to bold (to avoid visual overload)
 */
export function highlightKeywords(
    text: string,
    hashtags: string[],
    maxBolds: number = 5,
): React.ReactNode[] {
    if (!text || hashtags.length === 0) {
        return [text];
    }

    const keywords = getKeywordsForBolding(hashtags);
    if (keywords.size === 0) return [text];

    // Split on word boundaries while preserving separators
    const parts = text.split(/(\s+)/);
    const result: React.ReactNode[] = [];
    let boldCount = 0;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        // Check if the word (stripped of punctuation) matches a keyword
        const cleanWord = part.replace(/[.,;:!?()'"«»—–\-]/g, '').toLowerCase();

        if (cleanWord.length >= 4 && keywords.has(cleanWord) && boldCount < maxBolds) {
            boldCount++;
            result.push(
                React.createElement('strong', { key: `b-${i}`, className: 'font-semibold' }, part)
            );
        } else {
            result.push(part);
        }
    }

    return result;
}
