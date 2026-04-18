import { useState } from 'react';
import { Ticket, Gamepad2, Dices, Banana } from 'lucide-react';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';
import SessionManager from '../clicker/components/SessionManager';
import LotteryModal from '../clicker/components/LotteryModal';
import MinigamesModal from '../clicker/components/MinigamesModal';
import SlotsModal from './components/SlotsModal';

export default function CasinoPage() {
    const { gameState } = useGame();
    const [isLotteryOpen, setIsLotteryOpen] = useState(false);
    const [isMinigamesOpen, setIsMinigamesOpen] = useState(false);
    const [isSlotsOpen, setIsSlotsOpen] = useState(false);

    return (
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto">
            {/* Casino Header */}
            <div className="p-8 border-b border-white/10 bg-banan-primary/5 text-center relative overflow-hidden">
                <Dices className="h-32 w-32 text-banan-primary/10 absolute -top-8 -right-8 rotate-12" />
                <Ticket className="h-24 w-24 text-banan-primary/10 absolute -bottom-4 -left-4 -rotate-12" />
                
                <h1 className="text-4xl font-black text-banan-primary uppercase tracking-tighter mb-4 flex items-center justify-center gap-4">
                    <Dices className="h-8 w-8" />
                    CASINO POTASSIUM
                    <Dices className="h-8 w-8" />
                </h1>
                <p className="text-sm font-mono text-white/50 max-w-xl mx-auto uppercase">
                    Bienvenue dans le temple du jeu. Misez vos bananes, participez à la loterie hebdomadaire, ou testez vos réflexes à l'arcade.
                </p>
                
                <div className="mt-6 flex items-center justify-center gap-2">
                    <span className="text-xs font-mono text-white/50 uppercase">Solde:</span>
                    <span className="text-xl font-sans font-bold text-banan-primary flex items-center gap-1">
                        {formatNumber(gameState.bananas)} <Banana className="w-5 h-5"/>
                    </span>
                </div>
            </div>

            <div className="flex-1 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
                    
                    {/* Lottery Card */}
                    <button
                        onClick={() => setIsLotteryOpen(true)}
                        className="group relative p-8 border hover:border-banan-primary hover:bg-banan-primary/5 transition-all text-left overflow-hidden flex flex-col justify-between min-h-[300px]"
                        style={{
                            borderColor: isLotteryOpen ? 'var(--banan-primary)' : 'rgba(255,255,255,0.1)'
                        }}
                    >
                        <Ticket className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5 group-hover:text-banan-primary/10 transition-colors transform group-hover:scale-110 duration-500" />
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Ticket className="h-8 w-8 text-banan-primary" />
                                <h2 className="text-2xl font-black text-white uppercase tracking-wider group-hover:text-banan-primary transition-colors">Banana Lottery</h2>
                            </div>
                            <p className="font-mono text-sm text-white/50 mt-4 leading-relaxed max-w-sm">
                                Participez au tirage toutes les 5 minutes pour tenter de décrocher le jackpot ! Plus vous achetez de tickets, plus vos chances augmentent.
                            </p>
                        </div>
                        <div className="mt-8 font-mono text-xs text-banan-primary uppercase font-bold flex items-center gap-2">
                            Tenter sa chance <span className="text-lg">→</span>
                        </div>
                    </button>

                    {/* Slots Card */}
                    <button
                        onClick={() => setIsSlotsOpen(true)}
                        className="group relative p-8 border border-white/10 hover:border-banan-primary hover:bg-banan-primary/5 transition-all text-left overflow-hidden flex flex-col justify-between min-h-[300px]"
                        style={{
                            borderColor: isSlotsOpen ? 'var(--banan-primary)' : 'rgba(255,255,255,0.1)'
                        }}
                    >
                        <Dices className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5 group-hover:text-banan-primary/10 transition-colors transform group-hover:scale-110 group-hover:rotate-12 duration-500" />
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Dices className="h-8 w-8 text-banan-primary" />
                                <h2 className="text-2xl font-black text-white uppercase tracking-wider group-hover:text-banan-primary transition-colors">Machine à Sous</h2>
                            </div>
                            <p className="font-mono text-sm text-white/50 mt-4 leading-relaxed max-w-sm">
                                Alignez les symboles pour rafler la mise. Les diagonales offrent des micro-gains, mais attention au crâne ! 100% calculé côté serveur.
                            </p>
                        </div>
                        <div className="mt-8 font-mono text-xs text-banan-primary uppercase font-bold flex items-center gap-2">
                            Miser <span className="text-lg">→</span>
                        </div>
                    </button>

                    {/* Arcade Card */}
                    <button
                        onClick={() => setIsMinigamesOpen(true)}
                        className="group relative p-8 border border-white/10 hover:border-banan-primary hover:bg-banan-primary/5 transition-all text-left overflow-hidden flex flex-col justify-between min-h-[300px]"
                    >
                        <Gamepad2 className="absolute -right-8 -bottom-8 h-48 w-48 text-white/5 group-hover:text-banan-primary/10 transition-colors transform group-hover:scale-110 duration-500" />
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Gamepad2 className="h-8 w-8 text-banan-primary" />
                                <h2 className="text-2xl font-black text-white uppercase tracking-wider group-hover:text-banan-primary transition-colors">Arcade Potassium</h2>
                            </div>
                            <p className="font-mono text-sm text-white/50 mt-4 leading-relaxed max-w-sm">
                                Testez votre habileté et gagnez des bananes en direct ! Memory Peel, Banana Catch, Banana Pong...
                            </p>
                        </div>
                        <div className="mt-8 font-mono text-xs text-banan-primary uppercase font-bold flex items-center gap-2">
                            Jouer maintenant <span className="text-lg">→</span>
                        </div>
                    </button>

                </div>
            </div>

            <SessionManager />
            
            {/* Modals */}
            <LotteryModal isOpen={isLotteryOpen} onClose={() => setIsLotteryOpen(false)} />
            <MinigamesModal isOpen={isMinigamesOpen} onClose={() => setIsMinigamesOpen(false)} />
            <SlotsModal isOpen={isSlotsOpen} onClose={() => setIsSlotsOpen(false)} />
        </div>
    );
}
