import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseFeed } from "https://deno.land/x/rss@1.0.0/mod.ts";

/**
 * Priority 2: Edge Function "fetch-content"
 * Triggered by Supabase pg_net / pg_cron to fetch RSS and Bluesky feeds.
 * Includes 3-Level Cascade Moderation.
 */

const BLACKLIST = ["insulte1", "insulte2", "haine", "menace"]; // Example blacklist
const SPAM_REGEX = /(https?:\/\/[^\s]+){3,}/g; // Blocks posts purely made of 3+ links

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Basic Hashtag Keywords for Server-side sorting
const HASHTAG_KEYWORDS: Record<string, string[]> = {
    Logement: ["logement", "loyer", "immobilier"],
    Mobilité: ["mobilité", "sncb", "stib", "vélo", "voiture", "embouteillage"],
    Santé: ["santé", "hôpital", "médecin", "maladie"],
    Climat: ["climat", "réchauffement", "c02", "environnement"],
    Budget: ["budget", "fiscal", "taxe", "impôt", "pension"],
    Sécurité: ["sécurité", "police", "justice", "prison"],
    Éducation: ["éducation", "école", "enseignement"]
};

// Extremely simplified keywords parsing (full logic handles more)
function getKeywordsArray(text: string): string[] {
    const textLower = text.toLowerCase();
    const tags: Set<string> = new Set();
    for (const [tag, kws] of Object.entries(HASHTAG_KEYWORDS)) {
        for (const kw of kws) {
            if (textLower.includes(kw)) tags.add(tag);
        }
    }
    return Array.from(tags);
}

// 3-Level Moderation Cascade
async function moderateContent(text: string): Promise<boolean> {
    const textLower = text.toLowerCase();
    
    // Level 1: Fast Blacklist
    for (const word of BLACKLIST) {
        if (textLower.includes(word)) return false;
    }
    
    // Level 2: Regex Patterns (e.g. spam)
    if (SPAM_REGEX.test(text)) return false;
    
    // Level 3: Perspective API (Async, only if configured)
    const perspectiveKey = Deno.env.get("PERSPECTIVE_API_KEY");
    if (perspectiveKey) {
        try {
            const res = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${perspectiveKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    comment: { text },
                    requestedAttributes: { TOXICITY: {} },
                    languages: ["fr"]
                })
            });
            if (res.ok) {
                const data = await res.json();
                const toxicityScore = data.attributeScores?.TOXICITY?.summaryScore?.value || 0;
                if (toxicityScore > 0.75) return false;
            }
        } catch (e) {
            console.warn("Perspective API failed, allowing content softly.");
        }
    }
    return true; // Passed moderation
}

// Minimal execution structure for fetching
serve(async (req) => {
    try {
        const body = await req.json().catch(() => ({}));
        const mode = body.type || 'all'; // 'media' or 'political'

        // 1. Fetch Sources from DB mapped by type
        const { data: sources, error } = await supabase
            .from('sources')
            .select('*')
            .or(mode === 'political' ? 'type.eq.bluesky' : 'type.eq.rss');

        if (error || !sources) throw error;

        let totalInserted = 0;
        let totalModerated = 0;

        // Process sequentially to not overload connections from the Edge Function
        for (const source of sources) {
            try {
                // Determine feed URL format based on source
                const fetchUrl = source.type === 'bluesky' 
                    ? `https://bsky.app/profile/${source.url}/rss` 
                    : source.url;

                const response = await fetch(fetchUrl);
                if (!response.ok) continue;

                const xml = await response.text();
                const feed = await parseFeed(xml);

                for (const entry of feed.entries.slice(0, 10)) { // limit 10 per cycle
                    const title = entry.title?.value || "";
                    const description = entry.description?.value || "";
                    // Clean HTML tags for excerpt
                    const cleanDesc = description.replace(/<[^>]*>/g, '').trim();
                    const url = entry.links[0]?.href || entry.id;
                    const date = entry.published || new Date();
                    
                    if (!url) continue;

                    const excerpt = cleanDesc.substring(0, 200);
                    const isAllowed = await moderateContent(title + " " + excerpt);

                    if (!isAllowed) {
                        totalModerated++;
                        continue;
                    }

                    const hashtags = getKeywordsArray(title + " " + excerpt);
                    
                    // Upsert into Supabase (Dedup based on url)
                    await supabase
                        .from('publications')
                        .upsert({
                            source_type: source.type,
                            source_name: source.name,
                            title,
                            excerpt,
                            url,
                            hashtags,
                            published_at: new Date(date),
                        }, { onConflict: 'url', ignoreDuplicates: true });
                    
                    totalInserted++;
                }

            } catch (e) {
                console.error(`Error processing source ${source.name}`, e);
            }
        }

        return new Response(JSON.stringify({ 
            success: true, 
            inserted: totalInserted, 
            moderated: totalModerated 
        }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
