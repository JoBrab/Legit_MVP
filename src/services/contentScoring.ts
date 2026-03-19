/**
 * Content Scoring Engine
 *
 * Scores and ranks RSS articles for thematic clusters using:
 *   - Recency (30%): linear decay from publication time
 *   - Relevance (40%): keyword matching against hashtag dictionaries
 *   - Source Diversity (20%): penalizes 3rd+ article from same source
 *   - Engagement (10%): placeholder for future click tracking
 *
 * Designed to be extended for politician, civil society, and citizen posts.
 */

import { RSSArticle } from './rssService';

// ──────────────────────────────────────────────────────────────
// Hashtag Keyword Dictionaries
// Each hashtag maps to an array of lowercase French keywords.
// Title matches are weighted 3× vs description matches.
// ──────────────────────────────────────────────────────────────

export const HASHTAG_KEYWORDS: Record<string, string[]> = {
    Budget: [
        'budget', 'fiscal', 'fiscalité', 'impôt', 'impôts', 'taxe', 'taxes', 'tva',
        'dette', 'déficit', 'économie', 'économique', 'finances', 'financier', 'financière',
        'pension', 'pensions', 'retraite', 'allocations', 'allocation', 'cpas',
        'austérité', 'subsides', 'subside', 'subvention', 'subventions',
        'cotisation', 'cotisations', 'revenu', 'revenus', 'salaire', 'salaires',
        'emploi', 'chômage', 'inflation', 'pouvoir d\'achat', 'prix',
        'bce', 'banque nationale', 'croissance', 'pib', 'récession',
        'épargne', 'investissement', 'endettement', 'crédit', 'dépenses',
        'recettes', 'fédéral', 'entités fédérées', 'concertation budgétaire',
    ],
    Mobilité: [
        'mobilité', 'transport', 'transports', 'sncb', 'nmbs', 'tec', 'stib', 'mivb',
        'de lijn', 'train', 'trains', 'bus', 'tram', 'métro',
        'route', 'routes', 'autoroute', 'autoroutes', 'embouteillage', 'embouteillages',
        'vélo', 'vélos', 'cycliste', 'cyclistes', 'piste cyclable',
        'voiture', 'voitures', 'automobile', 'électrique', 'borne de recharge',
        'ring', 'travaux', 'chantier', 'circulation', 'trafic',
        'aéroport', 'zaventem', 'charleroi airport', 'avion', 'aviation',
        'stationnement', 'parking', 'zone 30', 'piéton', 'piétons',
        'covoiturage', 'trottinette', 'mobilité douce', 'navetteur', 'navetteurs',
    ],
    Logement: [
        'logement', 'logements', 'immobilier', 'immobilière',
        'loyer', 'loyers', 'locataire', 'locataires', 'propriétaire', 'propriétaires',
        'habitation', 'appartement', 'maison', 'construction',
        'urbanisme', 'urbanisation', 'permis de bâtir', 'permis d\'urbanisme',
        'logement social', 'logements sociaux', 'sans-abri', 'sdf',
        'rénovation', 'isolation', 'énergie', 'peb', 'certificat énergétique',
        'hypothèque', 'hypothécaire', 'crédit immobilier',
        'expulsion', 'bail', 'indexation des loyers', 'prix de l\'immobilier',
        'copropriété', 'lotissement', 'gentrification', 'quartier',
    ],
    Santé: [
        'santé', 'santé publique', 'hôpital', 'hôpitaux', 'clinique',
        'soins', 'soins de santé', 'médecin', 'médecins', 'infirmier', 'infirmière',
        'mutuelle', 'mutualité', 'inami', 'sécurité sociale',
        'médicament', 'médicaments', 'pharmacie', 'vaccin', 'vaccination',
        'pandémie', 'épidémie', 'covid', 'coronavirus', 'virus',
        'santé mentale', 'psychiatrie', 'psychologue', 'burn-out', 'dépression',
        'cancer', 'maladie', 'maladies', 'patient', 'patients',
        'urgences', 'planning familial', 'avortement', 'euthanasie',
        'pénurie', 'personnel soignant', 'maison de repos', 'aide-soignant',
    ],
    Climat: [
        'climat', 'climatique', 'réchauffement', 'environnement', 'environnemental',
        'co2', 'carbone', 'émissions', 'gaz à effet de serre', 'pollution',
        'énergie', 'éolien', 'éolienne', 'solaire', 'photovoltaïque',
        'nucléaire', 'doel', 'tihange', 'centrale',
        'biodiversité', 'nature', 'forêt', 'déforestation',
        'inondation', 'inondations', 'sécheresse', 'tempête', 'canicule',
        'développement durable', 'transition', 'transition énergétique',
        'accord de paris', 'cop', 'giec', 'neutralité carbone',
        'pesticide', 'pesticides', 'pfas', 'glyphosate', 'amiante',
        'déchet', 'déchets', 'recyclage', 'économie circulaire', 'plastique',
    ],
    Éducation: [
        'éducation', 'enseignement', 'école', 'écoles', 'scolaire',
        'université', 'universités', 'ucl', 'uclouvain', 'ulb', 'uliège', 'umons', 'unamur',
        'haute école', 'hautes écoles', 'étudiant', 'étudiants', 'élève', 'élèves',
        'professeur', 'professeurs', 'enseignant', 'enseignants', 'instituteur',
        'pisa', 'réforme', 'programme scolaire', 'diplôme',
        'bourse', 'bourses', 'minerval', 'inscription',
        'crèche', 'crèches', 'garderie', 'accueil extrascolaire',
        'pénurie d\'enseignants', 'tronc commun', 'pacte d\'excellence',
        'décret', 'fédération wallonie-bruxelles', 'communauté française',
        'formation', 'apprentissage', 'alphabétisation', 'décrochage scolaire',
    ],
    Sécurité: [
        'sécurité', 'police', 'policier', 'policiers', 'gendarmerie',
        'justice', 'tribunal', 'tribunaux', 'procès', 'condamnation', 'verdict',
        'criminalité', 'crime', 'crimes', 'délinquance', 'vol', 'agression',
        'terrorisme', 'terroriste', 'radicalisation', 'ocam',
        'prison', 'prisons', 'détenu', 'détenus', 'surpopulation carcérale',
        'drogue', 'drogues', 'trafic', 'narcotrafic', 'cocaïne',
        'arme', 'armes', 'fusillade', 'meurtre', 'homicide',
        'parquet', 'procureur', 'enquête', 'instruction',
        'victime', 'victimes', 'plainte', 'violence', 'violences',
        'cybercriminalité', 'fraude', 'blanchiment', 'corruption',
    ],
    International: [
        'international', 'internationale', 'géopolitique', 'diplomatie',
        'europe', 'européen', 'européenne', 'union européenne', 'commission européenne',
        'otan', 'nato', 'défense', 'armée', 'militaire',
        'guerre', 'conflit', 'paix', 'cessez-le-feu', 'négociations',
        'ukraine', 'russie', 'gaza', 'israël', 'palestine', 'iran', 'chine', 'états-unis',
        'immigration', 'migrant', 'migrants', 'réfugié', 'réfugiés', 'asile',
        'frontière', 'frontières', 'schengen', 'fedasil',
        'onu', 'nations unies', 'sanctions', 'embargo',
        'exportation', 'importation', 'commerce international',
        'aide humanitaire', 'coopération', 'développement',
        'trump', 'macron', 'von der leyen', 'poutine', 'zelensky',
    ],
    Numérique: [
        'numérique', 'digital', 'digitalisation', 'technologie', 'tech',
        'intelligence artificielle', 'ia', 'chatgpt', 'openai', 'deepfake',
        'données', 'data', 'rgpd', 'vie privée', 'protection des données',
        'réseaux sociaux', 'facebook', 'instagram', 'tiktok', 'twitter', 'x',
        'cybersécurité', 'piratage', 'hacking', 'cybercriminalité',
        'startup', 'startups', 'innovation', 'fintech',
        'smartphone', 'application', 'plateforme',
        'e-commerce', 'commerce en ligne', 'amazon',
        'télécommunication', 'proximus', 'orange', 'base', '5g', 'fibre',
        'algorithme', 'automatisation', 'robot', 'robotique',
        'désinformation', 'fake news', 'fact-checking', 'modération',
    ],
    Culture: [
        'culture', 'culturel', 'culturelle', 'art', 'arts', 'artiste',
        'musique', 'concert', 'concerts', 'festival', 'festivals',
        'cinéma', 'film', 'films', 'série', 'séries', 'télévision',
        'théâtre', 'spectacle', 'spectacles', 'danse',
        'patrimoine', 'musée', 'musées', 'exposition', 'expositions',
        'livre', 'livres', 'littérature', 'auteur', 'écrivain', 'roman',
        'bande dessinée', 'bd', 'manga',
        'mode', 'fashion', 'design', 'architecture',
        'gastronomie', 'cuisine', 'chef', 'restaurant',
        'sport', 'football', 'diables rouges', 'cyclisme', 'tennis',
        'olympique', 'jeux olympiques', 'athlétisme', 'compétition',
    ],
    Économie: [
        'économie', 'économique', 'croissance', 'pib', 'récession', 'conjoncture',
        'marché', 'marchés', 'bourse', 'entreprise', 'entreprises', 'pme',
        'industrie', 'industriel', 'industrielle', 'secteur', 'productivité',
        'commerce', 'exportation', 'importation', 'balance commerciale',
        'concurrence', 'compétitivité', 'mondialisation', 'libre-échange',
        'investissement', 'investissements', 'capital', 'capitalisme',
        'inflation', 'déflation', 'pouvoir d\'achat', 'prix',
        'banque', 'banques', 'banque nationale', 'bce', 'taux d\'intérêt',
        'faillite', 'faillites', 'restructuration', 'licenciement collectif',
        'start-up', 'innovation', 'entrepreneuriat', 'indépendant',
        'agriculture', 'agricole', 'agriculteur', 'pac', 'horeca',
    ],
    Emploi: [
        'emploi', 'emplois', 'travail', 'travailler', 'travailleur', 'travailleurs',
        'chômage', 'chômeur', 'chômeurs', 'demandeur d\'emploi', 'forem', 'vdab', 'actiris',
        'embauche', 'recrutement', 'offre d\'emploi', 'contrat', 'intérim',
        'salaire', 'salaires', 'rémunération', 'augmentation salariale',
        'syndicat', 'syndicats', 'fgtb', 'csc', 'cgslb', 'grève', 'manifestation',
        'négociation sociale', 'accord interprofessionnel', 'concertation sociale',
        'flexibilité', 'télétravail', 'temps partiel', 'flexi-job',
        'pénurie', 'pénurie de main-d\'œuvre', 'métier en pénurie',
        'formation professionnelle', 'reconversion', 'stage',
        'licenciement', 'restructuration', 'préavis', 'plan social',
        'droit du travail', 'code du travail', 'inspection sociale',
    ],
    Social: [
        'social', 'sociale', 'solidarité', 'solidaire', 'inclusion',
        'pauvreté', 'précarité', 'inégalité', 'inégalités', 'cpas',
        'aide sociale', 'revenu d\'intégration', 'sécurité sociale',
        'allocation', 'allocations', 'allocations familiales', 'handicap',
        'pension', 'pensions', 'retraite', 'prépension',
        'sans-abri', 'sdf', 'sans-abrisme', 'logement d\'urgence',
        'famille', 'familles', 'monoparental', 'garde d\'enfants',
        'égalité des chances', 'discrimination', 'racisme', 'diversité',
        'droits des femmes', 'féminisme', 'violence conjugale',
        'lgbtq', 'droits humains', 'droits fondamentaux',
        'bénévolat', 'associatif', 'secteur non-marchand', 'asbl',
        'migration', 'intégration', 'accueil', 'fedasil',
    ],
};

/** All available hashtags, ordered as they should appear in the trending bar */
export const ALL_HASHTAGS = Object.keys(HASHTAG_KEYWORDS);

// ──────────────────────────────────────────────────────────────
// Scoring Functions
// ──────────────────────────────────────────────────────────────

const WEIGHTS = {
    recency: 0.30,
    relevance: 0.40,
    diversity: 0.20,
    engagement: 0.10,
};

/**
 * Recency score (0-100).
 * <1h = 100, <6h = 80, <12h = 50, <24h = 20, >24h = 0
 */
function recencyScore(publishedAt: string): number {
    const ageMs = Date.now() - new Date(publishedAt).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);

    if (ageHours < 1) return 100;
    if (ageHours < 6) return 80 + (1 - ageHours / 6) * 20; // 80-100
    if (ageHours < 12) return 50 + (1 - ageHours / 12) * 30; // 50-80
    if (ageHours < 24) return 20 + (1 - ageHours / 24) * 30; // 20-50
    if (ageHours < 48) return Math.max(0, 20 - (ageHours - 24) * (20 / 24));
    return 0;
}

/**
 * Relevance score (0-100).
 * Matches keywords against title (×3) and description (×1).
 * Score = min(100, matchPoints × 15) — so ~7 keyword hits = max score.
 */
function relevanceScore(article: RSSArticle, hashtag: string): number {
    const keywords = HASHTAG_KEYWORDS[hashtag];
    if (!keywords) return 0;

    const titleLower = article.title.toLowerCase();
    const descLower = article.description.toLowerCase();

    let points = 0;
    for (const keyword of keywords) {
        const kw = keyword.toLowerCase();
        if (titleLower.includes(kw)) points += 3;
        if (descLower.includes(kw)) points += 1;
    }

    return Math.min(100, points * 15);
}

/**
 * Engagement score (placeholder).
 * Returns a constant 50. Will be replaced with real click data
 * when Supabase tracking is implemented.
 */
function engagementScore(_article: RSSArticle): number {
    return 50;
}

/**
 * Compute composite score for an article against a hashtag.
 */
export function scoreArticle(article: RSSArticle, hashtag: string): number {
    const rec = recencyScore(article.published_at);
    const rel = relevanceScore(article, hashtag);
    const eng = engagementScore(article);

    // Diversity is applied post-sort, not per-article
    return (
        rec * WEIGHTS.recency +
        rel * WEIGHTS.relevance +
        eng * WEIGHTS.engagement
    ) / (WEIGHTS.recency + WEIGHTS.relevance + WEIGHTS.engagement); // normalize to 0-100
}

/**
 * Find the best matching hashtag for an article.
 * Returns { hashtag, score } or null if no hashtag scores > threshold.
 */
export function bestHashtagForArticle(
    article: RSSArticle,
    minScore = 10,
): { hashtag: string; score: number } | null {
    let best: { hashtag: string; score: number } | null = null;

    for (const hashtag of ALL_HASHTAGS) {
        const score = scoreArticle(article, hashtag);
        if (score > (best?.score ?? 0)) {
            best = { hashtag, score };
        }
    }

    return best && best.score >= minScore ? best : null;
}

export interface ScoredArticle {
    article: RSSArticle;
    score: number;
}

/**
 * Rank articles for a specific cluster.
 *
 * 1. Score all articles against the hashtag
 * 2. Filter to minimum relevance threshold
 * 3. Sort by score descending
 * 4. Apply source diversity penalty (max `maxPerSource` per media)
 * 5. Return top `limit` articles
 */
export function rankArticlesForCluster(
    articles: RSSArticle[],
    hashtag: string,
    { limit = 3, maxPerSource = 2, minRelevance = 5 } = {},
): ScoredArticle[] {
    // Score and filter
    const scored: ScoredArticle[] = articles
        .map(article => ({ article, score: scoreArticle(article, hashtag) }))
        .filter(sa => relevanceScore(sa.article, hashtag) >= minRelevance)
        .sort((a, b) => b.score - a.score);

    // Apply source diversity cap
    const sourceCounts: Record<string, number> = {};
    const result: ScoredArticle[] = [];

    for (const sa of scored) {
        const source = sa.article.source;
        const count = sourceCounts[source] || 0;

        if (count >= maxPerSource) {
            // Apply heavy diversity penalty but keep in pipeline
            continue;
        }

        sourceCounts[source] = count + 1;
        result.push(sa);

        if (result.length >= limit) break;
    }

    return result;
}

/**
 * Distribute all articles across hashtags.
 * Each article goes to its single best-matching hashtag.
 * Returns a map of hashtag → ranked ScoredArticle[].
 */
export function distributeArticlesToClusters(
    articles: RSSArticle[],
    { articlesPerCluster = 3, maxPerSource = 2 } = {},
): Record<string, ScoredArticle[]> {
    // Assign each article to its best hashtag
    const buckets: Record<string, RSSArticle[]> = {};
    for (const hashtag of ALL_HASHTAGS) {
        buckets[hashtag] = [];
    }

    for (const article of articles) {
        const best = bestHashtagForArticle(article);
        if (best) {
            buckets[best.hashtag].push(article);
        }
    }

    // Rank within each cluster
    const result: Record<string, ScoredArticle[]> = {};
    for (const hashtag of ALL_HASHTAGS) {
        const ranked = rankArticlesForCluster(buckets[hashtag], hashtag, {
            limit: articlesPerCluster,
            maxPerSource,
        });
        if (ranked.length > 0) {
            result[hashtag] = ranked;
        }
    }

    return result;
}
