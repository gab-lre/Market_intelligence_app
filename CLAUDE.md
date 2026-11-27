# CLAUDE.md

Frontend seul de Market Intelligence, une app qui repère des opportunités B2B. Pas de backend : les données sont factices. Lis `NOTES.md` pour l'état du projet et ce qui reste à brancher.

## Stack

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS 4, Recharts, lucide-react.
Commandes : `npm run dev`, `npm run build`, `npm run lint`. Les deux dernières doivent passer sans erreur ni avertissement.

## Règle d'architecture

**Les pages et les composants ne lisent les données que via `src/lib/data` et ne déclenchent d'actions que via `src/lib/actions.ts`.**

- `src/lib/data/types.ts` : types de ce que l'UI affiche.
- `src/lib/data/mock.ts` et `mock-reports.ts` : données factices, organisées comme les futures tables.
- `src/lib/data/index.ts` : fonctions async de lecture (`getDashboardData`, `getOpportunities`, `getReport`…). C'est le seul fichier à réécrire pour brancher Supabase.
- `src/lib/actions.ts` : actions factices (≈ 800 ms d'attente, faux résultat, aucun appel réseau).

Interdits dans `src/app` et `src/components` : `fetch`, client Supabase, import direct de `mock.ts`, calculs de KPI (ils se font dans `src/lib/data`).

## Conventions

- Le rendu visuel est la référence : ne pas modifier le texte affiché ni les classes Tailwind sans accord explicite.
- Code et commentaires en français ; noms de variables et de fonctions en anglais.
- Pas de nouvelle dépendance sans accord.
- Les libellés et couleurs d'affichage partagés (départements, marchés, scores) sont dans `src/components/opportunities/display.ts`.
- Fichiers courts : au-delà de ~300 lignes, découper en sous-composants.
- Ne jamais lire, afficher ni commiter `.env*`.
- Commits en français, un par étape. Ne jamais pousser ni merger.
