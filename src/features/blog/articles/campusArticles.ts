import type { BlogArticle } from '../types';

// Edited from the dated student accounts in docs/tsp/sources/.
const author = { name: 'BananINT', role: 'Le carnet du campus', avatar: '🍌' };
const date = '2026-09-29T08:00:00Z';

export const CAMPUS_ARTICLES: BlogArticle[] = [
    {
        id: 'coulisses-origines', slug: 'comment-bananint-a-commence',
        title: 'Le premier clicker et la course aux bots',
        subtitle: 'Avant le jeu actuel, un classement a suffi pour lancer une petite compétition sur le campus.',
        metaTitle: 'BananINT à Télécom SudParis : le premier clicker',
        metaDescription: 'Le souvenir du premier clicker BananINT à Télécom SudParis : des clics, un classement, des bots et des étudiants qui reviennent jouer.',
        keywords: ['BananINT', 'Télécom SudParis', 'clicker', 'bots', 'vie étudiante'],
        category: 'coulisses', tags: ['BananINT', 'Campus', 'Clicker'],
        author: { name: 'Créateur de BananINT', role: 'Étudiant en deuxième année à TSP', avatar: '🍌' },
        publishedAt: date, updatedAt: date, readingTime: '3 min', featured: true,
        content: `Au départ, BananINT était une idée qu’on racontait aux gens sur le campus. Le « club » des bananes existe encore un peu comme ça : assez pour que le nom circule, pas vraiment comme une association avec un programme à suivre.

Vers le milieu du premier semestre, j’ai mis un premier clicker en ligne. On en parlait simplement aux étudiants qu’on croisait. Le jeu n’était même pas terminé qu’une personne avait déjà accumulé des millions de clics à la main. Son score a été remis à zéro ensuite ; je ne me souviens plus précisément pourquoi, donc je préfère ne pas inventer de cause.

## Le classement a pris le relais

Le défi n’était plus seulement de cliquer. Beaucoup se sont mis à écrire des bots et à comparer leurs résultats pour prendre la première place. Dans une école où beaucoup aiment coder, trouver un moyen plus malin de jouer faisait partie du jeu. Le serveur gardait l’état du classement : les tentatives pour « casser » le clicker devenaient surtout une compétition d’ingéniosité.

On pouvait aussi revenir après un moment d’absence et trouver une récompense liée à cette progression hors ligne. Entre le jeu à la main, les bots et les retours pour voir le classement, il y avait toujours une raison de jeter un œil.

## Ce qu’on retrouve aujourd’hui

Cette première version a laissé une trace dans les souvenirs des joueurs. Un clin d’œil à cette époque se cache encore sur le site ; on laisse le plaisir de le trouver.

J’ai continué à développer BananINT depuis le deuxième semestre, en apprenant au passage Docker et beaucoup de choses sur le web. Le jeu actuel a grandi, mais il reste un projet étudiant qui avance par essais, corrections et discussions. C’est aussi pour ça que ce carnet parle du campus autour du jeu, et pas seulement des bananes à gagner.
`,
    },
    {
        id: 'campus-reperes', slug: 'tsp-maisel-assos-premiers-reperes',
        title: 'TSP, MAISEL, INT : les premiers repères du campus',
        subtitle: 'Un point de départ pour comprendre les noms que tout le monde utilise à Évry.',
        metaTitle: 'Télécom SudParis : campus, MAISEL et vie étudiante',
        metaDescription: 'Un guide étudiant des premiers repères à Télécom SudParis : campus partagé, MAISEL, foyer, NOVA, Ritz et associations.',
        keywords: ['Télécom SudParis', 'vie étudiante', 'campus Évry', 'MAISEL', 'associations'],
        category: 'campus', tags: ['Campus', 'TSP', 'MAISEL', 'Assos'],
        author, publishedAt: date, updatedAt: date, readingTime: '4 min',
        content: `On peut arriver à Télécom SudParis et avoir l’impression d’avoir raté les trois premières saisons. Les bâtiments ont des noms, les associations des sigles et personne ne pense toujours à les expliquer. Voici une première carte mentale, écrite depuis le campus.

## Un campus partagé

À Évry, TSP partage une bonne partie de la vie du campus avec [Institut Mines-Télécom Business School](https://www.imt-bs.eu/). Étudiants ingénieurs et managers se retrouvent dans les mêmes lieux et de nombreuses associations. **INT** est un ancien nom qui vit toujours dans les conversations, les noms des clubs et les jeux de mots. Il explique aussi le nom BananINT.

## Les lieux qu’on cite le plus

La **MAISEL** s’occupe des résidences étudiantes. Les bâtiments U1 à U7 ne se ressemblent pas tous ; [on les parcourt dans un article dédié](/blog/maisel-u1-u7-logements-telecom-sudparis). Le **foyer** est un lieu central de la vie associative. **NOVA** est le bâtiment circulaire où l’on travaille, retrouve la bibliothèque et utilise les imprimantes. Le **Ritz** est le restaurant du campus où beaucoup déjeunent. [Voici ces lieux dans une journée ordinaire](/blog/nova-ritz-quotidien-campus-evry).

## Les noms dans les conversations

**MiNET** gère le réseau des résidences. **INTv** est un club vidéo du campus : ses membres aiment filmer, monter et partager leurs créations. Tu peux découvrir [leurs vidéos publiques](https://www.youtube.com/@INTvCrew/videos). Le **BDE**, lui, est l’association étudiante qui rythme notamment le début de l’année.

Il y a bien plus de clubs que ces quelques noms. Le [portail des associations](https://portal.bananint.fr/) aide à les retrouver, et [Welcom’](https://welcom.theodarvoux.fr/) propose d’autres repères étudiants. Le langage commun vient avec le temps : stickers, suffixe « INT » et expressions comme **XRTC** finissent par devenir familiers. [On décrypte ces habitudes ici](/blog/expressions-associations-int-xrtc).

Ce carnet est une vue étudiante, pas un règlement ni une liste complète. Pour des horaires, tarifs et démarches en cours, vérifie toujours les sites des lieux concernés.
`,
    },
    {
        id: 'campus-assos-vocabulaire', slug: 'expressions-associations-int-xrtc',
        title: 'Pourquoi il y a « INT » partout sur le campus',
        subtitle: 'XRTC, stickers, noms d’assos : le petit vocabulaire qui se transmet entre étudiants.',
        metaTitle: 'Vie associative à Télécom SudParis : INT, XRTC et assos',
        metaDescription: 'À Télécom SudParis, le nom INT revient dans les clubs, les stickers et les expressions. Un regard étudiant sur XRTC et la vie associative du campus.',
        keywords: ['Télécom SudParis', 'vie associative', 'INT', 'XRTC', 'associations campus'],
        category: 'campus', tags: ['Campus', 'TSP', 'Assos'],
        author, publishedAt: date, updatedAt: date, readingTime: '3 min',
        content: `Tu entends « INT » dans un nom de club, puis dans une blague, puis encore sur un sticker collé quelque part. Ce n’est pas un code à apprendre avant la rentrée : c’est une manière de se reconnaître sur le campus.

## Un ancien nom resté vivant

Le nom **INT** a une histoire plus ancienne que les promotions actuelles de Télécom SudParis. Il continue à servir de matériau pour nommer les associations et inventer des jeux de mots. BananINT s’inscrit dans cette habitude, avec son statut de club pour rire qui existe surtout parce que les étudiants continuent à en parler.

Autre formule qu’on entend : **XRTC**, pour « X roule the campus ». Le X peut représenter un club, une association ou autre chose. Il n’y a pas de sens profond à chercher derrière chaque occurrence ; le plaisir est souvent dans la variation.

## Les assos dépassent les sigles

Le BDE anime notamment le début d’année. INTv est un club vidéo ; on peut simplement découvrir [ses créations publiques](https://www.youtube.com/@INTvCrew/videos). Mais la vie associative ne se limite pas à ces noms : son, vidéo, sport, cybersécurité, accueil, projets techniques et culturels ont chacun leur place. Le [portail des associations](https://portal.bananint.fr/) est une meilleure liste de départ qu’une énumération figée dans un article. La [présentation de TSP](https://www.telecom-sudparis.eu/campus/vie-associative/) rappelle aussi que cette vie est partagée avec IMT-BS.

Les stickers d’associations sont parfois le premier indice visible. Le reste vient en passant du temps avec les gens : on apprend un nom parce qu’on a été à un événement, aidé à préparer quelque chose, ou simplement entendu une histoire au foyer. Un lexique aide à suivre ; il ne remplace pas la rencontre.
`,
    },
    {
        id: 'campus-maisel', slug: 'maisel-u1-u7-logements-telecom-sudparis',
        title: 'MAISEL : ce que changent vraiment U1 à U7',
        subtitle: 'Des impressions d’étudiant sur les résidences, à compléter avec les personnes qui y habitent.',
        metaTitle: 'Logements MAISEL U1 à U7 à Télécom SudParis',
        metaDescription: 'Repères étudiants sur les logements MAISEL de Télécom SudParis : U1 à U7, distance du foyer, bruit et différences entre bâtiments.',
        keywords: ['Télécom SudParis', 'MAISEL', 'U1 U7', 'logements étudiants Évry'],
        category: 'campus', tags: ['Campus', 'TSP', 'MAISEL'],
        author, publishedAt: date, updatedAt: date, readingTime: '4 min',
        content: `On parle souvent de « la MAISEL » comme si toutes les chambres donnaient sur le même couloir. Sur le campus, les bâtiments vont pourtant de **U1 à U7**, et leur emplacement change la façon de vivre les journées.

## La distance au foyer compte

**U1, U2 et U4** sont proches du foyer. C’est pratique pour la vie associative, mais la proximité peut aussi signifier plus de bruit. **U3** paraît plus excentré sur le campus à l’étudiant qui a raconté ces repères ; selon son expérience, on y croise beaucoup d’étudiants internationaux. **U6** est hors campus. Ce sont des impressions de vie, pas des mesures de distance ou de niveau sonore.

**U7** lui paraît le plus moderne. **U5** ne lui évoque pas de particularité heureuse ou spectaculaire : des couloirs étroits et une hauteur sous plafond plutôt faible. Il se souvient de problèmes d’hygiène il y a quelques années, sans affirmer qu’ils existent encore aujourd’hui. Aucun de ces avis ne vaut une visite de chambre ni un état des lieux actuel.

## Où chercher un avis récent

Pour comparer les bâtiments, le plus utile reste de demander aux personnes qui y vivent cette année. Le [Discord des admissibles](https://discord.com/invite/Us9QXdwt86), réutilisé depuis plusieurs promotions, permet justement aux anciens de raconter les différences. Vérifie la date du témoignage avant de prendre une anecdote pour la situation présente.

Les démarches, disponibilités et informations officielles sont sur [le site de la MAISEL](https://maisel.imtbs-tsp.eu/logements/). **NOVA**, malgré sa place dans les conversations sur le campus, n’est pas un bâtiment de logement : [on y va surtout pour travailler et imprimer](/blog/nova-ritz-quotidien-campus-evry).
`,
    },
    {
        id: 'campus-nova-ritz', slug: 'nova-ritz-quotidien-campus-evry',
        title: 'NOVA, le Ritz et les petits détours d’une journée',
        subtitle: 'La vie du campus passe aussi par les imprimantes, la pause déjeuner et des piles de feuilles avant les examens.',
        metaTitle: 'NOVA et le Ritz : quotidien du campus de Télécom SudParis',
        metaDescription: 'À Télécom SudParis, NOVA réunit bibliothèque, salles de travail et imprimantes ; le Ritz rythme les déjeuners du campus.',
        keywords: ['Télécom SudParis', 'NOVA', 'Ritz', 'campus Évry', 'vie étudiante'],
        category: 'campus', tags: ['Campus', 'TSP', 'NOVA', 'Ritz'],
        author, publishedAt: date, updatedAt: date, readingTime: '4 min',
        content: `NOVA se remarque d’abord parce que le bâtiment est rond. Une fois entré, il est surtout très ordinaire au bon sens du terme : on s’y pose, on travaille, on imprime, on croise quelqu’un qui vient faire exactement la même chose.

## NOVA et ses imprimantes

Au rez-de-chaussée, il y a la cafétéria, des tables et des distributeurs. Au premier étage se trouvent la bibliothèque, des salles d’étude et des salles de projet. Les imprimantes principales sont aussi à NOVA. Pour l’étudiant qui nous a raconté ces lieux, imprimer est facile et le quota paraît généreux.

Avant certains examens où les documents sont autorisés, les mêmes supports réapparaissent en piles de papier. D’autres impressions sont faites juste pour rire. Il se souvient notamment d’images de pieds et de découpages ou collages, sans vouloir transformer un souvenir incertain en tradition officielle. On rit aussi de l’absurdité écologique de tant imprimer pour parfois ne presque rien utiliser.

## Le Ritz à midi

Pour déjeuner, le **Ritz** est le restaurant principal du campus. Beaucoup de gens y passent, même si les habitudes varient. L’étudiant interrogé aime plutôt la nourriture, mais trouve que c’est devenu assez cher ; il a entendu d’autres étudiants s’en plaindre. La cafétéria de NOVA a également la réputation d’être chère. Ce sont des appréciations datées, pas un relevé de tarifs.

« Ritz » peut aussi désigner, dans une campagne ou une association, la personne qui prépare à manger. On peut donc parler du Ritz sans parler du bâtiment : une de ces petites ambiguïtés qui font le langage du campus.

NOVA et le Ritz ne résument pas toute la vie à Télécom SudParis. Ils montrent simplement comment un lieu devient familier : par les trajets répétés, les pauses avec les autres et les choses banales dont on finit par se souvenir.
`,
    },
];
