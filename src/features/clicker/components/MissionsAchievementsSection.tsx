import { useState, useEffect } from 'react';
import { Target, Users, Banana, Medal, Lock, CheckCircle2 } from 'lucide-react';
import GameSection from '@app/components/shared/GameSection';
import { useGame } from '@app/context/GameContext';
import { ACHIEVEMENTS_DATA } from '@app/data/gameData';
import { formatNumber } from '@app/utils/format';

export default function MissionsAchievementsSection() {
    const { gameState, claimMission, getMissions } = useGame();
    const [missionTab, setMissionTab] = useState<'personal' | 'clan'>('personal');

    // getMissions is a stable callback, so this fetches once on mount;
    // game_update triggers a refetch when missions complete.
    useEffect(() => {
        getMissions();
    }, [getMissions]);

    const missions = gameState.missions || [];
    const filteredMissions = missions.filter(m => m.type === missionTab);

    // Compute achievements unlocked count
    const totalAchievements = ACHIEVEMENTS_DATA.length;
    const unlockedAchievementsCount = ACHIEVEMENTS_DATA.filter((ach) => {
        let isUnlocked = gameState.unlockedAchievements.includes(ach.id);
        if (!isUnlocked) {
            if (ach.id.startsWith('click_')) {
                const target = parseInt(ach.id.split('_')[1]);
                if (!isNaN(target)) isUnlocked = gameState.clickCount >= target;
            } else if (ach.id.startsWith('earn_')) {
                const target = parseInt(ach.id.split('_')[1]);
                if (!isNaN(target)) isUnlocked = gameState.bananas >= target;
            } else if (ach.id.startsWith('ach_prestige_')) {
                switch (ach.id) {
                    case 'ach_prestige_1': isUnlocked = gameState.prestigeCount >= 1; break;
                    case 'ach_prestige_2': isUnlocked = gameState.prestigeCount >= 10; break;
                    case 'ach_prestige_3': isUnlocked = gameState.prestigeCount >= 50; break;
                    case 'ach_prestige_4': isUnlocked = gameState.prestigeCount >= 100; break;
                }
            } else {
                switch (ach.id) {
                    case 'first_click': isUnlocked = gameState.clickCount >= 1; break;
                    case 'automation_start': isUnlocked = gameState.autoClickers > 0; break;
                    case 'team_player': isUnlocked = !!gameState.clan_id; break;
                }
            }
        }
        return isUnlocked;
    }).length;

    const achPercent = Math.round((unlockedAchievementsCount / Math.max(1, totalAchievements)) * 100);

    return (
        <GameSection
            id="operations-section"
            title="CENTRE D'OPÉRATIONS & DISTINCTIONS DU BANANIER"
            icon={Target}
            className="w-full border-t border-white/10 p-0"
            headerClassName="p-4 mb-0"
            rightElement={
                <div className="font-mono text-[10px] text-white/50 flex items-center gap-2">
                    <Medal className="h-3 w-3 text-banan-primary" />
                    ACCOMPLISSEMENT GLOBAL : <span className="font-bold text-banan-primary">{unlockedAchievementsCount}/{totalAchievements} ({achPercent}%)</span>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 w-full">
                
                {/* COLUMN 1: MISSIONS & CONTRATS */}
                <div className="p-4 md:p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-banan-primary" />
                            <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                                Missions & Protocoles Actifs
                            </h3>
                        </div>
                        <div className="flex border border-white/10">
                            <button
                                onClick={() => setMissionTab('personal')}
                                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-colors ${
                                    missionTab === 'personal' ? 'bg-banan-primary text-black' : 'text-white/40 hover:text-white'
                                }`}
                            >
                                Personnelles
                            </button>
                            <button
                                onClick={() => setMissionTab('clan')}
                                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-colors flex items-center gap-1 ${
                                    missionTab === 'clan' ? 'bg-banan-primary text-black' : 'text-white/40 hover:text-white'
                                }`}
                            >
                                <Users className="h-3 w-3" /> Unité (Clan)
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                        {filteredMissions.length === 0 ? (
                            <div className="p-8 text-center text-xs font-mono text-white/30 uppercase">
                                {missionTab === 'clan' && !gameState.clan_id
                                    ? "Rejoignez un clan pour débloquer les missions d'unité."
                                    : "Aucune mission en cours dans cette catégorie."}
                            </div>
                        ) : (
                            filteredMissions.map((mission) => {
                                const progress = mission.progress || 0;
                                const completed = mission.completed;
                                const percent = Math.min(100, Math.floor((progress / Math.max(1, mission.target)) * 100));
                                const isClaimed = mission.claimed;
                                const hasPersonal = typeof mission.personalTarget === 'number' && mission.personalTarget > 0;
                                const personalProgress = mission.personalProgress || 0;
                                const personalTarget = mission.personalTarget || 0;
                                const personalPercent = hasPersonal
                                    ? Math.min(100, Math.floor((personalProgress / personalTarget) * 100))
                                    : 0;

                                return (
                                    <div
                                        key={mission.id}
                                        className="p-4 bg-white/5 border border-white/10 hover:border-banan-primary/40 transition-colors flex flex-col justify-between"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-3.5 w-3.5 text-banan-primary" />
                                                    <span className="font-bold font-mono text-xs uppercase text-white">{mission.name}</span>
                                                </div>
                                                <p className="text-[10px] text-white/50 mt-1 font-mono">{mission.desc}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-banan-primary font-mono flex items-center gap-1">
                                                    +{formatNumber(mission.reward)} <Banana className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            <div className="flex justify-between text-[9px] font-mono text-white/60 mb-1">
                                                <span>{hasPersonal ? 'PROGRESSION CLAN' : 'PROGRESSION'}</span>
                                                <span>{formatNumber(progress)} / {formatNumber(mission.target)} ({percent}%)</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-black border border-white/10 overflow-hidden">
                                                <div
                                                    className="h-full bg-banan-primary transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            {hasPersonal && (
                                                <>
                                                    <div className="flex justify-between text-[9px] font-mono text-white/60 mt-2 mb-1">
                                                        <span>VOTRE CONTRIBUTION</span>
                                                        <span>{formatNumber(personalProgress)} / {formatNumber(personalTarget)} ({personalPercent}%)</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-black border border-white/10 overflow-hidden">
                                                        <div
                                                            className="h-full bg-banan-primary/60 transition-all duration-500"
                                                            style={{ width: `${personalPercent}%` }}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {completed && !isClaimed && (
                                            <button
                                                onClick={() => claimMission(mission.id)}
                                                className="mt-3 w-full bg-banan-primary text-black font-bold font-mono text-xs uppercase py-2 hover:bg-white transition-colors shadow-[0_0_12px_rgba(250,222,0,0.4)]"
                                            >
                                                RÉCLAMER RÉCOMPENSE
                                            </button>
                                        )}
                                        {isClaimed && (
                                            <div className="mt-3 w-full bg-black/60 border border-banan-primary/30 text-banan-primary/60 font-bold font-mono text-[10px] uppercase py-1.5 text-center flex items-center justify-center gap-1.5">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> REÇU
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* COLUMN 2: DOSSIER MÉRITE & SUCCÈS */}
                <div className="p-4 md:p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                            <Medal className="h-4 w-4 text-banan-primary" />
                            <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                                Dossier Mérite & Distinctions
                            </h3>
                        </div>
                        <div className="text-[10px] font-mono text-white/40">
                            {unlockedAchievementsCount} / {totalAchievements} ACQUIS
                        </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div>
                        <div className="w-full h-1.5 bg-black border border-white/10 overflow-hidden">
                            <div
                                className="h-full bg-banan-primary transition-all duration-500"
                                style={{ width: `${achPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1">
                        {ACHIEVEMENTS_DATA.map((ach) => {
                            let isUnlocked = gameState.unlockedAchievements.includes(ach.id);
                            if (!isUnlocked) {
                                if (ach.id.startsWith('click_')) {
                                    const target = parseInt(ach.id.split('_')[1]);
                                    if (!isNaN(target)) isUnlocked = gameState.clickCount >= target;
                                } else if (ach.id.startsWith('earn_')) {
                                    const target = parseInt(ach.id.split('_')[1]);
                                    if (!isNaN(target)) isUnlocked = gameState.bananas >= target;
                                } else if (ach.id.startsWith('ach_prestige_')) {
                                    switch (ach.id) {
                                        case 'ach_prestige_1': isUnlocked = gameState.prestigeCount >= 1; break;
                                        case 'ach_prestige_2': isUnlocked = gameState.prestigeCount >= 10; break;
                                        case 'ach_prestige_3': isUnlocked = gameState.prestigeCount >= 50; break;
                                        case 'ach_prestige_4': isUnlocked = gameState.prestigeCount >= 100; break;
                                    }
                                } else {
                                    switch (ach.id) {
                                        case 'first_click': isUnlocked = gameState.clickCount >= 1; break;
                                        case 'automation_start': isUnlocked = gameState.autoClickers > 0; break;
                                        case 'team_player': isUnlocked = !!gameState.clan_id; break;
                                    }
                                }
                            }

                            return (
                                <div
                                    key={ach.id}
                                    className={`flex items-center gap-3 p-3 border transition-colors ${
                                        isUnlocked
                                            ? 'bg-banan-primary/5 border-banan-primary/40'
                                            : 'bg-white/5 border-white/10 opacity-50'
                                    }`}
                                >
                                    <div
                                        className={`p-2 border rounded-full shrink-0 ${
                                            isUnlocked
                                                ? 'bg-banan-primary text-black border-banan-primary'
                                                : 'bg-black text-white/30 border-white/10'
                                        }`}
                                    >
                                        {isUnlocked ? <Medal className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-mono text-xs font-bold uppercase truncate ${
                                            isUnlocked ? 'text-banan-primary' : 'text-white/70'
                                        }`}>
                                            {ach.label}
                                        </div>
                                        <div className="text-[10px] font-mono text-white/40 truncate mt-0.5">
                                            {ach.description}
                                        </div>
                                    </div>
                                    {isUnlocked && (
                                        <span className="text-[9px] font-mono font-bold text-banan-primary border border-banan-primary/40 bg-banan-primary/10 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                            ACQUIS
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </GameSection>
    );
}
