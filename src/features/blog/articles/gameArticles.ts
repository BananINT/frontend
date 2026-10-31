import type { BlogArticle } from '../types';

const author = { name: 'BananINT', role: 'Équipe du jeu', avatar: '🍌' };
const date = '2026-09-29T08:00:00Z';
const correctedAt = '2026-10-31T08:00:00Z';

export const GAME_ARTICLES: BlogArticle[] = [
    {
        id: 'guide-debutant',
        slug: 'guide-debutant-clicker-bananint',
        title: 'Bien commencer sur le clicker BananINT : guide & mécaniques',
        subtitle: 'Métriques clés, formules BPC/BPS, arbre d’améliorations, synergies et production hors ligne.',
        metaTitle: 'Guide débutant BananINT : BPC, BPS et améliorations',
        metaDescription: 'Bien démarrer sur le clicker BananINT : BPC et BPS, améliorations de clic et automatiques, synergies de production et gains hors ligne.',
        keywords: ['BananINT', 'clicker', 'guide débutant', 'BPC', 'BPS', 'améliorations'],
        category: 'tutoriel',
        tags: ['BananINT', 'Clicker', 'Débutant'],
        author,
        publishedAt: date,
        updatedAt: correctedAt,
        readingTime: '5 min',
        content: `Le clicker de [BananINT](/clicker) repose sur un système économique incrémental calibré pour équilibrer investissement actif et génération passive de bananes. Ce guide détaille les formules fondamentales et les paliers d'optimisation.

## Les deux piliers : BPC et BPS

L'économie du joueur s'articule autour de deux grandeurs :

1. **BPC (Bananes Par Clic)** : La valeur ajoutée à votre réserve à chaque interaction manuelle sur la banane centrale. La valeur de base est de 1 🍌 par clic.
2. **BPS (Bananes Par Seconde)** : Le flux continu généré automatiquement par vos infrastructures industrielles, sans nécessiter d'interaction physique.

\`\`\`mermaid
flowchart LR
    A[Cliquer] --> B[Gagner des bananes]
    B --> C[Choisir une amélioration]
    C --> D[Observer la progression]
    D --> A
\`\`\`

## Arbre des améliorations de Clic (BPC)

Les améliorations manuelles permettent de booster directement le rendement de vos clics :

| Amélioration | Coût de base | Bonus BPC | Description |
| :--- | :--- | :--- | :--- |
| **Better Fingers** | 10 🍌 | +1 BPC | Premier renfort musculaire |
| **Stronger Arms** | 100 🍌 | +5 BPC | Puissance accrue par frappe |
| **Banana Gloves** | 1 000 🍌 | +20 BPC | Gants de préhension renforcés |
| **Banana Laser Gloves** | 10 000 🍌 | +60 BPC | Focalisation laser par impulsion |
| **Banana Peeler** | 100 000 🍌 | +120 BPC | Éplucheur semi-automatique |
| **Hydraulic Banana Press** | 1 000 000 🍌 | +500 BPC | Presse hydraulique haute pression |
| **Cybernetic Ape Arms** | 10 000 000 🍌 | +2 000 BPC | Prothèses cybernétiques avancées |
| **Banana Neural Net** | 100 000 000 🍌 | +8 000 BPC | Réseau de neurones prédictif |
| **Quantum Finger Extension** | 1 000 000 000 🍌 | +35 000 BPC | Extension quantique multi-plans |
| **The Golden Touch** | 10 000 000 000 🍌 | +150 000 BPC | Transmutation dorée au toucher |

## Arbre des améliorations automatiques (BPS)

Les infrastructures automatisées garantissent un revenu passif régulier, même lorsque vous n'interagissez pas avec le jeu :

- **Banana Tree** (50 🍌) : +1 BPS
- **Banana Harvester Bot** (500 🍌) : +10 BPS
- **Banana Plantation** (5 000 🍌) : +80 BPS
- **Banana Factory** (50 000 🍌) : +400 BPS
- **Banana Enrichment Center** (500 000 🍌) : +1 600 BPS
- **Banana Shipping Fleet** (5 000 000 🍌) : +4 800 BPS
- **Banana Space Program** (50 000 000 🍌) : +25 000 BPS
- **Banana Multiverse Farm** (500 000 000 🍌) : +180 000 BPS
- **Intergalactic Banana Trade** (5 000 000 000 🍌) : +1 500 000 BPS
- **Dyson Sphere** (50 000 000 000 🍌) : +12 000 000 BPS
- **Banana Singularity** (500 000 000 000 🍌) : +100 000 000 BPS
- **Omniversal Banana Nexus** (5 000 000 000 000 🍌) : +800 000 000 BPS
- **God of Bananas** (50 000 000 000 000 🍌) : +6 000 000 000 BPS

## Les upgrades de Synergie

Disponibles en milieu de partie, ces améliorations créent des effets croisés démultiplicateurs :
- **Auto-clicker Bots** (1 000 000 🍌) : Déclenche un clic automatique toutes les 10 secondes.
- **Photosynthetic Bananas** (100 000 000 🍌) : Confère **+10% de puissance de clic** par bâtiment automatique possédé.
- **Kinetic Feedback Loop** (10 000 000 000 🍌) : Confère **+5% de BPS** par amélioration de clic acquise.
- **Recursive Banana Cloning** (1 000 000 000 000 🍌) : Double l'intégralité de la production automatique de base.
- **Hive-Mind Apes** (100 000 000 000 000 🍌) : Double l'intégralité de la production de clic de base.

## Et après ?

Quand la progression finit par ralentir, une autre étape s'ouvre à qui va assez loin. On vous laisse la découvrir en jeu.

## La production AFK

Le backend de BananINT intègre un calcul d'absence : à chaque reconnexion, le serveur évalue la durée écoulée et crédite votre compte d'un montant de bananes basé sur votre BPS actif.
`,
    },
    {
        id: 'guide-marche',
        slug: 'guide-bourse-trading',
        title: 'Guide de la bourse BananINT : cours, actifs et volatilité',
        subtitle: 'Comprendre les trois tiers d’actifs, leur volatilité et le fonctionnement des achats et ventes.',
        metaTitle: 'Bourse de BananINT : trading, actions et volatilité',
        metaDescription: 'Le marché boursier de BananINT : les six actions réparties en trois tiers (BNDAQ, BG, OGM, CYBR, FED, QNTM), leur volatilité et l’achat ou la vente au cours affiché.',
        keywords: ['BananINT', 'bourse', 'trading', 'marché', 'actions', 'volatilité'],
        category: 'guide',
        tags: ['BananINT', 'Trading', 'Guide'],
        author,
        publishedAt: date,
        updatedAt: correctedAt,
        readingTime: '4 min',
        content: `Accessible depuis l'onglet marché du [clicker](/clicker), la bourse de BananINT est une simulation économique en temps réel. Les cours oscillent sous l'influence combinée d'un algorithme de retour à la moyenne (*mean reversion*) et des transactions massives opérées par les joueurs.

## Les trois Tiers d'actifs financiers

Le marché est structuré en trois paliers de capitalisation pour correspondre aux différentes phases de progression des joueurs :

### Tier 1 : Retail Penny Market (Début de partie : 1 000 à 10M 🍌)
- **BNDAQ (BanaNASDAQ)** :
  - *Type* : Actif stable.
  - *Prix de base* : 15 🍌 | *Volatilité* : Faible (5%).
  - *Profil* : La valeur refuge de départ pour sécuriser ses premiers profits.
- **BG (BanaGone)** :
  - *Type* : Actif spéculatif (meme coin).
  - *Prix de base* : 150 🍌 | *Volatilité* : Très élevée (40%).
  - *Profil* : Idéal pour des opérations d'achat/revente rapides sur de fortes amplitudes.

### Tier 2 : Institutional Tech Market (Milieu de partie : 10M à 10B 🍌)
- **OGM (OGM BioTech)** :
  - *Type* : Actif de croissance stable.
  - *Prix de base* : 50 000 🍌 | *Volatilité* : Modérée (20%).
  - *Profil* : Laboratoire de recherche bananière, valeur de croissance plus calme que ses voisines.
- **CYBR (TorBanana Cybernetics)** :
  - *Type* : Actif technologique volatile.
  - *Prix de base* : 250 000 🍌 | *Volatilité* : Élevée (35%).
  - *Profil* : Valeur technologique réagissant fortement aux cycles de marché.

### Tier 3 : Sovereign Whales Market (Fin de partie : 10B à 50T+ 🍌)
- **FED (Banque Fédérale du Potassium)** :
  - *Type* : Actif institutionnel ultra-stable.
  - *Prix de base* : 10 000 000 🍌 | *Volatilité* : Très faible (8%).
  - *Profil* : Le placement le plus stable de la fin de partie, pour garer des dizaines de milliards.
- **QNTM (Quantum Singularity Corp)** :
  - *Type* : Actif spéculatif pour baleines.
  - *Prix de base* : 100 000 000 🍌 | *Volatilité* : Maximale (50%).
  - *Profil* : Conçu pour les portefeuilles massifs cherchant des swings spectaculaires.

## Acheter et vendre

Les ordres s'exécutent au marché : vous achetez ou vendez instantanément au cours affiché. Pas de carnet d'ordres à remplir, il faut être là au bon moment.
`,
    },
    {
        id: 'guide-clans',
        slug: 'tutoriel-osint-guerre-de-clans',
        title: 'Découvrir les clans et l’OSINT de BananINT : guide stratégique',
        subtitle: 'Trésorerie commune, Taxe Potassium, hacking coopératif, vol de coffre et roulette.',
        metaTitle: 'Clans et OSINT dans BananINT : guide stratégique complet',
        metaDescription: 'Guide stratégique des clans dans BananINT : gestion du coffre-fort, taxe potassium, bonus de loyauté, opérations OSINT, atouts et Ape Roulette.',
        keywords: ['BananINT', 'clans', 'OSINT', 'stratégie', 'coopération', 'potassium tax'],
        category: 'strategie',
        tags: ['BananINT', 'Clans', 'Guide'],
        author,
        publishedAt: date,
        updatedAt: correctedAt,
        readingTime: '5 min',
        content: `Les [clans](/clan) introduisent une dimension sociale et coopérative à l'économie de BananINT. Rejoindre une faction permet de mutualiser des fonds, de financer de nouveaux joueurs, de développer des atouts collectifs et de mener des opérations offensives de renseignement (OSINT).

## Création et administration d'un Clan

- **Coût de création** : La fondation d'un clan requiert un versement initial de **1 000 000 000 🍌** (1 Milliard).
- **Régimes de confidentialité** :
  - *Public* : Tout joueur sans clan peut rejoindre librement l'unité.
  - *Sur invitation* : L'accès requiert une invitation émise par un membre existant.
  - *Privé* : Les candidatures sont closes.

## Le Coffre-fort et la Taxe Potassium

Le coffre-fort de clan constitue la réserve financière collective de votre faction.

### La Taxe Potassium volontaire
Chaque joueur peut régler individuellement son curseur de **Taxe Potassium de 0% à 50%** :
- À chaque synchronisation avec le serveur, le pourcentage choisi est automatiquement prélevé sur vos gains (clics et production automatique) et crédité sur la trésorerie du clan.
- Les bananes prélevées comptent comme vos dons au coffre-fort, au même titre qu'un dépôt manuel.

### Le Bonus de Loyauté
Le don de bananes n'est pas un sacrifice à perte : vos dons cumulés au coffre-fort vous octroient un bonus multiplicateur de production (BPC et BPS) qui progresse de **+1% par 100 Millions 🍌** versés, plafonné à **+25%**. Le bonus s'applique tant que vous restez membre du clan.

## Le Pack Nouveau (Starter Pack)

Pour accélérer la montée en puissance des nouvelles recrues, les clans peuvent puiser dans leur trésorerie collective :
- **Coût** : 5 000 000 000 🍌 (5 Milliards) prélevés du coffre.
- **Critère d'éligibilité** : Le bénéficiaire doit posséder moins de 30 améliorations au total.
- **Effet** : Octroie instantanément **+5 niveaux** sur les 4 premières améliorations de clic et automatiques du joueur cible (*Better Fingers, Stronger Arms, Banana Tree, Banana Harvester Bot*).

## L'Arbre des Atouts de Clan (Clan Perks)

La trésorerie commune finance des améliorations collectives permanentes qui profitent à chaque membre :
- **Turbo-Mûrissement** : Réduit le coût des améliorations individuelles (clic et automatique) de **5% par niveau**.
- **Bouclier Cyber** : Réduit de **10% par niveau** les pertes de bananes subies lors d'attaques cyber hostiles.
- **Extracteur de Potassium** : Augmente la production de BPC et BPS de tous les membres du clan de **3% par niveau**.

## Opérations OSINT & Piratage Inter-Clans

Le terminal d'opérations permet de lancer des offensives coordonnées sur le réseau :
- **Scan réseau** : Un scan coûte **100 000 000 🍌** prélevés de la trésorerie pour découvrir 3 cibles potentielles de difficulté 1 à 6.
- **Entraide coordonnée** : Chaque membre connecté qui clique sur *Aider* réduit instantanément le compte à rebours de **15% de la durée totale** de l'opération.
- **Le vol de coffre inter-clans (Difficulté ≥ 4)** : À haut niveau de difficulté, le système peut identifier comme cible la trésorerie d'un clan rival parmi les plus riches. Une infiltration réussie permet alors de **dérober jusqu'à 10% du coffre-fort du clan ciblé** et de transférer ce butin directement dans votre propre trésorerie !
- **Contrats d'Élite** : Des missions temporaires de clan (dépôts de capital massifs, séries d'opérations OSINT) à remplir avant une échéance, avec des primes versées au coffre allant de quelques dizaines de millions à plusieurs milliards de bananes. Un seul contrat peut être actif à la fois.

## L'Ape Roulette (Le barillet partagé)

Pour les amateurs de prise de risque collective, l'Ape Roulette propose un jeu de barillet mécanique partagé entre les membres du clan :
- **Mécanique** : Un barillet de 6 chambres contenant **5 chambres saines (\`SAFE\`)** et **1 chambre piégée (\`DUD\`)**.
- **Coût par tirage** : 10 000 000 🍌 (10M). 10% de chaque mise alimente le Jackpot Mondial.
- **Tirage réussi** : Paiement immédiat de **30 000 000 🍌** (multiplicateur x3), avec 1% de chance de déclencher un *Potassium Surge* qui ajoute une part de la cagnotte mondiale au gain.
- **Tirage piégé** : Les chambres sont tirées l'une après l'autre et le barillet n'est rechargé qu'après l'explosion. Celui qui tombe sur la chambre piégée se retrouve **« Couvert de suie »** pendant **5 minutes (300 secondes)** : ses clics ne rapportent plus rien et le casino lui est fermé jusqu'à la fin du malus.
`,
    },
];
