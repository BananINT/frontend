import type { BlogArticle } from '../types';

const author = { name: 'BananINT', role: 'Le carnet du campus', avatar: '🍌' };
const date = '2026-09-29T08:00:00Z';

export const CAMPUS_ARTICLES: BlogArticle[] = [
    {
        id: 'coulisses-origines',
        slug: 'comment-bananint-a-commence',
        title: 'Aux origines de BananINT : du prototype à la guerre des bots',
        subtitle: 'Comment un projet potache lancé au premier semestre est devenu une compétition d’ingénierie sur le campus.',
        metaTitle: 'Histoire de BananINT : genèse, premier clicker et bots',
        metaDescription: 'L’histoire authentique de BananINT à Télécom SudParis : premier prototype, bouche-à-oreille en amphi, bots informatiques et refonte de production.',
        keywords: ['BananINT', 'Télécom SudParis', 'clicker', 'bots', 'vie étudiante', 'cybersécurité'],
        category: 'coulisses',
        tags: ['BananINT', 'Campus', 'Clicker'],
        author: { name: 'Créateur de BananINT', role: 'Étudiant en 2e année à TSP', avatar: '🍌' },
        publishedAt: date,
        updatedAt: date,
        readingTime: '4 min',
        featured: true,
        content: `BananINT est né d’un besoin élémentaire : s’amuser pendant les cours magistraux du premier semestre d’ingénieur. Entre deux démonstrations théoriques et des extraits de films projetés en fond, l'idée collective d’un club parodique dédié à la banane a rapidement émergé.

## Le premier prototype

Le tout premier jet de l’interface a été généré en quelques minutes via une requête sur un grand modèle de langage. Le résultat initial était rudimentaire, mais il fournissait une base interactive fonctionnelle : une banane jaune au centre de l’écran et un compteur incrémental.

La diffusion s'est faite sans campagne marketing ni affichage formel : simplement en allant voir les étudiants au foyer, en salle de travail et entre les rangs des amphithéâtres pour leur faire tester le lien. Le concept a immédiatement pris.

## La guerre des scripts et des bots

Dans une école d'ingénieurs spécialisée dans le numérique et les télécommunications, le jeu manuel a très vite été dépassé. Dès les premiers jours, des étudiants ont conçu des scripts et des programmes d'automatisation (notamment en Python) pour faire exploser les scores et s'emparer de la première place du classement.

Le clicker s'est alors transformé en banc d'essai pour les passionnés de cybersécurité du campus. Face à une interface d'apparence rudimentaire, certains ont rapidement tenté des attaques basiques : rejeu de requêtes HTTP, manipulation de variables et injection de clics automatisés. Mais le serveur d'authentification et de calcul faisait autorité : impossible de corrompre l'état du jeu ou de contourner les validations strictes du backend, qui a parfaitement tenu le choc.

## Les records manuels et l'engouement

Avant même le déploiement public officiel, alors que le jeu tournait sur un premier prototype privé partagé entre amis, un joueur s'était déjà distingué par une détermination hors norme : franchir la barre de plusieurs millions de clics à la seule force du poignet. Ce compteur impressionnant a finalement été remis à zéro lors du lancement de la première version publique afin de remettre l'ensemble des étudiants sur un pied d'égalité.

Le premier jeu incluait déjà un système de rétention basé sur des récompenses différées après une période d'absence, préfigurant les mécaniques modernes d'AFK farming. Une reproduction visuelle de ce premier clicker historique reste d'ailleurs accessible sous forme d'easter egg au sein de l'application.

## La transition vers la stack moderne

Après ce premier engouement viral, les limites techniques du prototype initial ont nécessité une reconstruction complète :
- **Architecture applicative** : Réécriture du backend en Python 3.13 avec FastAPI et persistance sous PostgreSQL.
- **Transactions sécurisées** : Implémentation de verrous au niveau des lignes de base de données pour éliminer les conditions de concurrence.
- **Temps réel** : Mise en place d'une infrastructure WebSockets diffusant instantanément les événements de marché et les variations économiques.
- **Interface web** : Front-end réactif développé sous React et Tailwind CSS.

BananINT continue d'évoluer sur cette base : un projet d'ingénierie conduit depuis le deuxième semestre de première année par son créateur, continuellement enrichi de nouvelles fonctionnalités et d'optimisations techniques.
`,
    },
    {
        id: 'campus-reperes',
        slug: 'tsp-maisel-assos-premiers-reperes',
        title: 'Guide des associations du campus : BDE, MiNET et clubs',
        subtitle: 'Cartographie et annuaire des structures qui animent la vie étudiante commune à Télécom SudParis et IMT-BS.',
        metaTitle: 'Associations Télécom SudParis et IMT-BS : annuaire et guide',
        metaDescription: 'Panorama complet des associations du campus d’Évry : BDE, BDA, ASINT, MiNET, HackademINT, INTv, BPM et clubs spécialisés.',
        keywords: ['Télécom SudParis', 'associations', 'BDE', 'MiNET', 'HackademINT', 'vie associative', 'IMT-BS'],
        category: 'campus',
        tags: ['Campus', 'TSP', 'Assos'],
        author,
        publishedAt: date,
        updatedAt: date,
        readingTime: '5 min',
        content: `Le campus d’Évry regroupe deux établissements majeurs de l’Institut Mines-Télécom : **Télécom SudParis** (école d’ingénieurs) et **Institut Mines-Télécom Business School** (école de management). La force de ce campus réside dans sa vie associative partagée : la majorité des bureaux et des clubs intègrent des étudiants des deux formations.

## Les trois bureaux exécutifs

La vie associative est coordonnée par trois instances principales élues chaque année :

- **BDE (Bureau des Élèves)** : Organe central de coordination de la vie étudiante. Il assure la liaison avec les directions des deux écoles, négocie les partenariats majeurs et organise les temps forts du calendrier étudiant.
- **BDA (Bureau des Arts)** : Fédère l'ensemble des activités culturelles et artistiques. Il supervise les ateliers de théâtre, danse, musique, comédie musicale et organise des manifestations d'envergure comme le festival *Festiv’art* et les scènes ouvertes.
- **ASINT (Association Sportive)** : Structure commune assurant l'entraînement hebdomadaire dans une quinzaine de disciplines, la gestion des installations sportives du campus et la participation aux tournois universitaires de la Fédération Française du Sport Universitaire (FFSU).

## Les clubs techniques et technologiques

Compte tenu de la culture technologique historique du campus, plusieurs clubs associatifs développent des activités techniques de premier plan :

- **MiNET** : Association historique fondée en 1991, opérant en tant que fournisseur d'accès Internet associatif. Les étudiants membres gèrent de manière autonome le réseau fibré et les switchs reliant l'ensemble des résidences de la MAISEL. Une adhésion auprès de l'association permet d'activer le port Ethernet Gigabit de sa chambre.
- **HackademINT** : Club d'expertise en cybersécurité informatique. Les membres participent aux compétitions Capture The Flag (CTF) nationales et internationales et co-conçoivent des épreuves de référence telles que le *404 CTF*.
- **INTech** : Club de robotique et de mécatronique préparant chaque année des prototypes autonomes pour la Coupe de France de Robotique.
- **Gam’INT** : Pôle e-sport et gaming organisant des tournois en réseau local et sur consoles au Foyer.

## Création, médias et vie événementielle

- **INTv** : Club vidéo officiel du campus, assurant la captation, la régie et le montage vidéo de l'ensemble des manifestations étudiantes.
- **BPM** : Équipe spécialisée dans la sonorisation, la scénographie lumineuse et le mix DJ pour les soirées du Foyer et les galas.
- **Déclic** : Club de photographie couvrant les événements associatifs et publiant les reportages visuels du campus.
- **Welcom’** : Association dédiée à l'accueil, au parrainage et à l'accompagnement administratif des étudiants internationaux.
- **AbsINThe** : Équipe assurant la gestion et le service du bar associatif situé au rez-de-chaussée du Foyer.
- **Épicer’INT** : Épicerie solidaire gérée par les étudiants pour proposer des denrées alimentaires et produits de première nécessité à prix solidaire.

L'annuaire complet des structures étudiantes peut être consulté sur le portail associatif à l'adresse [portal.bananint.fr](https://portal.bananint.fr/) ainsi que sur le guide étudiant [welcom.theodarvoux.fr](https://welcom.theodarvoux.fr/).
`,
    },
    {
        id: 'campus-assos-vocabulaire',
        slug: 'expressions-associations-int-xrtc',
        title: 'Lexique & culture du campus : INT, XRTC et traditions',
        subtitle: 'Déchiffrer le vocabulaire, les acronymes et les coutumes transmis d’une promotion à l’autre.',
        metaTitle: 'Lexique étudiant Télécom SudParis : INT, XRTC et vocabulaire',
        metaDescription: 'Le glossaire complet du vocabulaire de Télécom SudParis : origine du suffixe INT, formule XRTC, rituels d’intégration et stickers.',
        keywords: ['Télécom SudParis', 'vocabulaire campus', 'INT', 'XRTC', 'traditions étudiantes'],
        category: 'campus',
        tags: ['Campus', 'TSP', 'Assos'],
        author,
        publishedAt: date,
        updatedAt: date,
        readingTime: '4 min',
        content: `Tout nouvel arrivant sur le campus d’Évry fait face à un lexique composé d’abréviations historiques, d'expressions locales et de rituels partagés. Voici les clés de décryptage indispensables.

## L'omniprésence du suffixe « INT »

Avant de prendre leurs dénominations actuelles de Télécom SudParis et IMT-BS, les deux écoles formaient ensemble l'**Institut National des Télécommunications (INT)**. Bien que les statuts aient évolué, l'acronyme INT reste le marqueur identitaire fondamental du campus.

Il est utilisé systématiquement dans les créations lexicales, les jeux de mots et les dénominations d'associations :
- **BananINT** (le clicker du campus)
- **HackademINT** (le club cyber)
- **Gam’INT** (le club jeu vidéo)
- **AbsINThe** (le bar étudiant du foyer)
- **Épicer’INT** (l'épicerie solidaire)

## L'expression « XRTC »

Formule omniprésente scandée lors des rassemblements et inscrite sur les affiches, **XRTC** signifie mot pour mot **« X Roule The Campus »**.

La règle de déclinaison locale est bien précise : la lettre *X* est remplacée par l'initiale ou le trigramme de l'entité concernée. Ainsi :
- MiNET devient **MRTC**
- BananINT devient **BRTC**
- Le Bureau des Élèves devient **BDERTC**

L'expression est une revendication festive d'énergie et de présence au sein de la vie étudiante.

## Les stickers comme marqueur d'appartenance

Les associations et clubs éditent leurs propres séries de stickers adhésifs. Collés en grand nombre sur les capots des ordinateurs portables, les casques ou les murs des locaux associatifs, ils constituent une signature visuelle immédiate permettant d'identifier les centres d'intérêt et l'implication de chacun.

## Le calendrier et le lexique des campagnes associatives

Le rythme de l'année est marqué par des périodes intenses de campagne pour le renouvellement des bureaux :
- **Calendrier échelonné** : La toute première campagne qui ouvre l'année au cours du premier semestre est la **campagne BDE**. Les autres campagnes associatives (notamment pour le BDA et l'ASINT) prennent le relais plus tard, principalement au second semestre.
- **Les Offrandes** : Des défis créatifs et humoristiques lancés aux équipes candidates (défis d'éloquence, présentations décalées, sketchs ou animations publiques).
- **Les Livrables** : Les obligations administratives, logistiques et financières rigoureuses (budgets prévisionnels, tableaux de trésorerie, sécurité des événements) attestant de la capacité opérationnelle des futurs gestionnaires.

## Les temps forts de rentrée

L'année universitaire s'articule autour de plusieurs jalons clés :
- **SEI (Semaine d'Intégration)** : Découverte des infrastructures, des promotions et des associations.
- **WEI (Week-end d'Intégration)** : Séjour de cohésion collective en début d'année.
- **Club B** : Soirée festive organisée au Foyer par BPM et l'AbsINThe, généralement le mercredi soir.
`,
    },
    {
        id: 'campus-maisel',
        slug: 'maisel-u1-u7-logements-telecom-sudparis',
        title: 'Guide des résidences MAISEL : comparatif de U1 à U7',
        subtitle: 'Emplacements, atmosphère et caractéristiques pratiques des sept bâtiments de logement du campus.',
        metaTitle: 'Résidences MAISEL U1 à U7 Télécom SudParis : guide pratique',
        metaDescription: 'Comparatif objectif des résidences étudiantes MAISEL à Évry : analyse des bâtiments U1 à U7, isolation acoustique, emplacement et vie quotidienne.',
        keywords: ['MAISEL', 'logement étudiant', 'Télécom SudParis', 'U1 U7', 'résidence Évry'],
        category: 'campus',
        tags: ['Campus', 'TSP', 'MAISEL'],
        author,
        publishedAt: date,
        updatedAt: date,
        readingTime: '4 min',
        content: `La **MAISEL** (Maison des Élèves) administre le parc de logements étudiants sur le campus d’Évry. Réparti sur sept bâtiments désignés de **U1 à U7**, ce parc présente des configurations spatiales et des environnements sonores très contrastés.

## Analyse bâtiment par bâtiment

### U1, U2 et U4 : La zone Foyer
- **Situation** : Bâtiments encadrant directement la cour et les abords immédiats du Foyer associatif.
- **Avantages** : Emplacement central, accès en quelques secondes aux locaux associatifs, aux événements et aux salles de travail.
- **Inconvénients** : Niveau d'exposition sonore élevé les soirs d'événements associatifs et de Club B. Idéal pour ceux qui souhaitent être au cœur de la vie festive, moins recommandé pour le calme absolu.

### U7 : Le standard moderne
- **Situation** : Situé au 14 rue Charles Fourier, à proximité immédiate du restaurant universitaire (le Ritz).
- **Avantages** : Le bâtiment le plus récent et moderne du campus. Conception récente, ascenseurs et salles de bain individuelles.
- **Inconvénients** : Très forte demande lors des sessions d'attribution de logements.

### U3 : L'aile internationale
- **Situation** : Positionné au nord du campus, plus au calme et légèrement en retrait des allées principales.
- **Avantages** : Environnement paisible entouré d'espaces verts. Historiquement, le U3 réunit une forte proportion d'étudiants internationaux venus en séjour académique.
- **Inconvénients** : Bâtiment légèrement excentré par rapport aux amphithéâtres.

### U5 : La configuration classique
- **Situation** : Emplacement central sur le campus.
- **Caractéristiques** : Bâtiment standard caractérisé par des plafonds plus bas et des couloirs centraux plus étroits. Logements fonctionnels au cœur de la circulation du campus.

### U6 : L'annexe hors-campus
- **Situation** : L'unique résidence MAISEL située entièrement en dehors de l'enceinte fermée du campus d'Évry.
- **Caractéristiques** : Nécessite un trajet quotidien (à pied, à vélo ou en transports) pour se rendre en cours. Offre un rythme de vie indépendant de l'effervescence directe du campus.

## Informations techniques et services

Toutes les résidences de la MAISEL partagent plusieurs caractéristiques de fonctionnement :
- **Connexion réseau MiNET** : Chaque chambre dispose d'une prise murale RJ45 raccordée directement au réseau administré par l'association MiNET. L'adhésion auprès de MiNET est requise pour activer le port Ethernet Gigabit.
- **Cuisines collectives** : Cuisines d'étage équipées de plaques de cuisson et de réfrigérateurs partagés.
- **Laveries** : Salles de machines à laver et sèche-linge à cartes réparties dans les différents bâtiments.

Pour recueillir les retours d'expérience et conseils des promotions précédentes, le serveur Discord des admissibles ([lien d'invitation](https://discord.com/invite/Us9QXdwt86)) constitue une base d'échange historique très consultée.
`,
    },
    {
        id: 'campus-nova-ritz',
        slug: 'nova-ritz-quotidien-campus-evry',
        title: 'Lieux clés du campus : Le Foyer, NOVA et Le Ritz',
        subtitle: 'Les points de passage obligatoires d’une journée type entre cours, travail collaboratif et restauration.',
        metaTitle: 'Lieux incontournables du campus : Foyer, NOVA et Ritz',
        metaDescription: 'Guide pratique des lieux de vie de Télécom SudParis : Foyer des élèves, espace NOVA et restaurant Le Ritz.',
        keywords: ['Télécom SudParis', 'NOVA', 'Ritz', 'Foyer', 'campus Évry', 'vie étudiante'],
        category: 'campus',
        tags: ['Campus', 'TSP', 'NOVA', 'Ritz'],
        author,
        publishedAt: date,
        updatedAt: date,
        readingTime: '4 min',
        content: `Le quotidien d’un étudiant sur le campus d’Évry s’articule autour de trois pôles majeurs : les moments associatifs au Foyer, le travail de projet à NOVA et les repas au Ritz.

## Le Foyer associatif : le cœur battant du campus

Situé au pied des résidences U1, U2 et U4, le Foyer est l'espace de rassemblement principal :
- **L'AbsINThe** : Le bar étudiant géré par l'association du même nom. C'est le point de rencontre incontournable pour les pauses de fin d'après-midi.
- **La Grande Salle (GS) et l'Espace Triangle** : Espaces modulables accueillant les tournois de jeux, les assemblées générales, les projections et les soirées du Club B.
- **Les locaux de clubs** : Les étages et couloirs abritent les ateliers et sièges des associations (studios vidéo INTv, régie BPM, salles de réunion BDE).

## NOVA : l'espace de projet et d'impression

Reconnaissable à son architecture circulaire singulière, NOVA est le bâtiment dédié au travail collaboratif et à la documentation :

### Répartition des espaces
- **Rez-de-chaussée** : Espace cafétéria avec tables de travail en groupe et distributeurs de boissons et en-cas.
- **Premier étage** : Médiathèque et bibliothèque universitaire, salles de projet insonorisées équipées d'écrans pour les travaux d'équipe, et zones d'étude individuelle.

### Le pôle d'impression central
NOVA abrite le parc d'imprimantes réseau du campus, alimenté par un quota de pages généreux attribué aux étudiants.

Ce pôle connaît deux types d'usages emblématiques :
1. **Le rush des examens** : Pour les épreuves où l'ensemble des documents papier est autorisé, les étudiants débitent des classeurs complets de polycopiés et d'annales quelques heures avant l'examen.
2. **Les impressions créatives et potaches** : Ce quota étendu nourrit également une tradition locale d'impressions humoristiques, d'affiches décalées ou de collages élaborés qui animent régulièrement la vie étudiante.

## Le Ritz : le restaurant universitaire du campus

Situé à proximité immédiate du bâtiment U7, le restaurant principal du campus — universellement désigné par les étudiants sous le nom du **Ritz** — concentre la quasi-totalité des déjeuners de midi.

### La cuisine et les services
Le restaurant propose des formules complètes (entrées, plats chauds, desserts). Si la qualité globale des repas est appréciée par les étudiants, les évolutions récentes de tarifs font l'objet de discussions régulières dans les promotions. En complément, la cafétéria de NOVA propose des solutions de restauration rapide pour manger sur le pouce.

### Le double sens du mot « Ritz »
Dans le vocabulaire du campus, le terme a acquis un sens dérivé : au sein des équipes de campagne associative et des grands projets de clubs, **le Ritz** désigne familièrement la personne qui prend en charge la cuisine et la logistique des repas pour l'équipe.
`,
    },
];
