// Rapports factices (contenu Markdown simplifié, rendu par ReportContent).

import type { Report } from './types'

export type MockReport = Omit<Report, 'created_at'> & { daysAgo: number; hour: number }

export const mockReports: MockReport[] = [
  {
    id: 'report-full-1',
    type: 'full',
    title: 'Panorama des opportunités B2B francophones',
    daysAgo: 0, hour: 10,
    sources_used: ['hackernews', 'reddit', 'francetravail', 'indeed'],
    stats: { total_opportunities: 12, total_signals: 326 },
    sections: [
      {
        order: 1, title: 'Executive summary',
        content: `Sur les 7 derniers jours, **326 signaux** ont été collectés sur 4 sources et ont fait émerger **12 opportunités**.

- Les besoins les plus forts concernent la **finance des petites entreprises** et le **recrutement en PME**.
- Les offres d'emploi (France Travail, Indeed) révèlent des tâches répétitives encore faites à la main.
- Les communautés (Reddit, Hacker News) confirment ces douleurs, mais citent aussi beaucoup d'outils concurrents.

> L'opportunité la mieux notée — les relances de factures pour artisans — combine un besoin urgent, peu d'outils adaptés et un MVP réalisable en quelques semaines.`,
      },
      {
        order: 2, title: 'Cartographie du marché',
        content: `| Département | Opportunités | Score moyen |
|---|---|---|
| Finance | 2 | 70 |
| RH | 2 | 70 |
| Commercial | 2 | 55 |
| Marketing | 2 | 46 |
| Opérations | 1 | 76 |
| Support | 1 | 67 |

Le marché **FR** concentre la moitié des opportunités ; le **Québec** apparaît surtout sur le support client et la gestion associative.`,
      },
      {
        order: 3, title: 'Analyse emploi & communautés',
        content: `## Ce que disent les offres d'emploi
- Postes d'assistance administrative centrés sur les **relances clients**.
- Coordinateurs de planning dans l'**aide à domicile**, sans outil d'optimisation.

## Ce que disent les communautés
- Sur Reddit, les dirigeants de TPE décrivent le temps perdu en **veille d'appels d'offres**.
- Sur Hacker News, le tri des candidatures revient comme un problème partagé au-delà du marché francophone.`,
      },
      {
        order: 4, title: 'Analyse concurrentielle',
        content: `Les opportunités avec un score de saturation élevé (gestion des mots de passe, avis clients) sont à **éviter** : des acteurs installés proposent déjà des offres gratuites ou très bon marché.

À l'inverse, les outils comptables (Pennylane, Sellsy) ne couvrent pas les relances par SMS, et les ATS ne visent pas les PME qui recrutent rarement.`,
      },
      {
        order: 5, title: 'Top opportunités',
        content: `1. **Relances de factures automatisées pour artisans** — score 88
2. **Agent IA de tri des candidatures pour PME** — score 82
3. **Planification des tournées pour aides à domicile** — score 76
4. **Veille des appels d'offres publics pour TPE** — score 71`,
      },
      {
        order: 6, title: 'Recommandation & pour toi',
        content: `Avec ton profil (développeur junior, mi-temps, budget de quelques milliers d'euros), les deux premières opportunités sont les plus réalistes.

**Recommandation :** commencer par les relances de factures. Le MVP tient en quelques semaines, la cible est clairement identifiée et le modèle par abonnement est simple.

_Prochaine étape : interroger 5 artisans sur leur processus actuel de relance._`,
      },
    ],
  },
  {
    id: 'report-category-1',
    type: 'category',
    title: 'Emplois & Missions Freelance',
    daysAgo: 1, hour: 14,
    sources_used: ['francetravail', 'indeed'],
    stats: { signals_analyzed: 136 },
    sections: [
      {
        order: 1, title: 'Contexte',
        content: `Ce rapport analyse **136 offres d'emploi** issues de France Travail et d'Indeed. Chaque offre décrit des tâches que l'entreprise est prête à payer pour faire réaliser.`,
      },
      {
        order: 2, title: 'Tendances observées',
        content: `- Forte demande d'**assistance administrative** pour des tâches de relance et de saisie.
- Recrutements de **coordinateurs de planning** dans le médico-social.
- Offres de **veille commerciale** dans les petites entreprises du BTP.`,
      },
      {
        order: 3, title: 'Signaux les plus forts',
        content: `| Signal | Source | Fréquence |
|---|---|---|
| Relances clients | France Travail | 14 offres |
| Tri des candidatures | Indeed | 9 offres |
| Plannings de tournée | France Travail | 7 offres |`,
      },
      {
        order: 4, title: 'Opportunités identifiées',
        content: `1. Relances de factures automatisées pour artisans
2. Planification des tournées pour aides à domicile
3. Suivi des certifications obligatoires des employés`,
      },
      {
        order: 5, title: 'Risques',
        content: `- Les offres d'emploi décrivent un besoin, pas une volonté d'acheter un logiciel.
- Les tâches très spécifiques à un métier limitent la taille du marché.`,
      },
      {
        order: 6, title: 'Pour toi',
        content: `Ces signaux correspondent bien à ta préférence pour l'**automatisation** et les **PME**. La planification des tournées est cependant trop complexe pour un premier projet à mi-temps.`,
      },
    ],
  },
  {
    id: 'report-cross-1',
    type: 'cross',
    title: 'Emplois × Communautés',
    daysAgo: 3, hour: 11,
    sources_used: ['Emplois & Freelance', 'Communautés & Insights'],
    stats: { total_signals: 190 },
    sections: [
      {
        order: 1, title: 'Convergences',
        content: `Les deux catégories pointent vers les **mêmes douleurs** : relances de paiement, tri des candidatures et veille des appels d'offres. Quand un besoin apparaît à la fois dans les offres d'emploi et dans les discussions, il est généralement plus solide.`,
      },
      {
        order: 2, title: 'Divergences',
        content: `- Les communautés parlent beaucoup d'outils de **documentation technique**, absents des offres d'emploi.
- Les offres d'emploi révèlent des besoins **métier** (aide à domicile, BTP) peu discutés en ligne.`,
      },
      {
        order: 3, title: 'Opportunités croisées',
        content: `| Opportunité | Emplois | Communautés |
|---|---|---|
| Relances de factures | Oui | Oui |
| Tri des candidatures | Oui | Oui |
| Veille appels d'offres | Oui | Oui |
| Documentation d'API | Non | Oui |`,
      },
      {
        order: 4, title: 'Priorités',
        content: `1. Relances de factures automatisées pour artisans
2. Agent IA de tri des candidatures pour PME`,
      },
      {
        order: 5, title: 'Pour toi',
        content: `Les opportunités présentes dans les deux catégories sont les plus sûres pour un premier lancement. Elles restent accessibles avec ton niveau technique et ton budget.`,
      },
    ],
  },
]
