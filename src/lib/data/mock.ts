// Données factices. Elles imitent les tables du futur backend :
// la couche src/lib/data/index.ts les lit et les met en forme pour l'UI.
// Les dates sont relatives à « maintenant » pour que l'app ait toujours l'air à jour.

import type {
  CollectionRun, Opportunity, Profile, Report, SignalSourceType, SourceCategory,
} from './types'
import { mockReports } from './mock-reports'

/** Signal brut collecté par un run. */
export interface MockSignal {
  id: string
  source: string
  source_type: SignalSourceType
  title: string | null
  url: string | null
  collected_at: string
  /** Identifiant du run qui l'a collecté. */
  batch_id: string
  /** false = en attente d'analyse IA. */
  analyzed: boolean
}

/** Lien opportunité ↔ signal. */
export interface MockOpportunitySignal {
  opportunity_id: string
  signal_id: string
  relevance_note: string | null
}

/** Opportunité sans ses signaux liés (ils sont dans opportunitySignals). */
export type MockOpportunity = Omit<Opportunity, 'signals'>

/** Date ISO il y a `days` jours, à l'heure indiquée. */
function at(days: number, hour: number, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

// ─── Catalogue des sources (PRD) ─────────────────────────────────────────────

const SOURCE_TYPES: Record<string, SignalSourceType> = {
  hackernews: 'community',
  reddit: 'community',
  francetravail: 'job',
  indeed: 'job',
}

export const sourceCategories: SourceCategory[] = [
  {
    id: 'emploi',
    name: 'Emplois & Missions Freelance',
    desc: 'Offres d\'emploi et missions freelance — signaux de besoins non automatisés.',
    sources: [
      { name: 'France Travail',  key: 'francetravail', type: 'Gratuit', desc: 'Offres d\'emploi officielles FR (API publique)', emoji: '🏛️' },
      { name: 'Indeed (Apify)',  key: 'indeed',        type: 'Crédits', desc: 'Offres d\'emploi FR & QC via un acteur Apify',   emoji: '📋' },
    ],
  },
  {
    id: 'communaute',
    name: 'Communautés & Insights',
    desc: 'Discussions ouvertes, pain points et lancements produits.',
    sources: [
      { name: 'Hacker News', key: 'hackernews', type: 'Gratuit', desc: 'Tech & Startups discussions',          emoji: '🟠' },
      { name: 'Reddit',      key: 'reddit',     type: 'Gratuit', desc: 'Forums SaaS, startups & secteurs pro', emoji: '🔴' },
    ],
  },
]

// ─── Collectes ───────────────────────────────────────────────────────────────

export const collectionRuns: CollectionRun[] = [
  {
    id: 'run-5', started_at: at(0, 8, 15), status: 'completed',
    results_summary: { hackernews: { collected: 34 }, reddit: { collected: 28 }, francetravail: { collected: 41 }, indeed: { collected: 22 } },
    signals_collected: 125, signals_analyzed: 107, opportunities_created: 2, opportunities_updated: 3,
  },
  {
    id: 'run-4', started_at: at(2, 18, 40), status: 'completed',
    results_summary: { hackernews: { collected: 31 }, reddit: { collected: 26 } },
    signals_collected: 57, signals_analyzed: 57, opportunities_created: 3, opportunities_updated: 1,
  },
  {
    id: 'run-3', started_at: at(4, 9, 5), status: 'partial',
    results_summary: { francetravail: { collected: 38 }, indeed: { collected: 0 } },
    signals_collected: 38, signals_analyzed: 38, opportunities_created: 2, opportunities_updated: 0,
  },
  {
    id: 'run-2', started_at: at(6, 14, 30), status: 'completed',
    results_summary: { hackernews: { collected: 30 }, reddit: { collected: 22 }, francetravail: { collected: 35 }, indeed: { collected: 19 } },
    signals_collected: 106, signals_analyzed: 106, opportunities_created: 5, opportunities_updated: 0,
  },
  {
    id: 'run-1', started_at: at(7, 10, 0), status: 'failed',
    results_summary: { indeed: { collected: 0 } },
    signals_collected: 0, signals_analyzed: 0, opportunities_created: 0, opportunities_updated: 0,
  },
]

// ─── Opportunités ────────────────────────────────────────────────────────────

export const opportunities: MockOpportunity[] = [
  {
    id: 'opp-01', title: 'Relances de factures automatisées pour artisans',
    problem: 'Les artisans du bâtiment passent plusieurs heures par semaine à relancer des clients qui paient en retard, souvent par téléphone.',
    description: 'Un outil connecté au logiciel de facturation qui envoie des relances graduées par SMS et courriel, et prévient l\'artisan seulement en cas de litige.',
    department: 'finance', target_market: 'fr', signal_count: 63, score_global: 88, created_at: at(0, 9, 10),
    score_volume: 85, score_urgency: 92, score_tool_gap: 81, score_saturation: 34,
    opportunity_type: 'saas', revenue_model: 'subscription', time_to_mvp: 'weeks', complexity: 'low',
    estimated_cost: '2 000 – 4 000 €', price_range: '19 – 39 € / mois', market_size_hint: 'large',
    solo_dev_feasible: true, recurring_potential: true,
    key_challenges: ['Intégration aux logiciels de facturation existants', 'Ton des relances adapté à la relation client', 'Acquisition d\'une cible peu présente en ligne'],
    existing_tools: ['Pennylane', 'Sellsy', 'Excel'],
    tool_gaps: 'Les outils comptables proposent des relances par courriel génériques, mais pas de séquence SMS ni de suivi pensé pour les petites entreprises du bâtiment.',
  },
  {
    id: 'opp-02', title: 'Agent IA de tri des candidatures pour PME',
    problem: 'Les PME sans service RH reçoivent des dizaines de candidatures par offre et n\'ont pas le temps de les trier.',
    description: 'Un agent IA qui lit les CV reçus, les classe selon les critères du poste et prépare une courte liste avec une justification pour chaque profil.',
    department: 'rh', target_market: 'fr_qc', signal_count: 51, score_global: 82, created_at: at(0, 8, 40),
    score_volume: 78, score_urgency: 80, score_tool_gap: 74, score_saturation: 48,
    opportunity_type: 'ai_agent_product', revenue_model: 'usage_based', time_to_mvp: 'weeks', complexity: 'medium',
    estimated_cost: '5 000 – 8 000 €', price_range: '2 € par candidature analysée', market_size_hint: 'large',
    solo_dev_feasible: true, recurring_potential: true,
    key_challenges: ['Conformité RGPD et Loi 25 au Québec', 'Biais dans le classement', 'Confiance des recruteurs'],
    existing_tools: ['Welcome to the Jungle', 'Indeed Employeur', 'Taleez'],
    tool_gaps: 'Les ATS du marché visent les équipes RH structurées ; rien de simple pour un dirigeant de PME qui recrute deux fois par an.',
  },
  {
    id: 'opp-03', title: 'Planification des tournées pour aides à domicile',
    problem: 'Les structures d\'aide à domicile construisent les plannings de tournée à la main, avec beaucoup de trajets perdus.',
    description: 'Un planificateur qui optimise les tournées selon les créneaux des bénéficiaires, les compétences des intervenants et les temps de trajet.',
    department: 'operations', target_market: 'fr', signal_count: 47, score_global: 76, created_at: at(1, 16, 20),
    score_volume: 70, score_urgency: 77, score_tool_gap: 79, score_saturation: 41,
    opportunity_type: 'saas', revenue_model: 'subscription', time_to_mvp: 'months', complexity: 'high',
    estimated_cost: '10 000 – 15 000 €', price_range: '8 € / intervenant / mois', market_size_hint: 'medium',
    solo_dev_feasible: false, recurring_potential: true,
    key_challenges: ['Algorithme d\'optimisation sous contraintes', 'Cycle de vente long dans le médico-social'],
    existing_tools: ['Ximi', 'Apologic', 'Excel'],
    tool_gaps: 'Les logiciels métier gèrent la facturation mais l\'optimisation des trajets reste manuelle.',
  },
  {
    id: 'opp-04', title: 'Veille des appels d\'offres publics pour TPE',
    problem: 'Les TPE ratent des appels d\'offres publics faute de temps pour surveiller les plateformes.',
    description: 'Une alerte quotidienne qui filtre les appels d\'offres selon le métier et la zone de l\'entreprise, avec un résumé du cahier des charges.',
    department: 'commercial', target_market: 'fr_qc', signal_count: 39, score_global: 71, created_at: at(2, 11, 5),
    score_volume: 66, score_urgency: 63, score_tool_gap: 72, score_saturation: 55,
    opportunity_type: 'micro_product', revenue_model: 'subscription', time_to_mvp: 'days', complexity: 'low',
    estimated_cost: '1 000 – 2 000 €', price_range: '15 € / mois', market_size_hint: 'medium',
    solo_dev_feasible: true, recurring_potential: true,
    key_challenges: ['Qualité du filtrage', 'Sources différentes en France et au Québec (SEAO)'],
    existing_tools: ['Marchés Online', 'SEAO'],
    tool_gaps: 'Les plateformes existantes sont chères et pensées pour les grandes entreprises qui répondent souvent.',
  },
  {
    id: 'opp-05', title: 'Base de connaissances auto-alimentée pour le support',
    problem: 'Les équipes support répondent sans cesse aux mêmes questions car la FAQ n\'est jamais à jour.',
    description: 'Un outil qui repère les questions récurrentes dans les tickets et propose automatiquement de nouveaux articles d\'aide.',
    department: 'support', target_market: 'qc', signal_count: 34, score_global: 67, created_at: at(2, 15, 45),
    score_volume: 61, score_urgency: 58, score_tool_gap: 69, score_saturation: 62,
    opportunity_type: 'ai_agent_product', revenue_model: 'subscription', time_to_mvp: 'weeks', complexity: 'medium',
    estimated_cost: '4 000 – 6 000 €', price_range: '49 – 99 $ CA / mois', market_size_hint: 'medium',
    solo_dev_feasible: true, recurring_potential: true,
    key_challenges: ['Intégrations Zendesk et Freshdesk', 'Concurrence des fonctions IA natives'],
    existing_tools: ['Zendesk Guide', 'Freshdesk', 'Notion'],
    tool_gaps: 'Les fonctions IA natives restent en anglais et peu adaptées au français québécois.',
  },
  {
    id: 'opp-06', title: 'Générateur de rapports clients pour agences marketing',
    problem: 'Les petites agences compilent chaque mois les chiffres de plusieurs outils pour construire les rapports clients.',
    description: 'Un générateur qui assemble les données publicitaires et analytiques dans un rapport commenté, prêt à envoyer.',
    department: 'marketing', target_market: 'fr', signal_count: 29, score_global: 63, created_at: at(3, 10, 30),
    score_volume: 58, score_urgency: 55, score_tool_gap: 52, score_saturation: 71,
    opportunity_type: 'saas', revenue_model: 'subscription', time_to_mvp: 'weeks', complexity: 'medium',
    estimated_cost: '3 000 – 5 000 €', price_range: '29 € / client / mois', market_size_hint: 'medium',
    solo_dev_feasible: true, recurring_potential: true,
    key_challenges: ['Marché déjà occupé', 'Maintenance des connecteurs API'],
    existing_tools: ['Looker Studio', 'AgencyAnalytics', 'Whatagraph'],
    tool_gaps: 'Les outils produisent des tableaux de bord mais pas de commentaire rédigé en français.',
  },
  {
    id: 'opp-07', title: 'Suivi des certifications obligatoires des employés',
    problem: 'Les entreprises de transport et du BTP suivent les dates d\'expiration des habilitations dans des tableurs.',
    description: 'Un registre des certifications avec alertes avant expiration et prise de rendez-vous de formation.',
    department: 'rh', target_market: 'fr', signal_count: 24, score_global: 58, created_at: at(3, 14, 0),
    score_volume: 49, score_urgency: 66, score_tool_gap: 57, score_saturation: 44,
    opportunity_type: 'micro_product', revenue_model: 'subscription', time_to_mvp: 'days', complexity: 'low',
    estimated_cost: '1 000 – 2 500 €', price_range: '29 € / mois', market_size_hint: 'niche',
    solo_dev_feasible: true, recurring_potential: true,
    key_challenges: ['Marché de niche', 'Diversité des certifications selon les secteurs'],
    existing_tools: ['Excel', 'Lucca'],
    tool_gaps: 'Les SIRH généralistes ne gèrent pas les habilitations métier ni leurs renouvellements.',
  },
  {
    id: 'opp-08', title: 'Rapprochement bancaire pour associations',
    problem: 'Les trésoriers bénévoles d\'associations rapprochent les relevés bancaires à la main en fin d\'année.',
    description: 'Un outil simple qui importe les relevés, propose les rapprochements et produit le bilan annuel.',
    department: 'finance', target_market: 'qc', signal_count: 21, score_global: 52, created_at: at(4, 9, 50),
    score_volume: 44, score_urgency: 47, score_tool_gap: 60, score_saturation: 52,
    opportunity_type: 'template', revenue_model: 'one_time', time_to_mvp: 'days', complexity: 'low',
    estimated_cost: '500 – 1 500 €', price_range: '49 $ CA', market_size_hint: 'niche',
    solo_dev_feasible: true, recurring_potential: false,
    key_challenges: ['Faible budget de la cible', 'Formats de relevés différents selon les banques'],
    existing_tools: ['Excel', 'Wave'],
    tool_gaps: 'Les logiciels comptables sont trop complets pour un bénévole qui tient les comptes une fois par an.',
  },
  {
    id: 'opp-09', title: 'Documentation automatique des API internes',
    problem: 'Les équipes techniques ont une documentation d\'API toujours en retard sur le code.',
    description: 'Un outil branché sur le dépôt de code qui met à jour la documentation à chaque modification.',
    department: 'technique', target_market: 'fr_qc', signal_count: 18, score_global: 45, created_at: at(5, 17, 15),
    score_volume: 52, score_urgency: 38, score_tool_gap: 35, score_saturation: 78,
    opportunity_type: 'saas', revenue_model: 'freemium', time_to_mvp: 'weeks', complexity: 'medium',
    estimated_cost: '3 000 – 6 000 €', price_range: '0 – 49 € / mois', market_size_hint: 'large',
    solo_dev_feasible: true, recurring_potential: true,
    key_challenges: ['Marché saturé', 'Cible habituée aux outils gratuits'],
    existing_tools: ['Swagger', 'Mintlify', 'ReadMe'],
    tool_gaps: 'Peu de différence avec les solutions existantes, sinon la langue française.',
  },
  {
    id: 'opp-10', title: 'Prise de rendez-vous par SMS pour garages',
    problem: 'Les garages indépendants perdent des appels pendant les heures de travail à l\'atelier.',
    description: 'Un assistant SMS qui propose des créneaux, confirme les rendez-vous et envoie les rappels.',
    department: 'commercial', target_market: 'fr', signal_count: 15, score_global: 38, created_at: at(5, 11, 20),
    score_volume: 35, score_urgency: 42, score_tool_gap: 39, score_saturation: 68,
    opportunity_type: 'ai_agent_service', revenue_model: 'subscription', time_to_mvp: 'weeks', complexity: 'medium',
    estimated_cost: '2 000 – 4 000 €', price_range: '39 € / mois', market_size_hint: 'niche',
    solo_dev_feasible: true, recurring_potential: true,
    key_challenges: ['Concurrence des plateformes de réservation', 'Coût des SMS'],
    existing_tools: ['iDGarage', 'Vroomly'],
    tool_gaps: 'Les plateformes prennent une commission ; le garage veut garder sa clientèle.',
  },
  {
    id: 'opp-11', title: 'Tableau de bord des avis clients pour restaurants',
    problem: 'Les restaurateurs consultent leurs avis sur plusieurs plateformes sans vue d\'ensemble.',
    description: 'Un tableau de bord qui regroupe les avis et suggère des réponses.',
    department: 'marketing', target_market: 'qc', signal_count: 11, score_global: 29, created_at: at(6, 15, 0),
    score_volume: 28, score_urgency: 25, score_tool_gap: 22, score_saturation: 85,
    opportunity_type: 'saas', revenue_model: 'subscription', time_to_mvp: 'weeks', complexity: 'low',
    estimated_cost: '2 000 – 3 000 €', price_range: '19 $ CA / mois', market_size_hint: 'medium',
    solo_dev_feasible: true, recurring_potential: true,
    key_challenges: ['Marché très saturé', 'Accès limité aux API des plateformes d\'avis'],
    existing_tools: ['Partoo', 'Birdeye', 'Google Business Profile'],
    tool_gaps: null,
  },
  {
    id: 'opp-12', title: 'Gestionnaire de mots de passe pour cabinets',
    problem: 'Les petits cabinets partagent leurs accès par courriel ou sur papier.',
    description: 'Un coffre-fort de mots de passe partagé, simple, hébergé en France.',
    department: 'autre', target_market: 'fr', signal_count: 8, score_global: 21, created_at: at(6, 10, 45),
    score_volume: 19, score_urgency: 30, score_tool_gap: 12, score_saturation: 92,
    opportunity_type: 'saas', revenue_model: 'subscription', time_to_mvp: 'months', complexity: 'high',
    estimated_cost: '15 000 € et plus', price_range: '4 € / utilisateur / mois', market_size_hint: 'large',
    solo_dev_feasible: false, recurring_potential: true,
    key_challenges: ['Exigences de sécurité très élevées', 'Concurrents installés et gratuits'],
    existing_tools: ['Bitwarden', '1Password', 'Dashlane'],
    tool_gaps: null,
  },
]

// ─── Signaux ─────────────────────────────────────────────────────────────────

/** Signaux rattachés aux opportunités (affichés sur les fiches). */
const LINKED: Array<{
  opp: string; run: string; source: string; title: string; url: string; note: string; days: number
}> = [
  { opp: 'opp-01', run: 'run-5', source: 'reddit',        days: 0, title: 'Comment vous gérez les clients qui paient à 90 jours ?',          url: 'https://www.reddit.com/r/vosfinances/', note: 'Douleur exprimée explicitement, plusieurs réponses similaires.' },
  { opp: 'opp-01', run: 'run-5', source: 'francetravail', days: 0, title: 'Assistant(e) administratif(ve) — relances clients (BTP)',      url: 'https://candidat.francetravail.fr/', note: 'Poste créé uniquement pour relancer les impayés.' },
  { opp: 'opp-01', run: 'run-2', source: 'indeed',        days: 6, title: 'Secrétaire comptable mi-temps — suivi des encaissements',      url: 'https://fr.indeed.com/', note: 'Tâche répétitive décrite en détail dans l\'offre.' },
  { opp: 'opp-02', run: 'run-5', source: 'hackernews',    days: 0, title: 'Ask HN: How do small companies screen 200 applicants?',        url: 'https://news.ycombinator.com/', note: 'Besoin confirmé hors marché francophone.' },
  { opp: 'opp-02', run: 'run-5', source: 'indeed',        days: 0, title: 'Chargé(e) de recrutement — PME 40 salariés (Montréal)',        url: 'https://ca.indeed.com/', note: 'Tri manuel des CV cité comme tâche principale.' },
  { opp: 'opp-03', run: 'run-3', source: 'francetravail', days: 4, title: 'Coordinateur(trice) de planning — aide à domicile',             url: 'https://candidat.francetravail.fr/', note: 'Planification des tournées entièrement manuelle.' },
  { opp: 'opp-03', run: 'run-2', source: 'francetravail', days: 6, title: 'Responsable de secteur SAAD — optimisation des plannings',     url: 'https://candidat.francetravail.fr/', note: 'Mention explicite des temps de trajet perdus.' },
  { opp: 'opp-04', run: 'run-4', source: 'reddit',        days: 2, title: 'Répondre aux marchés publics quand on est 3 ?',                url: 'https://www.reddit.com/r/entrepreneur/', note: 'Manque de temps pour surveiller les plateformes.' },
  { opp: 'opp-04', run: 'run-2', source: 'indeed',        days: 6, title: 'Assistant(e) commercial(e) — veille appels d\'offres',         url: 'https://fr.indeed.com/', note: 'Veille faite à la main chaque matin.' },
  { opp: 'opp-05', run: 'run-4', source: 'hackernews',    days: 2, title: 'Our support team answers the same 20 questions every day',     url: 'https://news.ycombinator.com/', note: 'Problème récurrent, solutions existantes jugées lourdes.' },
  { opp: 'opp-06', run: 'run-4', source: 'reddit',        days: 2, title: 'Combien de temps pour vos rapports clients mensuels ?',        url: 'https://www.reddit.com/r/marketing/', note: 'Entre 2 et 6 heures par client selon les réponses.' },
  { opp: 'opp-07', run: 'run-3', source: 'francetravail', days: 4, title: 'Assistant(e) RH — suivi des habilitations CACES',              url: 'https://candidat.francetravail.fr/', note: 'Tableur partagé décrit comme source d\'erreurs.' },
  { opp: 'opp-08', run: 'run-2', source: 'reddit',        days: 6, title: 'Trésorier d\'asso : quel outil pour le rapprochement ?',        url: 'https://www.reddit.com/r/Quebec/', note: 'Demande d\'un outil simple, budget très faible.' },
  { opp: 'opp-09', run: 'run-2', source: 'hackernews',    days: 6, title: 'Show HN: keeping API docs in sync with code',                  url: 'https://news.ycombinator.com/', note: 'Nombreuses solutions concurrentes citées.' },
  { opp: 'opp-10', run: 'run-2', source: 'reddit',        days: 6, title: 'Mon garagiste ne répond jamais au téléphone',                  url: 'https://www.reddit.com/r/france/', note: 'Point de vue client, pas encore côté garage.' },
  { opp: 'opp-11', run: 'run-2', source: 'reddit',        days: 6, title: 'Outil pour suivre les avis Google et Tripadvisor ?',           url: 'https://www.reddit.com/r/restaurateur/', note: 'Plusieurs outils existants recommandés en réponse.' },
  { opp: 'opp-12', run: 'run-2', source: 'hackernews',    days: 6, title: 'Password sharing in small law firms',                          url: 'https://news.ycombinator.com/', note: 'Marché dominé par des acteurs installés.' },
]

/** Nombre de signaux encore en attente d'analyse dans la dernière collecte. */
const PENDING_IN_LAST_RUN = 18

function buildSignals(): { signals: MockSignal[]; links: MockOpportunitySignal[] } {
  const signals: MockSignal[] = []
  const links: MockOpportunitySignal[] = []

  LINKED.forEach((l, i) => {
    const id = `sig-linked-${i + 1}`
    signals.push({
      id, source: l.source, source_type: SOURCE_TYPES[l.source], title: l.title, url: l.url,
      collected_at: at(l.days, 9), batch_id: l.run, analyzed: true,
    })
    links.push({ opportunity_id: l.opp, signal_id: id, relevance_note: l.note })
  })

  // Complète chaque run avec des signaux génériques jusqu'au volume annoncé
  for (const run of collectionRuns) {
    let pendingLeft = run.id === 'run-5' ? PENDING_IN_LAST_RUN : 0
    for (const [source, { collected }] of Object.entries(run.results_summary ?? {})) {
      const already = signals.filter(s => s.batch_id === run.id && s.source === source).length
      for (let k = already; k < collected; k++) {
        const analyzed = pendingLeft <= 0
        if (!analyzed) pendingLeft--
        signals.push({
          id: `sig-${run.id}-${source}-${k + 1}`, source, source_type: SOURCE_TYPES[source],
          title: null, url: null, collected_at: run.started_at, batch_id: run.id, analyzed,
        })
      }
    }
  }
  return { signals, links }
}

const built = buildSignals()

export const signals: MockSignal[] = built.signals

export const opportunitySignals: MockOpportunitySignal[] = built.links

// ─── Rapports ────────────────────────────────────────────────────────────────

export const reports: Report[] = mockReports.map(({ daysAgo, hour, ...r }) => ({ ...r, created_at: at(daysAgo, hour) }))

// ─── Profil ──────────────────────────────────────────────────────────────────

export const profile: Profile | null = {
  entrepreneurial_stage: 'validation',
  main_motivation: ['autonomy', 'financial_freedom'],
  time_horizon: 'medium',
  prior_experience: false,
  tech_level: 'junior_dev',
  secondary_skills: ['data', 'pm'],
  spoken_languages: ['fr', 'en'],
  weekly_availability: 'half_time',
  budget_range: 'few_thousands',
  preferred_business_models: ['b2b'],
  excluded_sectors: ['health', 'defense'],
  preferred_sectors: ['logistique', 'services aux PME'],
  preferred_solution_types: ['automation', 'productivity'],
  preferred_target: 'sme',
  product_complexity: 'mvp',
  priority_market: 'fr_qc',
  existing_sector_knowledge: 'Plusieurs années en analyse de données dans le secteur des services.',
  report_detail_level: 'both',
  report_tone: 'actionable',
  profile_summary: 'Profil en phase de validation, développeur junior à mi-temps avec un budget de quelques milliers d\'euros. Vous ciblez les PME francophones (France et Québec) avec un outil d\'automatisation simple à lancer en MVP.',
}
