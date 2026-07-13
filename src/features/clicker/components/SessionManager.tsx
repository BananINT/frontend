import { useState, useEffect } from 'react';
import { useGame } from '@app/context/GameContext';
import { Fingerprint, Save } from 'lucide-react';
import GameSection from '@app/components/shared/GameSection';

export default function SessionManager() {
    const { gameState, changeName } = useGame();
    const [localName, setLocalName] = useState('');

    useEffect(() => {
        const defaultName = gameState.username || (gameState.userId ? `BANANIER_${gameState.userId.substring(0, 4)}` : '');
        if (defaultName && localName === '') {
            setTimeout(() => setLocalName(defaultName), 0);
        }
    }, [gameState.username, gameState.userId, localName]);

    const handleSaveName = () => {
        if (localName && localName !== gameState.username) {
            changeName(localName);
        }
    };

    return (
        <GameSection title="BANANIER" icon={Fingerprint}>
            <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
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
            </div>
        </GameSection>
    );
}
