# ARCHITECTURE.md — SaaS Market Intelligence App

Généré lors de la Phase 0 (audit) — 2026-03-29

---

## 1. Arborescence du projet

```
.
├── ARCHITECTURE.md          ← ce fichier
├── AGENT_HANDOVER.md        ← contexte de passation entre agents
├── CLAUDE.md                ← instructions pour l'agent Claude
├── NOTES.md                 ← avancement par étape (à jour)
├── SCRAPPING_GUIDE.md       ← plan de développement du pipeline (référence)
├── .env.local               ← variables d'environnement (non versionné)
├── next.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.mjs
├── eslint.config.mjs
│
├── supabase/
│   └── schema.sql           ← schéma SQL actuel (BLOC 1)
│
├── public/                  ← assets statiques Next.js
│
└── src/
    ├── app/                 ← App Router Next.js
    │   ├── layout.tsx       ← Layout global (Navigation + TopHeader)
    │   ├── page.tsx         ← Dashboard principal (KPIs + graphiques statiques)
    │   ├── globals.css      ← Tailwind CSS v4 + variables custom
    │   ├── sources/
    │   │   └── page.tsx     ← Page de gestion des collecteurs (UI statique)
    │   ├── opportunities/
    │   │   └── [id]/
    │   │       └── page.tsx ← Vue détaillée d'une opportunité (statique)
    │   └── api/
    │       └── test-supabase/
    │           └── route.ts ← Endpoint de test de connexion Supabase (CRUD)
    │
    ├── components/
    │   ├── Navigation.tsx   ← Double sidebar (icônes + sidebar foncée avec métriques)
    │   ├── TopHeader.tsx    ← Barre du haut (recherche, notif, user menu)
    │   └── Sidebar.tsx      ← Sidebar alternative (thème vert, non utilisée)
    │
    └── lib/
        └── supabase.ts      ← Client Supabase (anon key, côté client et serveur)
```

**Fichiers liés au scraping :** Aucun — tout est à créer.
**Fichiers liés à l'IA / Gemini :** Aucun — tout est à créer.
**Fichiers liés à Supabase :** `src/lib/supabase.ts`, `supabase/schema.sql`

---

## 2. Composants clés

### `src/lib/supabase.ts`
Client Supabase unique exporté depuis `@supabase/supabase-js`. Utilise les variables publiques `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Partagé entre pages et routes API.

### `src/app/sources/page.tsx`
Interface statique affichant 5 cartes de sources (Hacker News, Reddit, France Travail, LinkedIn Apify, Indeed Apify). Chaque carte a un bouton "Démarrer" qui n'est pas encore câblé. Le bas de la page affiche un historique vide.

### `src/app/api/test-supabase/route.ts`
Route GET qui insère, relit et supprime un enregistrement de test dans `collections_history`. Confirme que RLS est désactivé et que l'API fonctionne.

---

## 3. Schéma de base de données actuel (BLOC 1)

### Table `raw_signals`
| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | `uuid` | PK, `uuid_generate_v4()` |
| `source` | `text` | NOT NULL |
| `original_id` | `text` | — |
| `content` | `text` | NOT NULL |
| `url` | `text` | — |
| `author` | `text` | — |
| `publish_date` | `timestamptz` | — |
| `is_processed` | `boolean` | défaut `false` |
| `is_noise` | `boolean` | défaut `false` |
| `opportunity_id` | `uuid` | FK → `opportunities.id` ON DELETE SET NULL |
| `created_at` | `timestamptz` | défaut `now()` |

Index :
- UNIQUE sur `(source, original_id)`
- Sur `is_processed WHERE is_processed = FALSE`

### Table `opportunities`
| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | `uuid` | PK |
| `title` | `text` | NOT NULL |
| `score` | `integer` | défaut `0` |
| `department` | `text` | — |
| `mentions_count` | `integer` | défaut `1` |
| `market` | `text[]` | défaut `{}` |
| `urgency_avg` | `numeric` | défaut `0` |
| `pain_points` | `jsonb` | défaut `[]` |
| `existing_tools` | `jsonb` | défaut `[]` |
| `unaddressed_needs` | `jsonb` | défaut `[]` |
| `full_report` | `text` | — |
| `created_at` / `updated_at` | `timestamptz` | — |

Index : Sur `score DESC`

### Table `collections_history`
| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | `uuid` | PK |
| `source` | `text` | NOT NULL |
| `status` | `text` | NOT NULL (`'en cours'`, `'succès'`, `'erreur'`) |
| `items_collected` | `integer` | défaut `0` |
| `duration_seconds` | `integer` | défaut `0` |
| `error_message` | `text` | — |
| `created_at` | `timestamptz` | défaut `now()` |

**RLS :** Désactivé sur toutes les tables.

---

## 4. Écarts entre le schéma actuel et le schéma cible (SCRAPPING_GUIDE Phase 1)

### `raw_signals` — À modifier
| Colonne actuelle | Colonne cible | Action |
|-----------------|---------------|--------|
| `original_id` | `external_id` | Renommer |
| — | `source_type` (`text` NOT NULL) | Ajouter |
| — | `title` (`text`) | Ajouter |
| `content` | `content` | ✅ OK |
| `publish_date` | `published_at` | Renommer |
| `is_processed` + `is_noise` | `status` (`pending/analyzed/discarded/error`) | Refondre |
| — | `metadata` (`jsonb`) | Ajouter |
| — | `batch_id` (`uuid`) | Ajouter |
| `created_at` | `collected_at` | Renommer |
| `opportunity_id` (FK directe) | Supprimé (remplacé par table de liaison) | Supprimer |

### `opportunities` — À modifier
| Colonne actuelle | Colonne cible | Action |
|-----------------|---------------|--------|
| `score` (1 colonne) | `score_volume`, `score_urgency`, `score_tool_gap`, `score_saturation`, `score_global` | Refondre |
| `mentions_count` | `signal_count` | Renommer |
| `market` | `company_size` | Renommer + changer sémantique |
| `urgency_avg`, `pain_points`, etc. | `description`, `problem`, `repetitive_tasks`, etc. | Refondre entièrement |
| — | `source_types` (`text[]`) | Ajouter |
| — | `status` (`active/archived/dismissed`) | Ajouter |

### `collections_history` — À modifier
| Colonne actuelle | Colonne cible | Action |
|-----------------|---------------|--------|
| `source` (une par ligne) | `sources_config` (`jsonb`) | Refondre (une ligne par batch) |
| `status` (valeurs FR) | `status` (`running/completed/partial/failed`) | Normaliser |
| `items_collected` | `signals_collected` + `signals_analyzed` | Séparer |
| `duration_seconds` | `started_at` + `finished_at` | Remplacer |
| — | `opportunities_created`, `opportunities_updated` | Ajouter |
| — | `results_summary` (`jsonb`) | Ajouter |

### Nouvelle table `opportunity_signals` — À créer
Table de liaison N-N entre `opportunities` et `raw_signals`.
Colonnes : `opportunity_id` (FK), `signal_id` (FK), `relevance_note` (text).
PK composite sur `(opportunity_id, signal_id)`.

---

## 5. Variables d'environnement (`.env.local`)

| Variable | Statut | Notes |
|----------|--------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurée | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurée | Format `sb_publishable_...` |
| `GEMINI_API_KEY` | ✅ Configurée | — |
| `APIFY_API_TOKEN` | ✅ Configurée | — |
| `REDDIT_CLIENT_ID` | ❌ **Manquante** | Clé absente du fichier |
| `REDDIT_CLIENT_SECRET` | ❌ Vide | Valeur vide |
| `FRANCE_TRAVAIL_CLIENT_ID` | ❌ Vide | Valeur vide |
| `FRANCE_TRAVAIL_CLIENT_SECRET` | ❌ Vide | Valeur vide |

**Impact :** Les collecteurs Reddit et France Travail devront vérifier la présence de ces variables et se désactiver proprement si elles sont absentes.

---

## 6. Dépendances

### Installées
| Package | Version | Usage |
|---------|---------|-------|
| `next` | 16.2.1 | Framework |
| `react` / `react-dom` | 19.2.4 | UI |
| `@supabase/supabase-js` | ^2.100.1 | BDD |
| `lucide-react` | ^1.7.0 | Icônes |
| `tailwindcss` | ^4 | Styles |
| `typescript` | ^5 | Typage |

### Manquantes — À installer
| Package | Usage prévu |
|---------|-------------|
| `@google/generative-ai` | Client Gemini 2.5 Flash pour le pipeline d'analyse IA |

---

## 7. Règles UI (à respecter dans tous les nouveaux composants)

- **Light mode uniquement**
- Couleur primaire : `#2b3652`
- Couleur d'accentuation : `#00b4d8`
- Pas de `rounded` (formes rectangulaires, `rounded-none` ou `rounded-sm` max)
- Labels en majuscules avec `uppercase tracking-widest text-[10px]`
- Icônes via `lucide-react`
