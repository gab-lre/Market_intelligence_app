# Plan de développement — Pipeline de Scraping & Analyse IA

## Contexte pour l'agent

Tu travailles sur une application Next.js 16 (App Router, TypeScript) qui tourne en local (`localhost:3000`). La base de données est Supabase (PostgreSQL cloud). L'objectif de l'app est d'identifier des opportunités SaaS pour le marché francophone en analysant massivement des données publiques (offres d'emploi, forums, avis produits). L'IA utilisée est Gemini 2.5 Flash via l'API Google.

Le schéma actuel comporte 3 tables : `opportunities`, `raw_signals`, `collections_history`. Tu peux les modifier si nécessaire, mais conserve les données existantes.

Le scraping est déclenché manuellement (one-shot) par l'utilisateur depuis le dashboard. Pas de cron, pas d'automatisation pour le moment.

---

## PHASE 0 — Audit de l'existant et préparation

**Objectif :** Comprendre l'architecture actuelle avant de toucher quoi que ce soit.

### Étape 0.1 — Cartographie du code existant
- Ouvre le projet et liste l'arborescence complète des fichiers.
- Identifie les fichiers liés au scraping (routes API, services, utilitaires).
- Identifie les fichiers liés à Supabase (client, requêtes, types).
- Identifie les fichiers liés à l'IA / Gemini (prompts, appels API, traitement des réponses).
- Identifie le dashboard existant et ses composants.
- Documente tout ça dans un fichier `ARCHITECTURE.md` à la racine du projet.

### Étape 0.2 — Audit du schéma de base de données
- Connecte-toi à Supabase et récupère le schéma exact des 3 tables existantes (colonnes, types, contraintes, index).
- Documente le schéma actuel dans `ARCHITECTURE.md`.
- Note ce qui manque par rapport aux besoins décrits plus bas.

### Étape 0.3 — Vérification des dépendances
- Vérifie que les packages suivants sont installés. Si non, installe-les :
  - `@supabase/supabase-js` (client Supabase)
  - `@google/generative-ai` (client Gemini)
- Vérifie que les variables d'environnement sont présentes dans `.env.local` :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY` pour le backend)
  - `GEMINI_API_KEY`
  - `APIFY_API_TOKEN` (pour les scrapers payants, plus tard)
- Ne crée rien encore. Documente juste l'état actuel.

**Livrable :** Le fichier `ARCHITECTURE.md` est complet. Tu connais parfaitement l'état du projet.

---

## PHASE 1 — Architecture de la base de données

**Objectif :** Avoir un schéma de données solide qui supporte tout le pipeline (collecte → analyse → scoring → dashboard).

### Étape 1.1 — Refonte du schéma `raw_signals`

La table `raw_signals` stocke chaque donnée brute collectée depuis une source. Une ligne = un signal (un post HN, une offre d'emploi, un avis G2, etc.).

Assure-toi que la table contient au minimum ces colonnes (adapte les noms si des colonnes existent déjà) :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | `uuid` (PK, défaut `gen_random_uuid()`) | Identifiant unique |
| `source` | `text` NOT NULL | Nom de la source : `hackernews`, `reddit`, `indiehackers`, `g2`, `producthunt`, `indeed`, `linkedin`, `wellfound`, `francetravail`, `upwork` |
| `source_type` | `text` NOT NULL | Catégorie : `community`, `review`, `job`, `freelance` |
| `external_id` | `text` | ID unique côté source (pour dédupliquer) |
| `title` | `text` | Titre du post / offre / avis |
| `content` | `text` | Contenu brut complet |
| `url` | `text` | URL d'origine |
| `author` | `text` | Auteur (si disponible) |
| `metadata` | `jsonb` | Données supplémentaires propres à chaque source (salaire, entreprise, score HN, nombre de commentaires, tags, etc.) |
| `collected_at` | `timestamptz` (défaut `now()`) | Date de collecte |
| `published_at` | `timestamptz` | Date de publication originale |
| `status` | `text` (défaut `pending`) | Statut du traitement : `pending`, `analyzed`, `discarded`, `error` |
| `batch_id` | `uuid` | Référence vers la session de collecte |

Crée un index unique sur `(source, external_id)` pour empêcher les doublons.
Crée un index sur `status` pour filtrer rapidement les signaux en attente.

### Étape 1.2 — Refonte du schéma `opportunities`

La table `opportunities` contient les opportunités SaaS identifiées par l'IA après analyse. Plusieurs signaux peuvent être fusionnés en une seule opportunité.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | `uuid` (PK, défaut `gen_random_uuid()`) | Identifiant unique |
| `title` | `text` NOT NULL | Nom court de l'opportunité (ex: "Outil d'automatisation de reporting RH") |
| `description` | `text` | Description détaillée du besoin identifié |
| `problem` | `text` | Le problème ou besoin central |
| `repetitive_tasks` | `text[]` | Liste des tâches répétitives / manuelles mentionnées |
| `existing_tools` | `text[]` | Outils/logiciels déjà utilisés dans ce contexte |
| `tool_gaps` | `text` | Besoins exprimés sans outil existant nommé ("trous" du marché) |
| `department` | `text` | Département concerné : `commercial`, `marketing`, `operations`, `finance`, `rh`, `technique`, `support`, `autre` |
| `company_size` | `text[]` | Tailles d'entreprise : `startup`, `pme`, `grande_entreprise` |
| `score_volume` | `integer` | Score volume de mentions (0-100) |
| `score_urgency` | `integer` | Score urgence du besoin (0-100) |
| `score_tool_gap` | `integer` | Score manque d'outils existants (0-100) |
| `score_saturation` | `integer` | Score saturation du marché (0-100, élevé = saturé) |
| `score_global` | `integer` | Score global pondéré (0-100) |
| `signal_count` | `integer` (défaut 1) | Nombre de signaux fusionnés dans cette opportunité |
| `source_types` | `text[]` | Types de sources qui ont contribué (`community`, `job`, `review`, `freelance`) |
| `status` | `text` (défaut `active`) | `active`, `archived`, `dismissed` |
| `created_at` | `timestamptz` (défaut `now()`) | Date de création |
| `updated_at` | `timestamptz` (défaut `now()`) | Dernière mise à jour |

### Étape 1.3 — Table de liaison `opportunity_signals`

Crée une nouvelle table pour faire le lien N-N entre opportunités et signaux :

| Colonne | Type | Description |
|---------|------|-------------|
| `opportunity_id` | `uuid` (FK → `opportunities.id`) | |
| `signal_id` | `uuid` (FK → `raw_signals.id`) | |
| `relevance_note` | `text` | Note de l'IA expliquant pourquoi ce signal est lié |

Clé primaire composite sur `(opportunity_id, signal_id)`.

### Étape 1.4 — Refonte du schéma `collections_history`

Cette table logge chaque session de collecte (chaque fois que l'utilisateur clique sur "Lancer le scraping").

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | `uuid` (PK, défaut `gen_random_uuid()`) | = batch_id |
| `started_at` | `timestamptz` (défaut `now()`) | Début de la collecte |
| `finished_at` | `timestamptz` | Fin de la collecte |
| `status` | `text` (défaut `running`) | `running`, `completed`, `partial`, `failed` |
| `sources_config` | `jsonb` | Configuration utilisée (quelles sources, quels paramètres) |
| `results_summary` | `jsonb` | Résumé : nombre de signaux par source, erreurs |
| `signals_collected` | `integer` (défaut 0) | Total de signaux collectés |
| `signals_analyzed` | `integer` (défaut 0) | Total de signaux analysés par l'IA |
| `opportunities_created` | `integer` (défaut 0) | Nouvelles opportunités créées |
| `opportunities_updated` | `integer` (défaut 0) | Opportunités existantes mises à jour |

### Étape 1.5 — Migration

- Écris les requêtes SQL de migration (ALTER TABLE / CREATE TABLE) dans un fichier `supabase/migrations/001_refonte_schema.sql`.
- Exécute la migration sur Supabase.
- Vérifie que tout est en place.
- Met à jour les types TypeScript dans le projet pour refléter le nouveau schéma (fichier `types/database.ts` ou équivalent).

**Livrable :** Le schéma est en place. Les types TypeScript sont à jour. Le fichier de migration est versionné.

---

## PHASE 2 — Architecture du système de scraping

**Objectif :** Construire une architecture modulaire où chaque source est un "collecteur" indépendant qui respecte la même interface.

### Étape 2.1 — Définir l'interface commune des collecteurs

Crée un fichier `lib/scrapers/types.ts` avec les types suivants :

```
// Chaque collecteur doit respecter cette interface
interface ScraperConfig {
  source: string;           // ex: "hackernews"
  sourceType: string;       // ex: "community"
  enabled: boolean;
  params: Record<string, any>;  // paramètres spécifiques à la source
}

interface RawSignalInput {
  source: string;
  sourceType: string;
  externalId: string;
  title: string;
  content: string;
  url: string;
  author?: string;
  metadata?: Record<string, any>;
  publishedAt?: string;
}

interface ScraperResult {
  source: string;
  success: boolean;
  signalsCollected: number;
  errors: string[];
  durationMs: number;
}

interface Scraper {
  name: string;
  source: string;
  sourceType: string;
  collect(params: Record<string, any>): Promise<RawSignalInput[]>;
}
```

Chaque source implémentera cette interface. Cela rend le système extensible : pour ajouter une source, il suffit de créer un nouveau fichier qui respecte l'interface.

### Étape 2.2 — Créer le "scraper registry" (registre des collecteurs)

Crée un fichier `lib/scrapers/registry.ts` qui :
- Importe tous les collecteurs disponibles.
- Les enregistre dans un dictionnaire indexé par nom de source.
- Expose une fonction `getAvailableScrapers()` qui renvoie la liste des sources et leur statut (actif/inactif).
- Expose une fonction `getScraper(sourceName)` qui renvoie le collecteur correspondant.

### Étape 2.3 — Créer le "scraper engine" (moteur d'orchestration)

Crée un fichier `lib/scrapers/engine.ts` qui :
- Reçoit une liste de sources à scraper (avec leurs paramètres).
- Crée une entrée dans `collections_history` (batch_id).
- Exécute chaque collecteur de manière séquentielle (pas en parallèle, pour éviter les rate limits).
- Pour chaque signal retourné, l'insère dans `raw_signals` avec le `batch_id`. Si un doublon est détecté (même `source` + `external_id`), il skip sans erreur.
- Met à jour `collections_history` au fur et à mesure (compteurs, statut).
- Retourne un résumé complet de la session.

### Étape 2.4 — Créer la route API de déclenchement

Crée une route API Next.js `app/api/scraping/collect/route.ts` :
- Méthode POST.
- Body attendu : `{ sources: [{ source: "hackernews", params: { ... } }, ...] }`.
- Appelle le scraper engine.
- Retourne le résumé de la collecte en JSON.
- Si aucune source n'est spécifiée, utilise toutes les sources actives avec les paramètres par défaut.

**Livrable :** L'architecture est en place. Aucun collecteur spécifique n'est encore implémenté, mais le système est prêt à les accueillir.

---

## PHASE 3 — Implémentation des collecteurs (sources gratuites d'abord)

**Objectif :** Implémenter chaque collecteur un par un, en commençant par les sources avec API gratuite.

**Règle absolue :** Chaque collecteur est dans son propre fichier dans `lib/scrapers/sources/`. Chaque collecteur est testé individuellement avant de passer au suivant.

### Étape 3.1 — Collecteur Hacker News

Fichier : `lib/scrapers/sources/hackernews.ts`

Source de données : L'API officielle Hacker News est 100% gratuite, sans clé API.
- Endpoint pour les top stories : `https://hacker-news.firebaseio.com/v0/topstories.json`
- Endpoint pour le détail d'un item : `https://hacker-news.firebaseio.com/v0/item/{id}.json`
- Endpoint pour la recherche (Algolia) : `https://hn.algolia.com/api/v1/search?query=...&tags=story`

Logique du collecteur :
1. Utilise l'API Algolia de HN pour rechercher des posts pertinents. Mots-clés à chercher (en anglais, car HN est anglophone) : `"SaaS"`, `"startup idea"`, `"side project"`, `"I built"`, `"looking for tool"`, `"pain point"`, `"manual process"`, `"spreadsheet hell"`, `"wish there was"`, `"ask hn"`. Fais une requête par mot-clé.
2. Pour chaque résultat, récupère le titre, l'URL, le contenu (s'il y en a), le nombre de points, le nombre de commentaires, la date.
3. Pour les posts avec beaucoup de commentaires (> 10), récupère aussi les commentaires de premier niveau via l'API Firebase (les `kids` de l'item). Les commentaires contiennent souvent les vrais insights.
4. Formate chaque résultat en `RawSignalInput`.
5. Metadata à stocker : `{ points, num_comments, hn_type (story/comment/ask_hn), tags }`.

Paramètres configurables : `{ maxResults: 50, minPoints: 5, keywords: string[] }`.

### Étape 3.2 — Collecteur Reddit

Fichier : `lib/scrapers/sources/reddit.ts`

Source de données : L'API Reddit JSON est accessible sans authentification en ajoutant `.json` à la fin d'une URL Reddit.
- Endpoint : `https://www.reddit.com/r/{subreddit}/search.json?q=...&sort=relevance&t=month&limit=25`
- Alternative plus stable : `https://old.reddit.com/r/{subreddit}.json`

Subreddits pertinents : `SaaS`, `startups`, `Entrepreneur`, `smallbusiness`, `indiehackers`, `microsaas`, `webdev`, `sideproject`.

Logique du collecteur :
1. Pour chaque subreddit, récupère les posts récents pertinents.
2. Mots-clés de recherche : `"need a tool"`, `"looking for"`, `"wish there was"`, `"built a"`, `"pain point"`, `"manual process"`, `"anyone know"`, `"alternative to"`.
3. Pour chaque post, récupère le titre, le contenu (selftext), le score, le nombre de commentaires, le flair.
4. Metadata : `{ subreddit, score, num_comments, flair, upvote_ratio }`.

Paramètres : `{ subreddits: string[], maxPostsPerSub: 25, minScore: 3, keywords: string[] }`.

Important : Respecte un délai de 2 secondes entre chaque requête Reddit pour ne pas être rate-limited. Ajoute un User-Agent personnalisé dans les headers : `"SaaS-Opportunity-Finder/1.0"`.

### Étape 3.3 — Collecteur France Travail

Fichier : `lib/scrapers/sources/francetravail.ts`

Source de données : L'API France Travail (ex Pôle Emploi) est gratuite mais nécessite une inscription sur `https://francetravail.io/` pour obtenir un `client_id` et `client_secret`.

Logique du collecteur :
1. Authentification OAuth2 : POST sur `https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire` avec `grant_type=client_credentials`, `client_id`, `client_secret`, `scope=api_offresdemploiv2 o2dsoffre`.
2. Recherche d'offres : GET sur `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search` avec paramètres de filtre.
3. Filtrer par mots-clés métier liés à des tâches automatisables : `"CRM"`, `"reporting"`, `"automatisation"`, `"gestion de projet"`, `"data entry"`, `"saisie"`, `"tableaux de bord"`, `"suivi client"`, `"facturation"`, `"relance"`, `"prospection"`.
4. Pour chaque offre, extraire : intitulé, description, entreprise, lieu, salaire, compétences demandées, type de contrat.
5. Metadata : `{ company_name, location, contract_type, salary_range, required_skills, experience_level }`.

Paramètres : `{ keywords: string[], maxResults: 50, location: "France" }`.

Note : Si les identifiants France Travail ne sont pas configurés dans `.env.local`, le collecteur doit se désactiver proprement avec un message clair (pas de crash).

### Étape 3.4 — Collecteur Product Hunt

Fichier : `lib/scrapers/sources/producthunt.ts`

Source de données : Product Hunt n'a pas d'API publique facilement accessible. Utilise le endpoint non-officiel ou le scraping léger de la page d'accueil.
- Alternative recommandée : Utilise `https://www.producthunt.com/frontend/graphql` avec les bons headers, ou scrape la page HTML via fetch + parsing.
- Autre alternative : Utilise un flux RSS ou un service tiers gratuit.

Logique du collecteur :
1. Récupère les produits lancés récemment (dernière semaine / dernier mois).
2. Pour chaque produit, extraire : nom, tagline, description, catégorie, nombre de upvotes, nombre de commentaires, URL.
3. Filtre sur les catégories pertinentes SaaS (productivity, marketing, developer tools, sales, etc.).
4. Metadata : `{ upvotes, category, maker_name, topics }`.

Paramètres : `{ maxResults: 50, minUpvotes: 10, daysBack: 30 }`.

Si Product Hunt bloque les requêtes, désactive proprement ce collecteur et note-le dans les résultats. On passera par Apify plus tard si nécessaire.

### Étape 3.5 — Collecteur Indie Hackers

Fichier : `lib/scrapers/sources/indiehackers.ts`

Source de données : Indie Hackers n'a pas d'API publique. Deux options :
- Option A (recommandée) : Scrape la page `https://www.indiehackers.com/posts` en parsant le HTML retourné par fetch. Les posts sont généralement rendus côté serveur.
- Option B : Si le HTML est rendu côté client (SPA), utilise Apify ou un navigateur headless (passe à la Phase 6 pour cette source).

Logique du collecteur :
1. Récupère les posts récents de la section principale et de la section "groups".
2. Mots-clés de recherche : `"building"`, `"launched"`, `"revenue"`, `"idea validation"`, `"problem"`, `"looking for feedback"`.
3. Pour chaque post : titre, contenu, auteur, date, nombre de réactions.
4. Metadata : `{ reactions, group_name, is_milestone }`.

Paramètres : `{ maxResults: 30, daysBack: 30 }`.

Si le scraping échoue (SPA, anti-bot), le collecteur doit retourner `success: false` avec un message explicatif. Ne bloque pas le reste du pipeline.

### Étape 3.6 — Collecteur G2 (Reviews)

Fichier : `lib/scrapers/sources/g2.ts`

Source de données : G2 n'a pas d'API publique gratuite. Options :
- Option A : Scrape les pages de catégories G2 (`https://www.g2.com/categories/...`) pour récupérer les noms de produits, scores, et extraits d'avis.
- Option B : Utilise Apify (scraper G2 pré-construit) — dans ce cas, reporte à la Phase 6.

Logique du collecteur (Option A) :
1. Cible des catégories SaaS pertinentes : CRM, Project Management, Marketing Automation, HR Software, Accounting, Help Desk, etc.
2. Pour chaque catégorie, récupère la liste des produits et les avis récents (s'ils sont dans le HTML).
3. Les avis négatifs et les "problèmes" mentionnés sont les plus intéressants.
4. Metadata : `{ product_name, category, g2_rating, review_sentiment, pros, cons }`.

Paramètres : `{ categories: string[], maxReviewsPerProduct: 10 }`.

Même consigne : si ça bloque, fail gracefully. On reviendra avec Apify.

### Étape 3.7 — Tests individuels

Après chaque collecteur, teste-le individuellement :
1. Appelle le collecteur avec des paramètres par défaut.
2. Vérifie qu'il retourne des `RawSignalInput[]` valides.
3. Vérifie que les données s'insèrent correctement dans `raw_signals`.
4. Vérifie la déduplication (relance le même collecteur, aucun doublon ne doit être créé).
5. Vérifie que le collecteur gère les erreurs proprement (réseau, rate limit, HTML inattendu).

**Livrable :** Chaque source gratuite est implémentée, testée, et enregistrée dans le registry. Le moteur peut les exécuter toutes d'un seul clic.

---

## PHASE 4 — Pipeline d'analyse IA (Gemini)

**Objectif :** Prendre les signaux bruts (`raw_signals` en statut `pending`) et les faire analyser par Gemini 2.5 Flash pour en extraire des opportunités structurées.

### Étape 4.1 — Créer le module de prompting

Crée un fichier `lib/ai/prompts.ts` qui contient le prompt système pour Gemini.

Le prompt doit être clair et structuré. Voici le prompt à utiliser (adapte la formulation si tu juges pertinent, mais conserve tous les critères) :

```
# Prompt Gemini — Analyseur d'opportunités V2

## Prompt système (à copier tel quel)

```
Tu es un analyste de marché expert spécialisé dans l'identification d'opportunités business dans le numérique. Tu travailles pour un entrepreneur solo francophone (France/Québec) qui maîtrise le développement assisté par IA (vibe coding) et qui peut construire des produits fonctionnels rapidement sans équipe.

Tu reçois un signal brut (post de forum, offre d'emploi, avis produit, mission freelance). Ton rôle est d'analyser ce signal pour détecter des opportunités exploitables dans 3 catégories :

1. **SaaS** — Logiciel en ligne avec abonnement récurrent. Pertinent quand le besoin est large, récurrent, et touche beaucoup d'entreprises similaires.
2. **Agent IA / Automatisation** — Soit un service d'automatisation vendu en prestation (ex: "je configure un agent IA qui fait X pour votre entreprise"), soit un produit d'agent IA en self-service (ex: une plateforme où le client lance son agent). Pertinent quand la tâche est répétitive, basée sur du texte/données, et remplaçable par de l'IA.
3. **Template / Micro-produit** — Template Notion, workflow Make/n8n, kit prêt à l'emploi, extension. Pertinent quand le besoin est simple, ciblé, et résolvable sans backend complexe.

Un même signal peut révéler plusieurs types d'opportunités. Si c'est le cas, choisis le type le plus pertinent et mentionne les alternatives dans la description.

---

SECTEURS À EXCLURE : Si le signal concerne un secteur à forte réglementation ou à barrière d'entrée élevée (médical/santé, pharmaceutique, bancaire/fintech réglementée, assurance, juridique nécessitant un agrément, défense, nucléaire), mets is_opportunity à false avec discard_reason "Secteur réglementé — barrière d'entrée trop élevée".

---

Pour chaque signal, réponds UNIQUEMENT en JSON valide (pas de markdown, pas de commentaires, pas de texte avant ou après) avec cette structure :

{
  "is_opportunity": true | false,
  "confidence": 0-100,
  "analysis": {
    "opportunity_type": "saas | ai_agent_service | ai_agent_product | template | micro_product",
    "opportunity_title": "Titre court et accrocheur décrivant l'opportunité",
    "opportunity_description": "Description en 2-3 phrases : quel produit/service créer, pour qui, et pourquoi maintenant",
    "problem": "Le problème ou besoin central exprimé dans le signal",
    "repetitive_tasks": ["tâche manuelle 1", "tâche manuelle 2"],
    "existing_tools": ["outil existant 1", "outil existant 2"],
    "tool_gaps": "Besoins exprimés sans outil existant nommé — les trous du marché. Si aucun trou identifié, mettre null",
    "department": "commercial | marketing | operations | finance | rh | technique | support | multi | autre",
    "company_size": ["startup", "pme", "grande_entreprise"],
    "target_market": "fr | qc | fr_qc | international",
    "revenue_model": "subscription | one_time | per_project | usage_based | freemium",
    "urgency_score": 0-100,
    "tool_gap_score": 0-100,
    "saturation_score": 0-100,
    "effort": {
      "time_to_mvp": "days | weeks | months",
      "complexity": "low | medium | high",
      "estimated_cost": "< 500$ | 500-2000$ | 2000-5000$ | 5000$+",
      "solo_dev_feasible": true | false,
      "key_challenges": ["défi technique 1", "défi technique 2"]
    },
    "monetization_potential": {
      "price_range": "Fourchette de prix réaliste (ex: 29-79$/mois, 200-500$/projet, 49$ one-time)",
      "market_size_hint": "niche | medium | large",
      "recurring_potential": true | false
    },
    "alternative_types": ["Autres types d'opportunités possibles pour ce même besoin, parmi : saas, ai_agent_service, ai_agent_product, template, micro_product"]
  },
  "discard_reason": "Si is_opportunity est false, explique pourquoi en une phrase"
}

---

GRILLE DE SCORING :

urgency_score (poids 35%) — Urgence du besoin :
- 80-100 : L'entreprise paie un humain à temps plein pour cette tâche, ou le manque d'outil cause une perte directe de revenus/temps significative
- 50-79 : Le besoin est réel, récurrent, et provoque de la frustration visible (plaintes, workarounds bricolés)
- 20-49 : Le besoin est mentionné mais reste secondaire, pas de douleur aiguë
- 0-19 : Mention vague, curiosité, pas de vrai besoin actionnable

tool_gap_score (poids 25%) — Manque d'outils existants :
- 80-100 : Besoin clairement exprimé, aucun outil nommé, les gens bricolent avec Excel/email/papier
- 50-79 : Des outils existent mais sont jugés inadaptés, trop chers, trop complexes, ou mal localisés pour le marché francophone
- 20-49 : Des outils existent et sont utilisés, mais avec frustration ou des fonctionnalités manquantes
- 0-19 : Le marché est bien couvert, les utilisateurs sont globalement satisfaits

saturation_score (poids 10%, impact négatif) — Saturation du marché :
- 80-100 : Marché dominé par des acteurs majeurs bien établis avec des effets de réseau (Salesforce, HubSpot, Slack, Notion...)
- 50-79 : Plusieurs concurrents établis mais des niches géographiques (francophone) ou verticales restent ouvertes
- 20-49 : Peu de concurrents, marché émergent ou fragmenté
- 0-19 : Quasi aucun outil dédié sur ce créneau

Note : le score_volume (poids 30%) est calculé côté application en fonction du nombre de signaux convergents. Tu n'as pas à le fournir.

---

RÈGLES DE DÉCISION :

1. Si le signal est du spam, hors sujet, trop vague pour identifier un besoin concret, ou concerne un secteur exclu → is_opportunity: false.

2. Pour opportunity_type, choisis selon cette logique :
   - Le besoin touche beaucoup d'entreprises avec le même workflow → "saas"
   - La tâche est basée sur du traitement de texte/données, remplaçable par un LLM/agent → "ai_agent_service" (prestation) ou "ai_agent_product" (self-service)
   - Le besoin est simple et résolvable par un template, un workflow, ou un petit outil sans backend → "template" ou "micro_product"

3. Privilégie les opportunités avec le meilleur ratio effort/potentiel. Un agent IA faisable en quelques jours qui résout un vrai problème est plus intéressant qu'un SaaS complexe à potentiel équivalent.

4. Pour effort.solo_dev_feasible : évalue si un développeur solo utilisant du vibe coding (IA assistée, no-code/low-code, APIs tierces) peut construire un MVP fonctionnel. Si ça nécessite une équipe, des certifications, ou une infrastructure lourde, mets false.

5. Pour target_market : le focus est francophone. Si le signal est en anglais mais le besoin est universel et pas encore bien servi en français, note "fr_qc" et mentionne l'angle de localisation dans la description.

6. Si tu hésites entre is_opportunity true ou false, penche vers true avec un confidence bas (30-50). Il vaut mieux un faux positif qu'un faux négatif — le scoring global se chargera de trier.
```

---

## Changements par rapport à la V1

| Aspect | V1 | V2 |
|--------|----|----|
| Types d'opportunités | SaaS uniquement | SaaS + Agent IA (service & produit) + Template/Micro-produit |
| Effort/faisabilité | Absent | Bloc `effort` complet (time-to-MVP, coût, complexité, faisabilité solo) |
| Monétisation | Absent | Bloc `monetization_potential` (prix, taille marché, récurrence) |
| Marché cible | Implicite | Champ `target_market` explicite (fr/qc/international) |
| Modèle de revenus | Absent | Champ `revenue_model` |
| Secteurs exclus | Absent | Liste explicite de secteurs réglementés à filtrer |
| Types alternatifs | Absent | Champ `alternative_types` pour ne pas perdre d'angles |
| Profil entrepreneur | Générique | Calibré "solo dev + vibe coding" |
| Règle de décision | Binaire | Biais vers les faux positifs à faible confidence |

---

## Impact sur le schéma de base de données

La table `opportunities` du plan original doit être mise à jour avec ces nouvelles colonnes :

```sql
-- Nouvelles colonnes à ajouter à la table opportunities
ALTER TABLE opportunities ADD COLUMN opportunity_type text NOT NULL DEFAULT 'saas';
-- Valeurs : 'saas', 'ai_agent_service', 'ai_agent_product', 'template', 'micro_product'

ALTER TABLE opportunities ADD COLUMN target_market text DEFAULT 'fr_qc';
-- Valeurs : 'fr', 'qc', 'fr_qc', 'international'

ALTER TABLE opportunities ADD COLUMN revenue_model text;
-- Valeurs : 'subscription', 'one_time', 'per_project', 'usage_based', 'freemium'

ALTER TABLE opportunities ADD COLUMN time_to_mvp text;
-- Valeurs : 'days', 'weeks', 'months'

ALTER TABLE opportunities ADD COLUMN complexity text;
-- Valeurs : 'low', 'medium', 'high'

ALTER TABLE opportunities ADD COLUMN estimated_cost text;
-- Valeurs : '< 500$', '500-2000$', '2000-5000$', '5000$+'

ALTER TABLE opportunities ADD COLUMN solo_dev_feasible boolean DEFAULT true;

ALTER TABLE opportunities ADD COLUMN key_challenges text[];

ALTER TABLE opportunities ADD COLUMN price_range text;

ALTER TABLE opportunities ADD COLUMN market_size_hint text;
-- Valeurs : 'niche', 'medium', 'large'

ALTER TABLE opportunities ADD COLUMN recurring_potential boolean;

ALTER TABLE opportunities ADD COLUMN alternative_types text[];
```

---

## Mise à jour du scoring global

La formule reste la même mais le dashboard devra permettre de filtrer/trier par les nouveaux champs :

```
score_global = (score_volume × 0.30) + (score_urgency × 0.35) + (score_tool_gap × 0.25) - (score_saturation × 0.10)
```

En plus du score, le dashboard devra afficher un badge par type d'opportunité et permettre de filtrer par :
- Type (SaaS / Agent IA / Template)
- Time-to-MVP (days / weeks / months)
- Complexité (low / medium / high)
- Faisabilité solo (oui / non)
- Marché cible
```

### Étape 4.2 — Créer le service d'analyse

Crée un fichier `lib/ai/analyzer.ts` qui :
1. Récupère les signaux en statut `pending` depuis `raw_signals` (par batch de 5 maximum pour éviter de surcharger l'API).
2. Pour chaque signal, envoie une requête à Gemini 2.5 Flash avec le prompt ci-dessus + le contenu du signal.
3. Parse la réponse JSON de Gemini.
4. Si `is_opportunity` est `true` :
   - Cherche dans la table `opportunities` s'il existe déjà une opportunité similaire (même `title` ou problème proche). Pour cette comparaison, tu peux utiliser un second appel Gemini court : "Voici une nouvelle opportunité : {titre}. Voici les opportunités existantes : {liste des titres}. Est-ce que la nouvelle correspond à une existante ? Réponds avec l'ID de l'opportunité existante ou 'new'."
   - Si une opportunité similaire existe : mets à jour ses scores (recalcule les moyennes pondérées), incrémente `signal_count`, ajoute la liaison dans `opportunity_signals`.
   - Si c'est nouveau : crée une entrée dans `opportunities` + une liaison dans `opportunity_signals`.
5. Si `is_opportunity` est `false` :
   - Mets le statut du signal à `discarded`.
6. Dans tous les cas, mets le statut du signal à `analyzed` (ou `discarded`).
7. Gère les erreurs Gemini (rate limit, timeout, réponse invalide) : mets le signal en `error` et continue avec le suivant.

### Étape 4.3 — Calcul du score global

Le score global de chaque opportunité est calculé comme suit :

```
score_global = (score_volume × 0.30) + (score_urgency × 0.35) + (score_tool_gap × 0.25) - (score_saturation × 0.10)
```

Le `score_volume` est calculé en fonction du nombre de signaux (`signal_count`) rapporté au maximum observé dans la base. Formule :

```
score_volume = min(100, (signal_count / max_signal_count_in_db) × 100)
```

Si l'opportunité n'a qu'un seul signal, son `score_volume` est bas. Plus elle accumule de signaux de sources différentes, plus le score monte.

Le `score_urgency`, `score_tool_gap`, et `score_saturation` sont les moyennes des scores donnés par Gemini pour chaque signal rattaché.

Crée une fonction `recalculateOpportunityScore(opportunityId)` dans `lib/ai/scoring.ts` qui recalcule tout et met à jour la ligne dans la base.

### Étape 4.4 — Route API d'analyse

Crée une route `app/api/scraping/analyze/route.ts` :
- Méthode POST.
- Body optionnel : `{ batchId?: string, limit?: number }`.
- Si `batchId` est fourni, n'analyse que les signaux de ce batch. Sinon, prends tous les `pending`.
- Retourne un résumé : nombre analysé, nombre d'opportunités créées/mises à jour, nombre écarté.

### Étape 4.5 — Route API de pipeline complet

Crée une route `app/api/scraping/run/route.ts` qui enchaîne automatiquement :
1. Collecte (Phase 3)
2. Analyse (Phase 4)
3. Scoring (recalcul global)
4. Retourne un résumé complet

C'est cette route qui sera appelée par le bouton "Lancer le scraping" du dashboard.

**Livrable :** Le pipeline complet fonctionne de bout en bout. Un clic → collecte → analyse → scoring → résultats dans la base.

---

## PHASE 5 — Interface Dashboard

**Objectif :** Le dashboard permet de lancer le scraping, suivre son avancement, et explorer les opportunités.

### Étape 5.1 — Page de lancement du scraping

Crée une page (ou un composant) dans le dashboard qui permet :
- De voir la liste des sources disponibles avec un toggle on/off pour chacune.
- De configurer les paramètres de chaque source (mots-clés, nombre max de résultats).
- De lancer le scraping via un bouton "Lancer la collecte".
- D'afficher un indicateur de progression en temps réel (polling sur `collections_history`).
- D'afficher le résumé une fois terminé (nombre de signaux par source, erreurs).

Utilise Tailwind CSS v4 et les icônes `lucide-react` conformément au style existant.

### Étape 5.2 — Dashboard des opportunités

Crée ou améliore la page de visualisation des opportunités :
- Affichage sous forme de tableau/cartes triées par `score_global` décroissant.
- Pour chaque opportunité : titre, description courte, score global (avec barre visuelle), département, taille d'entreprise cible, nombre de signaux.
- Filtre par département, par score minimum, par source.
- Possibilité de cliquer sur une opportunité pour voir le détail (tous les signaux liés, les scores détaillés, les outils existants, les trous de marché).
- Possibilité de marquer une opportunité comme "archivée" ou "rejetée".

### Étape 5.3 — Page d'historique des collectes

Crée une page qui affiche l'historique des sessions de scraping :
- Liste des collectes passées avec date, durée, nombre de signaux, statut.
- Possibilité de cliquer pour voir le détail d'une collecte.

**Livrable :** Le dashboard est fonctionnel et connecté aux données réelles.

---

## PHASE 6 — Sources payantes / difficiles (via Apify)

**Objectif :** Ajouter les sources qui nécessitent un navigateur headless ou une API payante.

### Étape 6.1 — Module Apify générique

Crée un fichier `lib/scrapers/apify-client.ts` qui :
- Envoie un job à un acteur Apify via leur API REST.
- Attend la fin du job (polling).
- Récupère les résultats.
- Gère les erreurs et les timeouts.

L'API Apify fonctionne comme suit :
1. POST sur `https://api.apify.com/v2/acts/{actorId}/runs` avec le body de configuration + le token dans les headers.
2. Polling sur `https://api.apify.com/v2/actor-runs/{runId}` jusqu'à ce que le statut soit `SUCCEEDED`.
3. GET sur `https://api.apify.com/v2/datasets/{datasetId}/items` pour récupérer les résultats.

### Étape 6.2 — Collecteur LinkedIn Jobs (via Apify)

Fichier : `lib/scrapers/sources/linkedin.ts`

- Utilise un acteur Apify de type "LinkedIn Jobs Scraper" (cherche le plus populaire sur Apify Store).
- Recherche des offres d'emploi avec des mots-clés liés aux tâches automatisables.
- Mots-clés : `"CRM manager"`, `"data entry"`, `"reporting analyst"`, `"process automation"`, `"operations coordinator"`, `"marketing automation"`, `"customer success"`, `"sales ops"`.
- Filtre géographique : France et Canada (Québec).
- Metadata : `{ company, location, seniority, employment_type, industry }`.

### Étape 6.3 — Collecteur Indeed (via Apify)

Fichier : `lib/scrapers/sources/indeed.ts`

- Même logique que LinkedIn mais via un acteur Apify dédié à Indeed.
- Même mots-clés, mêmes filtres géographiques.
- Metadata : `{ company, location, salary, job_type, experience_level }`.

### Étape 6.4 — Collecteur Wellfound (ex AngelList)

Fichier : `lib/scrapers/sources/wellfound.ts`

- Wellfound se concentre sur les startups, donc les offres sont pertinentes pour détecter les besoins des jeunes entreprises.
- Via Apify ou scraping direct si le HTML le permet.
- Metadata : `{ company, stage (seed/series_a/etc), team_size, tech_stack }`.

### Étape 6.5 — Collecteur Upwork

Fichier : `lib/scrapers/sources/upwork.ts`

- Récupère les missions freelance postées sur Upwork.
- Les missions freelance révèlent des tâches que les entreprises externalisent → potentiel SaaS.
- Mots-clés : `"data entry"`, `"CRM"`, `"reporting"`, `"automation"`, `"web scraping"`, `"lead generation"`, `"bookkeeping"`.
- Metadata : `{ budget, duration, client_country, skills_required, proposals_count }`.

### Étape 6.6 — Intégration dans le registry

Enregistre chaque nouveau collecteur dans le registry. Ils doivent apparaître automatiquement dans le dashboard avec leur toggle on/off.

Les sources Apify doivent vérifier la présence de `APIFY_API_TOKEN` dans `.env.local`. Si absent, elles se désactivent avec un message explicatif.

**Livrable :** Toutes les sources sont intégrées. Les sources Apify fonctionnent si le token est configuré.

---

## PHASE 7 — Robustesse et finitions

### Étape 7.1 — Gestion des erreurs globale
- Chaque collecteur gère ses propres erreurs sans bloquer les autres.
- Les erreurs sont loguées dans `collections_history.results_summary`.
- Si Gemini rate-limit, implémente un retry avec backoff exponentiel (attente de 2s, 4s, 8s, max 3 retries).

### Étape 7.2 — Rate limiting
- Ajoute un délai configurable entre chaque requête HTTP dans chaque collecteur (défaut : 1 seconde).
- Ajoute un délai entre chaque appel Gemini (défaut : 500ms).

### Étape 7.3 — Logging
- Crée un logger simple (`lib/utils/logger.ts`) qui écrit dans la console avec des niveaux (`info`, `warn`, `error`) et des timestamps.
- Chaque collecteur et le moteur d'analyse logguent leurs actions.

### Étape 7.4 — Validation des données
- Avant d'insérer un signal dans la base, valide que les champs obligatoires sont présents et non vides.
- Avant de créer une opportunité, valide que les scores sont entre 0 et 100.

### Étape 7.5 — Documentation
- Mets à jour le `README.md` avec :
  - Comment configurer les variables d'environnement.
  - Comment lancer l'app.
  - Comment ajouter une nouvelle source (pour référence future).
  - La liste des sources et leur statut (gratuit / Apify).

**Livrable :** L'application est robuste, bien documentée, et prête à l'utilisation quotidienne.

---

## Ordre d'exécution résumé

| # | Phase | Dépend de | Priorité |
|---|-------|-----------|----------|
| 0 | Audit de l'existant | — | Immédiate |
| 1 | Base de données | Phase 0 | Critique |
| 2 | Architecture scraping | Phase 1 | Critique |
| 3 | Collecteurs gratuits (HN, Reddit, France Travail, PH, IH, G2) | Phase 2 | Haute |
| 4 | Pipeline IA (Gemini + scoring) | Phase 1 | Haute |
| 5 | Dashboard | Phases 3 + 4 | Haute |
| 6 | Sources payantes (Apify : LinkedIn, Indeed, Wellfound, Upwork) | Phase 2 | Moyenne |
| 7 | Robustesse et finitions | Toutes | Standard |

Les Phases 3 et 4 peuvent être développées en parallèle puisqu'elles ne dépendent que de la Phase 1 (schéma) et Phase 2 (architecture).

---

## Règles générales pour l'agent

1. **Un fichier = une responsabilité.** Ne mets jamais la logique de deux collecteurs dans le même fichier.
2. **Fail gracefully.** Si une source ne marche pas, log l'erreur et continue. Ne crash jamais le pipeline entier.
3. **Pas de données en dur dans le code.** Les mots-clés, les URLs d'API, les seuils doivent être des paramètres ou des constantes nommées.
4. **Respect du style existant.** Utilise les conventions TypeScript, le style Tailwind, et les patterns déjà en place dans le projet.
5. **Teste chaque étape.** Avant de passer à l'étape suivante, vérifie que l'étape actuelle fonctionne correctement.
6. **Commits logiques.** Chaque phase terminée devrait correspondre à un état stable et fonctionnel de l'app.
7. **Communique les blocages.** Si un scraping échoue à cause d'un anti-bot ou d'une API cassée, reporte-le clairement plutôt que de bidouiller un workaround fragile.