# SaaS Market Intelligence

**Date de démarrage :** 27 Mars 2026

## BLOC 1 — Fondations du projet (Terminé)
- [x] Étape 1.1 — Initialisation du projet (Terminé)
- [x] Étape 1.2 — Connexion à Supabase (Terminé)
- [x] Étape 1.3 — Structure de navigation de l'application (Terminé)

## BLOC 2 — Collecteurs de données (source par source)
- [x] Étape 2.1 — Collecteur Hacker News (Terminé — 15 signaux testés, déduplication validée)
- [x] Étape 2.2 — Collecteur Reddit (Terminé — API JSON publique sans auth, déduplication validée)
- [x] Étape 2.3 — Collecteur France Travail (Terminé — OAuth2 fonctionnel, 20 signaux testés)
- [x] Étape 2.4a — Collecteur Product Hunt (Stub désactivé — Cloudflare bloque, prévu Phase 6 Apify)
- [x] Étape 2.4b — Collecteur Indie Hackers (Stub désactivé — SPA côté client, prévu Phase 6 Apify)
- [x] Étape 2.4c — Collecteur G2 (Terminé — Intégré avec le scraper Apify product-reviews, parsing fonctionnel)
- [x] Étape 2.4d — Collecteur Wellfound (Terminé — Intégré avec le scraper Apify wellfound-api-ppe, parsing fonctionnel)
- [x] Étape 2.4e — Collecteur Dev.to (Terminé — API publique REST native sans Apify)
- [x] Étape 2.4f — Collecteur Upwork (Terminé — Intégré avec le scraper Apify flash_mage/upwork, parsing fonctionnel)
- [x] Étape 2.4g — Collecteur Malt (Terminé — Intégré avec le scraper Apify shoya/malt-profile-scraper (profils freelances))
- [x] Étape 2.5 — Collecteurs Apify LinkedIn + Indeed (Terminé — Acteurs worldunboxer/valig intégérés, activés et testés, parsing des dates géré)
- [x] Étape 2.6 — Finalisation de la page de gestion des sources (Terminé — Groupement par catégories Emplois/Communautés/Startups, refonte UI)

## BLOC 3 — Moteur d'analyse IA
- [x] Étape 3.1 — Connexion Gemini + analyse signal (Terminé — modèle : gemini-2.5-flash)
- [x] Étape 3.2 — Traitement en batch et stockage opportunités (Terminé — analyzeSignals() par batch)
- [x] Étape 3.3 — Fusion des opportunités similaires (Terminé — 2ème appel Gemini pour matching)
- [x] Étape 3.4 — Système de scoring (Terminé — recalculateOpportunityScore(), formule pondérée)
- [x] Étape 3.5 — Route /api/scraping/analyze et /api/scraping/run (Terminé — pipeline complet testé)
- Note : modèles Gemini free-tier disponibles — gemini-2.5-flash (OK), gemini-2.0-flash (quota 0), gemini-1.5-flash (404)

## BLOC 4 — Interface utilisateur complète
- [x] Étape 4.1 — Dashboard (page.tsx) : KPIs réels (opportunités actives, score moyen, signaux, date last batch) + tableau top 10 cliquable + bouton LaunchRunButton (Terminé)
- [x] Étape 4.2 — Sources (sources/page.tsx) : dernier run par source depuis results_summary, boutons Démarrer fonctionnels, historique collections_history, bouton Analyse Globale IA (Terminé)
- [x] Étape 4.3 — Détail opportunité ([id]/page.tsx) : chargement Supabase par ID, 4 scores avec barres, champs IA complets, signaux liés, back button router (Terminé)
- [x] Étape 4.4 — Visualisations graphiques dynamiques (Terminé — Dashboard avec charts Recharts connectés à Supabase)
- [x] Étape 4.5 — Hub de rapports d'IA complet (Terminé — Interfaces globales, croisées, et par sources créées avec accès aux signaux)
- [x] Étape 4.6 — Finitions transverses et cohérence visuelle sur l'ensemble (Terminé — Tri dynamique sur Dashboard, navigation épurée, graphiques corrigés, boutons clean)

### Composants client créés (BLOC 4)
- `src/components/BackButton.tsx` — useRouter().back()
- `src/components/LaunchRunButton.tsx` — POST /api/scraping/run, états idle/loading/success/error
- `src/components/SourceStartButton.tsx` — POST /api/scraping/collect pour une source donnée

### Erreur préexistante corrigée
- `src/lib/ai/analyzer.ts` ligne 267 : propriété `errorDetails` manquante dans le return initial → ajoutée.

## BLOC 5 — Système de Rapports IA + Onboarding Utilisateur (Terminé)
- [x] Étape 5.1 — Migration BDD : `supabase/migrations/003_user_profiles_and_reports.sql` — tables `user_profiles` + `generated_reports`, RLS désactivé (**exécuter manuellement dans Supabase SQL Editor**)
- [x] Étape 5.2 — Onboarding Wizard 6 étapes (`src/app/onboarding/page.tsx`) + API profil (`/api/user/profile` GET/POST/PATCH, `/api/user/profile/summary` POST) + `OnboardingGate.tsx` + lien Settings dans Navigation
- [x] Étape 5.3 — Injection profil dans Gemini (`buildUserContextBlock` dans `prompts.ts`) + scoring personnalisé (`computePersonalizedScore`, `sortOpportunitiesByProfile` dans `scoring.ts`)
- [x] Étape 5.4 — Rapport catégorie (`/api/reports/category` + `reports/category/[id]/page.tsx`) + composant `CategoryReportButton.tsx`
- [x] Étape 5.5 — Rapport croisé (`/api/reports/cross` + `reports/cross/[id]/page.tsx`) + composant `CrossReportBuilder.tsx`
- [x] Étape 5.6 — Rapport complet (`/api/reports/full` + `reports/full/[id]/page.tsx`) + composant `FullReportButton.tsx` (6 appels Gemini séquentiels avec suivi de progression)
- [x] Étape 5.7 — Page Settings (`src/app/settings/page.tsx`), classes `print:` sur les 3 pages de rapport, `PrintButton.tsx`, historique rapports dans `reports/page.tsx`

### Composants créés (BLOC 5)
- `src/components/OnboardingGate.tsx` — redirige vers /onboarding si profil incomplet
- `src/components/ReportContent.tsx` — renderer markdown custom (sans dépendance externe)
- `src/components/PrintButton.tsx` — window.print() client component
- `src/components/CategoryReportButton.tsx` — bouton génération rapport catégorie
- `src/components/CrossReportBuilder.tsx` — sélecteur multi-catégories pour rapport croisé
- `src/components/FullReportButton.tsx` — bouton génération rapport complet avec étapes animées

### Page `/reports/source/[id]` réécrite
- Contenu placeholder remplacé par vraies données : signaux du batch, opportunités liées via `opportunity_signals`, répartition par type/source
- Lien vers le Hub rapports pour générer une analyse IA

### Architecture single-user
- UUID généré à la première visite via POST `/api/user/profile`, stocké dans `localStorage` key `mi_user_id`
- `OnboardingGate` vérifie `onboarding_completed` à chaque navigation
- Scoring personnalisé calculé à la volée (non stocké en BDD)

---

## BLOC 6 — Personnalisation IA par profil utilisateur (En cours)

### Étape 6.1 — Injection du profil dans le pipeline complet (Terminé — 2 Avril 2026)

**Objectif :** Que le profil utilisateur influence réellement le scraping, l'analyse Gemini et le scoring — pas seulement les rapports.

**Fichiers créés :**
- `src/lib/userProfile.ts` — `fetchUserProfile()` : récupère le profil `onboarding_completed = true` depuis Supabase
- `src/lib/scrapers/profileParams.ts` — `buildScraperParamsFromProfile(profile)` : génère des overrides de params (keywords, tags, locations) par scraper selon le profil

**Fichiers modifiés :**
- `src/lib/ai/prompts.ts` — ajout de `buildAnalysisSystemPrompt(profile)` : génère un prompt Gemini personnalisé qui injecte 12 contraintes spécifiques au profil (tech_level → solo_dev_feasible, budget_range → penalise coûts élevés, excluded_sectors → discard, priority_market → target_market, etc.)
- `src/lib/ai/analyzer.ts` — `analyzeSignals(batchId?, limit?, profile?)` accepte maintenant un profil optionnel, utilise `buildAnalysisSystemPrompt` à la place du prompt statique
- `src/lib/scrapers/engine.ts` — `runScrapingEngine(sources?, profile?)` accepte un profil, applique les overrides de params sur tous les scrapers
- `src/app/api/scraping/run/route.ts` — fetch profil avant collecte + analyse, passe aux deux fonctions
- `src/app/api/scraping/analyze/route.ts` — fetch profil avant analyse, passe à `analyzeSignals`
- `src/app/api/scraping/collect/route.ts` — fetch profil avant collecte, passe à `runScrapingEngine`

**Scrapers personnalisés :** devto (tags), upwork (keywords), malt (keywords), wellfound (keywords + locations), linkedin (keywords + locations), indeed (searches dérivées)
**Scrapers non affectés :** hackernews, reddit, g2, francetravail (pas de params de ciblage exploitables)
**Fallback propre :** si aucun profil (onboarding non complété), comportement identique à avant

### Bugs corrigés (session 2 Avril 2026)

**Bug — `MERGE_CHECK_SYSTEM_PROMPT` manquant**
- `src/lib/ai/analyzer.ts` importait `MERGE_CHECK_SYSTEM_PROMPT` depuis `./prompts` mais cette constante n'avait jamais été exportée
- Fix : ajout de `export const MERGE_CHECK_SYSTEM_PROMPT = ...` dans `src/lib/ai/prompts.ts`

**Bug — Rapport complet crashe : `text.split is not a function`**
- Cause : Gemini retourne un JSON tronqué pour la section 4 (trop long, fin de contexte de sortie) → `parseJsonResponse` throw → le catch stocke un contenu string d'erreur → mais d'autres sections peuvent retourner un JSON valide avec `content: null`
- `ReportContent.tsx` appelait `text.split('\n')` sans vérifier que `text` est bien une string
- Aggravant : Turbopack cachait le bundle RSC compilé et ne prenait pas en compte les hotreload — seul un `rm -rf .next/dev/server/chunks && rm -rf .next/cache` suivi d'un redémarrage du serveur a forcé la recompilation
- Fixes appliqués :
  - `src/components/ReportContent.tsx` : type `content: string | null | undefined`, guard dans `parseMarkdown` (`if (!text || typeof text !== 'string') return []`), guard dans `ReportContent` (conversion via `String(content ?? '')`)
  - `src/app/reports/full/[id]/page.tsx` : sanitisation de `section.content` avant passage à `ReportContent` (`.map(s => ({ ...s, content: typeof s.content === 'string' ? s.content : String(s.content ?? '') }))`)

**Note importante — Turbopack cache :**
Quand les modifications source ne semblent pas prises en compte (même erreur malgré les edits) :
```bash
rm -rf .next/dev/server/chunks
rm -rf .next/cache
# puis redémarrer le serveur
```

### Bugs corrigés (session 2 Avril 2026 — suite)

**Bug — Tableaux markdown non rendus dans ReportContent**
- `ReportContent.tsx` ne gérait pas les lignes `| col |` → affichage brut avec les pipes visibles
- Fix : réécriture complète en mode "blocs" (pré-groupement des lignes consécutives avant rendu). Les lignes `|` consécutives sont groupées et rendues en vrai `<table>` HTML. Ajout support `#### `, `> ` (blockquote). Listes groupées dans `<ul>`/`<ol>`.

**Bug — Section 5 "Top Opportunités" : `[object Object],[object Object],...`**
- Cause : Gemini retourne parfois `content` comme tableau JSON plutôt que string markdown. `String(array)` → `[object Object],[object Object]`
- Fix 1 : `src/app/api/reports/full/route.ts` — guard après `parseJsonResponse` : si `content` est un tableau, sérialisation en markdown (`### N. titre\n**clé** : valeur`)
- Fix 2 : `src/lib/ai/prompts.ts` — prompt section 5 réécrit pour imposer explicitement une string markdown plate avec format `### N. Titre — Score: XX`

**Bug — Section 4 affiche "Section 4" en cas d'erreur**
- Le catch dans `full/route.ts` utilisait `title: \`Section ${i}\`` comme fallback
- Fix : ajout de `SECTION_TITLES: Record<number, string>` dans `full/route.ts`, le catch utilise maintenant le vrai titre de la section

**Amélioration — maxOutputTokens rapport complet**
- `full/route.ts` : ajout de `generationConfig: { maxOutputTokens: 8192 }` sur le modèle Gemini → réduit la troncation JSON des sections longues

**Bug — Quota Gemini 429 silencieux dans l'analyzer**
- Le free tier gemini-2.5-flash est limité à 20 req/jour. L'analyzer continuait à boucler sur les signaux et marquait chacun en `error` → perte de signaux
- Fix : `src/lib/ai/analyzer.ts` — détection 429 via `isQuotaError()`, `break` propre (les signaux restants restent `pending`), flag `quotaReached: true` dans `AnalysisResult`
- Routes `/api/scraping/run` et `/api/scraping/analyze` : retournent `quotaWarning` dans la réponse si quota atteint

**Bug — Malt Apify timeout à 90s**
- Le scraper Malt prenait souvent >90s → timeout systématique, 0 signaux collectés
- Fix : `src/lib/scrapers/sources/malt.ts` — ajout de `maxWaitMs: 150_000` dans `runApifyActor()`

---

## BLOC 7 — Refonte Dashboard UI/UX "Pixel-Perfect" (Terminé — Avril 2026)

**Objectif :** Aligner strictement l'interface du Dashboard (`page.tsx`) et de la section Opportunités (`OpportunitiesSection.tsx`) avec un design de référence fourni par l'utilisateur (dense, épuré, compact).

**Travaux réalisés :**
- **Disposition Globale** :
  - Passage d'un gap large (`gap-4`) à un gap très compact (`gap-2`) sur toute la page.
  - Ajustement des marges du `TopHeader` (`mt-3 mb-5 py-1`) pour centrer parfaitement la barre de navigation. Suppression des marges parasites (`mt-2`) préexistantes dans le layout principal (`layout.tsx`).
- **Cartes KPIs (Top)** :
  - Maintien d'une grille à 5 colonnes (`grid-cols-5`) bien proportionnées, avec des hauteurs minium resserrées (`min-h-[100px]`).
- **Graphiques (Charts Layer)** :
  - Hauteur réduite considérablement: `h-[160px]` au lieu de >200px.
  - Largeur gérée via une grille équilibrée `grid-cols-2`. Cela permet au graphique Radar d'occuper très précisément la largeur équivalente de 2,5 cartes KPIs (atteignant le milieu de la 3e carte), créant une sensation de largeur supérieure vis-à-vis de la liste inférieure (qui est contrainte sur 2 colonnes implicites).
  - Courbe Spline (DoubleEvolutionChart) : Ajout de l'axe des ordonnées (`<YAxis>`) nativement importé de `recharts` avec ajustement des marges en conséquence.
- **Section Opportunités & Détails (`OpportunitiesSection.tsx`)** :
  - **Liste** : Encapsulation complète de "Opportunities list" dans une carte blanche aux bords arrondis (`rounded-[24px]`).
  - **Détails** : Suppression totale de la sous-grille d'information qui tronquait les données (marché cible, dpt, etc.). Remplacement intégral par la pure retranscription du modèle de référence : Titre, date, le texte intégral du "Problème identifié" (lisible et scrollable sans étêtement), et un bouton propre "Voir fiche complète ->" aligné en bas à droite.
  - Ajustement des hauteurs et des chevauchements (`min-h-0`) pour assurer un flux flexible et adaptatif sans empiétement sur les graphes et un alignement pixel perfect de la RightSidebar. Refonte de la TopHeader (Search étendue, avatar iconographique propre et margin revu).
- Refonte UI/UX : Page "Mes documents", implémentation des badges, cartes et grid layout.
- Refonte UI/UX : Page "Rapports" et "Sources", alignement complet avec le design system (light mode, rounded corners, typographie dense).
- Refonte UI/UX : Boutons d'actions principaux (`LaunchRunButton`, `AnalyzePendingButton`) avec ombres, transitions et coins arrondis.
- Refonte UI/UX : Pages de détails (Rapport Source, Rapport Complet, Opportunités) avec conservation des headers sombres mais adaptation du style (rounded-24px, ombres premium, tags revus).

### En cours
- Finalisation des transitions d'états dans `LaunchRunButton` pour feedback visuel immédiat.

---

## BLOC 8 — Migration Pipeline IA : Gemini → OpenAI Multi-couches (Terminé — 8 Avril 2026)

**Objectif :** Lever la contrainte du free tier Gemini (20 req/jour) en migrant vers une architecture OpenAI à 3 couches. Coût cible : ~$0.25/batch.

### Architecture mise en place

```
Signaux pending
  → Layer 0 : Filtre TypeScript (gratuit)       → rejet ~40-60%
  → Layer 1 : gpt-4.1-nano classification       → rejet ~30-40% supplémentaires
  → Layer 2 : gpt-5-mini low (analyse fusionnée + merge check en 1 appel)
  → Layer 3 : gpt-5 medium (rapports — 3 appels groupés au lieu de 6)
```

### Fichiers créés
- `src/lib/ai/models.ts` — constantes modèles, reasoning effort, tarifs, `estimateCost()`
- `src/lib/ai/openai-client.ts` — singleton `getOpenAIClient()`
- `src/lib/ai/prefilter.ts` — `prefilterSignals()` : rejet TypeScript (contenu court, absence mots-clés SaaS, engagement HN/Reddit/Upwork trop faible)
- `src/lib/ai/classifier.ts` — `classifySignals()` : classification gpt-4.1-nano via Chat Completions API

### Fichiers modifiés
- `src/lib/ai/analyzer.ts` — réécriture complète : suppression Gemini, intégration 3 couches, appel fusionné gpt-5-mini (Responses API), suivi tokens → `collections_history.results_summary.ai_usage`
- `src/lib/ai/prompts.ts` — ajout `buildFusedAnalysisPrompt()` (signal + merge check en 1 prompt), `buildFullReportGroupPrompt()` (2 sections par appel), `signals` optionnel dans `buildCategoryReportPrompt()`
- `src/app/api/reports/category/route.ts` — migration OpenAI gpt-5, suppression signaux bruts du contexte, suivi coût dans `generation_params`
- `src/app/api/reports/cross/route.ts` — migration OpenAI gpt-5
- `src/app/api/reports/full/route.ts` — migration OpenAI gpt-5, 6 appels séquentiels → 3 appels groupés
- `src/lib/scrapers/registry.ts` — `producthunt.enabled: false` (Cloudflare), `malt.enabled: false` (Apify trop coûteux)

### Décisions architecturales
- **Fusion analyse + merge check** : L'ancien 2ème appel Gemini (`findMatchingOpportunity`) est éliminé. Le champ `merge_match` est retourné dans le même JSON que l'analyse → 50% d'appels en moins sur la couche la plus coûteuse.
- **gpt-4.1-nano via Chat Completions API** (pas Responses API) — modèle de vitesse, sans reasoning
- **gpt-5-mini et gpt-5 via Responses API** avec `reasoning: { effort: 'low' | 'medium' }` — modèles de raisonnement
- **Top 20 opps existantes** : fetched une seule fois avant la boucle d'analyse (pas N+1)
- **Rapport full** : sections groupées [1+2], [3+4], [5+6] → plus stable, moins de latence

### Variable d'environnement à ajouter
```
OPENAI_API_KEY=sk-...
```

### Note : `@google/generative-ai` toujours présent
Le package Gemini est encore dans `package.json` (utilisé par `api/user/profile/summary/route.ts`). À supprimer quand cette route sera migrée.

---

## BLOC 9 — Refonte Stratégique : Cross-Industries, Nouvelles Sources, Scoring V2 (Terminé — Avril 2026)

**Objectif :** Sortir de la bulle tech, couvrir tous les secteurs industriels, garantir la fraîcheur des signaux sur runs répétés, corriger des bugs critiques qui limitaient massivement la couverture, et ajouter 3 nouvelles sources de données.

### 9.1 — Bugs critiques corrigés

**Bug G2 — quota `maxResults` total au lieu de par URL**
- `src/lib/scrapers/sources/g2.ts` : avec `maxResults: 20` et 15 URLs → URL 1 remplissait les 20 slots, URLs 2-15 ne s'exécutaient jamais
- Fix : `perUrl = Math.ceil(maxResults / urls.length)`, boucle indépendante par URL, `maxWaitMs: 120_000`

**Bug Dev.to — quota `maxResults` total au lieu de par tag**
- `src/lib/scrapers/sources/devto.ts` : même problème, seuls les 2 premiers tags sur 8 produisaient des signaux
- Fix : `perTag = Math.ceil(maxResults / tags.length)`, limite par tag, ajout `published_after` (30 jours) pour fraîcheur

### 9.2 — Nouvelles sources

**ProductHunt** — Réécrit depuis zéro
- Ancien : appel GraphQL `https://www.producthunt.com/frontend/graphql` → bloqué Cloudflare (403)
- Nouveau : RSS public `https://www.producthunt.com/feed` → parsing XML natif sans dépendance
- Fonctions internes : `parseRSS()`, `extractTag()`, `stripHtml()`, `decodeEntities()`
- Filtre 30 jours + max 50 résultats par run

**Capterra** — Nouveau scraper
- Actor Apify : `dionysus_way/capterra-reviews`
- Input format : `{ startUrls: [url_string], maxReviews: N }` — IMPORTANT : `startUrls` est un tableau de strings simples (pas d'objets `{url: "..."}`)
- Champs de sortie réels : `id`, `title`, `rating`, `date` (pas `date_posted`), `author`, `jobTitle`, `industry`, `companySize`, `comments` (pas `content`), `pros`, `cons`, `switchingReasons`, `reviewUrl` (pas `review_url`), `productUrl`
- Coût : ~$0.01/review via PPE (Pay Per Event)
- 5 produits field service : ServiceTitan, Jobber, 7shifts, Fishbowl, Lightspeed
- **DÉSACTIVÉ temporairement** (90 signaux déjà collectés) — réactiver pour prochain run complet
- `maxWaitMs: 180_000`, `timeoutSecs: 120`

**Trustpilot** — Nouveau scraper
- Actor Apify : `happitap/trustpilot-scraper`
- Input : `{ startUrls: [url], numberOfReviews: N }`
- 10 URLs B2B : ShipBob, ShipStation, QuickBooks, Xero, Gusto, Shopify, BigCommerce, Buildium, Mailchimp, DocuSign
- Mapper avec fallback multiple sur les noms de champs

### 9.3 — Préfiltre Layer 0 corrigé (`src/lib/ai/prefilter.ts`)

**Problème :** Les reviews et offres d'emploi étaient rejetées par le filtre `no_saas_relevance` car elles ne contiennent pas de mots-clés SaaS explicites (ex: 29 reviews Capterra perdues par run).

**Fix :** Routing par type de source avant le filtre keyword :
- `REVIEW_SOURCES = ['g2', 'capterra', 'trustpilot']` → bypass keyword filter, uniquement rejeter les reviews 5★ sans `FRICTION_KEYWORDS`
- `JOB_SOURCES = ['francetravail', 'indeed', 'linkedin', 'wellfound', 'upwork']` → bypass keyword filter, uniquement vérifier longueur ≥ 100 chars
- `FRICTION_KEYWORDS` : `['wish', 'missing', 'manually', 'spreadsheet', 'cons:', 'why they switched', 'no integration', 'workaround', 'lack', 'frustrat', 'limitation', 'alternative']`

### 9.4 — Scoring Formula V2 (`src/lib/ai/scoring.ts`)

**Ancienne formule :** `volume×0.30 + urgency×0.35 + tool_gap×0.25 - saturation×0.10`
- Problème : le volume dominait trop (une opportunité avec 10 signaux avait toujours un score élevé, même si urgency/tool_gap étaient bas)

**Nouvelle formule :**
```typescript
const scoreQuality = Math.round(urgency × 0.50 + tool_gap × 0.40 - saturation × 0.10)
const scoreVolumeBonus = Math.min(15, Math.round(Math.log2(signal_count + 1) × 5))
const scoreGlobal = Math.max(0, Math.min(100, scoreQuality + scoreVolumeBonus))
```
- Score de qualité d'abord (urgency + tool_gap), volume = bonus logarithmique plafonné à +15
- Exemple : urgency=80, tool_gap=70, saturation=30 → quality=65, bonus=5 → score=70

### 9.5 — Prompts étendus (`src/lib/ai/prompts.ts`)

- Ajout section **PÉRIMÈTRE** : explique comment interpréter les signaux par type de source (reviews → chercher les "cons"/"why they switched" ; jobs → recruter un humain = tâche non automatisée ; posts communautaires → demandes directes d'outil)
- **SECTEURS COUVERTS** : désormais explicitement tous secteurs (comptabilité, RH, logistique, immobilier, restauration, construction, retail, éducation, juridique…)
- Grille scoring mise à jour : urgency 50% (was 35%), tool_gap 40% (was 25%)
- `buildFusedAnalysisPrompt()` : ajout de `SOURCE : {source} ({source_type})` en tête du signal pour que l'IA contextualise le signal avant analyse et merge

### 9.6 — Registry reconfiguré (`src/lib/scrapers/registry.ts`)

**Nouvelles configs :**
- G2 : 15 URLs × 11 industries (CRM, Support, RH, Compta, PM, Legal, Immobilier, Santé, Construction, Marketing), `maxResults: 150`
- Reddit : 12 subreddits (7 secteurs pro non-tech + 5 tech/startups), 8 keywords comportementaux (`"we use spreadsheet"`, `"manually track"`, etc.), `minScore: 5`
- HackerNews : 10 nouveaux keywords comportementaux + filtre Algolia 30 jours (`numericFilters=created_at_i>...`)
- Indeed : 10 searches (5 EN + 5 FR), rôles opérationnels révélateurs (`data entry specialist`, `saisie de données`, etc.)
- France Travail : 15 keywords rôles manuels (`saisie de données`, `assistant de gestion`, `coordinateur logistique`...)
- Upwork : 7 keywords orientés besoins (`excel to app`, `automate spreadsheet`, `internal tool`...)
- LinkedIn : keywords process/ops (`revenue operations`, `data coordinator`...) + locations France/Canada
- Capterra : `enabled: false` — 5 produits field service, 90 signaux déjà collectés
- Trustpilot : `enabled: true` — 10 URLs B2B services
- ProductHunt : `enabled: true` — RSS, pas de params

### 9.7 — UI mise à jour

**`src/app/sources/page.tsx`** — 4 catégories (was 3) :
- `emploi` : Upwork, France Travail, LinkedIn, Indeed (Malt supprimé)
- `communaute` : Dev.to, Reddit, Hacker News, Product Hunt (ajouté)
- `reviews` : G2, Trustpilot, Capterra (nouvelle catégorie, icône `Star`)
- `startup` : Wellfound

**`src/components/QuickScrapeModal.tsx`** — Même 4 catégories, `CategoryKey` mis à jour.

### 9.8 — Fusion cross-source améliorée (`src/lib/ai/analyzer.ts`)

- Opportunités chargées pour merge check : 20 → **50** (`.limit(50)`)
- Signal context enrichi : `SOURCE : {source} ({source_type})` visible par l'IA → meilleur matching multi-sources
- Instruction de merge clarifiée : "même besoin fondamental = merge, peu importe la source"

### 9.9 — Acteurs Apify testés et rejetés (Capterra)

Pour référence, les 3 acteurs Capterra rejetés avant de trouver `dionysus_way/capterra-reviews` :
1. `imadjourney/capterra-reviews-scraper` → HTTP 403 (abonnement payant requis)
2. `focused_vanguard/multi-platform-reviews-scraper` → Attend `input.domain` pas `url`
3. `focused_vanguard` avec `domain: "rippling.com"` → Run réussi mais 0 résultats (bug connu de l'acteur)

### 9.10 — Sources obsolètes

**Malt** : `enabled: false` depuis BLOC 8 (Apify trop coûteux, profils freelances peu pertinents)
**IndieHackers** : stub désactivé depuis BLOC 2 (SPA côté client, pas scrappable sans auth)
Ces deux sources sont retirées de l'UI mais leurs fichiers source restent présents.

---

## BLOC 10 — Audit Pipeline Scraping + Fix Opportunités (Terminé — Avril 2026)

### 10.1 — Bugs scraping corrigés

**Trustpilot — acteur Apify cassé**
- `happitap/trustpilot-scraper` : run SUCCEEDED mais retourne systématiquement 0 items (acteur déprécié)
- Diagnostic : testé avec PayPal (URL garantie) → toujours 0 items
- Fix : migration vers `automation-lab/trustpilot` (6 574 runs, maintenu)
- Nouveau format d'input : `{ companyUrls: ["domain.com"], maxReviewsPerCompany: N, sort: "recency" }` — domaine seul (pas l'URL Trustpilot complète)
- Nouveau format de sortie : champs `publishedDate` (vs `datePublished`), `authorName` (vs `author`), `verificationLevel`, `language`, `country`
- `mapToSignal()` mis à jour, `TrustpilotReview` interface étendue
- URLs par défaut : `paypal.com` (B2B reconnu sur Trustpilot)

**ProductHunt — parser RSS réécrit pour Atom**
- Cause : feed `https://www.producthunt.com/feed` est au format **Atom**, pas RSS 2.0
- Ancienne fonction `parseRSS()` cherchait `<item>`, `<pubDate>`, `<description>` → 0 entrées trouvées
- Fix : réécriture complète en `parseAtomFeed()` : `<entry>`, `<published>` (ISO direct), `<link rel="alternate" href="...">`, `<content type="html">`
- ID extrait depuis `<id>tag:www.producthunt.com,2005:Post/1234567</id>` via regex `/Post\/(\d+)/`
- Guard `isNaN(pubDate.getTime())` ajouté sur le filtre de date
- Résultat validé : **47 signaux collectés** sur un run de test

**Scripts de test isolés (`scripts/test-scrapers/`)**
- 7 fichiers créés : `test-trustpilot.ts`, `test-g2.ts`, `test-capterra.ts`, `test-upwork.ts`, `test-wellfound.ts`, `test-linkedin.ts`, `test-indeed.ts`
- Chargement automatique de `.env.local` via `fs.readFileSync` (tsx ne le charge pas)
- Pattern : API REST Apify directe, poll status toutes 5s, affiche 3 premiers items bruts
- URL Apify Console loggée pour debug en cas de 0 résultats

**Route `/api/scraping/collect` — normalisation des sources**
- Fix : accepte désormais `sources: ["producthunt"]` (strings) en plus des objets `{source: "..."}` via `.map(s => typeof s === 'string' ? { source: s } : s)`

### 10.2 — Bug critique : 0 opportunités créées malgré des milliers de signaux

**Cause racine identifiée :** `SourceStartButton` (bouton "Lancer" par catégorie) appelait `/api/scraping/collect` — collecte uniquement, sans analyse IA. Tous les signaux restaient en `status: pending` indéfiniment.

Seul `LaunchRunButton` ("Lancer toutes les sources") appelait `/api/scraping/run` (pipeline complet). La distinction n'était pas visible dans l'UI.

**Deuxième cause :** `/api/scraping/run` tentait d'analyser 2000 signaux séquentiellement dans un seul appel HTTP → timeout garanti pour les gros batches.

**Fixes :**
- `SourceStartButton` → appelle désormais `/api/scraping/run` (collect + analyse) au lieu de `/api/scraping/collect`
- Limite analyse dans `/api/scraping/run` : 2000 → 100 signaux (évite les timeouts)
- Nouveau endpoint `POST /api/analyze` : analyse les signaux pending existants (limite : 50/call, configurable jusqu'à 200)
- Nouveau endpoint `GET /api/analyze` : retourne le compte de signaux pending
- Nouveau composant `AnalyzePendingButton.tsx` : bouton orange dans la page Sources, visible uniquement s'il y a des signaux pending, affiche le compte et le résultat (créées/fusionnées/rejetées/restants). Traitement par lots de 50 avec indication du nombre restant.

### 10.3 — Robustesse IA (`src/lib/ai/utils.ts`)

- Nouveau fichier `safeParseAIResponse<T>(raw, signalId?)` : strip markdown code blocks, remplace les nombres en toutes lettres anglaises (`eighty` → `80`), log le JSON brut + signal_id en cas d'échec
- Tous les `JSON.parse(raw)` remplacés dans : `analyzer.ts`, `classifier.ts`, `reports/category`, `reports/cross`, `reports/full`
- Règle 7 ajoutée dans `ANALYSIS_SYSTEM_PROMPT` : scores numériques uniquement en chiffres (pas en lettres)

### Composants créés (BLOC 10)
- `src/components/AnalyzePendingButton.tsx` — bouton d'analyse on-demand avec compteur live
- `src/app/api/analyze/route.ts` — POST (analyse) + GET (count pending)
- `scripts/test-scrapers/test-*.ts` — 7 scripts de test Apify isolés

### Composants modifiés (BLOC 10)
- `src/components/SourceStartButton.tsx` — `/collect` → `/run`
- `src/app/api/scraping/run/route.ts` — limit 2000 → 100
- `src/lib/scrapers/sources/trustpilot.ts` — acteur + input format + mapToSignal
- `src/lib/scrapers/sources/producthunt.ts` — réécriture parser Atom
- `src/lib/scrapers/sources/g2.ts`, `capterra.ts`, `upwork.ts`, `wellfound.ts`, `linkedin.ts`, `indeed.ts` — pas modifiés


### Étape 4.5 — Alignement UI/UX des pages secondaires
- **État :** Terminée.
- **Actions :**
  - **Boutons Actions Rapides** : Refonte totale de `LaunchRunButton` et `AnalyzePendingButton` pour correspondre pixel par pixel au style "Actions Rapides" du dashboard (pilule noire et pilule blanche avec bordure).
  - **Sources (page principale)** : Intégration des deux boutons dans un container grid aligné sur l'entête, remplaçant les boutons flottants.
  - **Pages de détail (Opportunités, Rapports sources, Rapports complets)** : Suppression complète des "Dark Headers" (`bg-[#2b3652]`) au profit d'entêtes clairs et épurés ("Light Mode") pour être 100% cohérent avec l'esthétique du Dashboard.
- **Note Turbopack :** En cas d'incohérence visuelle sur le navigateur (le code étant déjà modifié), un `rm -rf .next/cache` suivi d'un restart du serveur de développement est nécessaire.
