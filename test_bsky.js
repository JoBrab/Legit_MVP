import { fetchBlueskyPostsFromActors } from './src/services/blueskyService.js';

async function test() {
  console.log("Fetching...");
  try {
    const posts = await fetchBlueskyPostsFromActors();
    console.log(`Fetched ${posts.length} posts.`);
    if (posts.length > 0) {
      console.log(posts[0]);
    }
  } catch (e) {
    console.error(e);
  }
}

test();
