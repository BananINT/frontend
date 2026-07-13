import Modal from '@app/components/shared/Modal';
import { useGame } from '@app/context/GameContext';
import { ACHIEVEMENTS_DATA } from '@app/data/gameData';
import { Lock, Medal } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function AchievementsModal({ isOpen, onClose }: Props) {
    const { gameState } = useGame();

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="DOSSIER MÉRITE"
        >
            <div className="space-y-4">
                {ACHIEVEMENTS_DATA.map((achievement) => {
                    let isUnlocked = gameState.unlockedAchievements.includes(achievement.id);
                    if (!isUnlocked) {
                        if (achievement.id.startsWith('click_')) {
                            const target = parseInt(achievement.id.split('_')[1]);
                            if (!isNaN(target)) isUnlocked = gameState.clickCount >= target;
                        } else if (achievement.id.startsWith('earn_')) {
                            const target = parseInt(achievement.id.split('_')[1]);
                            if (!isNaN(target)) isUnlocked = gameState.bananas >= target;
                        } else {
                            switch (achievement.id) {
                                case 'first_click': isUnlocked = gameState.clickCount >= 1; break;
                                case 'automation_start': isUnlocked = gameState.autoClickers > 0; break;
                                case 'team_player': isUnlocked = !!gameState.clan_id; break;
                            }
                        }
                    }

                    return (
                        <div
                            key={achievement.id}
                            className={`flex items-center gap-4 p-4 border border-white/10 ${isUnlocked ? 'bg-banan-primary/10 border-banan-primary/50' : 'bg-white/5 opacity-50'
                                }`}
                        >
                            <div className={`p-3 border ${isUnlocked ? 'bg-banan-primary text-black border-banan-primary' : 'bg-banan-black text-white/30 border-white/10'} rounded-full`}>
                                {isUnlocked ? <Medal className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                                <h3 className={`font-bold font-mono text-sm uppercase tracking-wider ${isUnlocked ? 'text-banan-primary' : 'text-white'}`}>
                                    {achievement.label}
                                </h3>
                                <p className="text-xs font-mono text-white/50 mt-1">
                                    {achievement.description}
                                </p>
                            </div>
                            {isUnlocked && (
                                <div className="text-[10px] font-mono text-banan-primary uppercase tracking-widest border border-banan-primary px-2 py-1">
                                    ACQUIS
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
}
