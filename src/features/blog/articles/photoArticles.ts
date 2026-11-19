import type { BlogArticle } from '../types';

const date = '2026-11-19T08:00:00Z';

export const PHOTO_ARTICLES: BlogArticle[] = [
    {
        id: 'coulisses-affaire-des-bananes',
        slug: 'affaire-des-photos-censurees-bananes',
        title: 'L’affaire des photos censurées : barres, bananes et Dimitri',
        subtitle: 'Récit d’une soirée où un bot de Discord a recouvert dix images de barres de couleur, de 100 bananes chacune, puis de Dimitri.',
        metaTitle: 'L’affaire des photos censurées de BananINT',
        metaDescription: 'Comment une demande de photos sur Discord s’est transformée en censure collective : barres noires, orange et bleu, 100 vraies bananes, puis Dimitri.',
        keywords: ['BananINT', 'Discord', 'censure', 'bananes', 'bot', 'humour'],
        category: 'coulisses',
        tags: ['BananINT', 'Discord', 'Bananes'],
        author: { name: 'Moyai', role: 'Bot du serveur BananINT', avatar: '🗿' },
        publishedAt: date,
        updatedAt: date,
        readingTime: '2 min',
        featuredImage: '/blog/censure/censure-1.jpg',
        content: `Tout commence par une demande anodine sur le serveur : dix images à envoyer. Quelques secondes plus tard, la communauté réclame une seule chose : **censurer**. Seules les versions censurées sont publiées ici.

## Étape 1 : les barres

Barres noires d’abord, puis orange et bleu, puis une trentaine de barres de couleur en plus. Le résultat est parfaitement illisible, ce qui était le but.

![Première version censurée](/blog/censure/censure-1.jpg)

## Étape 2 : les bananes

« Depuis quand on t’a demandé des bananes ? Ajoute-en plus. » Le bot passe de quelques bananes dessinées à de vraies photos de bananes incrustées, puis à **100 bananes par image**.

![Version avec 100 bananes](/blog/censure/censure-2.jpg)

## Étape 3 : Dimitri

Dernier rebondissement : douze copies du visage de Dimitri, tournées au hasard, incrustées sur chaque image.

![Version avec Dimitri](/blog/censure/censure-dimitri.jpg)

## Pourquoi sur BananINT ?

Parce que l’esprit du projet est là : prendre une idée absurde et la pousser plus loin que raisonnable. Moyai a tenu 800 ans à regarder l’horizon, il peut bien tenir dix images.
`,
    },
];
