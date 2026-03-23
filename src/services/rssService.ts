/**
 * RSS Feed Service
 * Parses RSS feeds from Belgian media outlets using DOMParser (no external deps).
 * Uses allorigins.win as CORS proxy for MVP.
 *
 * Sources: RTBF Info, Le Soir, La Libre Belgique
 */

export interface RSSArticle {
    title: string;
    description: string;
    url: string;
    image: string | null;
    published_at: string;
    source: string;
    category: string;
    author?: string;
}

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Available RSS feed sources
 */
export const RSS_FEEDS = {
    rtbf_actu: { url: 'https://rss.rtbf.be/article/rss/rtbfinfo_homepage.xml', name: 'RTBF Info' },
    le_soir: { url: 'https://www.lesoir.be/rss2/2/cible_principale?status=1', name: 'Le Soir' },
    la_libre: { url: 'https://www.lalibre.be/arc/outboundfeeds/rss/?outputType=xml', name: 'La Libre' },
    lecho_politique: { url: 'https://www.lecho.be/rss/politique_belgique.xml', name: "L'Écho Politique" },
    lecho_economie: { url: 'https://www.lecho.be/rss/politique_economie.xml', name: "L'Écho Économie" },
    
    la_chambre: { url: 'https://www.lachambre.be/kvvcr/rss.cfm', name: 'La Chambre' },
    gouvernement_belge: { url: 'https://www.belgium.be/fr/rss/actualites', name: 'Gouvernement belge' },
    parlement_fwb: { url: 'https://www.pfwb.be/rss', name: 'Parlement FWB' },
    mr: { url: 'https://www.mr.be/feed/', name: 'MR' },
    ps: { url: 'https://www.ps.be/feed/', name: 'PS' },
    ecolo: { url: 'https://www.ecolo.be/feed/', name: 'Ecolo' },
    les_engages: { url: 'https://www.lesengages.be/feed/', name: 'Les Engagés' },
    ptb: { url: 'https://www.ptb.be/feed', name: 'PTB' },
    fgtb: { url: 'https://www.fgtb.be/rss.xml', name: 'FGTB' },
    csc: { url: 'https://www.csc-en-ligne.be/rss.xml', name: 'CSC' },
    greenpeace: { url: 'https://www.greenpeace.org/belgium/fr/feed/', name: 'Greenpeace BE' },
    amnesty: { url: 'https://www.amnesty.be/feed', name: 'Amnesty BE' },
} as const;

/**
 * Parse an RSS XML string into RSSArticle objects
 */
function parseRSSXml(xmlString: string, sourceName: string): RSSArticle[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        console.error(`RSS parse error (${sourceName}):`, parseError.textContent);
        return [];
    }

    const items = doc.querySelectorAll('item');
    const articles: RSSArticle[] = [];

    items.forEach((item) => {
        const title = item.querySelector('title')?.textContent?.trim() || '';
        const link = item.querySelector('link')?.textContent?.trim() || '';
        const description = item.querySelector('description')?.textContent?.trim() || '';
        const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
        const category = item.querySelector('category')?.textContent?.trim() || '';

        // Author: try dc:creator first, then author element
        const dcCreator = item.getElementsByTagNameNS(
            'http://purl.org/dc/elements/1.1/', 'creator'
        )[0]?.textContent?.trim() || '';
        const authorEl = item.querySelector('author')?.textContent?.trim() || '';
        const rawAuthor = dcCreator || authorEl;

        // Image: try media:content → media:thumbnail → enclosure
        const mediaContent = item.getElementsByTagNameNS(
            'http://search.yahoo.com/mrss/', 'content'
        )[0];
        const mediaThumbnail = item.getElementsByTagNameNS(
            'http://search.yahoo.com/mrss/', 'thumbnail'
        )[0];
        const enclosure = item.querySelector('enclosure');

        const image = mediaContent?.getAttribute('url')
            || mediaThumbnail?.getAttribute('url')
            || enclosure?.getAttribute('url')
            || extractImageFromHtml(description)
            || null;

        if (title && link) {
            articles.push({
                title: decodeHtmlEntities(stripCDATA(title)),
                description: decodeHtmlEntities(stripHtmlTags(stripCDATA(description))),
                url: link,
                image,
                published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                source: sourceName,
                category: stripCDATA(category) || 'Actualité',
                author: cleanAuthorField(stripCDATA(rawAuthor)),
            });
        }
    });

    return articles;
}

/**
 * Strip CDATA wrappers from content
 */
function stripCDATA(text: string): string {
    return text
        .replace(/^<!\[CDATA\[/, '')
        .replace(/\]\]>$/, '')
        .trim();
}

/**
 * Decode HTML entities in text
 */
function decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

/**
 * Strip HTML tags from description (some feeds embed HTML in descriptions)
 */
function stripHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Extract image URL from HTML content (for feeds that embed images in description)
 */
function extractImageFromHtml(html: string): string | null {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match?.[1] || null;
}

/**
 * Clean author fields like "rtbf.info@rtbf.be (Belga)" → "Belga"
 * Also handles CDATA-wrapped quoted names like '"AFP"' → "AFP"
 */
function cleanAuthorField(author: string): string {
    // Remove surrounding quotes
    let cleaned = author.replace(/^["'"]+|["'"]+$/g, '');
    // Extract from parentheses pattern
    const match = cleaned.match(/\(([^)]+)\)/);
    if (match) cleaned = match[1].trim();
    // Remove email prefix
    cleaned = cleaned.replace(/@[\w.]+/, '').trim();
    return cleaned || '';
}

/**
 * Fetch and parse an RSS feed
 */
export async function fetchRSSFeed(
    feedUrl: string,
    sourceName: string,
): Promise<RSSArticle[]> {
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;

    const response = await fetch(proxiedUrl);
    if (!response.ok) {
        throw new Error(`RSS fetch failed for ${sourceName}: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    return parseRSSXml(xmlText, sourceName);
}

/**
 * Fetch all configured RSS feeds in parallel.
 * Uses Promise.allSettled so a single feed failure doesn't block others.
 */
export async function fetchAllFeeds(): Promise<RSSArticle[]> {
    const feedEntries = Object.values(RSS_FEEDS);

    const results = await Promise.allSettled(
        feedEntries.map(feed => fetchRSSFeed(feed.url, feed.name))
    );

    const allArticles: RSSArticle[] = [];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            allArticles.push(...result.value);
        } else {
            console.warn(
                `Failed to fetch ${feedEntries[index].name}:`,
                result.reason
            );
        }
    });

    // Sort all articles by publication date (newest first)
    allArticles.sort((a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    return allArticles;
}

/**
 * Fetch RTBF Actu feed (legacy, kept for backwards compatibility)
 */
export async function fetchRTBFActu(): Promise<RSSArticle[]> {
    return fetchRSSFeed(RSS_FEEDS.rtbf_actu.url, RSS_FEEDS.rtbf_actu.name);
}
