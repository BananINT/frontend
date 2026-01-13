
import Modal from '@/components/shared/Modal';
import { useGame } from '@/context/GameContext';
import { ACHIEVEMENTS_DATA } from '@/data/gameData';
import { Lock, Medal } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function AchievementsModal({ isOpen, onClose }: Props) {
    const { gameState } = useGame();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="DOSSIER_MÉRITE">
            <div className="space-y-4">
                {ACHIEVEMENTS_DATA.map((achievement) => {
                    const isUnlocked = gameState.unlockedAchievements.includes(achievement.id);

                    return (
                        <div
                            key={achievement.id}
                            className={`flex items-center gap-4 p-4 border border-white/10 ${isUnlocked ? 'bg-banan-primary/10 border-banan-primary/50' : 'bg-white/5 opacity-50'
                                }`}
                        >
                            <div className={`p-3 rounded-full border ${isUnlocked ? 'bg-banan-primary text-black border-banan-primary' : 'bg-black text-white/30 border-white/10'}`}>
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
