
export interface Achievement {
    id: string;
    label: string;
    description: string;
    icon?: any; // Lucide icon
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
    { id: 'banana_beginner', label: 'Débutant', description: 'Possédez 100 bananes.' },
    { id: 'banana_hoarder', label: 'Magasinier', description: 'Possédez 1 000 bananes.' },
    { id: 'automation_start', label: 'Ingénieur', description: 'Achetez votre première amélioration automatique.' },
];

export const MISSIONS_DATA: Omit<Mission, 'progress' | 'completed'>[] = [
    { id: 'click_100', label: 'Entraînement Manuel', description: 'Cliquez 100 fois.', goal: 100, reward: 50, type: 'personal' },
    { id: 'earn_500', label: 'Collecte Initiale', description: 'Gagnez 500 bananes au total.', goal: 500, reward: 200, type: 'personal' },
    { id: 'team_goal_1', label: 'Effort Collectif', description: 'L\'équipe doit générer 1M de bananes.', goal: 1000000, reward: 5000, type: 'team' },
];
