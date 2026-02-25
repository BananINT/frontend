import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Users, Fingerprint, Save, LogIn } from 'lucide-react';
import GameSection from '@/components/shared/GameSection';

export default function SessionManager() {
    const { gameState, changeName, joinTeam } = useGame();
    const [localName, setLocalName] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('ÉQUIPE_ALPHA');

    useEffect(() => {
        if (gameState.session_name) {
            setLocalName(gameState.session_name);
        } else if (gameState.userId) {
            setLocalName(`OPERATOR_${gameState.userId.substring(0, 4)}`);
        }
    }, [gameState.session_name, gameState.userId]);

    const handleSaveName = () => {
        if (localName && localName !== gameState.session_name) {
            changeName(localName);
        }
    };

    const handleJoinTeam = () => {
        joinTeam(selectedTeam);
    };

    const teams = ['ÉQUIPE_ALPHA', 'ÉQUIPE_BETA', 'ÉQUIPE_OMEGA', 'ÉQUIPE_NULL'];

    return (
        <GameSection title="SESSION_MANAGER" icon={Users}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Session ID Section */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <Fingerprint className="h-3 w-3" />
                        IDENTITÉ D'OPÉRATEUR
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value)}
                            maxLength={20}
                            placeholder="Entrez votre nom..."
                            className="flex-1 bg-white/5 border border-white/10 p-2 text-xs font-mono text-white focus:border-banan-primary focus:outline-none"
                        />
                        <button
                            onClick={handleSaveName}
                            disabled={localName === gameState.session_name || !localName.trim()}
                            className="bg-banan-primary text-black px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Save className="h-3 w-3" />
                            SAUVEGARDER
                        </button>
                    </div>

                    <div className="flex items-start gap-2 mt-2 p-2 bg-white/5 border border-white/10 rounded">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold font-mono text-white/50 uppercase">Réseau d'Identité</span>
                            <p className="text-[10px] font-mono text-white/40 leading-tight">
                                Votre identité sera retransmise en direct sur le système de classement global de la corporation. Les pseudonymes de moins de 3 ou plus de 20 caractères sont rejetés par le réseau central.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team Selection Section */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        AFFECTATION D'UNITÉ
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 p-2 text-xs font-mono text-white focus:border-banan-primary focus:outline-none uppercase appearance-none"
                        >
                            {teams.map(team => (
                                <option key={team} value={team} className="bg-banan-black text-white">{team}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleJoinTeam}
                            disabled={selectedTeam === gameState.team}
                            className="border border-banan-primary text-banan-primary px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-banan-primary hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <LogIn className="h-3 w-3" />
                            {gameState.team === selectedTeam ? 'ACTUEL' : 'REJOINDRE'}
                        </button>
                    </div>

                    {gameState.team && (
                        <div className="mt-4 p-4 bg-white/5 border border-white/10">
                            <h4 className="text-[10px] font-bold font-mono uppercase text-white/50 mb-2 border-b border-white/10 pb-1 flex justify-between">
                                <span>MEMBRES ACTIFS</span>
                                <span className="text-banan-primary">ONLINE</span>
                            </h4>
                            <div className="space-y-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between text-xs font-mono group">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${i <= 3 ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-white/30'}`} />
                                            <span className="text-white/70 group-hover:text-white transition-colors">
                                                OPERATOR_{Math.floor(Math.random() * 9000) + 1000}
                                            </span>
                                        </div>
                                        <span className="text-white/30 text-[10px]">
                                            {i === 1 ? 'LEADER' : 'MEMBER'}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between text-xs font-mono group pt-2 border-t border-white/5 mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-banan-primary shadow-[0_0_5px_rgba(250,255,0,0.5)]" />
                                        <span className="text-banan-primary font-bold">
                                            {gameState.userId.split('-').pop()?.substring(0, 8)} (VOUS)
                                        </span>
                                    </div>
                                    <span className="text-banan-primary/50 text-[10px]">RECRUE</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GameSection>
    );
}
