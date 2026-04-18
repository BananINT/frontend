import { useState, useEffect, useCallback, useRef } from 'react';
import { Timer, Trophy, ArrowLeft, Gamepad2, Brain, Banana, Heart, HelpCircle, Activity, Star, Zap, Sun, Moon, Cloud, Flame, Smile, Triangle, Circle, Square } from 'lucide-react';
import React from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@app/components/shared/Modal';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';

interface MinigameInfo {
    id: string;
    max_score: number;
    base_reward: number;
    max_reward: number;
}

interface MinigameStatus {
    games: MinigameInfo[];
    cooldown_remaining: number;
    can_play: boolean;
}

const GAME_META: Record<string, { name: string; Icon: React.ElementType; description: string; color: string }> = {
    banana_catch: {
        name: "Banana Catch",
        Icon: Banana,
        description: "Attrapez les bananes qui tombent !",
        color: "text-yellow-400",
    },
    memory_peel: {
        name: "Memory Peel",
        Icon: Brain,
        description: "Mémorisez les paires !",
        color: "text-purple-400",
    },
    banana_pong: {
        name: "Banana Pong",
        Icon: Activity,
        description: "Renvoyez la banane !",
        color: "text-cyan-400",
    },
};

interface MinigamesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MinigamesModal({ isOpen, onClose }: MinigamesModalProps) {
    const [status, setStatus] = useState<MinigameStatus | null>(null);
    const [currentGame, setCurrentGame] = useState<string | null>(null);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [gameActive, setGameActive] = useState(false);
    const [gameResult, setGameResult] = useState<any>(null);
    const [cooldown, setCooldown] = useState(0);

    // Request status when modal opens
    useEffect(() => {
        if (isOpen) {
            socketManager.send('get_minigame_status', {});
        }
        return () => {
            setCurrentGame(null);
            setGameActive(false);
            setGameResult(null);
        };
    }, [isOpen]);

    // Cooldown timer
    useEffect(() => {
        if (!status || status.cooldown_remaining <= 0) {
            setCooldown(0);
            return;
        }
        setCooldown(status.cooldown_remaining);
        const interval = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    socketManager.send('get_minigame_status', {});
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [status]);

    // Listen for messages
    useEffect(() => {
        const handleMessage = (message: any) => {
            if (message.type === 'minigame_status') {
                setStatus(message.data);
            } else if (message.type === 'minigame_started') {
                setSessionToken(message.data.session_token);
                setGameActive(true);
            } else if (message.type === 'minigame_result') {
                setGameResult(message.data);
                setGameActive(false);
                setCurrentGame(null);
                socketManager.send('get_minigame_status', {});
            }
        };

        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, []);

    const startGame = useCallback((gameId: string) => {
        setCurrentGame(gameId);
        setGameResult(null);
        socketManager.send('start_minigame', { game_id: gameId });
    }, []);

    const submitScore = useCallback((score: number) => {
        if (!currentGame || !sessionToken) return;
        socketManager.send('submit_minigame', {
            game_id: currentGame,
            score,
            session_token: sessionToken,
        });
    }, [currentGame, sessionToken]);

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="🎮 MINI-JEUX POTASSIUM"
        >
            {/* Game Result */}
            <AnimatePresence>
                {gameResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 p-6 border border-banan-primary bg-banan-primary/5 text-center space-y-3"
                    >
                        <Trophy className="h-10 w-10 text-banan-primary mx-auto" />
                        <div className="text-xl font-black text-banan-primary font-sans">
                            Score: {gameResult.score}
                        </div>
                        <div className="text-sm font-mono text-banan-green">
                            +{formatNumber(gameResult.reward)} 🍌
                        </div>
                        <button
                            onClick={() => setGameResult(null)}
                            className="text-[10px] font-mono text-white/30 hover:text-banan-primary uppercase mt-2"
                        >
                            Continuer
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Game */}
            {gameActive && currentGame ? (
                <div className="space-y-4">
                    <button
                        onClick={() => {
                            setGameActive(false);
                            setCurrentGame(null);
                        }}
                        className="flex items-center gap-2 text-xs font-mono text-white/30 hover:text-banan-primary transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Abandonner
                    </button>

                    {currentGame === 'banana_catch' && (
                        <BananaCatchGame onComplete={submitScore} />
                    )}
                    {currentGame === 'memory_peel' && (
                        <MemoryPeelGame onComplete={submitScore} />
                    )}
                    {currentGame === 'banana_pong' && (
                        <BananaPongGame onComplete={submitScore} />
                    )}
                </div>
            ) : !gameResult ? (
                /* Game Selection */
                <div className="space-y-4">
                    {/* Cooldown Warning */}
                    {cooldown > 0 && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10">
                            <Timer className="h-4 w-4 text-banan-primary" />
                            <span className="text-xs font-mono text-white/50">
                                Prochain jeu dans {formatTime(cooldown)}
                            </span>
                        </div>
                    )}

                    {(status?.games || []).map(game => {
                        const meta = GAME_META[game.id];
                        return (
                            <button
                                key={game.id}
                                onClick={() => startGame(game.id)}
                                disabled={cooldown > 0}
                                className="w-full p-4 border border-white/10 bg-white/5 hover:border-banan-primary hover:bg-banan-primary/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-left"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    {(() => {
                                        const MetaIcon = meta?.Icon;
                                        return MetaIcon ? <MetaIcon className={`h-8 w-8 ${meta.color}`} /> : <Gamepad2 className="h-8 w-8" />;
                                    })()}
                                    <div>
                                        <div className={`text-sm font-bold font-mono uppercase ${meta?.color || 'text-white'}`}>
                                            {meta?.name || game.id}
                                        </div>
                                        <div className="text-[10px] font-mono text-white/30">
                                            {meta?.description}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-white/30">
                                    <span>Score max: {game.max_score}</span>
                                    <span className="text-banan-primary flex items-center gap-1">Jusqu'à {formatNumber(game.max_reward)} <Banana className="w-3 h-3"/></span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </Modal>
    );
}


// ==================== MINI-GAME: BANANA CATCH ====================
function BananaCatchGame({ onComplete }: { onComplete: (score: number) => void }) {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [bananas, setBananas] = useState<{ id: number; x: number; y: number; speed: number }[]>([]);
    const nextId = useRef(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            setTimeout(() => onComplete(score), 500);
        }
    }, [timeLeft, score, onComplete]);

    // Spawn bananas
    useEffect(() => {
        if (timeLeft <= 0) return;
        const spawner = setInterval(() => {
            setBananas(prev => [
                ...prev,
                { id: nextId.current++, x: Math.random() * 80 + 10, y: -5, speed: 2 + Math.random() * 3 }
            ]);
        }, 600);
        return () => clearInterval(spawner);
    }, [timeLeft]);

    // Animate falling
    useEffect(() => {
        if (timeLeft <= 0) return;
        const animFrame = setInterval(() => {
            setBananas(prev => prev
                .map(b => ({ ...b, y: b.y + b.speed }))
                .filter(b => b.y < 110)
            );
        }, 50);
        return () => clearInterval(animFrame);
    }, [timeLeft]);

    const catchBanana = (id: number) => {
        setBananas(prev => prev.filter(b => b.id !== id));
        setScore(prev => Math.min(prev + 1, 30));
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
                <span className="text-banan-primary font-bold">Score: {score}</span>
                <span className="text-white/50 flex items-center gap-1"><Timer className="h-3 w-3"/> {timeLeft}s</span>
            </div>
            <div className="relative h-64 border border-white/10 bg-black overflow-hidden select-none" style={{ touchAction: 'none' }}>
                {bananas.map(b => (
                    <button
                        key={b.id}
                        onClick={() => catchBanana(b.id)}
                        className="absolute text-2xl cursor-pointer hover:scale-125 transition-transform"
                        style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
                    ><Banana className="h-6 w-6 text-banan-primary" /></button>
                ))}
                {timeLeft <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <span className="text-2xl font-black text-banan-primary">TERMINÉ !</span>
                    </div>
                )}
            </div>
        </div>
    );
}


// ==================== MINI-GAME: MEMORY PEEL ====================
function MemoryPeelGame({ onComplete }: { onComplete: (score: number) => void }) {
    const ICONS = [Banana, Heart, Star, Zap, Sun, Moon, Cloud, Flame, Smile, Triangle, Circle, Square];
    const [cards, setCards] = useState<{ id: number; Icon: React.ElementType; flipped: boolean; matched: boolean }[]>([]);
    const [flippedIds, setFlippedIds] = useState<number[]>([]);
    const [matches, setMatches] = useState(0);
    const [moves, setMoves] = useState(0);

    useEffect(() => {
        // Create 6 pairs (12 cards)
        const selected = ICONS.slice(0, 6);
        const deck = [...selected, ...selected]
            .sort(() => Math.random() - 0.5)
            .map((Icon, i) => ({ id: i, Icon, flipped: false, matched: false }));
        setCards(deck);
    }, []);

    useEffect(() => {
        if (matches === 6) {
            // Score based on efficiency: fewer moves = higher score
            const score = Math.max(1, 12 - Math.max(0, moves - 6));
            setTimeout(() => onComplete(score), 800);
        }
    }, [matches, moves, onComplete]);

    const flipCard = (id: number) => {
        if (flippedIds.length >= 2) return;
        const card = cards.find(c => c.id === id);
        if (!card || card.flipped || card.matched) return;

        const newFlipped = [...flippedIds, id];
        setFlippedIds(newFlipped);
        setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = newFlipped;
            const c1 = cards.find(c => c.id === first)!;
            const c2 = cards.find(c => c.id === second || c.id === id)!;
            const Icon2 = id === second ? card.Icon : c2.Icon;

            if (c1.Icon === Icon2) {
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === first || c.id === second ? { ...c, matched: true } : c
                    ));
                    setMatches(m => m + 1);
                    setFlippedIds([]);
                }, 400);
            } else {
                setTimeout(() => {
                    setCards(prev => prev.map(c =>
                        c.id === first || c.id === second ? { ...c, flipped: false } : c
                    ));
                    setFlippedIds([]);
                }, 800);
            }
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
                <span className="text-banan-primary font-bold">Paires: {matches}/6</span>
                <span className="text-white/50">Coups: {moves}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {cards.map(card => (
                    <button
                        key={card.id}
                        onClick={() => flipCard(card.id)}
                        className={`aspect-square flex items-center justify-center text-2xl border transition-all duration-200
                            ${card.matched
                                ? 'bg-banan-primary/10 border-banan-primary/30 scale-95 opacity-50'
                                : card.flipped
                                    ? 'bg-white/10 border-white/30'
                                    : 'bg-white/5 border-white/10 hover:border-banan-primary cursor-pointer'
                            }`}
                    >
                        {card.flipped || card.matched ? <card.Icon className="h-6 w-6 text-banan-primary" /> : <HelpCircle className="h-6 w-6 text-white/30" />}
                    </button>
                ))}
            </div>
        </div>
    );
}


// ==================== MINI-GAME: BANANA PONG ====================
function BananaPongGame({ onComplete }: { onComplete: (score: number) => void }) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [ball, setBall] = useState({ x: 50, y: 50, dx: 2, dy: 2 });
    const [paddle, setPaddle] = useState(50);
    const gameOver = useRef(false);

    useEffect(() => {
        if (lives <= 0 && !gameOver.current) {
            gameOver.current = true;
            setTimeout(() => onComplete(Math.min(score, 10)), 500);
        }
    }, [lives, score, onComplete]);

    // Game loop
    useEffect(() => {
        if (lives <= 0) return;

        const loop = setInterval(() => {
            setBall(prev => {
                let { x, y, dx, dy } = prev;
                x += dx;
                y += dy;

                // Wall bounces
                if (x <= 0 || x >= 100) dx = -dx;
                if (y <= 0) dy = -dy;

                // Paddle hit
                if (y >= 90 && Math.abs(x - paddle) < 15) {
                    dy = -Math.abs(dy) - 0.2; // Speed up slightly
                    dx = (x - paddle) / 5;
                    setScore(s => s + 1);
                }

                // Missed
                if (y > 100) {
                    setLives(l => l - 1);
                    return { x: 50, y: 50, dx: 2, dy: 2 };
                }

                return { x: Math.max(0, Math.min(100, x)), y, dx, dy };
            });
        }, 30);

        return () => clearInterval(loop);
    }, [lives, paddle]);


    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX: number;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = e.clientX;
        }
        const x = ((clientX - rect.left) / rect.width) * 100;
        setPaddle(Math.max(10, Math.min(90, x)));
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
                <span className="text-banan-primary font-bold">Score: {score}</span>
                <span className="text-white/50 flex items-center gap-1"><Heart className="h-3 w-3 text-red-500"/> {lives}</span>
            </div>
            <div
                ref={canvasRef}
                className="relative h-64 border border-white/10 bg-black overflow-hidden cursor-none select-none"
                onMouseMove={handleMove}
                onTouchMove={handleMove}
                style={{ touchAction: 'none' }}
            >
                {/* Ball */}
                <div
                    className="absolute text-xl"
                    style={{
                        left: `${ball.x}%`,
                        top: `${ball.y}%`,
                        transform: 'translate(-50%, -50%)',
                        transition: 'left 30ms linear, top 30ms linear'
                    }}
                >
                    🍌
                </div>
                {/* Paddle */}
                <div
                    className="absolute bottom-2 h-2 bg-banan-primary"
                    style={{
                        left: `${paddle - 10}%`,
                        width: '20%',
                        transition: 'left 50ms ease-out'
                    }}
                />
                {lives <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <span className="text-2xl font-black text-banan-primary">GAME OVER !</span>
                    </div>
                )}
            </div>
        </div>
    );
}
