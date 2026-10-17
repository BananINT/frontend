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
        keywords: ['BananINT', 'Télécom SudParis', 'clicker', 'bots', 'vie étudiante', 'HackademINT'],
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

Le clicker s'est alors transformé en banc d'essai pour les passionnés de cybersécurité, notamment au sein du club HackademINT (qui organise chaque année le 404 CTF). Certains ont tenté d'intercepter les requêtes HTTP et de manipuler les soldes. Mais le serveur d'authentification et de calcul faisait autorité : impossible de forcer arbitrairement l'état sans respecter les règles de validation du backend.

## Les records manuels et l'engouement

Pendant que certains affinaient leurs scripts d'automatisation, d'autres joueurs ont poursuivi la voie du clic manuel pur : l'un d'eux est ainsi parvenu à franchir le cap de plusieurs millions de clics à la force du poignet avant qu'une mise à jour de structure ne réinitialise les compteurs.

Le premier jeu incluait déjà un système de rétention basé sur des récompenses différées après une période d'absence, préfigurant les mécaniques modernes d'AFK farming. Une reproduction visuelle de ce premier clicker historique reste d'ailleurs accessible sous forme d'easter egg au sein de l'application.

## La transition vers la stack moderne

Après ce premier engouement viral, les limites techniques du prototype initial ont nécessité une reconstruction complète :
- **Architecture applicative** : Réécriture du backend en Python 3.13 avec FastAPI et persistance sous PostgreSQL.
- **Transactions sécurisées** : Implémentation de verrous au niveau des lignes de base de données pour éliminer les conditions de concurrence.
- **Temps réel** : Mise en place d'une infrastructure WebSockets diffusant instantanément les événements de marché et les variations économiques.
- **Interface web** : Front-end réactif développé sous React et Tailwind CSS.

BananINT continue d'évoluer sur cette base : un projet d'ingénierie étudiant, conçu sur le campus et développé au fil des promotions.
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

- **MiNET** : Association historique fondée en 1991, opérant en tant que fournisseur d'accès Internet associatif. Les étudiants membres gèrent de manière autonome le réseau fibré et les switchs reliant l'ensemble des résidences de la MAISEL (plus de 1 000 chambres équipées en prises RJ45 Gigabit).
- **HackademINT** : Club d'expertise en cybersécurité informatique. Les membres participent aux compétitions Capture The Flag (CTF) nationales et internationales et co-conçoivent des épreuves de référence telles que le *404 CTF*.
- **INTech** : Club de robotique et de mécatronique préparant chaque année des prototypes autonomes pour la Coupe de France de Robotique.
- **Gam’INT** : Pôle e-sport et gaming organisant des tournois en réseau local et sur consoles au Foyer.

## Création, médias et vie événementielle

- **INTv** : Club vidéo officiel du campus, assurant la captation, la régie et le montage vidéo de l'ensemble des manifestations étudiantes.
- **BPM** : Équipe spécialisée dans la sonorisation, la scénographie lumineuse et le mix DJ pour les soirées du Foyer et les galas.
- **Déclic** : Club de photographie couvrant les événements associatifs et publiant les reportages visuels du campus.
- **Welcom’** : Association dédiée à l'accueil, au parrainage et à l'accompagnement administratif des étudiants internationaux.
- **AbsINThe** : Équipe assurant la gestion et le service du bar associatif situé au rez-de-chaussée du Foyer.

L'annuaire exhaustif et mis à jour des clubs est consultable sur le portail associatif du campus à l'adresse [portal.bananint.fr](https://portal.bananint.fr/).
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

Formule omniprésente scandée lors des rassemblements et inscrite sur les affiches : **XRTC** signifie mot pour mot **« X Roule The Campus »**.

La variable *X* est substituée par le nom d'un club, d'un collectif ou d'un projet (par exemple *« MiNET RTC »* ou *« BDA RTC »*). L'expression est une revendication festive d'énergie et de présence au sein de la vie étudiante.

## Les stickers comme marqueur d'appartenance

Les associations et clubs éditent leurs propres séries de stickers adhésifs. Collés en grand nombre sur les capots des ordinateurs portables, les casques ou les murs des locaux associatifs, ils constituent une signature visuelle immédiate permettant d'identifier les centres d'intérêt et l'implication de chacun.

## Le calendrier des campagnes associatives

Le premier semestre est rythmé par les périodes de campagne pour l'élection des nouveaux bureaux :
- **Défis créatifs** : Les équipes candidates organisent des animations publiques, des présentations thématiques et des contenus humoristiques pour faire connaître leur projet.
- **Dossiers de gestion** : Au-delà de l'animation, chaque équipe candidate doit soumettre des livrables de gestion rigoureux (budgets prévisionnels, tableaux de trésorerie, plannings logistiques) démontrant sa capacité à administrer l'association.

## Les temps forts de rentrée

L'année universitaire s'articule autour de plusieurs jalons clés :
- **SEI (Semaine d'Intégration)** : Découverte des infrastructures, des promotions et des associations.
- **WEI (Week-end d'Intégration)** : Séjour de cohésion collective en début d'année.
- **Club B** : Soirée festive hebdomadaire du mercredi soir organisée au Foyer par BPM et l'AbsINThe.
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
- **Situation** : Situés à proximité immédiate ou directement au-dessus du Foyer associatif.
- **Avantages** : Emplacement central, accès en quelques secondes aux locaux associatifs, aux événements et aux salles de travail.
- **Inconvénients** : Niveau d'exposition sonore élevé les soirs d'événements associatifs et de Club B. À privilégier si vous souhaitez participer activement à la vie nocturne du campus.

### U7 : Le standard moderne
- **Situation** : 14 rue Charles Fourier, en face du restaurant universitaire (le Ritz).
- **Avantages** : Bâtiment le plus récent du campus. Conception moderne, ascenseurs, isolation acoustique renforcée et salles de bain individuelles récentes.
- **Inconvénients** : Forte demande lors des attributions de chambres.

### U3 : L'aile internationale
- **Situation** : Positionné au nord du campus, légèrement en retrait des allées principales.
- **Avantages** : Environnement calme entouré d'espaces verts. Historiquement, le U3 accueille une forte concentration d'étudiants internationaux venus en échange académique.
- **Inconvénients** : Bâtiment légèrement excentré par rapport aux amphithéâtres.

### U5 : La configuration classique
- **Situation** : Emplacement intermédiaire sur le campus.
- **Caractéristiques** : Bâtiment standard à couloirs centraux étroits et hauteur sous plafond classique. Chambres fonctionnelles sans spécificité architecturale particulière.

### U6 : L'annexe hors-campus
- **Situation** : Seul bâtiment situé en dehors de l'enceinte fermée du campus d'Évry.
- **Caractéristiques** : Nécessite un court trajet à pied ou à vélo pour rejoindre les cours. Environnement indépendant du rythme direct du foyer.

## Informations techniques et services

Toutes les résidences de la MAISEL partagent plusieurs caractéristiques de fonctionnement :
- **Connexion réseau MiNET** : Chaque chambre dispose d'une prise murale RJ45 raccordée directement au réseau Gigabit administré par l'association MiNET. Une inscription auprès de MiNET est requise pour activer le port Ethernet.
- **Cuisines collectives** : Cuisines d'étage équipées de plaques de cuisson et de réfrigérateurs partagés.
- **Laveries** : Salles de machines à laver et sèche-linge à cartes réparties dans les différents bâtiments.

Pour recueillir les avis directs des promotions précédentes, le serveur Discord des admissibles ([rejoindre l'invitation](https://discord.com/invite/Us9QXdwt86)) constitue une base d'échange historique très active.
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

Situé au pied des résidences U1 et U2, le Foyer est l'espace de rassemblement principal :
- **L'AbsINThe** : Le bar étudiant géré par l'association du même nom. C'est le point de rencontre pour les pauses de fin d'après-midi.
- **La Grande Salle (GS) et l'Espace Triangle** : Espaces modulables accueillant les tournois de jeux, les assemblées générales, les projections et les soirées étudiantes du mercredi (Club B).
- **Les locaux de clubs** : Les étages et couloirs adjacents abritent les ateliers et sièges des associations (studios vidéo INTv, régie BPM, salles de réunion BDE).

## NOVA : l'espace de projet et d'impression

Reconnaissable à son architecture circulaire singulière, NOVA est le bâtiment dédié au travail collaboratif et à la documentation :

### Répartition des espaces
- **Rez-de-chaussée** : Espace cafétéria, tables de travail en groupe informel et distributeurs automatiques de boissons et snacks.
- **Premier étage** : Médiathèque et bibliothèque universitaire, salles de projet insonorisées équipées d'écrans pour les travaux d'équipe, et zones d'étude individuelle silencieuse.

### Le pôle d'impression central
NOVA abrite le parc d'imprimantes réseau du campus. Chaque étudiant bénéficie d'un quota annuel de pages pour ses travaux universitaires. 

Ce pôle connaît un pic d'affluence caractéristique à l'approche des sessions de partiels : dans plusieurs matières autorisant l'ensemble des documents papier en examen, les imprimantes tournent à plein régime pour débiter des classeurs entiers de cours et d'annales corrigées.

## Le Ritz : le restaurant universitaire du campus

Situé à proximité immédiate du bâtiment U7, le restaurant principal du campus — universellement désigné par les étudiants sous le nom du **Ritz** — concentre la quasi-totalité des déjeuners de midi.

### La cuisine et les services
Le restaurant propose des formules complètes (entrées, plats chauds, desserts). Si la qualité globale des repas est reconnue par les étudiants, les évolutions récentes de tarifs font l'objet de discussions régulières dans les promotions. En complément, la cafétéria de NOVA propose des solutions de restauration rapide sur le pouce.

### Le double sens du mot « Ritz »
Dans le vocabulaire du campus, le terme a acquis un sens dérivé : au sein des équipes de campagne associative et des grands projets de clubs, **le Ritz** désigne la personne officiellement responsable de la logistique alimentaire et de la préparation des repas pour l'équipe.
`,
    },
];
