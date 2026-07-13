import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, ShieldAlert, Cpu, Network, Skull, Banana, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@app/components/shared/Modal';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';

interface OsintTarget {
    id: string;
    ip: string;
    corp: string;
    difficulty: number;
    duration: number;
    reward: number;
}

interface ActiveHack {
    target: OsintTarget;
    remaining_time: number;
    total_duration: number;
    completed: boolean;
}

interface OsintState {
    targets: OsintTarget[];
    active_hack: ActiveHack | null;
}

interface OsintModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OsintModal({ isOpen, onClose }: OsintModalProps) {
    const [state, setState] = useState<OsintState | null>(null);
    const [result, setResult] = useState<{ reward: number } | null>(null);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const terminalRef = useRef<HTMLDivElement>(null);
    
    const addLog = useCallback((line: string) => {
        setTerminalLines(prev => [...prev.slice(-20), `> ${line}`]);
    }, []);

    // Initial load
    useEffect(() => {
        if (isOpen) {
            socketManager.send('get_osint_state', {});
            setTimeout(() => {
                addLog("Connexion établie au terminal BananINT v1.0.4...");
                addLog("Initialisation du module OSINT...");
            }, 0);
        } else {
            setTimeout(() => {
                setTerminalLines([]);
                setResult(null);
            }, 0);
        }
    }, [isOpen, addLog]);

    // Setup socket listeners
    useEffect(() => {
        const handleMessage = (msg: { type: string, data: unknown, message?: string }) => {
            if (msg.type === 'osint_state') {
                setState(msg.data as OsintState);
            } else if (msg.type === 'osint_scan') {
                addLog(`[RESEAU] Nouveau scan terminé (${(msg.data as { targets: unknown[] }).targets.length} nœuds découverts).`);
            } else if (msg.type === 'osint_hack_complete') {
                setResult(msg.data as { reward: number });
                addLog(`[SUCCES] Infiltration terminée. +${formatNumber((msg.data as { reward: number }).reward)} bananes.`);
            } else if (msg.type === 'error') {
                addLog(`[ERREUR] ${msg.message}`);
            }
        };
        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, [addLog]);

    // Local tick for active hack progression without waiting for server except at the end
    useEffect(() => {
        if (!state?.active_hack) return;
        
        const hack = state.active_hack;
        if (hack.completed) {
            // It's done, tell the server we're grabbing the reward
            socketManager.send('complete_osint_hack', {});
            return;
        }

        const interval = setInterval(() => {
            setState(prev => {
                if (!prev || !prev.active_hack) return prev;
                const newRemaining = prev.active_hack.remaining_time - 1;
                
                // Random terminal logs during hack
                if (Math.random() < 0.3) {
                    const logs = [
                        `Contournement du pare-feu sur le port ${Math.floor(Math.random() * 8000)}...`,
                        `Déchiffrement des clés RSA-2048... ${Math.floor(Math.random() * 100)}%`,
                        `Injection de payload B.A.N.A.N.A...`,
                        `Évasion des contre-mesures...`,
                        `Exploitation de la vulnérabilité CVE-2026-B4N4...`,
                        `Extraction des paquets de données...`
                    ];
                    addLog(logs[Math.floor(Math.random() * logs.length)]);
                }

                if (newRemaining <= 0) {
                    clearInterval(interval);
                    return { ...prev, active_hack: { ...prev.active_hack, remaining_time: 0, completed: true } };
                }
                return { ...prev, active_hack: { ...prev.active_hack, remaining_time: newRemaining } };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [state?.active_hack, addLog]);

    // Scroll to bottom of terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalLines]);



    const handleScan = () => {
        addLog("Lancement du scanner de réseau global...");
        socketManager.send('scan_osint_network', {});
    };

    const handleHack = (targetId: string, ip: string) => {
        addLog(`Ciblage de l'IP : ${ip}`);
        addLog("Déploiement des outils d'infiltration...");
        socketManager.send('start_osint_hack', { target_id: targetId });
    };

    const handleCancel = () => {
        addLog("Annulation de l'opération en cours...");
        socketManager.send('cancel_osint_hack', {});
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            borderColor="border-banan-osint"
            title={<span className="flex items-center gap-2"><Terminal className="h-5 w-5" /> TERMINAL OSINT</span>}
        >
            <div className="flex flex-col gap-4">
                
                {/* Visual Terminal Window */}
                <div className="bg-black/90 border border-green-500/30 p-4 rounded-sm font-mono text-xs overflow-hidden flex flex-col h-48 relative shadow-[inset_0_0_20px_rgba(0,255,0,0.05)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 shadow-[0_0_10px_rgba(0,255,0,0.5)] animate-pulse" />
                    <div ref={terminalRef} className="flex-1 overflow-y-auto space-y-1 text-green-400/80 pr-2 custom-scrollbar">
                        {terminalLines.map((line, i) => (
                            <div key={i} className="break-all">{line}</div>
                        ))}
                    </div>
                </div>

                {/* Result Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-green-900/20 border border-green-500 p-4 text-center"
                        >
                            <ShieldAlert className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <div className="font-bold text-green-400 font-mono mb-1">CIBLE COMPROMISE</div>
                            <div className="text-sm font-mono text-green-300/70 mb-2">Informations extraites avec succès.</div>
                            <div className="text-xl font-bold text-banan-primary flex items-center justify-center gap-2 font-sans">
                                +{formatNumber(result.reward)} <Banana className="h-5 w-5" />
                            </div>
                            <button
                                onClick={() => setResult(null)}
                                className="mt-4 px-4 py-1 text-[10px] font-mono border border-green-500/50 text-green-400 hover:bg-green-500 hover:text-black transition-colors"
                            >
                                CONTINUER
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Hack Progress */}
                {!result && state?.active_hack ? (
                    <div className="border border-banan-primary/30 p-4 bg-banan-primary/5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-banan-primary font-bold font-mono text-sm flex items-center gap-2">
                                    <Cpu className="h-4 w-4 animate-pulse" />
                                    INFILTRATION EN COURS
                                </h3>
                                <div className="text-xs text-white/50 font-mono mt-1">
                                    Cible: {state.active_hack.target.ip} ({state.active_hack.target.corp})
                                </div>
                            </div>
                            <button onClick={handleCancel} className="text-red-500 hover:text-red-400 hover:scale-110 transition-all">
                                <StopCircle className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-4 bg-black border border-white/20 relative overflow-hidden">
                            <div 
                                className="absolute top-0 left-0 h-full bg-banan-primary transition-all duration-1000 ease-linear"
                                style={{ width: `${Math.max(0, Math.min(100, 100 - (state.active_hack.remaining_time / state.active_hack.total_duration) * 100))}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-white/50 mt-1">
                            <span>Progression</span>
                            <span>{state.active_hack.remaining_time}s restantes</span>
                        </div>
                    </div>
                ) : !result && state && (
                    /* Target List */
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <h3 className="font-mono text-xs uppercase text-white/50 flex items-center gap-2">
                                <Network className="h-4 w-4" />
                                Noeuds Vulnérables
                            </h3>
                            <button
                                onClick={handleScan}
                                className="text-[10px] font-mono bg-white/5 hover:bg-white/10 px-3 py-1 border border-white/10 transition-colors uppercase text-banan-primary"
                            >
                                Relancer Scan
                            </button>
                        </div>

                        <div className="grid gap-2">
                            {state.targets.map(t => (
                                <div key={t.id} className="group border border-white/10 hover:border-banan-primary/50 bg-white/5 p-3 flex items-center justify-between transition-colors">
                                    <div>
                                        <div className="font-mono text-sm font-bold text-white group-hover:text-banan-primary transition-colors flex items-center gap-2">
                                            <Skull className={`h-3 w-3 ${t.difficulty >= 4 ? 'text-red-500' : 'text-white/50'}`} />
                                            {t.ip}
                                        </div>
                                        <div className="text-[10px] font-mono text-white/50 mt-1">
                                            {t.corp} • Dif:{t.difficulty}/5 • Tps:{t.duration}s
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleHack(t.id, t.ip)}
                                        className="font-mono text-xs font-bold text-black bg-banan-primary hover:bg-yellow-400 px-4 py-2 transition-colors flex items-center gap-1 shadow-[0_0_10px_rgba(var(--banan-primary-rgb),0.2)]"
                                    >
                                        HACK <span className="text-[10px] opacity-70">({formatNumber(t.reward)}🍌)</span>
                                    </button>
                                </div>
                            ))}
                            {state.targets.length === 0 && (
                                <div className="text-center p-4 text-xs font-mono text-white/30">
                                    Aucune cible locale détectée. Relancez un scan.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,255,0,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,255,0,0.3); border-radius: 4px; }
            `}</style>
        </Modal>
    );
}
