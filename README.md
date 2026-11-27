# Market Intelligence

Market Intelligence repère des opportunités de produits B2B (SaaS, agents IA, micro-produits) à partir de signaux publics : offres d'emploi et discussions en ligne. L'application les classe par département et par marché (France, Québec), leur donne un score sur 100 et produit des rapports d'analyse.

Ce dépôt ne contient que le **frontend**. Toutes les données affichées sont **factices** : elles viennent d'une couche d'accès aux données prête à être branchée sur un vrai backend.

## Pages

| Page | Route | Contenu |
|---|---|---|
| Dashboard | `/` | KPI, graphiques, liste et aperçu des opportunités, actions rapides |
| Opportunités | `/opportunities`, `/opportunities/[id]` | Tableau filtrable et fiche détaillée |
| Rapports | `/reports` et ses vues | Rapports par catégorie, croisés, complets et par collecte |
| Sources | `/sources` | Sources de données et historique des collectes |
| Mon profil | `/settings` | Préférences qui personnalisent les analyses |

## Lancer le projet

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev
```

L'application est alors disponible sur http://localhost:3000.

Autres commandes :

```bash
npm run build   # build de production
npm run lint    # vérification du code
```

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Recharts et lucide-react.

## Organisation du code

```
src/
├── app/            pages (une route = un dossier)
├── components/     composants d'interface
└── lib/
    ├── data/       accès aux données : types, données factices, fonctions de lecture
    └── actions.ts  actions des boutons (collecte, rapports, profil), factices pour l'instant
```

Les pages et les composants lisent leurs données **uniquement** via `src/lib/data` et `src/lib/actions.ts`. Pour brancher un vrai backend, il suffit de réécrire ces deux points d'entrée en gardant les mêmes signatures.

## Crédits

Le code a été écrit avec l'aide d'agents IA ; j'en ai conçu la logique.
