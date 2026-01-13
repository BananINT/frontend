
import Modal from '@/components/shared/Modal';
import { useGame } from '@/context/GameContext';
import { MISSIONS_DATA } from '@/data/gameData';
import { Target, Users, Banana } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function MissionsModal({ isOpen, onClose }: Props) {
    const { gameState, claimMission } = useGame();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="CENTRE_OPERATIONS">
            <div className="space-y-6">
                {/* Personal Missions */}
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4 border-b border-white/10 pb-2">
                        Objectifs Personnels
                    </h3>
                    <div className="space-y-4">
                        {MISSIONS_DATA.filter(m => m.type === 'personal').map((mission) => {
                            const progressData = gameState.missionProgress[mission.id] || { progress: 0, completed: false };
                            const percent = Math.min(100, Math.floor((progressData.progress / mission.goal) * 100));

                            return (
                                <div key={mission.id} className="p-4 bg-white/5 border border-white/10 hover:border-banan-primary/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-banan-primary" />
                                                <span className="font-bold font-mono text-sm uppercase text-white">{mission.label}</span>
                                            </div>
                                            <p className="text-xs text-white/50 mt-1 font-mono">{mission.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-banan-primary flex items-center gap-1">
                                                +{mission.reward} <Banana className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex justify-between text-[10px] font-mono text-white/70 mb-1">
                                            <span>PROGRESSION</span>
                                            <span>{progressData.progress} / {mission.goal}</span>
                                        </div>
                                        <div className="h-2 w-full bg-black border border-white/10 overflow-hidden">
                                            <div
                                                className="h-full bg-banan-primary transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {progressData.completed && (
                                        <button
                                            onClick={() => claimMission(mission.id)}
                                            className="mt-4 w-full bg-banan-primary text-black font-bold text-xs uppercase py-2 hover:bg-white transition-colors"
                                        >
                                            RÉCLAMER
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Team Missions */}
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                        Objectifs d'Unité <Users className="h-3 w-3" />
                    </h3>
                    <div className="space-y-4">
                        {MISSIONS_DATA.filter(m => m.type === 'team').map((mission) => {
                            // Mock team progress for now
                            const progress = 125000;
                            const percent = Math.min(100, Math.floor((progress / mission.goal) * 100));

                            return (
                                <div key={mission.id} className="p-4 bg-banan-primary/5 border border-banan-primary/20 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Users className="w-24 h-24 text-banan-primary" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold font-mono text-sm uppercase text-white">{mission.label}</span>
                                                    <span className="text-[10px] bg-banan-primary text-black px-1 font-bold">CO-OP</span>
                                                </div>
                                                <p className="text-xs text-white/50 mt-1 font-mono">{mission.description}</p>
                                            </div>
                                            <span className="text-xs font-bold text-banan-primary flex items-center gap-1">
                                                +{mission.reward} <Banana className="h-3 w-3" />
                                            </span>
                                        </div>
                                        <div className="mt-4">
                                            <div className="flex justify-between text-[10px] font-mono text-white/70 mb-1">
                                                <span>PROGRESSION GLOBALE</span>
                                                <span>{(progress / 1000).toFixed(1)}k / {(mission.goal / 1000).toFixed(0)}k</span>
                                            </div>
                                            <div className="h-2 w-full bg-black border border-white/10 overflow-hidden">
                                                <div
                                                    className="h-full bg-white transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
