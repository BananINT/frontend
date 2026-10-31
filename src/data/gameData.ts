
import type { LucideIcon } from 'lucide-react';

export interface Achievement {
    id: string;
    label: string;
    description: string;
    icon?: LucideIcon; // Lucide icon
    unlocked: boolean;
}

export const ACHIEVEMENTS_DATA: Omit<Achievement, 'unlocked'>[] = [
    { id: 'first_click', label: 'Premier Pas', description: 'Cliquez sur la banane pour la première fois.' },
    { id: 'automation_start', label: 'Ingénieur', description: 'Achetez votre première amélioration automatique.' },
    { id: 'team_player', label: 'Esprit d\'Équipe', description: 'Rejoignez une équipe.' },
    // Earn track (based on current balance)
    { id: 'earn_1000', label: 'Débutant', description: 'Possédez 1 000 bananes.' },
    { id: 'earn_100000', label: 'Magasinier', description: 'Possédez 100 000 bananes.' },
    { id: 'earn_10000000', label: 'Magnat de la Banane', description: 'Possédez 10 Millions de bananes.' },
    { id: 'earn_1000000000', label: 'Milliardaire', description: 'Possédez 1 Milliard de bananes.' },
    { id: 'earn_100000000000', label: 'Trillionaire', description: 'Possédez 100 Milliards de bananes.' },
    { id: 'earn_10000000000000', label: 'Empereur Galactique', description: 'Possédez 10 Billions de bananes.' },
    // Click track
    { id: 'click_1000', label: 'Apprenti Cliqueur', description: 'Effectuez 1 000 clics.' },
    { id: 'click_10000', label: 'Maître Cliqueur', description: 'Effectuez 10 000 clics.' },
    { id: 'click_100000', label: 'Gourou du Clic', description: 'Effectuez 100 000 clics.' },
    { id: 'click_1000000', label: 'Doigt de Fer', description: 'Effectuez 1 000 000 clics.' },
    { id: 'click_10000000', label: 'Divinité du Clic', description: 'Effectuez 10 000 000 clics.' },
    // Prestige track
    { id: 'ach_prestige_1', label: 'Ascension Initiale', description: 'Effectuez votre première ascension cosmique.' },
    { id: 'ach_prestige_2', label: 'Accro à l\'Ascension', description: 'Effectuez 10 ascensions.' },
    { id: 'ach_prestige_3', label: 'Transcendance Bananière', description: 'Effectuez 50 ascensions.' },
    { id: 'ach_prestige_4', label: 'Divinité Primordiale', description: 'Effectuez 100 ascensions.' },
];
