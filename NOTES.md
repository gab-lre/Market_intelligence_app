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
