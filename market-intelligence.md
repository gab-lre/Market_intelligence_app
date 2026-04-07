# Prompt Agent — SaaS Market Intelligence App

---

## Contexte et objectif général

Je suis entrepreneur et je cherche à identifier les meilleures opportunités pour créer un SaaS qui répond à de vrais besoins du marché francophone (France et Québec). Pour cela, j'ai besoin d'une application web qui tourne en local sur mon ordinateur, capable de collecter automatiquement des données depuis plusieurs sources publiques gratuites, d'analyser ces données grâce à l'intelligence artificielle, et de me présenter un classement clair des opportunités les plus prometteuses sous forme de dashboard visuel.

L'idée centrale est la suivante : quand beaucoup d'entreprises recrutent un humain pour faire une tâche précise (gérer un CRM, trouver des leads, produire des rapports, automatiser des processus marketing...), c'est le signe qu'un logiciel SaaS pourrait faire ce travail à leur place. En analysant massivement les offres d'emploi, les forums, et les avis sur les logiciels existants, je veux faire émerger automatiquement ces opportunités, les scorer, et les explorer en détail.

---

## Nom de l'application

**SaaS Market Intelligence**

---

## Stack technique souhaité

Tu es libre de faire les meilleurs choix techniques, mais voici mes préférences et contraintes :

- L'application doit tourner entièrement en local sur mon ordinateur
- J'utilise **Supabase** comme base de données (service cloud gratuit, PostgreSQL)
- Pour l'intelligence artificielle (analyse des données et génération de rapports), j'utilise l'**API Google Gemini**, avec le modèle **Gemini 2.5 Flash** qui est disponible gratuitement
- Pour le scraping de certaines sources (LinkedIn, Indeed), j'utilise **Apify**, qui me donne 5 dollars de crédits gratuits par mois
- Les autres sources de données sont toutes gratuites et accessibles sans abonnement
- Pour le frontend, tu choisis le framework le plus adapté (Next.js est une bonne option)
- Le style visuel doit être propre, moderne, avec un thème sombre de préférence

---

## Sources de données à collecter

L'application doit collecter des données depuis les sources suivantes. Pour chaque source, je précise comment y accéder gratuitement.

**Hacker News** est un forum technologique anglophone très actif. Il dispose d'une API publique totalement gratuite, sans inscription ni clé requise. Je veux récupérer les publications de type "Ask HN" où les gens expriment des besoins non satisfaits, cherchent des outils, ou parlent de problèmes qu'ils règlent manuellement.

**Reddit** est une plateforme de forums communautaires. Il propose une API gratuite accessible après création d'une application (sans abonnement). Je veux scanner plusieurs communautés pertinentes comme les subreddits dédiés à l'entrepreneuriat, aux SaaS, aux startups, au développement web, aux petites entreprises et au freelance. Je cherche des posts où les gens mentionnent qu'ils font quelque chose manuellement, qu'ils cherchent un outil, ou qu'ils expriment une frustration avec les solutions existantes.

**France Travail** (anciennement Pôle Emploi) dispose d'une API officielle et gratuite, accessible après inscription sur leur portail partenaire. Elle donne accès à des centaines de milliers d'offres d'emploi françaises. Je veux cibler les offres qui mentionnent des missions liées à la croissance, à l'automatisation, à la gestion de la relation client, au SEO, au reporting, à la prospection commerciale, et à toutes les tâches qui pourraient être partiellement ou totalement remplacées par un logiciel.

**Apify** est une plateforme de scraping qui propose des acteurs préconstruits (des scrapers prêts à l'emploi) pour LinkedIn et Indeed. Avec mes 5 dollars de crédits mensuels gratuits, je veux récupérer des offres d'emploi sur ces deux plateformes avec les mêmes critères de recherche que pour France Travail. Ces collectes Apify doivent être déclenchées manuellement depuis l'interface, pas automatiquement, pour préserver mes crédits.

---

## Ce que je veux analyser dans chaque donnée collectée

Pour chaque signal collecté (qu'il vienne d'une offre d'emploi, d'un post Reddit, ou d'un fil Hacker News), l'IA doit extraire les informations suivantes :

- Quel est le besoin ou le problème central exprimé ?
- Quelles sont les tâches répétitives ou manuelles mentionnées ?
- Quels logiciels ou outils sont déjà utilisés dans ce contexte ?
- Y a-t-il des besoins clairement exprimés sans qu'un outil soit nommé ? Ces "trous" sont les opportunités les plus intéressantes.
- Dans quel département de l'entreprise ce besoin se situe-t-il (commercial, marketing, opérations, finance, RH, technique, support client) ?
- Quelle est la taille des entreprises concernées (startups, PME, grandes entreprises) ?
- Le besoin est-il suffisamment urgent et douloureux pour justifier un logiciel payant ?
- Est-ce que ce signal révèle une vraie opportunité de SaaS, ou est-ce du bruit sans intérêt ?

Si un signal ne révèle aucune opportunité claire, il doit être écarté proprement sans polluer la base de données utile.

---

## Logique de scoring des opportunités

Chaque opportunité identifiée doit recevoir un score global entre 0 et 100, calculé à partir de plusieurs critères pondérés :

Le **volume de mentions** compte pour environ 30% du score. Plus un besoin est évoqué fréquemment dans les données collectées, plus il est probable qu'il représente un marché réel.

L'**urgence du besoin** compte pour environ 35% du score. Si les entreprises paient déjà un humain à temps plein pour faire cette tâche, le besoin est maximal. Si c'est juste une envie vague, le score est bas.

Le **manque d'outils existants** compte pour environ 25% du score. Si les gens expriment un besoin sans nommer aucun outil pour le résoudre, c'est un signal fort de marché non adressé. C'est une opportunité en or.

La **saturation du marché** joue négativement sur environ 10% du score. Si tout le monde mentionne déjà HubSpot, Salesforce ou un autre acteur dominant, le marché est peut-être trop encombré pour un nouvel entrant.

Quand un même besoin est détecté plusieurs fois à partir de sources différentes, les occurrences doivent être fusionnées intelligemment en une seule opportunité dont le score augmente au fil des confirmations.

---

## Fonctionnalités du dashboard principal

La page d'accueil de l'application doit être un tableau de bord synthétique avec les éléments suivants :

En haut de la page, quatre indicateurs clés doivent s'afficher : le nombre total d'opportunités identifiées, le score moyen des opportunités, le nombre total de signaux bruts collectés toutes sources confondues, et la date de la dernière mise à jour.

En dessous, deux visualisations graphiques doivent être présentes. La première montre l'évolution du nombre d'opportunités et des scores dans le temps, permettant de voir si certains thèmes émergent ou progressent. La seconde est un graphique circulaire montrant la répartition des opportunités par département (commercial, marketing, opérations, etc.).

La partie principale de la page est un tableau listant toutes les opportunités, triées par score décroissant par défaut. Chaque ligne doit afficher le titre de l'opportunité, son score, le département concerné, le nombre de mentions, le marché ciblé (France, Québec ou les deux), et un résumé des principaux outils manquants. Un clic sur une ligne ouvre la vue détaillée.

Le tableau doit être filtrable par département, par marché géographique, et par score minimum.

En haut de la page, un bouton doit permettre de lancer manuellement l'analyse des signaux bruts qui n'ont pas encore été traités par l'IA.

---

## Fonctionnalités de la page de gestion des sources

Une page dédiée doit permettre de gérer et de suivre les collectes de données. Elle présente une carte pour chaque source de données (Hacker News, Reddit, France Travail, Apify LinkedIn, Apify Indeed).

Chaque carte affiche le nom de la source, une brève description de ce qu'elle apporte, la date et le statut du dernier run (succès, erreur, en cours), le nombre d'éléments collectés lors du dernier run, et un bouton pour lancer une nouvelle collecte manuellement.

Un historique des runs doit être visible en bas de la page, sous forme de tableau, avec la source, le statut, le nombre d'éléments collectés, la durée du run et la date. Les statuts doivent être clairement différenciés visuellement (vert pour succès, rouge pour erreur, orange animé pour en cours).

---

## Fonctionnalités de la vue détaillée d'une opportunité

Quand l'utilisateur clique sur une opportunité, il accède à une page complète qui lui donne toutes les informations disponibles sur cette opportunité.

En en-tête, le titre, le score (avec une couleur selon sa valeur : vert au-dessus de 70, orange entre 40 et 70, rouge en dessous), le département et le marché géographique sont affichés avec des étiquettes claires.

En dessous, des métriques clés : combien de fois ce besoin a été détecté au total, quel est le niveau d'urgence moyen, combien d'outils sont mentionnés vs combien de besoins restent sans solution identifiée.

Ensuite, la liste détaillée des points de douleur identifiés, des outils déjà utilisés dans ce contexte, et des besoins sans solution (les opportunités de marché concrètes).

Un bouton "Générer le rapport complet" doit permettre de demander à l'IA de produire une analyse approfondie de l'opportunité. Ce rapport doit couvrir : un résumé exécutif, une analyse du problème, une estimation de la taille du marché, une analyse de la concurrence existante et de ses lacunes, une proposition de valeur recommandée, le profil du client idéal à cibler en premier, une suggestion de modèle de monétisation, et trois actions concrètes à faire pour valider l'opportunité avant de se lancer. Ce rapport s'affiche directement dans la page, formaté de manière lisible.

Enfin, la liste des sources (liens vers les offres d'emploi ou posts originaux) ayant contribué à identifier cette opportunité.

---

## Comportement de l'application — tout manuel

Toutes les actions de l'application doivent être déclenchées manuellement par l'utilisateur, depuis l'interface. Il n'y a aucune automatisation ni aucun scheduler en arrière-plan. C'est moi qui décide quand collecter, quand analyser, et quand générer un rapport.

Concrètement, cela signifie que depuis la page de gestion des sources, je clique sur le bouton de la source que je veux interroger, j'attends que la collecte se termine, puis je reviens sur le dashboard pour lancer manuellement l'analyse des nouveaux signaux via le bouton prévu à cet effet. La génération de rapport pour une opportunité spécifique est également déclenchée manuellement depuis la vue détaillée.

Cette approche manuelle s'applique à toutes les sources sans exception, y compris Hacker News, Reddit et France Travail. Apify reste bien entendu manuel également, pour préserver les crédits gratuits.

---

## Contraintes et principes importants

L'application doit être robuste : si une source de données est temporairement indisponible ou retourne une erreur, cela ne doit pas bloquer les autres collectes. Chaque erreur doit être journalisée proprement.

Pour l'analyse IA, les signaux doivent être traités par batches de 20 maximum à la fois, avec une courte pause entre chaque appel à l'API Gemini, pour respecter les limites gratuites du service (15 requêtes par minute, 250 par jour).

Quand deux signaux différents parlent du même besoin, ils doivent être intelligemment fusionnés en une seule opportunité plutôt que de créer des doublons. Le score de l'opportunité doit augmenter à chaque nouvelle confirmation.

Le projet doit démarrer simplement avec la commande habituelle de développement local, sans configuration complexe au-delà du fichier de variables d'environnement.

---

## Clés API nécessaires et comment les obtenir gratuitement

**Google Gemini** : créer une clé sur aistudio.google.com, section "Get API Key". Aucune carte bancaire requise.

**Supabase** : créer un projet gratuit sur supabase.com. Les clés sont disponibles dans les paramètres du projet.

**France Travail** : s'inscrire sur francetravail.io/partenaire, créer une application et activer le scope d'accès aux offres d'emploi.

**Reddit** : créer une application de type "script" sur reddit.com/prefs/apps. L'URL de redirection peut être localhost. Aucun abonnement requis.

**Apify** : s'inscrire sur apify.com. Les 5 dollars de crédits gratuits sont disponibles dès l'inscription.

---

## Inspirations visuelles et exemples de référence

### Inspiration pour le dashboard et l'interface

Les captures d'écran ci-dessous servent de référence visuelle pour le style général de l'application. Je ne veux pas une copie conforme, mais une direction artistique similaire : interface sombre, données denses mais lisibles, hiérarchie visuelle claire, utilisation intelligente de la couleur pour mettre en valeur les scores et les statuts.

> **[INSÉRER ICI LES CAPTURES D'ÉCRAN D'INSPIRATION — glisser-déposer les images dans le prompt avant de l'envoyer à l'agent]**

### Exemple de rapport à générer

Le fichier PDF joint ci-dessous est un exemple du type de rapport que l'IA doit être capable de produire pour chaque opportunité. Il sert de modèle de référence pour la structure, le niveau de détail, le ton et la profondeur d'analyse attendus. Le rapport généré par l'application n'a pas besoin d'être identique, mais doit atteindre un niveau de qualité et de complétude similaire.

> **[INSÉRER ICI LE FICHIER PDF — nom du fichier : `[NOM_DU_FICHIER].pdf`]**

---

## Plan de développement — découpage macro / méso / micro

L'agent doit impérativement travailler tâche par tâche, dans l'ordre indiqué. Chaque tâche micro doit être complètement terminée, testée et fonctionnelle avant de passer à la suivante. Il ne faut jamais sauter d'étape ni bâcler une partie pour avancer plus vite.

---

### BLOC 1 — Fondations du projet (infrastructures et base de données)

**Étape 1.1 — Initialisation du projet**
Créer la structure du projet avec le framework choisi, installer les dépendances de base, configurer Tailwind CSS, mettre en place le fichier de variables d'environnement avec toutes les clés nécessaires listées mais vides, et vérifier que l'application démarre correctement sur le port local.

**Étape 1.2 — Connexion à Supabase**
Configurer le client Supabase dans le projet, créer les trois tables nécessaires (signaux bruts, opportunités, historique des collectes) avec tous leurs champs et leurs index, et vérifier que la connexion fonctionne correctement en lisant et écrivant une ligne de test.

**Étape 1.3 — Structure de navigation de l'application**
Mettre en place le squelette de l'application avec les trois pages principales (dashboard, gestion des sources, vue détaillée d'une opportunité), une barre de navigation latérale ou supérieure fonctionnelle, et des pages vides mais accessibles pour chacune. L'application doit déjà ressembler à quelque chose visuellement, avec le thème sombre appliqué.

---

### BLOC 2 — Collecteurs de données (source par source)

**Étape 2.1 — Collecteur Hacker News**
Construire le collecteur Hacker News, créer la route API correspondante, stocker les résultats en base de données, et afficher la source sur la page de gestion des sources avec son bouton de déclenchement manuel et son indicateur de statut. Tester en lançant une vraie collecte et vérifier que des données apparaissent en base.

**Étape 2.2 — Collecteur Reddit**
Construire le collecteur Reddit avec gestion de l'authentification OAuth, créer la route API correspondante, intégrer la source sur la page de gestion des sources. Tester avec un vrai compte Reddit et vérifier les données collectées.

**Étape 2.3 — Collecteur France Travail**
Construire le collecteur France Travail avec gestion du token OAuth, créer la route API correspondante, intégrer la source sur la page de gestion des sources. Tester avec de vraies clés et vérifier que les offres d'emploi sont bien récupérées.

**Étape 2.4 — Collecteur Apify (LinkedIn et Indeed)**
Construire les deux collecteurs Apify (un pour LinkedIn, un pour Indeed), créer les routes API correspondantes avec gestion du polling jusqu'à la fin du run, intégrer les deux sources sur la page de gestion des sources. Ces deux sources sont les seules qui coûtent des crédits : bien s'assurer qu'elles ne peuvent être déclenchées que manuellement.

**Étape 2.5 — Finalisation de la page de gestion des sources**
Compléter la page avec l'historique des runs en bas de page (tableau avec toutes les collectes passées, leur statut, leur durée et leur volume), et s'assurer que les statuts sont visuellement clairs et se mettent à jour en temps réel pendant une collecte en cours.

---

### BLOC 3 — Moteur d'analyse IA

**Étape 3.1 — Connexion à l'API Gemini et extraction d'un signal**
Configurer le client Google Gemini dans le projet, écrire le prompt d'analyse d'un signal brut, et tester l'extraction sur une dizaine de signaux manuellement pour valider que la sortie JSON est cohérente et exploitable.

**Étape 3.2 — Traitement en batch et stockage des opportunités**
Construire la logique qui récupère tous les signaux non traités, les envoie à Gemini par lots de 20 avec une pause entre chaque appel, et stocke les résultats en base de données sous forme d'opportunités. Gérer proprement les erreurs et les signaux sans opportunité détectable.

**Étape 3.3 — Fusion des opportunités similaires**
Construire la logique qui détecte quand un nouveau signal parle du même besoin qu'une opportunité déjà existante, et fusionne les deux intelligemment (consolider les points de douleur, les outils mentionnés, et augmenter le score) plutôt que de créer un doublon.

**Étape 3.4 — Système de scoring**
Implémenter le calcul du score global entre 0 et 100 selon les quatre critères pondérés (volume de mentions, urgence, manque d'outils, saturation). Le score doit être recalculé à chaque fusion ou mise à jour d'une opportunité.

**Étape 3.5 — Génération de rapports détaillés**
Construire la fonctionnalité de génération de rapport complet pour une opportunité donnée. Écrire le prompt Gemini dédié à cette tâche en s'inspirant de l'exemple de rapport fourni, et créer la route API correspondante. Tester sur plusieurs opportunités et affiner le prompt jusqu'à obtenir un niveau de qualité satisfaisant.

---

### BLOC 4 — Interface utilisateur complète

**Étape 4.1 — Dashboard principal : indicateurs clés et bouton d'analyse**
Construire la partie haute du dashboard avec les quatre indicateurs clés (nombre d'opportunités, score moyen, signaux collectés, dernière mise à jour) et le bouton de lancement manuel de l'analyse IA. Brancher le bouton sur la route API d'analyse et afficher un retour visuel pendant le traitement.

**Étape 4.2 — Dashboard : visualisations graphiques**
Ajouter les deux graphiques (évolution temporelle des scores et répartition par département) avec de vraies données issues de la base. S'assurer qu'ils se mettent à jour après chaque analyse.

**Étape 4.3 — Dashboard : tableau des opportunités avec filtres**
Construire le tableau principal des opportunités avec tri par score, et les trois filtres (département, marché géographique, score minimum). Chaque ligne doit être cliquable et rediriger vers la vue détaillée.

**Étape 4.4 — Vue détaillée d'une opportunité**
Construire la page complète d'une opportunité avec l'en-tête coloré selon le score, les métriques clés, les listes de points de douleur et d'outils, le bouton de génération de rapport, l'affichage du rapport généré formaté de manière lisible, et la liste des sources avec leurs liens originaux.

**Étape 4.5 — Finitions et cohérence visuelle**
Passer en revue l'ensemble de l'application pour s'assurer que le style est cohérent sur toutes les pages, que les états de chargement sont gérés partout, que les messages d'erreur sont clairs, et que l'expérience globale est fluide et agréable à utiliser.

---

## Résultat attendu

Au terme du développement, je dois pouvoir lancer l'application sur mon ordinateur, déclencher les collectes depuis l'interface quand je le souhaite, attendre quelques minutes que l'IA analyse les données, et voir apparaître un classement d'opportunités SaaS issues de vraies données de marché, avec des scores, des analyses détaillées, et des rapports complets générés à la demande en un clic.