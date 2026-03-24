import { fetchBlueskyPostsFromActors } from './src/services/blueskyService.ts';

async function verify() {
  console.log('starting verification');
  try {
    const posts = await fetchBlueskyPostsFromActors();
    console.log(`Fetched ${posts.length} posts from Bluesky.`);
    if (posts.length > 0) {
      console.log('First post:', JSON.stringify(posts[0], null, 2));
    } else {
      console.log('No posts returned. Is there a network/CORS error or API limit?');
    }
  } catch(e) {
    console.error('Crash:', e);
  }
}

verify();
