import { useState, useEffect } from 'react';
import { useGame } from '@app/context/GameContext';
import { Users, Fingerprint, Save, LogIn } from 'lucide-react';
import GameSection from '@app/components/shared/GameSection';

export default function SessionManager() {
    const { gameState, changeName, joinTeam } = useGame();
    const [localName, setLocalName] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('ÉQUIPE_ALPHA');

    useEffect(() => {
        if (gameState.username) {
            setLocalName(gameState.username);
        } else if (gameState.userId) {
            setLocalName(`BANANIER_${gameState.userId.substring(0, 4)}`);
        }
        
        if (gameState.team) {
            setSelectedTeam(gameState.team);
        }
    }, [gameState.username, gameState.userId, gameState.team]);

    const handleSaveName = () => {
        if (localName && localName !== gameState.username) {
            changeName(localName);
        }
    };

    const handleJoinTeam = () => {
        if (selectedTeam && selectedTeam !== gameState.team) {
            joinTeam(selectedTeam.toUpperCase());
        }
    };

    return (
        <GameSection title="BANANIER" icon={Users}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Session ID Section */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <Fingerprint className="h-3 w-3" />
                        IDENTITÉ DE BANANIER
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value.replace(/[^a-zA-Z0-9_\-À-ÿœŒæÆ ]/g, ''))}
                            maxLength={20}
                            placeholder="Entrez votre nom..."
                            className="flex-1 bg-white/5 border border-white/10 p-2 text-xs font-mono text-white focus:border-banan-primary focus:outline-none"
                        />
                        <button
                            onClick={handleSaveName}
                            disabled={localName === gameState.username || localName.trim().length < 3}
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
                        <input
                            type="text"
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value.replace(/[^a-zA-Z0-9_\-À-ÿœŒæÆ ]/g, '').toUpperCase())}
                            placeholder="Rejoindre ou créer une équipe..."
                            maxLength={15}
                            className="flex-1 bg-white/5 border border-white/10 p-2 text-xs font-mono text-white focus:border-banan-primary focus:outline-none uppercase"
                        />
                        <button
                            onClick={handleJoinTeam}
                            disabled={selectedTeam === gameState.team || selectedTeam.trim().length < 3}
                            className="border border-banan-primary text-banan-primary px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-banan-primary hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <LogIn className="h-3 w-3" />
                            {gameState.team === selectedTeam ? 'ACTUEL' : 'REJOINDRE'}
                        </button>
                    </div>

                    <div className="flex items-start gap-2 mt-2 p-2 bg-white/5 border border-white/10 rounded">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold font-mono text-white/50 uppercase">Protocole d'Équipe</span>
                            <p className="text-[10px] font-mono text-white/40 leading-tight">
                                Rejoignez une escouade pour synchroniser vos efforts de production. Le rendement global de l'unité sera minutieusement évalué par le réseau central.
                            </p>
                        </div>
                    </div>

                    {gameState.team && (
                        <div className="mt-4 p-4 bg-white/5 border border-white/10">
                            <h4 className="text-[10px] font-bold font-mono uppercase text-white/50 mb-2 border-b border-white/10 pb-1 flex justify-between">
                                <span>MEMBRES ACTIFS</span>
                                <span className="text-banan-primary">ONLINE</span>
                            </h4>
                            <div className="space-y-1">
                                {gameState.team_members && gameState.team_members.map((member, i) => (
                                    <div key={member.id} className="flex items-center justify-between text-xs font-mono group">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 ${i === 0 ? 'bg-banan-primary shadow-[0_0_5px_var(--color-banan-primary)]' : 'bg-banan-green shadow-[0_0_5px_var(--color-banan-green)]'}`} />
                                            <span className="text-white/70 group-hover:text-white transition-colors">
                                                {member.name} {member.id === gameState.userId && <span className="opacity-50">(VOUS)</span>}
                                            </span>
                                        </div>
                                        <span className="text-white/30 text-[10px]">
                                            {i === 0 ? 'LEADER' : member.role}
                                        </span>
                                    </div>
                                ))}

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GameSection>
    );
}
