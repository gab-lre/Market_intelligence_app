# Contexte Projet : SaaS Market Intelligence

Ce fichier fournit le contexte complet de l'application à un agent IA prenant le relais sur le développement. Lire aussi `NOTES.md` pour le journal d'erreurs et décisions détaillées.

---

## 🧭 Concept

L'application **SaaS Market Intelligence** est un outil interne de collecte et d'analyse de données.
**But** : Scanner des sources publiques tous secteurs (emplois, reviews logiciels, communautés, freelance), repérer les expressions de besoins résolvables par un SaaS/agent IA/template, les analyser via un pipeline OpenAI multi-couches, les classer par score de pertinence, et les présenter dans un dashboard personnalisé selon le profil utilisateur.

**Sources actives :** HackerNews, Reddit (12 subreddits), France Travail, Dev.to, G2 (15 produits/11 industries), Wellfound, Upwork, LinkedIn, Indeed (10 recherches), Trustpilot (10 URLs B2B), ProductHunt (RSS)
**Sources désactivées :** Capterra (90 signaux déjà collectés — réactiver manuellement), Malt (trop coûteux), IndieHackers (SPA non scrappable)

---

## 🛠️ Stack Technique

| Élément | Choix |
|---------|-------|
| Framework | Next.js 16 (App Router) + TypeScript |
| BDD | Supabase (PostgreSQL) via `@supabase/supabase-js` |
| Styles | Tailwind CSS v4 |
| UI | Code sur-mesure — pas de Shadcn ni autres libs. Icônes : `lucide-react` |
| IA (pipeline principal) | OpenAI — gpt-4.1-nano (classifier) + gpt-5-mini (analyzer) + gpt-5 (rapports) |
| IA (profil summary uniquement) | Google Gemini `gemini-2.5-flash` via `/api/user/profile/summary` |
| Scraping | Apify (actors tiers) + APIs publiques directes + RSS |
| Hébergement | Local uniquement (`npm run dev`) |

---

## 🎨 Règles UI/UX — NON NÉGOCIABLES

1. **Mode Clair ("Light Mode") Intégré** — Base de fond `#F4F6F8` (gris très clair) avec cartes de contenu blanches `#FFFFFF`. Pas de mode sombre.
2. **Densité d'Information (Grille & Espacements)** — Interface à l'aspect dense et compact. `gap-2` globaux. Hauteur minimisée pour les graphiques (`h-[160px]`) pour privilégier l'espace des listes et détails en flexibilité (`flex-1`).
3. **Formes & Contours** : Utilisation intensive de coins arrondis larges (`rounded-[24px]`) sur la quasi-totalité des conteneurs (`cards`, graphiques, sidebar, TopHeader) combinées à `shadow-[0_4px_20px_rgba(0,0,0,0.02)]`.  *(Annule explicitement l'ancienne règle "zéro rounded")*
4. **Couleur primaire/texte** : `#1A1C1E` (titres et corps noir profond), gris secondaires `#707478` (sous-titres, dates).
5. **Couleurs accents** : `#257b57` (Vert succès, scores), `#b64390` (Rose magenta, métriques).
6. **Typographie** : Polices resserrées (`tracking-tight`), labels souvent en `uppercase tracking-widest text-[9px] ou [10px]`. Lettrages gras privilégiés pour les titres de section (`font-bold text-[14px]`).
7. **Print** : classes `print:hidden` / `print:max-w-full` sur les pages de rapport pour export PDF via `window.print()`

---

## ✅ État d'avancement — BLOC PAR BLOC

### BLOC 1 — Fondations (100% ✅)
- Next.js 16 + Tailwind v4 initialisé
- Supabase connecté (`src/lib/supabase.ts`). **RLS désactivé** sur toutes les tables.
- Navigation complète (`Navigation.tsx`, `TopHeader.tsx`)

### BLOC 2 — Collecteurs de données (100% ✅)
- Architecture scraping : `types.ts`, `registry.ts`, `engine.ts`
- **Actifs** : HackerNews, Reddit, France Travail (OAuth2), Dev.to, G2 (Apify), Wellfound (Apify), Upwork (Apify), LinkedIn (Apify), Indeed (Apify), ProductHunt (RSS), Trustpilot (Apify)
- **Actif mais désactivé temporairement** : Capterra (90 signaux déjà collectés — `enabled: false` dans registry)
- **Désactivés définitivement** : Malt (trop coûteux), IndieHackers (SPA non scrappable)
- Déduplication par `external_id` dans `insertSignals()` — pas d'upsert Supabase (incompatible avec index partiel)

### BLOC 3 — Pipeline IA (100% ✅)
- Migration 002 exécutée — 12 colonnes IA dans `opportunities`
- **Architecture 3 couches OpenAI** :
  - Layer 0 : `prefilter.ts` — filtre TypeScript gratuit (longueur, mots-clés, source-type routing)
  - Layer 1 : `classifier.ts` — gpt-4.1-nano via Chat Completions API (classification rapide)
  - Layer 2 : `analyzer.ts` — gpt-5-mini via Responses API, analyse + merge check fusionné en 1 appel
- `prompts.ts` — prompt V2 cross-industries + PÉRIMÈTRE par type de source + scoring recalibré
- `scoring.ts` — formule V2 : `quality = urgency×0.5 + tool_gap×0.4 - saturation×0.1` + bonus log volume (max +15)
- Pipeline complet : collecte → analyse → scoring via `/api/scraping/run`

### BLOC 4 — Interface Dashboard (100% ✅)
- Dashboard avec KPIs réels + graphiques Recharts + tableau Top 10 avec tri dynamique
- Page Sources par catégories (Emplois / Communautés / Startups) + historique collections
- Page détail opportunité avec 4 scores, champs IA, signaux liés
- Hub rapports `/reports` — interfaces des 3 types de rapports

### BLOC 5 — Rapports IA + Onboarding Utilisateur (100% ✅)
- Migration 003 exécutée — tables `user_profiles` + `generated_reports`
- Onboarding wizard 6 étapes (`/onboarding`) + `OnboardingGate` (redirige si non complété)
- Page Settings (`/settings`) — modification profil + régénération du résumé IA
- **3 types de rapports IA générés à la demande :**
  - Rapport catégorie (`/reports/category/[id]`) — 1 appel Gemini, analyse 1 catégorie
  - Rapport croisé (`/reports/cross/[id]`) — analyse convergences multi-catégories
  - Rapport complet (`/reports/full/[id]`) — 6 appels Gemini séquentiels, toutes sources
- Composant `ReportContent.tsx` — renderer markdown custom (sans dépendance externe)
- Export PDF via `PrintButton.tsx` (`window.print()` + classes `print:`)
- Architecture single-user : UUID en `localStorage` (`mi_user_id`) → profil en BDD

### BLOC 6 — Personnalisation IA par Profil (100% ✅)

**Étape 6.1 terminée — Injection profil dans le pipeline complet**
- `src/lib/userProfile.ts` — `fetchUserProfile()` : récupère le profil depuis Supabase
- `src/lib/scrapers/profileParams.ts` — `buildScraperParamsFromProfile()` : keywords/tags/locations par scraper selon profil
- `src/lib/ai/prompts.ts` — `buildAnalysisSystemPrompt(profile)` : 12 contraintes injectées dans le prompt Gemini (tech_level, budget_range, excluded_sectors, priority_market, preferred_solution_types, etc.)
- Toutes les routes de scraping (`/run`, `/analyze`, `/collect`) fetchent le profil et le passent aux fonctions

### BLOC 8 — Migration Pipeline IA : Gemini → OpenAI Multi-couches (100% ✅)
- Voir `NOTES.md` section BLOC 8 pour le détail complet

### BLOC 9 — Refonte Stratégique : Cross-Industries + Nouvelles Sources (100% ✅)
- Corriger bugs G2 (per-URL quota) et Dev.to (per-tag quota)
- Nouveaux scrapers : Capterra (Apify `dionysus_way/capterra-reviews`), Trustpilot (Apify `happitap`), ProductHunt (RSS natif)
- Prefilter : bypass keyword filter pour les review/job sources
- Scoring V2 : quality-first + bonus logarithmique volume
- Prompts : tous secteurs + PÉRIMÈTRE par source + source context dans buildFusedAnalysisPrompt
- Registry : 11 sources reconfigurées (keywords, volumes, URLs)
- UI : 4 catégories (Emplois / Communautés / Avis & Reviews / Startups)
- Analyzer : merge check étendu à 50 opportunités (was 20)

### BLOC 7 — Refonte Dashboard UI/UX "Pixel-Perfect" (100% ✅)
- Aligné au pixel près avec une maquette figma-like (densité accrue, style épuré, fonds clairs, ombres subtiles).
- TopHeader restructuré ("Pill" avec recherche centrale bordée de stroke subtile) et marges rectifiées (`mt-3 mb-5`).
- Les graphiques (Layer centrale) respectent une répartition 50/50 (`grid-cols-2`). Le radar empiète proportionnellement sur la moitié de la page (au milieu du 3ème KPI), ce qui le rend visuellement plus large que la partie "Listes" située sous lui.
- Ajout d'origine/Y-Axis sur le Spline Chart et lissage de courbes.
- Zone Liste / Détails (OpportunitiesSection) : Simplification drastique. La liste a des bulles score intégrées. Les détails retirent l'excès de grilles pour un modèle textuel long et focalisé ("Problème Identifié"), se rapprochant de l'interface "Mail" de l'image de référence. `overflow` corrigé.

---

## 🏗️ Architecture des fichiers

```
src/
├── types/
│   └── database.ts                  ← Types TS (migrations 001 + 002 + 003)
│
├── lib/
│   ├── supabase.ts                  ← Client Supabase (anon key)
│   ├── userProfile.ts               ← fetchUserProfile() — utilitaire single-user
│   ├── scrapers/
│   │   ├── types.ts                 ← Interfaces Scraper, RawSignalInput, ScraperResult
│   │   ├── registry.ts              ← Registre + configs par défaut de tous les collecteurs
│   │   ├── engine.ts                ← runScrapingEngine(sources?, profile?) + insertSignals()
│   │   ├── profileParams.ts         ← buildScraperParamsFromProfile(profile)
│   │   └── sources/
│   │       ├── hackernews.ts        ← API Algolia + filtre 30j (opérationnel)
│   │       ├── reddit.ts            ← API JSON publique, 12 subreddits, 8 keywords comportementaux (opérationnel)
│   │       ├── francetravail.ts     ← OAuth2, 15 keywords rôles manuels (opérationnel)
│   │       ├── devto.ts             ← API REST native, per-tag quota, filtre 30j (opérationnel)
│   │       ├── g2.ts                ← Apify product-reviews, per-URL quota, 15 produits (opérationnel)
│   │       ├── wellfound.ts         ← Apify wellfound-api-ppe (opérationnel)
│   │       ├── upwork.ts            ← Apify flash_mage/upwork, 7 keywords orientés besoins (opérationnel)
│   │       ├── malt.ts              ← Apify shoya/malt-profile-scraper (DÉSACTIVÉ — trop coûteux)
│   │       ├── linkedin.ts          ← Apify worldunboxer/rapid-linkedin-scraper (opérationnel)
│   │       ├── indeed.ts            ← Apify valig/indeed-jobs-scraper, 10 searches EN+FR (opérationnel)
│   │       ├── producthunt.ts       ← RSS natif https://www.producthunt.com/feed, parser XML custom (opérationnel)
│   │       ├── capterra.ts          ← Apify dionysus_way/capterra-reviews (DÉSACTIVÉ — 90 signaux collectés)
│   │       ├── trustpilot.ts        ← Apify happitap/trustpilot-scraper, 10 URLs B2B (opérationnel)
│   │       └── indiehackers.ts      ← Stub désactivé (SPA non scrappable)
│   └── ai/
│       ├── models.ts                ← Constantes modèles OpenAI, tarifs, estimateCost()
│       ├── openai-client.ts         ← Singleton getOpenAIClient()
│       ├── prefilter.ts             ← Layer 0 : filtre TypeScript gratuit (source-type routing + keywords)
│       ├── classifier.ts            ← Layer 1 : gpt-4.1-nano classification
│       ├── prompts.ts               ← ANALYSIS_SYSTEM_PROMPT + buildAnalysisSystemPrompt(profile)
│       │                              + buildFusedAnalysisPrompt(signal, existingOpps) [inclut source context]
│       │                              + prompts rapports (category, cross, full)
│       │                              + buildUserContextBlock(profileSummary)
│       ├── analyzer.ts              ← Layer 2 : analyzeSignals(batchId?, limit?, profile?), merge check top 50
│       └── scoring.ts               ← recalculateOpportunityScore() V2 (quality-first + log bonus) + computePersonalizedScore()
│
├── components/
│   ├── Navigation.tsx               ← Sidebar principale (liens + icônes)
│   ├── TopHeader.tsx                ← Barre top
│   ├── BackButton.tsx               ← useRouter().back() client component
│   ├── LaunchRunButton.tsx          ← POST /api/scraping/run (idle/loading/success/error)
│   ├── SourceStartButton.tsx        ← POST /api/scraping/collect pour une source
│   ├── OnboardingGate.tsx           ← Redirige vers /onboarding si profil incomplet
│   ├── ReportContent.tsx            ← Renderer markdown custom (guard null + tableaux + blockquotes + h4)
│   ├── PrintButton.tsx              ← window.print() client component
│   ├── CategoryReportButton.tsx     ← Génération rapport catégorie
│   ├── CrossReportBuilder.tsx       ← Sélecteur multi-catégories rapport croisé
│   └── FullReportButton.tsx         ← Génération rapport complet (6 étapes animées)
│
└── app/
    ├── layout.tsx                   ← Layout global
    ├── page.tsx                     ← Dashboard (KPIs + graphiques + top opportunités)
    ├── globals.css
    ├── onboarding/
    │   └── page.tsx                 ← Wizard 6 étapes (client component)
    ├── settings/
    │   └── page.tsx                 ← Édition profil + régénération résumé IA
    ├── sources/
    │   └── page.tsx                 ← Gestion sources par catégorie
    ├── opportunities/
    │   └── [id]/page.tsx            ← Détail opportunité
    ├── reports/
    │   ├── page.tsx                 ← Hub rapports + historique
    │   ├── category/[id]/page.tsx   ← Rapport catégorie
    │   ├── cross/[id]/page.tsx      ← Rapport croisé
    │   ├── full/[id]/page.tsx       ← Rapport complet (6 sections)
    │   └── source/[id]/page.tsx     ← Rapport par batch de collecte
    └── api/
        ├── scraping/
        │   ├── collect/route.ts     ← POST /api/scraping/collect
        │   ├── analyze/route.ts     ← POST /api/scraping/analyze
        │   └── run/route.ts         ← POST /api/scraping/run (pipeline complet)
        ├── user/
        │   ├── profile/route.ts     ← GET / POST / PATCH /api/user/profile
        │   └── profile/summary/route.ts ← POST (génère profile_summary via Gemini)
        └── reports/
            ├── category/route.ts    ← POST /api/reports/category
            ├── cross/route.ts       ← POST /api/reports/cross
            └── full/route.ts        ← POST /api/reports/full

supabase/migrations/
├── 001_refonte_schema.sql           ← Tables de base (exécutée)
├── 002_opportunities_ai_fields.sql  ← 12 colonnes IA dans opportunities (exécutée)
└── 003_user_profiles_and_reports.sql ← user_profiles + generated_reports (exécutée)
```

---

## 🗄️ Schéma BDD complet (migrations 001 + 002 + 003)

### `collections_history`
`id` (uuid PK = batch_id), `started_at`, `finished_at`, `status` (running/completed/partial/failed), `sources_config` (jsonb), `results_summary` (jsonb), `signals_collected`, `signals_analyzed`, `opportunities_created`, `opportunities_updated`

### `raw_signals`
`id`, `source` (hackernews/reddit/…), `source_type` (community/job/review/freelance), `external_id` (déduplication), `title`, `content`, `url`, `author`, `metadata` (jsonb), `collected_at`, `published_at`, `status` (**pending**/analyzed/discarded/error), `batch_id` (FK→collections_history)

### `opportunities`
Colonnes de base : `id`, `title`, `description`, `problem`, `repetitive_tasks[]`, `existing_tools[]`, `tool_gaps`, `department`, `company_size[]`, `score_volume`, `score_urgency`, `score_tool_gap`, `score_saturation`, `score_global`, `signal_count`, `source_types[]`, `status`, `created_at`, `updated_at`

Colonnes IA (migration 002) : `opportunity_type` (saas/ai_agent_service/ai_agent_product/template/micro_product), `target_market` (fr/qc/fr_qc/international), `revenue_model`, `time_to_mvp` (days/weeks/months), `complexity` (low/medium/high), `estimated_cost`, `solo_dev_feasible` (bool), `key_challenges[]`, `price_range`, `market_size_hint` (niche/medium/large), `recurring_potential` (bool), `alternative_types[]`

### `opportunity_signals`
`opportunity_id` (FK), `signal_id` (FK), `relevance_note` — liaison N-N

### `user_profiles` (migration 003)
`id` (uuid PK), `entrepreneurial_stage`, `main_motivation[]`, `time_horizon`, `prior_experience` (bool), `tech_level` (non_tech/low_code/junior_dev/senior_dev), `secondary_skills[]`, `spoken_languages[]`, `weekly_availability`, `budget_range` (bootstrapped/few_thousands/comfortable), `preferred_business_models[]`, `excluded_sectors[]`, `preferred_sectors[]`, `preferred_solution_types[]`, `preferred_target` (sme/enterprise/freelancers/consumers), `product_complexity`, `vertical_vs_horizontal`, `priority_market` (fr/fr_qc/europe/international), `existing_sector_knowledge`, `report_detail_level`, `report_tone`, `report_frequency`, `profile_summary` (text généré par Gemini), `onboarding_completed` (bool), `onboarding_step`, `created_at`, `updated_at`

### `generated_reports` (migration 003)
`id` (uuid PK), `user_id` (FK nullable), `type` (category/cross/full), `title`, `sections` (jsonb — `[{order, title, content}]`), `sources_used[]`, `collection_ids[]`, `generation_params` (jsonb), `status` (generating/completed/error), `sections_total`, `sections_done`, `error_message`, `created_at`

---

## 🔑 Variables d'environnement

| Variable | État |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `OPENAI_API_KEY` | ✅ — pipeline principal (gpt-4.1-nano, gpt-5-mini, gpt-5) |
| `GEMINI_API_KEY` | ✅ — uniquement `/api/user/profile/summary` (résumé profil) |
| `APIFY_API_TOKEN` | ✅ |
| `FRANCE_TRAVAIL_CLIENT_ID` | ✅ |
| `FRANCE_TRAVAIL_CLIENT_SECRET` | ✅ |

---

## 🚀 Routes API disponibles

| Route | Méthode | Body | Usage |
|-------|---------|------|-------|
| `/api/scraping/collect` | POST | `{ sources?: [...] }` | Collecte seule (personnalisée si profil) |
| `/api/scraping/analyze` | POST | `{ batchId?, limit? }` | Analyse IA seule (personnalisée si profil) |
| `/api/scraping/run` | POST | `{ sources? }` | **Pipeline complet** (collecte→analyse→scoring) |
| `/api/user/profile` | GET | `?userId=` | Récupère le profil |
| `/api/user/profile` | POST | `{}` | Crée un nouveau profil vide |
| `/api/user/profile` | PATCH | `{ userId, ...champs }` | Met à jour le profil |
| `/api/user/profile/summary` | POST | `{ userId }` | Génère `profile_summary` via Gemini |
| `/api/reports/category` | POST | `{ category, userId? }` | Génère rapport catégorie |
| `/api/reports/cross` | POST | `{ categories[], userId? }` | Génère rapport croisé |
| `/api/reports/full` | POST | `{ userId? }` | Génère rapport complet (6 sections, ~3 min) |

---

## ⚠️ Pièges connus

### 0. Capterra — format startUrls CRITIQUE
L'actor Apify `dionysus_way/capterra-reviews` attend `startUrls: ["https://..."]` (tableau de **strings simples**).
Passer `startUrls: [{ url: "https://..." }]` (tableau d'objets) retourne HTTP 400 "startUrls.0 must be string".
Les URLs doivent pointer directement vers une page produit Capterra (pas une page de recherche).

### 0b. Capterra — champs de sortie réels
Les noms de champs dans la réponse de l'actor sont différents de ce qu'on pourrait attendre :
- `comments` (pas `content`) — texte principal de la review
- `date` (pas `date_posted`) — date de publication
- `reviewUrl` (pas `review_url`) — URL de la review
- `productUrl` — URL du produit (permet d'extraire le nom via `extractProductName()`)

### 1. Gemini — modèles disponibles (free tier)
- `gemini-2.5-flash` → ✅ OK (modèle en production)
- `gemini-2.0-flash` → ❌ quota 0 sur free tier
- `gemini-1.5-flash` → ❌ 404 déprécié
- Previews (`-preview-04-17`, `-05-20`) → ❌ expirées

### 2. Supabase upsert + index partiel
Supabase ne supporte pas `onConflict` avec index partiel. Solution : SELECT des `external_id` existants puis INSERT classique. Voir `insertSignals()` dans `engine.ts`.

### 3. Turbopack cache RSC (hot-reload qui ne prend pas)
Symptôme : modifications source ignorées, même chunk ID après rechargement.
Fix :
```bash
rm -rf .next/dev/server/chunks
rm -rf .next/cache
# puis Ctrl+C + npm run dev
```

### 4. Gemini retourne du markdown autour du JSON
`parseJsonResponse()` dans les routes retire les balises ` ```json ``` ` avant `JSON.parse()`.

### 5. Gemini peut tronquer le JSON (rapport complet)
Si la réponse d'une section est trop longue, le JSON est tronqué → `SyntaxError: Unterminated string`.
Mitigation en place : `generationConfig: { maxOutputTokens: 8192 }` dans `full/route.ts`.
Le catch utilise `SECTION_TITLES[i]` comme titre de fallback (ex: "Analyse Concurrentielle" au lieu de "Section 4").

### 6. `ReportContent` — contenu null/non-string/tableau
- Supabase JSONB peut retourner `null` → guard dans `ReportContent.tsx`
- Gemini section 5 peut retourner `content` comme tableau d'objets → guard dans `full/route.ts` sérialise en markdown avant stockage
- `ReportContent.tsx` est réécrit en mode "blocs" : rend les tableaux markdown (`| col |`) en vrai `<table>`, supporte `#### ` et `> ` blockquote

### 11. Quota Gemini free tier (20 req/jour)
`gemini-2.5-flash` est limité à **20 requêtes/jour** sur le free tier. Avec 100+ signaux par run, le quota est atteint rapidement.
Comportement actuel : `analyzer.ts` détecte le 429 via `isQuotaError()`, fait un `break` propre, les signaux restent en `pending`.
Les routes `/api/scraping/run` et `/api/scraping/analyze` retournent `quotaWarning` dans la réponse JSON.
**Solution long terme :** passer sur un compte Gemini payant (pas de limite journalière sur les tiers payants).

### 12. Malt Apify timeout
Le scraper Malt (actor `shoya/malt-profile-scraper`) est lent sur les proxies résidentiels FR.
Timeout local augmenté à 150s (`maxWaitMs: 150_000` dans `malt.ts`). Si ça timeout encore, augmenter à 200s ou réduire `maxPages: 1 → 1` et `maxResults`.

### 7. Apostrophes dans les strings JS (JSX)
Les strings JS entre guillemets simples avec apostrophes internes (`'je t'aide'`) cassent le parser Turbopack.
Toujours encapsuler avec des guillemets doubles quand la valeur contient une apostrophe.

### 8. `source_type` enum Supabase
L'enum ne contient que `community | job | review`. Les sources freelance (Malt, Upwork) sont mappées sur `'job'` à l'insertion pour éviter un crash silencieux.

### 9. Next.js 16 — `await params` dans les routes dynamiques
Les `params` dans les Server Components App Router sont une `Promise` :
```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### 10. Architecture single-user
Pas d'auth Supabase. L'UUID utilisateur est généré à la 1ère visite, stocké en `localStorage` (`mi_user_id`), et utilisé pour récupérer le profil via GET `/api/user/profile?userId=`.
`fetchUserProfile()` (dans `src/lib/userProfile.ts`) prend le premier profil avec `onboarding_completed = true` — utilisé côté serveur dans les routes API (pas de localStorage accessible).

---

## 📋 Ce qui reste à faire

### Premier run complet avec la nouvelle stratégie
- Optionnel mais recommandé : reset BDD avant le run (signaux anciens = bulle tech, scores corrompus)
  ```sql
  TRUNCATE TABLE opportunity_signals CASCADE;
  TRUNCATE TABLE raw_signals CASCADE;
  TRUNCATE TABLE opportunities CASCADE;
  TRUNCATE TABLE collections_history CASCADE;
  ```
- Lancer `POST /api/scraping/run` sans body pour un run global
- Vérifier diversité sectorielle dans les opportunités (comptabilité, RH, logistique, immobilier…)
- Réactiver Capterra (`enabled: true` dans registry.ts) au prochain run planifié

### Scoring personnalisé — Affichage dans le Dashboard
- `computePersonalizedScore()` existe dans `scoring.ts` mais n'est pas encore appelé dans le Dashboard
- À connecter : trier le tableau Top Opportunités par `personalized_score` si un profil est chargé

### UI opportunités — Filtres et recherche
- Page `/opportunities` sans liste ni filtres (uniquement accessible via lien direct `[id]`)
- À créer : liste paginée avec filtres par type, marché, complexité, score

### Rapport source (`/reports/source/[id]`)
- Page fonctionnelle mais limitée en contexte IA
- Optionnel : bouton "Analyser ce batch" qui lance un rapport catégorie ciblé sur ce batch_id
