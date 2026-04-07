# Système de Rapports IA & Onboarding Utilisateur
## Document de directives pour Claude Code

---

## Contexte général

L'application collecte des signaux depuis 3 catégories de sources :
- **Emplois & Missions Freelance** — Upwork, Malt, France Travail, LinkedIn, Indeed
- **Communautés & Insights** — Dev.to, Reddit, Hacker News, G2
- **Écosystème Startups** — Wellfound

Ces signaux sont analysés par Gemini pour produire des opportunités scorées. L'objectif de cette nouvelle fonctionnalité est double :
1. Générer des **rapports IA poussés** à partir de ces données
2. **Personnaliser** ces rapports et le classement des opportunités selon le profil de chaque utilisateur

L'application a vocation à être partagée. Chaque utilisateur aura donc son propre profil stocké en base.

---

## PARTIE 1 — Onboarding Utilisateur

### Objectif

Construire un onboarding complet qui permet de collecter un profil utilisateur riche, stocké en base de données, et utilisé pour personnaliser à la fois le classement des opportunités par Gemini et la rédaction des rapports.

L'onboarding doit être une **expérience soignée**, pas un formulaire administratif. Il doit donner envie d'être complété. Pense à une progression claire, des questions courtes et des interactions visuelles (sliders, tags cliquables, choix multiples) plutôt que des champs texte à remplir.

### Profil utilisateur — ce qu'il faut couvrir

Voici les grandes dimensions à couvrir, dans un ordre logique pour l'expérience utilisateur. Claude Code est libre de regrouper ou de séquencer ces blocs comme il le juge pertinent.

---

#### Bloc 1 — Identité entrepreneuriale

L'objectif est de comprendre où en est l'utilisateur dans sa démarche, ce qu'il cherche vraiment, et son rapport au risque et à l'ambition.

Questions à couvrir (format libre pour Claude Code) :
- Stade actuel : exploration d'idée / validation / construction / déjà lancé
- Motivation principale : liberté financière, impact, passion technique, reconversion, etc.
- Horizon de temps : veut-il quelque chose de rentable rapidement ou est-il prêt à investir sur le long terme ?
- Expérience entrepreneuriale antérieure : première fois ou a déjà tenté quelque chose

---

#### Bloc 2 — Profil de compétences

Permet à Gemini de prioriser des opportunités réalistes à construire seul ou en petite équipe.

Questions à couvrir :
- Niveau technique : non-technique / low-code / développeur junior / développeur confirmé
- Compétences secondaires pertinentes : marketing, design, vente, finance, gestion de projet, etc.
- Langues parlées (important pour le marché francophone)
- Disponibilité approximative : quelques heures par semaine / mi-temps / plein temps

---

#### Bloc 3 — Contexte et contraintes

Ce bloc est crucial pour filtrer les opportunités non pertinentes.

Questions à couvrir :
- Budget disponible pour lancer : bootstrapped serré / quelques milliers / plus confortable
- Modèle business préféré : B2B / B2C / B2B2C / marketplace / indifférent
- Complexité de vente acceptable : self-serve uniquement / vente directe simple / vente enterprise non
- Secteurs à éviter absolument (santé, légal, finance, RH sensible, etc.)
- Secteurs préférés ou affinités particulières

---

#### Bloc 4 — Vision produit

Comprendre le type de produit que l'utilisateur envisage ou préfère.

Questions à couvrir :
- Type de solution préférée : outil de productivité / automatisation / plateforme / API / widget
- Préférence sur la cible : TPE/PME / grandes entreprises / indépendants / consommateurs
- Complexité produit acceptable : MVP simple / produit élaboré / indifférent
- Intérêt pour des niches verticales spécifiques vs solutions horizontales

---

#### Bloc 5 — Marché et géographie

Questions à couvrir :
- Marché prioritaire : France / francophone (FR+CA+BE) / Europe / international
- Connaissance sectorielle existante : y a-t-il un secteur qu'il connaît mieux que les autres (ex-emploi, réseau, vécu) ?
- Connaissance des outils SaaS actuels dans ce secteur

---

#### Bloc 6 — Préférences de rapport (important pour la personnalisation)

Ce bloc permet de calibrer le ton et le format des rapports générés.

Questions à couvrir :
- Niveau de détail souhaité : résumé exécutif / analyse complète / les deux
- Ton préféré : analytique et chiffré / narratif et stratégique / pragmatique et actionnable
- Fréquence envisagée d'utilisation des rapports

---

### Recommandations UX pour l'onboarding

- **Progression visuelle** : barre ou étapes numérotées pour que l'utilisateur sache où il en est
- **Formats variés** : sliders pour les niveaux (compétence, budget, disponibilité), tags cliquables pour les choix multiples (secteurs, compétences), questions binaires en toggle, et quelques champs texte libres pour les réponses nuancées
- **Possibilité de passer** : aucune question ne doit être bloquante. Les champs non remplis sont simplement ignorés dans la personnalisation
- **Édition ultérieure** : le profil doit être accessible et modifiable depuis les paramètres, pas seulement à l'inscription
- **Complétion partielle** : si l'utilisateur quitte, ses réponses partielles sont sauvegardées
- **Résumé final** : à la fin de l'onboarding, afficher un résumé du profil généré en langage naturel (ex : "Vous êtes un développeur généraliste francophone, bootstrapped, qui cherche une opportunité B2B simple à vendre en moins de 6 mois, dans les secteurs hors santé et finance."). Ce résumé est modifiable.

---

### Schéma de données — Profil utilisateur

Claude Code connaît mieux l'infrastructure existante. Il doit créer ou adapter la table utilisateur pour stocker ces informations. Le profil doit être stocké de façon à être facilement injecté dans les prompts Gemini sous forme de contexte structuré.

Le résumé en langage naturel généré à la fin de l'onboarding est particulièrement utile : il peut être passé directement dans les prompts IA comme contexte utilisateur, sans avoir à reformater tous les champs à chaque fois.

---

## PARTIE 2 — Système de Rapports IA

### Principes généraux

Chaque rapport est généré par Gemini à partir des données déjà présentes en base (opportunités scorées, signaux bruts, métadonnées). Le rapport est contextualisé par le profil utilisateur.

Un rapport doit lire comme une **analyse rédigée par un expert de marché**, pas comme une liste de données exportées. L'objectif pour l'utilisateur est de **comprendre et de décider**, pas juste de consulter.

Les rapports sont sauvegardés en base pour être relus, comparés dans le temps, et potentiellement exportés.

---

### Les 3 types de rapports

---

#### Type 1 — Rapport par catégorie de sources

**Ce que c'est :** une analyse approfondie d'une seule catégorie de sources (ex : uniquement les données issues des offres d'emploi, ou uniquement les communautés).

**Ce que l'utilisateur doit en tirer :**
- Quels signaux ressortent le plus fortement dans cette catégorie
- Ce que cette catégorie dit spécifiquement sur les besoins du marché (les offres d'emploi parlent des tâches que les entreprises externalisent ; les communautés parlent des frustrations réelles des utilisateurs ; etc.)
- Les opportunités les mieux alignées avec son profil dans cette catégorie
- Ce qui est spécifique à cette source et qu'on ne verrait pas ailleurs

**Sections suggérées** (Claude Code est libre d'adapter) :
- Synthèse de la catégorie : vue d'ensemble en quelques paragraphes
- Signaux dominants : les thèmes, mots-clés, patterns qui reviennent le plus
- Top opportunités de la catégorie classées selon le profil utilisateur
- Angles à explorer : ce que les données suggèrent mais qui n'est pas encore une opportunité confirmée
- Limites de cette source : biais ou angles morts de la catégorie

---

#### Type 2 — Rapport croisé

**Ce que c'est :** une analyse qui croise deux ou plusieurs catégories pour identifier les convergences et divergences.

**Ce que l'utilisateur doit en tirer :**
- Les opportunités qui apparaissent dans plusieurs catégories sont les plus solides (une frustration mentionnée sur Reddit ET une offre d'emploi pour gérer cette tâche manuellement = signal fort)
- Les divergences intéressantes : ce que les communautés disent vs ce que les entreprises cherchent à recruter
- Les opportunités sous-représentées dans certaines sources (signal faible mais isolé = niche potentielle)

**Sections suggérées** :
- Matrice de convergence : quelles opportunités sont confirmées par plusieurs sources
- Analyse des tensions : là où les sources se contredisent et ce que ça signifie
- Opportunités émergentes : signaux faibles croisés qui méritent attention
- Recommandations personnalisées : top 5 des opportunités à creuser selon le profil utilisateur, avec justification

---

#### Type 3 — Rapport complet

**Ce que c'est :** l'analyse la plus exhaustive, couvrant toutes les sources, tous les secteurs, et fournissant une vision globale du marché.

**Ce que l'utilisateur doit en tirer :**
- Une cartographie complète des besoins du marché à un instant T
- Une hiérarchisation claire des opportunités selon plusieurs critères (volume, urgence, manque d'outils, faisabilité)
- Une section spécifique "Pour toi" qui filtre tout selon son profil
- Une base de référence qu'il pourra comparer aux rapports futurs pour voir l'évolution du marché

**Sections suggérées** :
- Executive summary : les 5 insights les plus importants à retenir (1 page max)
- État du marché : panorama général des besoins détectés, par secteur
- Cartographie des opportunités : tableau ou visualisation des opportunités par score global
- Analyse par département/vertical : RH, commercial, marketing, ops, finance, technique...
- Analyse de la demande emploi : ce que les offres révèlent sur les tâches encore manuelles
- Voix des utilisateurs : ce que les communautés expriment comme frustrations récurrentes
- Analyse concurrentielle globale : secteurs saturés vs secteurs ouverts
- Top opportunités personnalisées : les meilleures opportunités selon le profil de l'utilisateur, avec argumentation détaillée
- Angles de positionnement suggérés : comment se différencier sur les opportunités retenues
- Ce qu'il faudrait construire en premier : recommandation concrète et justifiée
- Évolution à surveiller : signaux faibles qui pourraient devenir forts prochainement

---

### Personnalisation des rapports par le profil utilisateur

Le profil utilisateur doit influencer les rapports de plusieurs façons. Claude Code est le mieux placé pour écrire les prompts Gemini, mais voici les axes de personnalisation attendus :

**Filtrage et priorisation :**
- Les opportunités dans les secteurs exclus par l'utilisateur ne doivent pas apparaître dans les recommandations personnalisées (elles peuvent rester dans les analyses générales)
- Les opportunités sont repondérées selon les compétences et la disponibilité de l'utilisateur (un non-technique ne verra pas les mêmes top 5 qu'un développeur confirmé)
- Le marché géographique filtre les signaux pertinents

**Ton et format :**
- Le niveau de détail technique est adapté au profil
- Si l'utilisateur préfère un ton actionnable, chaque section se termine par une recommandation concrète
- Si l'utilisateur est en phase d'exploration (comme c'est souvent le cas), les rapports insistent sur la diversité des opportunités plutôt que de converger trop vite

**Section "Pour toi" :**
- Chaque rapport doit contenir une section finale dédiée, rédigée à la première personne, qui fait le lien explicite entre les données analysées et le profil spécifique de l'utilisateur. C'est la section la plus personnalisée et probablement la plus lue.

---

### Interface utilisateur pour les rapports

Quelques directions pour l'UI (Claude Code implémente comme il le juge pertinent) :

- Utiliser les différents boutons disponibles pour générer les différents types de rapport
- Pendant la génération, un indicateur de progression (les rapports complets peuvent prendre du temps)
- Les rapports générés sont sauvegardés avec leur date, leur type, et les paramètres de collecte utilisés
- Un historique des rapports permet de les comparer dans le temps
- Option d'export (PDF ou copie markdown) pour partager ou archiver
- Sur le rapport lui-même, les sections sont navigables (table des matières) car les rapports complets seront longs

---

### Gestion de la génération

Quelques contraintes à avoir en tête :

- Les rapports complets peuvent nécessiter plusieurs appels IA successifs (un par section) pour ne pas dépasser les limites de contexte. Claude Code gère cette orchestration comme il le juge le plus robuste.
- Si les données en base sont insuffisantes (trop peu de signaux collectés), le rapport doit l'indiquer clairement plutôt que de générer une analyse creuse.
- Les rapports sont générés à la demande (pas automatiquement). L'utilisateur choisit quand générer.
- Les rapports par catégorie et croisés peuvent être téléchargés, mais sont affichés dans l'interface utilisateur.
- Les rapports complets sont des fichiers générés à partir de l'exemple @Rapport_example.pdf. Ces rapports doivent être générés à la demande et téléchargés par l'utilisateur. Ils doivent respecter le style graphique de l'exemple.

---

## Ordre de mise en œuvre suggéré

1. **Schéma BDD** — créer ou adapter la table de profil utilisateur
2. **Onboarding** — construire le flow de collecte du profil
3. **Injection du profil dans Gemini** — adapter le scoring existant pour tenir compte du profil
4. **Rapport par catégorie** — le plus simple, bon point de départ
5. **Rapport croisé** — s'appuie sur la même base
6. **Rapport complet** — le plus complexe, à faire en dernier
7. **Historique et export** — finitions

---

## Ce que Claude Code doit décider lui-même

- Les prompts Gemini exacts pour chaque type de rapport et pour la personnalisation
- La logique de repondération des scores selon le profil
- La structure exacte des tables en base
- L'architecture technique de la génération (streaming, batch, sections parallèles...)
- Le design et l'UX de l'onboarding et des rapports
- La gestion des cas limites (données insuffisantes, profil incomplet, erreurs Gemini)

---

## Plan d'implémentation — BLOC 5 (validé le 2026-04-01)

### Décisions arrêtées

- **Auth** : Single-user sans Supabase Auth. UUID généré en localStorage, profil stocké en base. Auth ajoutée plus tard sans refonte.
- **Export PDF** : Reporté à l'étape 5.7. Print-CSS Tailwind en premier, jsPDF ensuite.
- **Génération** : Section par section côté serveur via API routes Next.js. Polling client pour la progression.

### Étape 5.1 — Migration BDD

Fichier : `supabase/migrations/003_user_profiles_and_reports.sql`

**Table `user_profiles`** — stocke les 6 blocs du profil + `profile_summary` (texte Gemini) + `onboarding_completed` (bool)

Colonnes clés :
- `entrepreneurial_stage` text (`exploration` | `validation` | `building` | `launched`)
- `tech_level` text (`non_tech` | `low_code` | `junior_dev` | `senior_dev`)
- `budget_range` text (`bootstrapped` | `few_thousands` | `comfortable`)
- `priority_market` text (`fr` | `fr_qc` | `europe` | `international`)
- `excluded_sectors` text[], `preferred_sectors` text[]
- `preferred_business_models` text[], `secondary_skills` text[]
- `report_detail_level` text, `report_tone` text
- `profile_summary` text — résumé langage naturel généré par Gemini
- `onboarding_completed` boolean DEFAULT false

**Table `generated_reports`** — stocke les rapports générés
- `type` text (`category` | `cross` | `full`)
- `sections` JSONB — `[{ order, title, content (markdown) }]`
- `sources_used` text[], `collection_ids` UUID[]
- `status` text (`generating` | `completed` | `error`)

Mettre à jour `src/types/database.ts` après migration.

### Étape 5.2 — Onboarding Wizard (6 étapes)

Fichiers :
- `src/app/onboarding/page.tsx` — client component, wizard 6 étapes
- `src/app/api/user/profile/route.ts` — GET / POST / PATCH

Logique UUID : `localStorage.getItem('mi_user_id')` → si absent, créer profil vide en base + stocker UUID.
Redirect automatique si `onboarding_completed = true`.

UX wizard :
- Progress bar haut (étape X/6)
- Interactions : cartes cliquables, tags multiples, toggles, sliders (pas de formulaires texte sauf exceptions)
- Toutes les questions sont passables (aucun champ bloquant)
- Sauvegarde partielle à chaque étape (PATCH API)
- Étape 6 → bouton "Générer mon profil" → appel Gemini → affichage du résumé → "Modifier" | "Confirmer"

### Étape 5.3 — Injection du profil dans Gemini

Fichiers modifiés :
- `src/lib/ai/prompts.ts` — ajouter `buildUserContextBlock(profileSummary)` + 3 prompts de rapport
- `src/lib/ai/analyzer.ts` — accepter `profileSummary?` optionnel, l'injecter dans le system prompt

Scoring personnalisé (à la volée, non stocké) dans `src/lib/ai/scoring.ts` :
- `excluded_sectors` → pénalise les depts exclus
- `tech_level = 'non_tech'` → pénalise `complexity = 'high'`
- `budget_range = 'bootstrapped'` → pénalise `estimated_cost = '5000$+'`
- `priority_market` → filtre les `target_market` incompatibles

### Étape 5.4 — Rapport par catégorie

Fichiers :
- `src/app/api/reports/category/route.ts` — POST `{ category: 'job'|'community'|'startup', userId }`
- `src/app/reports/category/[id]/page.tsx`

Génération en 2 appels Gemini :
1. Synthèse + signaux dominants + angles à explorer
2. Top opportunités personnalisées + limites de la source

Sections : synthèse, signaux_dominants[], angles[], top_opportunités[], limites_source, pour_toi

UI `reports/page.tsx` : remplacer les checkboxes disabled par 3 boutons actifs (un par catégorie).

### Étape 5.5 — Rapport croisé

Fichiers :
- `src/app/api/reports/cross/route.ts` — POST `{ categories: string[], userId }`
- `src/app/reports/cross/[id]/page.tsx`

Génération en 3 appels Gemini :
1. Matrice de convergence
2. Tensions + opportunités émergentes
3. Recommandations personnalisées top 5

UI : activer les checkboxes dans `reports/page.tsx`, bouton actif si ≥ 2 sélectionnées, spinner avec étapes.

### Étape 5.6 — Rapport complet

Fichiers :
- `src/app/api/reports/full/route.ts` — POST `{ userId }` (génération longue)
- `src/app/reports/full/[id]/page.tsx`

Génération en 5-6 appels Gemini séquentiels :
1. Executive summary (5 insights)
2. État du marché + cartographie sectorielle
3. Analyse demande emploi + voix utilisateurs
4. Analyse concurrentielle (saturé vs ouvert)
5. Top opportunités personnalisées + angles
6. Recommandation prioritaire + signaux faibles

Progression : polling sur `status` du rapport (`generating` → count sections).
UI : bouton "Global Intelligence Report" actif, TOC sticky, section "Pour toi" fond `#2b3652`.

### Étape 5.7 — Historique & Export

- Historique dans `reports/page.tsx` : liste des `generated_reports` du user (type, date, titre, lien)
- Export print-CSS : classes `print:` Tailwind + bouton `window.print()`
- `src/app/settings/page.tsx` : édition du profil (mêmes composants onboarding, mode édition)
- `src/components/Navigation.tsx` : ajouter lien `/settings` (icône Settings)