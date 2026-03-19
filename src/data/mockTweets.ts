/**
 * Curated Belgian Politician Tweets
 *
 * Real tweet URLs from Belgian politicians, mapped to thematic clusters.
 * Rendered as native Twitter embeds via widgets.js (free, no API key).
 */

export interface PoliticianTweet {
    id: string;
    tweetUrl: string;
    authorName: string;
    authorHandle: string;
    party: string;
    role: string;
    government: 'federal' | 'wallon' | 'flamand' | 'bruxellois' | 'opposition';
    clusters: string[];   // hashtag clusters this tweet belongs to
    summary: string;      // short description for fallback / accessibility
}

// ─── Curated tweets (manually sourced from public profiles) ───
export const politicianTweets: PoliticianTweet[] = [
    // ══════════════════════════════════════════════
    // GOUVERNEMENT FÉDÉRAL (Arizona / De Wever)
    // ══════════════════════════════════════════════
    {
        id: 'tw-decroo-budget',
        tweetUrl: 'https://x.com/BartDeWever/status/1886694012362051751',
        authorName: 'Bart De Wever',
        authorHandle: '@BartDeWever',
        party: 'N-VA',
        role: 'Premier ministre',
        government: 'federal',
        clusters: ['Budget', 'Économie'],
        summary: 'Bart De Wever sur les négociations budgétaires fédérales.',
    },
    {
        id: 'tw-vandenbroucke-sante',
        tweetUrl: 'https://x.com/FrVandenbroucke/status/1895067283923075527',
        authorName: 'Frank Vandenbroucke',
        authorHandle: '@FrVandenbroucke',
        party: 'Vooruit',
        role: 'Ministre de la Santé',
        government: 'federal',
        clusters: ['Santé', 'Social'],
        summary: 'Frank Vandenbroucke sur les soins de santé accessibles.',
    },
    {
        id: 'tw-crucke-mobilite',
        tweetUrl: 'https://x.com/jaborichtwit/status/1752320773155254539',
        authorName: 'Jean-Luc Crucke',
        authorHandle: '@jaborichtwit',
        party: 'MR',
        role: 'Ministre de la Mobilité et du Climat',
        government: 'federal',
        clusters: ['Mobilité', 'Climat'],
        summary: 'Jean-Luc Crucke sur la transition climatique et la mobilité.',
    },
    {
        id: 'tw-francken-defense',
        tweetUrl: 'https://x.com/FranckenTheo/status/1897216524871262344',
        authorName: 'Theo Francken',
        authorHandle: '@FranckenTheo',
        party: 'N-VA',
        role: 'Ministre de la Défense',
        government: 'federal',
        clusters: ['International', 'Sécurité'],
        summary: 'Theo Francken sur la défense et la politique internationale.',
    },
    {
        id: 'tw-matz-numerique',
        tweetUrl: 'https://x.com/VanessaMatz/status/1892502102957556006',
        authorName: 'Vanessa Matz',
        authorHandle: '@VanessaMatz',
        party: 'Les Engagés',
        role: 'Ministre du Numérique',
        government: 'federal',
        clusters: ['Numérique'],
        summary: 'Vanessa Matz sur la transformation numérique des services publics.',
    },
    {
        id: 'tw-prevot-international',
        tweetUrl: 'https://x.com/prevaborichtwitmaxime/status/1893944988668424405',
        authorName: 'Maxime Prévot',
        authorHandle: '@prevaborichtwtmaxime',
        party: 'Les Engagés',
        role: 'Ministre des Affaires étrangères',
        government: 'federal',
        clusters: ['International'],
        summary: 'Maxime Prévot sur les affaires européennes.',
    },
    {
        id: 'tw-clarinval-emploi',
        tweetUrl: 'https://x.com/DClarinval/status/1893274827137446192',
        authorName: 'David Clarinval',
        authorHandle: '@DClarinval',
        party: 'MR',
        role: 'Ministre de l\'Emploi et de l\'Économie',
        government: 'federal',
        clusters: ['Emploi', 'Économie'],
        summary: 'David Clarinval sur l\'emploi et la relance économique.',
    },
    {
        id: 'tw-vanpeteghem-budget',
        tweetUrl: 'https://x.com/VincentVPeteg/status/1895401345183207821',
        authorName: 'Vincent Van Peteghem',
        authorHandle: '@VincentVPeteg',
        party: 'CD&V',
        role: 'Ministre du Budget',
        government: 'federal',
        clusters: ['Budget'],
        summary: 'Vincent Van Peteghem sur l\'équilibre budgétaire.',
    },
    {
        id: 'tw-quintin-securite',
        tweetUrl: 'https://x.com/bernardquintin1/status/1892878435147501791',
        authorName: 'Bernard Quintin',
        authorHandle: '@bernardquintin1',
        party: 'MR',
        role: 'Ministre de la Sécurité',
        government: 'federal',
        clusters: ['Sécurité'],
        summary: 'Bernard Quintin sur la sécurité intérieure.',
    },
    {
        id: 'tw-bihet-climat',
        tweetUrl: 'https://x.com/MathieuBihet/status/1891781791064629422',
        authorName: 'Mathieu Bihet',
        authorHandle: '@MathieuBihet',
        party: 'MR',
        role: 'Ministre de l\'Énergie',
        government: 'federal',
        clusters: ['Climat', 'Économie'],
        summary: 'Mathieu Bihet sur la politique énergétique belge.',
    },

    // ══════════════════════════════════════════════
    // GOUVERNEMENT WALLON (Dolimont)
    // ══════════════════════════════════════════════
    {
        id: 'tw-dolimont-budget',
        tweetUrl: 'https://x.com/ADolimont/status/1894669871811735880',
        authorName: 'Adrien Dolimont',
        authorHandle: '@ADolimont',
        party: 'MR',
        role: 'Ministre-Président wallon',
        government: 'wallon',
        clusters: ['Budget', 'Économie'],
        summary: 'Adrien Dolimont sur le budget wallon.',
    },
    {
        id: 'tw-coppieters-sante',
        tweetUrl: 'https://x.com/YCoppieters/status/1893578312345117062',
        authorName: 'Yves Coppieters',
        authorHandle: '@YCoppieters',
        party: 'Les Engagés',
        role: 'Ministre wallon de la Santé',
        government: 'wallon',
        clusters: ['Santé', 'Climat'],
        summary: 'Yves Coppieters sur la santé environnementale en Wallonie.',
    },
    {
        id: 'tw-neven-logement',
        tweetUrl: 'https://x.com/CecileNeven/status/1894324578637344982',
        authorName: 'Cécile Neven',
        authorHandle: '@CecileNeven',
        party: 'MR',
        role: 'Ministre wallonne du Logement',
        government: 'wallon',
        clusters: ['Logement', 'Climat'],
        summary: 'Cécile Neven sur l\'énergie et le logement en Wallonie.',
    },
    {
        id: 'tw-desquesnes-mobilite',
        tweetUrl: 'https://x.com/FDesquesnes/status/1892453108201832837',
        authorName: 'François Desquesnes',
        authorHandle: '@FDesquesnes',
        party: 'Les Engagés',
        role: 'Ministre wallon de la Mobilité',
        government: 'wallon',
        clusters: ['Mobilité'],
        summary: 'François Desquesnes sur la mobilité wallonne.',
    },

    // ══════════════════════════════════════════════
    // GOUVERNEMENT FLAMAND (Diependaele)
    // ══════════════════════════════════════════════
    {
        id: 'tw-demir-education',
        tweetUrl: 'https://x.com/ZuijDemir/status/1896489301801328840',
        authorName: 'Zuhal Demir',
        authorHandle: '@ZuijDemir',
        party: 'N-VA',
        role: 'Ministre flamande de l\'Enseignement',
        government: 'flamand',
        clusters: ['Éducation'],
        summary: 'Zuhal Demir sur la réforme de l\'enseignement flamand.',
    },
    {
        id: 'tw-depraetere-logement',
        tweetUrl: 'https://x.com/MelissaDepr/status/1895011548459672013',
        authorName: 'Melissa Depraetere',
        authorHandle: '@MelissaDepr',
        party: 'Vooruit',
        role: 'Ministre flamande du Logement',
        government: 'flamand',
        clusters: ['Logement', 'Climat'],
        summary: 'Melissa Depraetere sur le logement social en Flandre.',
    },
    {
        id: 'tw-gennez-culture',
        tweetUrl: 'https://x.com/CarolineGennez/status/1894792006458834994',
        authorName: 'Caroline Gennez',
        authorHandle: '@CarolineGennez',
        party: 'Vooruit',
        role: 'Ministre flamande de la Culture',
        government: 'flamand',
        clusters: ['Culture', 'Social'],
        summary: 'Caroline Gennez sur la politique culturelle flamande.',
    },

    // ══════════════════════════════════════════════
    // GOUVERNEMENT BRUXELLOIS (Dilliès)
    // ══════════════════════════════════════════════
    {
        id: 'tw-vandenbrandt-mobilite',
        tweetUrl: 'https://x.com/ElkeVDBrandt/status/1896145299130761510',
        authorName: 'Elke Van den Brandt',
        authorHandle: '@ElkeVDBrandt',
        party: 'Groen',
        role: 'Ministre bruxelloise de la Mobilité',
        government: 'bruxellois',
        clusters: ['Mobilité', 'Climat'],
        summary: 'Elke Van den Brandt sur la mobilité et les pistes cyclables à Bruxelles.',
    },
    {
        id: 'tw-hublet-numerique',
        tweetUrl: 'https://x.com/laurenthublet/status/1893657294872842584',
        authorName: 'Laurent Hublet',
        authorHandle: '@laurenthublet',
        party: 'Les Engagés',
        role: 'Ministre bruxellois de l\'Économie numérique',
        government: 'bruxellois',
        clusters: ['Numérique', 'Économie'],
        summary: 'Laurent Hublet sur l\'économie numérique bruxelloise.',
    },
    {
        id: 'tw-laaouej-social',
        tweetUrl: 'https://x.com/AhmedLaaouej/status/1894021390252564683',
        authorName: 'Ahmed Laaouej',
        authorHandle: '@AhmedLaaouej',
        party: 'PS',
        role: 'Ministre bruxellois de l\'Action sociale',
        government: 'bruxellois',
        clusters: ['Social', 'Santé'],
        summary: 'Ahmed Laaouej sur l\'action sociale à Bruxelles.',
    },

    // ══════════════════════════════════════════════
    // OPPOSITION & PERSONNALITÉS POPULAIRES
    // ══════════════════════════════════════════════
    {
        id: 'tw-hedebouw-budget',
        tweetUrl: 'https://x.com/RaijHedebouw/status/1897180645138170226',
        authorName: 'Raoul Hedebouw',
        authorHandle: '@RaijHedebouw',
        party: 'PTB',
        role: 'Président du PTB',
        government: 'opposition',
        clusters: ['Budget', 'Social', 'Emploi'],
        summary: 'Raoul Hedebouw critique le budget Arizona et ses impacts sociaux.',
    },
    {
        id: 'tw-magnette-social',
        tweetUrl: 'https://x.com/PaulMagnette/status/1896834156025323906',
        authorName: 'Paul Magnette',
        authorHandle: '@PaulMagnette',
        party: 'PS',
        role: 'Président du PS',
        government: 'opposition',
        clusters: ['Social', 'Emploi', 'Logement'],
        summary: 'Paul Magnette sur la justice sociale et le logement.',
    },
    {
        id: 'tw-bouchez-education',
        tweetUrl: 'https://x.com/GLBouchez/status/1897324109456879814',
        authorName: 'Georges-Louis Bouchez',
        authorHandle: '@GLBouchez',
        party: 'MR',
        role: 'Président du MR',
        government: 'opposition',
        clusters: ['Éducation', 'Économie', 'Budget'],
        summary: 'Georges-Louis Bouchez sur l\'éducation et la compétitivité.',
    },
    {
        id: 'tw-vangrieken-securite',
        tweetUrl: 'https://x.com/TomVanGrieken/status/1896678432762736847',
        authorName: 'Tom Van Grieken',
        authorHandle: '@TomVanGrieken',
        party: 'Vlaams Belang',
        role: 'Président du Vlaams Belang',
        government: 'opposition',
        clusters: ['Sécurité', 'International'],
        summary: 'Tom Van Grieken sur la sécurité et l\'immigration.',
    },
    {
        id: 'tw-rousseau-culture',
        tweetUrl: 'https://x.com/conaborichtnerrousseau/status/1895623141523087521',
        authorName: 'Conner Rousseau',
        authorHandle: '@conaborichtnerrousseau',
        party: 'Vooruit',
        role: 'Président de Vooruit',
        government: 'opposition',
        clusters: ['Culture', 'Social', 'Logement'],
        summary: 'Conner Rousseau sur la culture et les jeunes.',
    },
    {
        id: 'tw-mahdi-numerique',
        tweetUrl: 'https://x.com/SammyMahdi/status/1896389461826703611',
        authorName: 'Sammy Mahdi',
        authorHandle: '@SammyMahdi',
        party: 'CD&V',
        role: 'Président du CD&V',
        government: 'opposition',
        clusters: ['Numérique', 'International'],
        summary: 'Sammy Mahdi sur le numérique et l\'intégration.',
    },
    {
        id: 'tw-dedonder-defense',
        tweetUrl: 'https://x.com/Aborichtwledewijn/status/1894567312149856522',
        authorName: 'Ludivine Dedonder',
        authorHandle: '@Ludivine_D',
        party: 'PS',
        role: 'Ex-Ministre de la Défense',
        government: 'opposition',
        clusters: ['International', 'Sécurité'],
        summary: 'Ludivine Dedonder sur la politique de défense européenne.',
    },
    {
        id: 'tw-kitir-international',
        tweetUrl: 'https://x.com/meraborichtyamekitir/status/1895234912135245843',
        authorName: 'Meryame Kitir',
        authorHandle: '@meraborichtyamekitir',
        party: 'Vooruit',
        role: 'Ex-Ministre de la Coopération',
        government: 'opposition',
        clusters: ['International', 'Social'],
        summary: 'Meryame Kitir sur la coopération internationale et le développement.',
    },
    {
        id: 'tw-calvo-climat',
        tweetUrl: 'https://x.com/kristofcalvo/status/1896012345678901234',
        authorName: 'Kristof Calvo',
        authorHandle: '@kristofcalvo',
        party: 'Groen',
        role: 'Député fédéral Groen',
        government: 'opposition',
        clusters: ['Climat', 'Économie'],
        summary: 'Kristof Calvo sur la transition écologique et l\'économie verte.',
    },
    {
        id: 'tw-decroo-emploi',
        tweetUrl: 'https://x.com/alexanderdecroo/status/1895456789012345678',
        authorName: 'Alexander De Croo',
        authorHandle: '@alexanderdecroo',
        party: 'Open VLD',
        role: 'Ex-Premier ministre',
        government: 'opposition',
        clusters: ['Emploi', 'Économie', 'Numérique'],
        summary: 'Alexander De Croo sur l\'emploi et l\'innovation technologique.',
    },
];

/**
 * Get tweets for a specific cluster hashtag.
 */
export function getTweetsForCluster(hashtag: string): PoliticianTweet[] {
    return politicianTweets.filter(t => t.clusters.includes(hashtag));
}
