import { useState, useEffect } from 'react';
import { Fingerprint, Save, ShieldCheck, BadgeCheck, Shield } from 'lucide-react';
import { useGame } from '@app/context/GameContext';
import GameSection from '@app/components/shared/GameSection';

export default function AgentDossierCard() {
    const { gameState, changeName } = useGame();
    const [localName, setLocalName] = useState('');
    const [savedSuccess, setSavedSuccess] = useState(false);

    useEffect(() => {
        const defaultName = gameState.username || (gameState.userId ? `BANANIER_${gameState.userId.substring(0, 4)}` : '');
        if (defaultName && localName === '') {
            setTimeout(() => setLocalName(defaultName), 0);
        }
    }, [gameState.username, gameState.userId, localName]);

    const handleSaveName = () => {
        if (localName && localName !== gameState.username && localName.trim().length >= 3) {
            changeName(localName);
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        }
    };

    // Calculate clearance level
    const bananas = gameState.totalBananasEarned || gameState.bananas || 0;
    let clearance = "CLASSE D — STAGIAIRE EN POTASSIUM";
    let clearanceColor = "text-white/50";
    if (gameState.prestigeCount >= 5 || bananas >= 10_000_000_000) {
        clearance = "CLASSE OMEGA — PRIMAT SUPRÊME";
        clearanceColor = "text-banan-primary font-black";
    } else if (gameState.prestigeCount >= 1 || bananas >= 1_000_000_000) {
        clearance = "CLASSE A — CYBER-BARON DU POTASSIUM";
        clearanceColor = "text-purple-400 font-bold";
    } else if (bananas >= 100_000_000) {
        clearance = "CLASSE B — OPÉRATEUR DE RÉSEAU";
        clearanceColor = "text-cyan-400 font-bold";
    } else if (bananas >= 1_000_000) {
        clearance = "CLASSE C — SPÉCULATEUR ACTIF";
        clearanceColor = "text-green-400 font-bold";
    }

    const serial = gameState.userId ? gameState.userId.substring(0, 8).toUpperCase() : "INIT-0000";

    return (
        <GameSection
            title="DOSSIER AGENT & IDENTITÉ"
            icon={Fingerprint}
            className="border-t-0 p-4 md:p-6 justify-between h-full"
            headerClassName="mb-4"
            rightElement={
                <span className="font-mono text-[9px] text-white/40 border border-white/10 px-2 py-0.5 rounded">
                    MATRICULE : #{serial}
                </span>
            }
        >
            <div className="space-y-4">

                {/* Clearance Level */}
                <div className="p-3 bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                        <div className="text-[9px] font-mono text-white/40 uppercase">Accréditation de Sécurité</div>
                        <div className={`font-mono text-xs mt-0.5 ${clearanceColor}`}>
                            {clearance}
                        </div>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-banan-primary shrink-0 opacity-80" />
                </div>

                {/* Name Edit Input */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                        <BadgeCheck className="h-3.5 w-3.5 text-banan-primary" />
                        Nom d'Appel / Call-Sign
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={localName}
                            onChange={(e) => setLocalName(e.target.value.replace(/[^a-zA-Z0-9_\-À-ÿœŒæÆ ]/g, ''))}
                            maxLength={20}
                            placeholder="Entrez votre nom..."
                            className="flex-1 bg-white/5 border border-white/10 p-2 text-xs font-mono text-white focus:border-banan-primary focus:outline-none transition-colors"
                        />
                        <button
                            onClick={handleSaveName}
                            disabled={localName === gameState.username || localName.trim().length < 3}
                            className="bg-banan-primary text-black px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                        >
                            <Save className="h-3.5 w-3.5" />
                            {savedSuccess ? 'SAUVÉ !' : 'ENREGISTRER'}
                        </button>
                    </div>
                </div>

                {/* Clan status */}
                <div className="flex items-center justify-between text-[10px] font-mono p-2 bg-white/5 border border-white/10 rounded">
                    <span className="text-white/50 flex items-center gap-1">
                        <Shield className="h-3 w-3 text-banan-primary" />
                        Unité Tactique (Clan) :
                    </span>
                    <span className="font-bold text-white uppercase">
                        {gameState.clan_id ? "AFFECTÉ À UNE DIVISION" : "AUCUN CLAN (SOLO)"}
                    </span>
                </div>
            </div>

            <div className="pt-4 text-[9px] font-mono text-white/30 leading-tight border-t border-white/10 mt-4">
                Identité chiffrée par le réseau central BananINT. Retransmise en continu sur les terminaux satellites.
            </div>
        </GameSection>
    );
}
