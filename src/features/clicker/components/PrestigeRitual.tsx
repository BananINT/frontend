import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dna, X } from 'lucide-react';
import { socketManager } from '@app/lib/socket';
import { useGame } from '@app/context/GameContext';
import { fireJackpotConfetti } from '@app/utils/confetti';

interface PrestigeRitualProps {
    isOpen: boolean;
    onClose: () => void;
}

type Stage = 'confirm' | 'ascending' | 'complete';

export default function PrestigeRitual({ isOpen, onClose }: PrestigeRitualProps) {
    const { gameState } = useGame();
    const [stage, setStage] = useState<Stage>('confirm');
    const [dnaGained, setDnaGained] = useState(0);

    const previewDnaGain = 1 + Math.floor(gameState.prestigeCount / 10);

    const handleClose = () => {
        setStage('confirm');
        onClose();
    };

    useEffect(() => {
        if (stage !== 'ascending') return;

        const handleMessage = (msg: { type: string; data: unknown }) => {
            if (msg.type === 'prestige_success') {
                const data = msg.data as { dnaGained: number };
                setDnaGained(data.dnaGained);
                fireJackpotConfetti();
                setStage('complete');
            }
        };
        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, [stage]);

    const handleConfirm = () => {
        setStage('ascending');
        socketManager.send('prestige', {});
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
                >
                    {/* Ambient radial glow */}
                    <motion.div
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(circle at center, rgba(250,222,0,0.15) 0%, transparent 60%)' }}
                    />

                    {stage === 'confirm' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative z-10 max-w-md w-full mx-4 p-10 rounded-3xl border border-banan-primary/40 bg-white/5 backdrop-blur-md text-center"
                        >
                            <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                                className="inline-block mb-6"
                            >
                                <Dna className="w-16 h-16 text-banan-primary" />
                            </motion.div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-banan-primary mb-3">Ascension</h2>
                            <p className="text-sm font-mono text-white/60 leading-relaxed mb-6">
                                Renaître de zéro, muni d'ADN de Banane éternel. Vos bananes, améliorations et clics repartent à zéro — votre prestige et vos thèmes restent acquis à jamais.
                            </p>
                            <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-8">
                                ADN gagné à l'ascension
                                <div className="text-2xl font-black text-banan-primary mt-1">+{previewDnaGain}</div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors text-xs font-bold uppercase tracking-widest"
                                >
                                    Pas encore
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 py-3 rounded-xl bg-banan-primary text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-colors shadow-[0_0_30px_rgba(250,222,0,0.3)]"
                                >
                                    Ascender
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {stage === 'ascending' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative z-10 flex flex-col items-center gap-6"
                        >
                            <motion.div
                                animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                                transition={{ rotate: { repeat: Infinity, duration: 1.4, ease: 'linear' }, scale: { repeat: Infinity, duration: 1.4 } }}
                            >
                                <Dna className="w-24 h-24 text-banan-primary drop-shadow-[0_0_30px_rgba(250,222,0,0.6)]" />
                            </motion.div>
                            <div className="text-banan-primary font-mono uppercase tracking-[0.3em] text-sm animate-pulse">
                                Ascension en cours...
                            </div>
                        </motion.div>
                    )}

                    {stage === 'complete' && (
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                            className="relative z-10 text-center px-4"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="inline-block mb-6"
                            >
                                <Dna className="w-20 h-20 text-banan-primary mx-auto drop-shadow-[0_0_30px_rgba(250,222,0,0.6)]" />
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-banan-primary mb-4">
                                Ascension Réussie
                            </h2>
                            <p className="text-sm font-mono text-white/60 uppercase tracking-widest mb-8">
                                +{dnaGained} ADN de Banane • Prestige {gameState.prestigeCount + 1}
                            </p>
                            <button
                                onClick={handleClose}
                                className="px-8 py-3 rounded-xl bg-banan-primary text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-colors"
                            >
                                Continuer
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
