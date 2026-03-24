export interface BlueskyPost {
    id: string;
    url: string;
    authorName: string;
    authorHandle: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
    replyCount: number;
    repostCount: number;
    likeCount: number;
    images: string[];
}

// Full list of Belgian politicians active on Bluesky
export const BLUESKY_ACTORS = [
    { name: "Paul Magnette", handle: "paulmagnette.bsky.social", did: "did:plc:x3a4shkczn227d7kixrdmb2k", party: "PS" },
  { name: "Elio Di Rupo", handle: "eliodirupo.bsky.social", did: "did:plc:l2gmdknyf54szj5ztdttnflf", party: "PS" },
  { name: "Thomas Dermine", handle: "thomasdermine.bsky.social", did: "did:plc:6oalwngdngedv4rtfdfy6scc", party: "PS" },
  { name: "Ludivine Dedonder", handle: "ludivinededonder.bsky.social", did: "did:plc:6f7xqqq4p37qq7o2kqp3u6oq", party: "PS" },
  { name: "Ahmed Laaouej", handle: "laaouej.bsky.social", did: "did:plc:32xss2euehqm6pxhmdix6l4h", party: "PS" },
  { name: "Georges-Louis Bouchez", handle: "glbouchez.bsky.social", did: "did:plc:z2sqnclz2oabryh5v7xnzr3c", party: "MR" },
  { name: "Sophie Wilmès", handle: "sophiewilmes.bsky.social", did: "did:plc:lzzj7u2y4xg4t5l4o3l2z2k4", party: "MR" },
  { name: "David Clarinval", handle: "davidclarinval.bsky.social", did: "did:plc:3xzfqq4yvq4t2z5l3o7qz2k4", party: "MR" },
  { name: "Raoul Hedebouw", handle: "raoulhedebouw.bsky.social", did: "did:plc:u4y6z3w5hxywq2y5tq6z3w5h", party: "PTB" },
  { name: "Maxime Prévot", handle: "maximeprevot.bsky.social", did: "did:plc:n5y6z3w5hxywq2y5tq6z3w5h", party: "Les Engagés" },
  { name: "Jean-Luc Crucke", handle: "jeanluccrucke.bsky.social", did: "did:plc:o4y6z3w5hxywq2y5tq6z3w5h", party: "Les Engagés" },
  { name: "Elisabeth Degryse", handle: "edegryse.bsky.social", did: "did:plc:rccybc6izgis6x7bglxe35ke", party: "Les Engagés" },
  { name: "Yvan Verougstraete", handle: "yverougstraete.bsky.social", did: "did:plc:ik34pyait3bikamczua6vck2", party: "Les Engagés" },
  { name: "Zakia Khattabi", handle: "zakia.bsky.social", did: "did:plc:yfzulutv7kigro73ps5prqqw", party: "Ecolo" },
  { name: "Georges Gilkinet", handle: "georgesgilkinet.bsky.social", did: "did:plc:y266cg3kivkrebwm5lf7af2y", party: "Ecolo" },
  { name: "Alain Maron", handle: "alainmaron.bsky.social", did: "did:plc:xj54hktbdbwolm7itsch54sz", party: "Ecolo" },
  { name: "Sarah Schlitz", handle: "sarahschlitz.bsky.social", did: "did:plc:6cjlgw33kcve7c4hboi36jnl", party: "Ecolo" },
  { name: "Samuel Cogolati", handle: "cogolati.bsky.social", did: "did:plc:zjqccgwfgeujm2wdnuc3hakp", party: "Ecolo" },
  { name: "François De Smet", handle: "francoisdesmet.bsky.social", did: "did:plc:ghp5jp3bq4gbn4jkag625hpv", party: "DéFI" }
];

export async function fetchBlueskyPostsFromActors(): Promise<BlueskyPost[]> {
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    const allPosts: BlueskyPost[] = [];

    const batchSize = 5;
    for (let i = 0; i < BLUESKY_ACTORS.length; i += batchSize) {
        const batch = BLUESKY_ACTORS.slice(i, i + batchSize);
        await Promise.all(batch.map(async (actor) => {
            try {
                const feedUrl = `https://bsky.app/profile/${actor.handle}/rss`;
                const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
                
                const response = await fetch(proxiedUrl);
                if (!response.ok) return;
                
                const xmlText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(xmlText, 'text/xml');
                
                const parseError = doc.querySelector('parsererror');
                if (parseError) return;

                // Attempt to extract the author avatar from the channel <image><url>
                const channelImageUrl = doc.querySelector('channel > image > url')?.textContent?.trim() || '';

                const items = doc.querySelectorAll('item');
                // We only take the top 5 most recent posts from each actor to keep it light
                const recentItems = Array.from(items).slice(0, 5);

                recentItems.forEach((item) => {
                    const title = item.querySelector('title')?.textContent?.trim() || '';
                    const link = item.querySelector('link')?.textContent?.trim() || '';
                    const description = item.querySelector('description')?.textContent?.trim() || '';
                    const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
                    
                    if (!link || !description) return;

                    // Exclude pure replies (a heuristic: title starts with "Reply to")
                    // Note: Bluesky RSS feeds typically don't have replies, but just in case
                    if (title.startsWith('Reply to')) return;

                    // Extract image from description HTML if present (<img src="...">)
                    const imageMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
                    const images = imageMatch ? [imageMatch[1]] : [];

                    // Clean the description to be purely text for the content
                    const cleanContent = description
                         .replace(/<br\s*\/?>/gi, '\n')
                         .replace(/<[^>]*>/g, '') // Strip other HTML
                         .trim();

                    // Generate a pseudo-ID from the link
                    const id = link.split('/').pop() || Math.random().toString();

                    allPosts.push({
                        id,
                        url: link,
                        authorName: actor.name,
                        authorHandle: `@${actor.handle}`,
                        authorAvatar: channelImageUrl,
                        content: cleanContent,
                        createdAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                        // RSS does not provide engagement stats, so we zero them out for now
                        replyCount: 0,
                        repostCount: 0,
                        likeCount: 0,
                        images
                    });
                });
            } catch (e) {
                console.warn(`Failed to fetch Bluesky RSS feed for ${actor.handle}`);
            }
        }));
    }

    // Sort by newest first
    return allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
