import { useState, useEffect } from 'react';
import Modal from '@app/components/shared/Modal';
import { useGame } from '@app/context/GameContext';
import { MISSIONS_DATA, ACHIEVEMENTS_DATA } from '@app/data/gameData';
import { Target, Users, Banana, Lock, Medal } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: 'missions' | 'achievements';
}

export default function PlayerDossierModal({ isOpen, onClose, initialTab = 'missions' }: Props) {
    const { gameState, claimMission } = useGame();
    const [activeTab, setActiveTab] = useState<'missions' | 'achievements'>(initialTab);
    const [claimed, setClaimed] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) setActiveTab(initialTab);
    }, [isOpen, initialTab]);

    useEffect(() => {
        const saved = localStorage.getItem('claimedMissions');
        if (saved) setClaimed(JSON.parse(saved));
    }, []);

    const handleClaim = (missionId: string, reward: number) => {
        if (claimed.includes(missionId)) return;
        claimMission(missionId, reward);
        setClaimed(prev => {
            const next = [...prev, missionId];
            localStorage.setItem('claimedMissions', JSON.stringify(next));
            return next;
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="UNIT_DATABASE">
            <div className="flex border-b border-white/10 mb-6">
                <button
                    onClick={() => setActiveTab('missions')}
                    className={`flex-1 py-2 font-bold font-mono text-xs uppercase tracking-wider transition-colors ${activeTab === 'missions' ? 'border-b-2 border-banan-primary text-banan-primary' : 'text-white/30 hover:text-white/60'}`}
                >
                    CENTRE D'OPERATIONS
                </button>
                <button
                    onClick={() => setActiveTab('achievements')}
                    className={`flex-1 py-2 font-bold font-mono text-xs uppercase tracking-wider transition-colors ${activeTab === 'achievements' ? 'border-b-2 border-banan-primary text-banan-primary' : 'text-white/30 hover:text-white/60'}`}
                >
                    DOSSIER MÉRITE
                </button>
            </div>

            <div className="space-y-6">
                {activeTab === 'missions' && (
                    <>
                        {/* Personal Missions */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4 border-b border-white/10 pb-2">
                                Objectifs Personnels
                            </h3>
                            <div className="space-y-4">
                                {MISSIONS_DATA.filter(m => m.type === 'personal').map((mission) => {
                                    let rawProgress = 0;
                                    if (mission.id.startsWith('click_')) rawProgress = gameState.clickCount;
                                    if (mission.id.startsWith('earn_')) rawProgress = gameState.bananas;

                                    const progress = Math.min(mission.goal, rawProgress);
                                    const completed = progress >= mission.goal;
                                    const percent = Math.min(100, Math.floor((progress / mission.goal) * 100));
                                    const isClaimed = claimed.includes(mission.id);

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
                                                    <span>{progress} / {mission.goal}</span>
                                                </div>
                                                <div className="h-2 w-full bg-banan-black border border-white/10 overflow-hidden">
                                                    <div
                                                        className="h-full bg-banan-primary transition-all duration-500"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {completed && !isClaimed && (
                                                <button
                                                    onClick={() => handleClaim(mission.id, mission.reward)}
                                                    className="mt-4 w-full bg-banan-primary text-black font-bold text-xs uppercase py-2 hover:bg-white transition-colors"
                                                >
                                                    RÉCLAMER
                                                </button>
                                            )}
                                            {isClaimed && (
                                                <div className="mt-4 w-full bg-black border border-banan-primary text-banan-primary font-bold text-xs uppercase py-2 text-center pointer-events-none">
                                                    ACQUIS
                                                </div>
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
                                                    <div className="h-2 w-full bg-banan-black border border-white/10 overflow-hidden">
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
                    </>
                )}

                {activeTab === 'achievements' && (
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
                                        case 'team_player': isUnlocked = !!gameState.team; break;
                                    }
                                }
                            }

                            return (
                                <div
                                    key={achievement.id}
                                    className={`flex items-center gap-4 p-4 border border-white/10 ${isUnlocked ? 'bg-banan-primary/10 border-banan-primary/50' : 'bg-white/5 opacity-50'
                                        }`}
                                >
                                    <div className={`p-3 rounded-full border ${isUnlocked ? 'bg-banan-primary text-black border-banan-primary' : 'bg-banan-black text-white/30 border-white/10'}`}>
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
                )}
            </div>
        </Modal>
    );
}
