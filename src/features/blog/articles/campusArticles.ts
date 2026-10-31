import type { BlogArticle } from '../types';

const author = { name: 'BananINT', role: 'Le carnet du campus', avatar: '🍌' };
const date = '2026-09-29T08:00:00Z';
const correctedAt = '2026-10-31T08:00:00Z';

export const CAMPUS_ARTICLES: BlogArticle[] = [
    {
        id: 'coulisses-origines',
        slug: 'comment-bananint-a-commence',
        title: 'Aux origines de BananINT : du premier clicker à la course aux bots',
        subtitle: 'Un club pour rire, un clicker présenté de vive voix, puis une course au meilleur bot pour la première place.',
        metaTitle: 'Histoire de BananINT : premier clicker, bots et classement',
        metaDescription: 'Les débuts de BananINT à Télécom SudParis racontés par son créateur : un club pour rire, un premier clicker diffusé de bouche-à-oreille, une course aux bots et un développement toujours en cours.',
        keywords: ['BananINT', 'Télécom SudParis', 'clicker', 'bots', 'vie étudiante', 'classement'],
        category: 'coulisses',
        tags: ['BananINT', 'Campus', 'Clicker'],
        author: { name: 'Créateur de BananINT', role: 'Étudiant en 2e année à TSP', avatar: '🍌' },
        publishedAt: date,
        updatedAt: correctedAt,
        readingTime: '3 min',
        featured: true,
        content: `BananINT commence comme une blague entre amis : imaginer un club consacré aux bananes. Les premières créations sont des expériences rapides et absurdes faites avec l’IA, dont un site, à une époque où les résultats étaient encore, selon le créateur, assez ratés.

Il décrit aujourd’hui BananINT comme un **club pour rire, qui existe un peu et n’existe pas vraiment**. Le but était surtout de faire circuler le nom.

## Le premier clicker

Vers le milieu du premier semestre, le créateur publie un clicker sur le web. Pour le faire connaître, la bande va simplement en parler aux gens, en allant les voir. Le jeu prend de l’ampleur, et il s’en souvient comme d’un jeu très addictif.

Le frontend de cette première version est sorti, d’après lui, d’un seul prompt Claude. La suite, il l’a construite en continuant à travailler dessus et en apprenant Docker et les technologies web.

## La course aux bots

Dans une école d’informatique, fabriquer un bot faisait partie du jeu. C’était facile, même si le créateur situe cette période juste avant ce qu’il appelle le « boom agentique », quand en écrire un demandait un peu plus d’effort qu’aujourd’hui. Beaucoup de joueurs s’y sont mis, avec un objectif principal : la première place du classement.

Essayer de « casser BananINT » était aussi un défi, notamment pour les étudiants passionnés de cybersécurité, comme ceux de HackademINT, le club que le créateur associe au 404 CTF. Mais le serveur faisait autorité sur l’état du jeu : selon lui, on ne pouvait pas vraiment le casser de cette manière.

## Des millions à la main

Le jeu n’était même pas terminé qu’un joueur avait déjà accumulé des millions à la main. Ce progrès a ensuite été remis à zéro ; le récit ne dit ni par qui, ni pourquoi. Pendant ce temps, d’autres essayaient de rivaliser avec leurs bots. Revenir après une absence rapportait aussi une récompense : une forme d’AFK farming.

## Et ensuite

Après ce premier pic, l’engouement retombe, et le créateur manque de temps pour mettre le site à jour correctement. Les étudiants se souviennent pourtant de ce premier clicker : son apparence d’origine se cache encore quelque part, pour qui la cherche.

Depuis le deuxième semestre, il travaille sur le projet. Il le décrit comme un travail lourd et toujours en cours : il reste selon lui beaucoup de problèmes dans le casino et le jeu principal, et des parties de l’interface qui ne lui plaisent pas.
`,
    },
    {
        id: 'campus-reperes',
        slug: 'tsp-maisel-assos-premiers-reperes',
        title: 'Guide des associations du campus : BDE, MiNET et clubs',
        subtitle: 'Premiers repères sur les structures qui animent la vie étudiante commune à Télécom SudParis et IMT-BS.',
        metaTitle: 'Associations Télécom SudParis et IMT-BS : premiers repères',
        metaDescription: 'Repères sur les associations du campus d’Évry : BDE, BDA, ASINT, MiNET, HackademINT, INTv, BPM et d’autres clubs.',
        keywords: ['Télécom SudParis', 'associations', 'BDE', 'MiNET', 'HackademINT', 'vie associative', 'IMT-BS'],
        category: 'campus',
        tags: ['Campus', 'TSP', 'Assos'],
        author,
        publishedAt: date,
        updatedAt: correctedAt,
        readingTime: '3 min',
        content: `Le campus d’Évry réunit deux écoles de l’Institut Mines-Télécom : **Télécom SudParis** (école d’ingénieurs) et **Institut Mines-Télécom Business School** (école de management). Elles partagent le campus et la vie associative.

## Les trois bureaux

- **BDE (Bureau des Élèves)** : l’association étudiante qui anime notamment le début d’année, un moment central de la vie associative pour un étudiant de deuxième année interrogé en septembre 2026.
- **BDA (Bureau des Arts)** : il fait vivre les clubs artistiques et des événements comme INT Got Talent, *Festiv’art* ou le cabaret, d’après son site pour la saison 2025–2026.
- **ASINT (Association sportive)** : commune aux deux écoles. Son site évoque l’intégration avec le BDE et le BDA, des compétitions, les installations sportives et des « open locaux ».

## Les clubs techniques

- **MiNET** : l’association qui exploite le réseau des résidences depuis 1991. Elle présente aussi une mission de formation et un soutien aux clubs.
- **HackademINT** : le club de cybersécurité, associé au *404 CTF*.
- **INTech** : le club de robotique.
- **Gam’INT** : le club de jeu vidéo.

## Création, médias et événements

- **INTv** : le club vidéo du campus.
- **BPM** : son et lumière ; il organise le Club B avec l’AbsINThe.
- **Déclic** : le club photo, crédité sur les images de Welcom’.
- **Welcom’** : l’accueil des étudiants internationaux, avec des guides pratiques et des rencontres comme le Global Village.
- **AbsINThe** : le bar étudiant du foyer.
- **Épicer’INT** : la solidarité alimentaire.

Pour la liste complète des structures étudiantes, voir le portail associatif [portal.bananint.fr](https://portal.bananint.fr/) et le guide étudiant [welcom.theodarvoux.fr](https://welcom.theodarvoux.fr/).
`,
    },
    {
        id: 'campus-assos-vocabulaire',
        slug: 'expressions-associations-int-xrtc',
        title: 'Lexique du campus : INT, XRTC et sigles de rentrée',
        subtitle: 'Déchiffrer les sigles et les expressions qu’on entend en arrivant sur le campus.',
        metaTitle: 'Lexique étudiant Télécom SudParis : INT, XRTC et vocabulaire',
        metaDescription: 'Petit lexique de Télécom SudParis : pourquoi INT est partout, ce que veut dire XRTC, les stickers et les sigles de rentrée (SEI, WEI, Club B).',
        keywords: ['Télécom SudParis', 'vocabulaire campus', 'INT', 'XRTC', 'lexique étudiant'],
        category: 'campus',
        tags: ['Campus', 'TSP', 'Assos'],
        author,
        publishedAt: date,
        updatedAt: correctedAt,
        readingTime: '2 min',
        content: `En arrivant sur le campus d’Évry, on entend vite des sigles et des expressions que personne ne prend le temps d’expliquer. En voici quelques-uns.

## « INT » partout

**INT** est l’ancien nom de l’école, l’Institut national des télécommunications. Le nom a changé, mais on aime remettre INT partout, dans les noms d’associations et les jeux de mots :
- **BananINT** (le clicker du campus)
- **HackademINT** (le club cyber)
- **Gam’INT** (le club jeu vidéo)
- **AbsINThe** (le bar étudiant du foyer)
- **Épicer’INT** (la solidarité alimentaire)

Tous les clubs ne portent pas ce suffixe, mais il revient souvent.

## « XRTC »

**XRTC** veut dire **« X roule the campus »**. X peut être à peu près n’importe quoi, le plus souvent un club ou une association.

## Les stickers

Selon un étudiant de deuxième année (septembre 2026), on reconnaît souvent quelqu’un du campus à ça : il connaît ces expressions, ou il a des stickers d’associations quelque part.

## Les sigles de rentrée

Le guide associatif de Welcom’ donne quelques repères, qui ne valent pas calendrier :
- **SEI** : la semaine d’intégration, précédée d’une pré-SEI.
- **WEI** : le week-end d’intégration.
- **Club B** : une soirée récurrente organisée par BPM et l’AbsINThe, annoncée le mercredi, avec des exceptions.
`,
    },
    {
        id: 'campus-maisel',
        slug: 'maisel-u1-u7-logements-telecom-sudparis',
        title: 'Résidences MAISEL : U1 à U7 vus par un étudiant',
        subtitle: 'Ce qu’un étudiant de deuxième année retient des sept bâtiments, en attendant d’autres témoignages.',
        metaTitle: 'Résidences MAISEL U1 à U7 à Télécom SudParis : premiers repères',
        metaDescription: 'Les sept bâtiments MAISEL du campus d’Évry, de U1 à U7, décrits par les impressions datées d’un étudiant : bruit près du foyer, U3 excentré, U6 hors campus, U7 le plus moderne.',
        keywords: ['MAISEL', 'logement étudiant', 'Télécom SudParis', 'U1 U7', 'résidence Évry'],
        category: 'campus',
        tags: ['Campus', 'TSP', 'MAISEL'],
        author,
        publishedAt: date,
        updatedAt: correctedAt,
        readingTime: '2 min',
        content: `La **MAISEL** est l’association d’hébergement du campus d’Évry. Son site présente sept bâtiments, de **U1 à U7**.

Les repères ci-dessous viennent d’un étudiant de deuxième année du cycle ingénieur, recueillis fin septembre 2026. Ce sont ses impressions, pas des mesures ni un classement : pour lui, chaque bâtiment a ses avantages et ses inconvénients.

## Bâtiment par bâtiment

### U1, U2 et U4 : près du foyer
Proches du foyer, et jugés très bruyants pour cette raison.

### U3 : excentré, mais sur le campus
Le plus excentré du campus. Dans son expérience, c’est souvent là qu’on trouve le plus d’étudiants internationaux.

### U5 : rien de très particulier
Plafonds plutôt bas, petits couloirs ; pour le reste, rien de très particulier selon lui.

### U6 : hors du campus
Entièrement hors du campus, à ne pas confondre avec le U3, qui reste sur le campus.

### U7 : le plus moderne
Le plus moderne, selon le témoin. Le site de la MAISEL le situe au 14 rue Charles Fourier, près du restaurant du campus, le Ritz.

## Pour en savoir plus

Le réseau des résidences est exploité par l’association MiNET.

Pour les retours des anciens sur chaque bâtiment, le même étudiant recommande le serveur Discord des admissibles ([lien d’invitation](https://discord.com/invite/Us9QXdwt86)), réutilisé selon lui depuis plusieurs années. Les témoignages y ont donc des dates différentes : un vieux problème ne décrit pas forcément l’état actuel.
`,
    },
    {
        id: 'campus-nova-ritz',
        slug: 'nova-ritz-quotidien-campus-evry',
        title: 'Lieux clés du campus : Le Foyer, NOVA et Le Ritz',
        subtitle: 'Trois lieux qu’on fréquente vite : le foyer des associations, NOVA et ses imprimantes, le Ritz à midi.',
        metaTitle: 'Lieux du campus Télécom SudParis : Foyer, NOVA et Ritz',
        metaDescription: 'Le foyer, NOVA et le Ritz à Télécom SudParis, racontés par un étudiant : imprimantes et quota, déjeuner au Ritz, prix discutés et double sens du mot Ritz.',
        keywords: ['Télécom SudParis', 'NOVA', 'Ritz', 'Foyer', 'campus Évry', 'vie étudiante'],
        category: 'campus',
        tags: ['Campus', 'TSP', 'NOVA', 'Ritz'],
        author,
        publishedAt: date,
        updatedAt: correctedAt,
        readingTime: '3 min',
        content: `Trois lieux reviennent vite dans une journée sur le campus d’Évry : le foyer pour les associations, NOVA pour travailler et imprimer, le Ritz pour déjeuner. Les impressions ci-dessous sont celles d’un étudiant de deuxième année, recueillies fin septembre 2026.

## Le foyer

Proche des résidences U1, U2 et U4, le foyer accueille les locaux des associations et les rencontres :
- **L’AbsINThe** : le bar étudiant du foyer.
- **La Grande Salle (GS) et l’Espace Triangle** : des lieux qu’on retrouve dans les descriptions de soirées étudiantes.

## NOVA : surtout les imprimantes

NOVA est un **bâtiment circulaire**. Sa forme est ce qu’il a de bizarre ; pour le reste, c’est un lieu très normal :
- **Rez-de-chaussée** : une cafétéria, des tables et des distributeurs.
- **Premier étage** : des salles d’étude, des salles de projet et la bibliothèque du campus.

### Les imprimantes
Les imprimantes principales sont à NOVA, et c’est un vrai repère : imprimer est facile et le quota est généreux.

On y imprime souvent des choses pour rire. Le témoin se souvient d’un étudiant qui faisait des découpages et des collages, qu’il compare à Tobyn Jacobs. Avant les examens, il y a aussi la scène de tout le monde qui imprime les mêmes supports. Pour les examens où tous les documents sont autorisés, certains impriment des quantités folles, parfois inutiles, juste parce qu’ils peuvent. Ce qui l’amuse : c’est très peu écolo.

## Le Ritz

Le Ritz est le restaurant principal du campus, près du U7. Les étudiants mangent un peu partout, mais à midi, presque tout le monde y va, selon lui.

La nourriture est plutôt bonne. Mais le Ritz est devenu assez cher ces derniers temps, et les étudiants s’en plaignent. La cafétéria a aussi la réputation d’être chère.

### Le double sens du mot « Ritz »
Dans les associations, « le Ritz » désigne aussi la personne qui fait à manger.
`,
    },
];
