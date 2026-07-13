
import type { LucideIcon } from 'lucide-react';

export interface Achievement {
    id: string;
    label: string;
    description: string;
    icon?: LucideIcon; // Lucide icon
    unlocked: boolean;
}

export interface Mission {
    id: string;
    label: string;
    description: string;
    progress: number;
    goal: number;
    reward: number; // Bananas
    completed: boolean;
    type: 'personal' | 'team';
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
];

export const MISSIONS_DATA: Omit<Mission, 'progress' | 'completed'>[] = [
    // Click missions
    { id: 'click_500', label: 'Échauffement', description: 'Cliquez 500 fois.', goal: 500, reward: 2500, type: 'personal' },
    { id: 'click_5000', label: 'Marathon de Clics', description: 'Cliquez 5 000 fois.', goal: 5000, reward: 50000, type: 'personal' },
    { id: 'click_50000', label: 'Hyperactif', description: 'Cliquez 50 000 fois.', goal: 50000, reward: 1000000, type: 'personal' },
    { id: 'click_500000', label: 'Tendon d\'Achille', description: 'Cliquez 500 000 fois.', goal: 500000, reward: 25000000, type: 'personal' },
    // Earn missions
    { id: 'earn_10000', label: 'Collecte Initiale', description: 'Obtenez 10 000 bananes.', goal: 10000, reward: 5000, type: 'personal' },
    { id: 'earn_500000', label: 'Récolte Massive', description: 'Obtenez 500 000 bananes.', goal: 500000, reward: 100000, type: 'personal' },
    { id: 'earn_25000000', label: 'Empire de Bananes', description: 'Obtenez 25 Millions bananes.', goal: 25000000, reward: 5000000, type: 'personal' },
    { id: 'earn_1000000000', label: 'Monopole Mondial', description: 'Obtenez 1 Milliard bananes.', goal: 1000000000, reward: 250000000, type: 'personal' },
    // Team
    { id: 'team_goal_1', label: 'Effort Collectif', description: 'L\'équipe doit générer 10M de bananes.', goal: 10000000, reward: 50000, type: 'team' },
    { id: 'team_goal_2', label: 'Puissance de Groupe', description: 'L\'équipe doit générer 500M de bananes.', goal: 500000000, reward: 5000000, type: 'team' },
    { id: 'team_goal_3', label: 'Syndicat de la Banane', description: 'L\'équipe doit générer 50B de bananes.', goal: 50000000000, reward: 1000000000, type: 'team' },
];
