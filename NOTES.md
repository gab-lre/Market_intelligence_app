# Notes du projet

## Ce qui a été fait (novembre 2026)

L'ancienne app mélangeait le frontend et un backend désordonné (Supabase, OpenAI, Gemini, Apify, scrapers, routes API). Seul le frontend a été gardé, avec un rendu visuel identique, en 4 phases (un commit par phase) :

1. **Couche de données** : `src/lib/data` (types, données factices, fonctions de lecture) et `src/lib/actions.ts` (actions factices). Toutes les pages ont été rebranchées dessus.
2. **Suppression du backend** : routes API, clients Supabase et IA, scrapers, onboarding, page Documents, composants inutilisés, anciens fichiers d'agents, dépendances `@supabase/supabase-js`, `openai` et `@google/generative-ai`.
3. **Données factices** : 12 opportunités, 3 rapports (complet, catégorie, croisé) et un profil. Les sources, les collectes et les signaux sont volontairement vides. Tous les KPI sont calculés à partir des données, y compris les tendances sur 7 jours.
4. **Nettoyage** : code mort supprimé, gros fichiers découpés (profil, liste du dashboard, fenêtres), libellés d'affichage partagés dans `src/components/opportunities/display.ts`.

À chaque phase, des captures Playwright (1440×900) ont été comparées pixel par pixel. Le dossier `screenshots/` est ignoré par git et Playwright est installé en devDependency pour ça.

## Décisions

- **Rendu à chaque requête** : `export const dynamic = "force-dynamic"` dans `src/app/layout.tsx`. Sans ça, le build figeait le dashboard et ses chiffres ne suivaient pas les données.
- **« Mes Documents »** pointe vers `/reports`, puisque la page Documents est supprimée.
- **Les fenêtres « Lancer une collecte » et « Générer un rapport »** sont gardées telles quelles (cartes, choix, textes). Leurs boutons appellent les actions factices.
- **Le nom et le rôle du header** viennent du profil (`display_name`, `role`).
- **Les badges d'évolution du dashboard** comparent avec l'état d'il y a 7 jours. Ils sont masqués quand il n'y a rien à comparer.

## Ce qui reste à brancher

### Backend

- [ ] Réécrire `src/lib/data/index.ts` sur Supabase en gardant les signatures, puis supprimer `mock.ts` et `mock-reports.ts`.
- [ ] Réécrire `src/lib/actions.ts` : collecte, analyse IA, génération de rapports, sauvegarde du profil, résumé IA.
- [ ] Ajouter les sources (Hacker News, Reddit, France Travail, Indeed via Apify), les collectes et les signaux. La page Sources et les KPI « Sources actives » et « Données brutes » les attendent.
- [ ] `signal_count` est un champ de l'opportunité et n'est pas recalculé à partir des signaux : décider lequel fait foi.
- [ ] Les identifiants de rapport renvoyés par `generateReport` doivent exister, sinon la page affiche une 404.

### Textes écrits en dur, à mettre à jour avec le backend

- [ ] Les fenêtres « Lancer une collecte » et « Générer un rapport » (`src/components/modals/*Options.tsx`) et la page Rapports citent LinkedIn, Upwork, G2, Wellfound… et Gemini.
- [ ] Le rapport par catégorie affiche « Moteur : Gemini 2.5 Flash ».
- [ ] La page Mon Profil affiche « Complétez d'abord l'onboarding » quand il n'y a pas de profil, alors que l'onboarding n'existe plus.

### Interface non fonctionnelle (visible mais sans effet)

- [ ] Header : recherche, boutons précédent / suivant, sélecteur Today / Week / Month, cloche. L'avatar vient de dicebear.com (image externe).
- [ ] « Aide » mène à `/help` (404) et « Déconnexion » n'a pas d'action.
- [ ] Le bouton « Générer le Rapport IA » de la fiche opportunité n'a pas d'action.

### Points techniques

- [ ] Les classes `plugin-noscrollbar` et `animate-in` / `fade-in` / `slide-in-*` ne sont définies nulle part (`globals.css` ne fait qu'importer Tailwind) : elles n'ont aucun effet. On les a gardées pour ne pas toucher au rendu.
- [ ] Au build, Recharts affiche un avertissement sur la taille des graphiques (« width(-1) and height(-1) ») : il est sans effet à l'écran.
