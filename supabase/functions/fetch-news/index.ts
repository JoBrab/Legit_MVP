import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback news data when external API limits are reached
const fallbackNews = [
  {
    title: "Réforme des pensions : tensions autour des nouvelles propositions",
    description:
      "Les partenaires sociaux réagissent aux pistes de réforme. Points de désaccord et calendrier évoqués.",
    url: "https://www.rtbf.be/",
    image:
      "https://images.unsplash.com/photo-1554224311-beee460201e8?w=900&auto=format&fit=crop",
    source: "RTBF Info",
    published_at: new Date().toISOString(),
  },
  {
    title: "Bruxelles : évolution du plan Good Move",
    description:
      "Retour sur les aménagements de mobilité et les ajustements prévus dans plusieurs quartiers.",
    url: "https://www.lesoir.be/",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=900&auto=format&fit=crop",
    source: "Le Soir",
    published_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Éolien offshore : nouveaux projets en mer du Nord",
    description:
      "Les capacités renouvelables continuent d’augmenter avec de nouveaux appels d’offres et raccordements.",
    url: "https://www.lalibre.be/",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&auto=format&fit=crop",
    source: "La Libre",
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Aide sociale : hausse des demandes d’accompagnement",
    description:
      "Les services sociaux observent une progression des demandes d’aide et d’orientation ces dernières semaines.",
    url: "https://www.rtbf.be/",
    image:
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=900&auto=format&fit=crop",
    source: "RTBF Info",
    published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords } = await req.json();
    const MEDIASTACK_API_KEY = Deno.env.get('MEDIASTACK_API_KEY');

    if (!MEDIASTACK_API_KEY) {
      console.error('MEDIASTACK_API_KEY not configured');
      return new Response(
        JSON.stringify({ data: fallbackNews, meta: { source: 'fallback', reason: 'missing_api_key' } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching news for keywords: ${keywords}`);

    // Build the API URL with parameters for Belgian news
    const params = new URLSearchParams({
      access_key: MEDIASTACK_API_KEY,
      countries: 'be',
      languages: 'fr,nl',
      limit: '10',
      sort: 'published_desc',
    });

    if (keywords) {
      params.append('keywords', keywords);
    }

    const url = `http://api.mediastack.com/v1/news?${params.toString()}`;

    console.log('Calling Mediastack API...');
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mediastack API error:', response.status, errorText);

      // IMPORTANT: return 200 with fallback to avoid client blank screens
      return new Response(
        JSON.stringify({
          data: fallbackNews,
          meta: {
            source: 'fallback',
            upstream_status: response.status,
            upstream_error: errorText,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const articles = Array.isArray(data?.data) ? data.data : [];
    console.log(`Successfully fetched ${articles.length} news articles`);

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ data: fallbackNews, meta: { source: 'fallback', reason: 'empty_response' } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ data: articles, meta: { source: 'mediastack' } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-news function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ data: fallbackNews, meta: { source: 'fallback', reason: 'exception', error: errorMessage } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
