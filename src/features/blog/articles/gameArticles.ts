import type { BlogArticle } from '../types';

const author = { name: 'BananINT', role: 'Équipe du jeu', avatar: '🍌' };
const date = '2026-09-29T08:00:00Z';

export const GAME_ARTICLES: BlogArticle[] = [
    {
        id: 'guide-debutant', slug: 'guide-debutant-clicker-bananint',
        title: 'Bien commencer sur le clicker BananINT',
        subtitle: 'Des clics, des améliorations et un classement : les bases visibles du jeu, sans dévoiler ce qui se découvre en jouant.',
        metaTitle: 'Guide débutant du clicker BananINT',
        metaDescription: 'Comment commencer le clicker BananINT : cliquer, choisir des améliorations, découvrir la production automatique et suivre le classement.',
        keywords: ['BananINT', 'clicker', 'guide débutant', 'améliorations', 'classement'],
        category: 'tutoriel', tags: ['BananINT', 'Clicker', 'Débutant'],
        author, publishedAt: date, updatedAt: date, readingTime: '4 min',
        content: `Le [clicker BananINT](/clicker) commence par un geste très simple : cliquer sur la banane. Le nombre affiché monte, puis les premières améliorations apparaissent. Le plaisir vient autant des choix que des clics eux-mêmes.

## Regarder avant d’acheter

La boutique classe les améliorations par familles. Celles de **clic** rendent le geste manuel plus intéressant ; celles d’**automatisation** ajoutent une production qui continue sans cliquer. D’autres effets apparaissent dans l’interface au fil de la partie. Pour commencer, lis le coût et la description de chaque amélioration, puis regarde ce qui change après l’achat.

\`\`\`mermaid
flowchart LR
    A[Cliquer] --> B[Gagner des bananes]
    B --> C[Choisir une amélioration]
    C --> D[Observer la progression]
    D --> A
\`\`\`

Ce schéma n’est pas une recette pour optimiser chaque partie. Il rappelle simplement la boucle visible dès le départ.

## Revenir et comparer

Le classement est une bonne raison de revenir voir ce que les autres ont fait. Dès le premier clicker, les étudiants ont joué à plusieurs manières de grimper, à la main comme avec du code. Le projet actuel garde ce goût de compétition. Ne prends toutefois pas les vieux récits de scores pour une promesse de progression identique aujourd’hui.

La page du jeu présente aussi d’autres panneaux, comme les missions et les réussites. Explore-les à ton rythme : le carnet donne des repères, mais laisse au jeu ses découvertes. Si tu veux comprendre d’où vient cette obsession du classement, [voici l’histoire du premier clicker](/blog/comment-bananint-a-commence).
`,
    },
    {
        id: 'guide-marche', slug: 'guide-bourse-trading-dividendes',
        title: 'Lire la bourse de BananINT sans se précipiter',
        subtitle: 'Cours, graphiques et portefeuille : une introduction à ce que montre réellement le marché du jeu.',
        metaTitle: 'Guide de la bourse BananINT : cours et portefeuille',
        metaDescription: 'Comprendre la bourse du jeu BananINT : choisir une action, lire le graphique, acheter, vendre et suivre son portefeuille.',
        keywords: ['BananINT', 'bourse du jeu', 'marché', 'graphique', 'portefeuille'],
        category: 'guide', tags: ['BananINT', 'Trading', 'Guide'],
        author, publishedAt: date, updatedAt: date, readingTime: '4 min',
        content: `Sous le clicker se trouve un marché virtuel. Il est facile d’y voir un graphique qui bouge et d’imaginer qu’il faut agir tout de suite. Le meilleur premier pas est plus simple : comprendre ce que l’interface affiche.

## Choisir un actif

Le [marché du jeu](/clicker) permet de sélectionner une action. Sa fiche montre un prix actuel et un historique sous forme de graphique. On peut passer d’une vue en chandeliers à une vue en courbe et changer la période observée. Ces vues racontent les mêmes échanges avec des niveaux de détail différents ; aucune ne prédit la suite.

## Acheter, vendre, relire son portefeuille

Avant de valider un achat, vérifie la quantité saisie et le prix indiqué. Après l’opération, le portefeuille permet de voir ce que tu détiens. La vente est une autre décision : il vaut mieux la prendre en regardant sa position plutôt qu’en réagissant à une seule bougie rouge ou verte.

Le marché est une mécanique de BananINT, pas un service financier réel. Les anciens articles du carnet donnaient des chiffres de rendement et des méthodes garanties sans preuve dans le jeu. On les a retirés. Ici, l’objectif est de savoir lire l’écran et de découvrir la mécanique par soi-même, sans promettre de gagner à chaque échange.
`,
    },
    {
        id: 'guide-clans', slug: 'tutoriel-osint-guerre-de-clans',
        title: 'Découvrir les clans et l’OSINT de BananINT',
        subtitle: 'Un guide pour repérer les outils collectifs visibles dans le jeu, sans révéler leurs surprises.',
        metaTitle: 'Clans et OSINT dans BananINT : premiers repères',
        metaDescription: 'Les premiers repères sur les clans et l’OSINT dans BananINT : rejoindre un groupe et comprendre les panneaux du jeu sans spoiler les mécaniques cachées.',
        keywords: ['BananINT', 'clans', 'OSINT', 'jeu collectif'],
        category: 'strategie', tags: ['BananINT', 'Clans', 'Guide'],
        author, publishedAt: date, updatedAt: date, readingTime: '3 min',
        content: `Le clicker a commencé comme une course au classement. Les **clans** ajoutent une dimension collective : on ne regarde plus seulement son propre compteur. L’interface du jeu propose des outils dédiés au groupe et un panneau OSINT.

## Commencer par le collectif

Avant de chercher une stratégie compliquée, rejoins ou fonde un clan depuis [le jeu](/clan). Le panneau OSINT du clicker indique lui-même qu’un clan est nécessaire pour y accéder. C’est une bonne indication de l’esprit de cette partie : discuter, coordonner et comprendre ce que votre groupe veut faire.

## Lire l’interface avant d’agir

Les possibilités du jeu évoluent. Certains vieux guides décrivaient des horaires d’attaque, des récompenses ou des effets exacts comme s’ils étaient gravés dans le marbre. Ce n’est pas fiable. Lis les conditions indiquées dans les panneaux au moment de jouer et traite les nombres qui y figurent comme la source la plus récente.

Nous gardons volontairement les opérations précises hors de cette page. Le plaisir d’une mécanique collective tient aussi à la découverte avec les autres. Pour un point de départ plus calme, [commence par les bases du clicker](/blog/guide-debutant-clicker-bananint).
`,
    },
];
