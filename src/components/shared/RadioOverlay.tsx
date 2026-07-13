import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, AlertCircle, List, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '@app/components/shared/Modal';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

// Use Vite's import.meta.glob to automatically map the public/audio folder
const rawAudioFiles = import.meta.glob('../../../public/audio/*.{mp3,wav,ogg,flac,m4a,aac}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export default function RadioOverlay() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume] = useState(0.5);
    const [isMuted] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isListOpen, setIsListOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isInitialMount = useRef(true);
    const controls = useAnimation();

    const [corner, setCorner] = useState<'TL' | 'TR' | 'BL' | 'BR'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('radioOverlayCorner');
            if (saved === 'TL' || saved === 'TR' || saved === 'BL' || saved === 'BR') {
                return saved;
            }
        }
        return 'BR';
    });

    // Color Constants from BananINT-Design.md
    const COLORS = {
        primary: 'var(--color-banan-primary)', // Radioactive Banana
        black: 'var(--color-banan-black)',   // Banan Black
        glass: 'rgba(255,255,255,0.05)',
        structure: 'rgba(255,255,255,0.1)'
    };

    const audioManifest = useMemo(() => {
        return Object.entries(rawAudioFiles).map(([path, url]) => {
            let cleanUrl = url as string;
            if (cleanUrl.startsWith('/public/')) {
                cleanUrl = cleanUrl.replace(/^\/public/, '');
            }
            return {
                filename: path.split('/').pop()!,
                url: cleanUrl
            };
        }).sort((a, b) => a.filename.localeCompare(b.filename));
    }, []);

    const tracks = useMemo(() => audioManifest.map(item => item.url), [audioManifest]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const handleNext = React.useCallback(() => {
        setCurrentTrackIndex((prev) => (prev + 1) % (tracks.length || 1));
    }, [tracks.length]);

    const handlePrev = React.useCallback(() => {
        setCurrentTrackIndex((prev) => (prev - 1 + (tracks.length || 1)) % (tracks.length || 1));
    }, [tracks.length]);

    useEffect(() => {
        if (tracks.length > 0) {
            const audio = new Audio();
            audio.crossOrigin = "anonymous";
            audio.volume = volume;
            audioRef.current = audio;

            const onEnded = () => handleNext();
            const onErr = () => {
                setError(`LOAD ERROR: ${audioManifest[currentTrackIndex]?.filename || 'UNKNOWN'}`);
                setIsPlaying(false);
            };
            const onCanPlay = () => setError(null);

            audio.addEventListener('ended', onEnded);
            audio.addEventListener('error', onErr);
            audio.addEventListener('canplay', onCanPlay);
            audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
            audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));

            audio.src = tracks[currentTrackIndex];

            return () => {
                audio.pause();
                audio.removeEventListener('ended', onEnded);
                audio.removeEventListener('error', onErr);
                audio.removeEventListener('canplay', onCanPlay);
                audioRef.current = null;
            };
        }
    }, [audioManifest, currentTrackIndex, handleNext, tracks, volume]);

    useEffect(() => {
        if (audioRef.current && tracks.length > 0) {
            // Only update src if it's different to avoid reloads
            const nextSrc = tracks[currentTrackIndex];
            if (audioRef.current.src !== window.location.origin + nextSrc) {
                audioRef.current.src = nextSrc;
            }
            
            if (isPlaying) {
                audioRef.current.play().catch(err => {
                    console.error("RadioOverlay: Effect play failed", err);
                    if (err.name === 'NotAllowedError') setError("INTERACTION REQUIRED");
                });
            }
        }
    }, [currentTrackIndex, isPlaying, tracks]);

    const togglePlay = React.useCallback(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                    setError(null);
                }).catch(err => {
                    console.error("RadioOverlay: Play failed", err);
                    setError("INTERACTION REQUIRED");
                });
            }
        }
    }, [isPlaying]);

    const selectTrack = (index: number) => {
        if (audioRef.current) {
            setCurrentTrackIndex(index);
            setIsPlaying(true);
            setError(null);
            
            // Setting src and playing in the same event loop (user gesture)
            audioRef.current.src = tracks[index];
            audioRef.current.play().catch(err => {
                console.error("RadioOverlay: Select play failed", err);
                setError("INTERACTION REQUIRED");
            });
        }
    };



    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || !isFinite(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const executeSnap = React.useCallback((targetCorner: 'TL' | 'TR' | 'BL' | 'BR', instant = false) => {
        if (typeof window === 'undefined') return;
        const width = 320;
        const height = containerRef.current?.offsetHeight || 150;
        
        let targetX = 24; // left-6 -> 6 * 4 = 24px
        let targetY = 64; // top-16 -> 16 * 4 = 64px
        
        if (targetCorner === 'TR') {
            targetX = window.innerWidth - width - 24;
        } else if (targetCorner === 'BL') {
            targetY = window.innerHeight - height - 24;
        } else if (targetCorner === 'BR') {
            targetX = window.innerWidth - width - 24;
            targetY = window.innerHeight - height - 24;
        }
        
        if (instant) {
            controls.set({ x: targetX, y: targetY });
        } else {
            controls.start({ 
                x: targetX, 
                y: targetY, 
                transition: { type: "spring", stiffness: 200, damping: 22, mass: 0.8, bounce: 0.2 } 
            });
        }
    }, [controls]);

    const [visualizerData, setVisualizerData] = useState<{ delay: number, duration: number }[]>([]);

    useEffect(() => {
        setTimeout(() => {
            setVisualizerData(Array.from({ length: 6 }, () => ({
                delay: Math.random() * 0.5,
                duration: 0.3 + Math.random() * 0.5
            })));
        }, 0);
    }, []);

    const filteredManifest = useMemo(() => {
        return audioManifest.map((item, index: number) => ({ ...item, index }))
            .filter((item) => item.filename.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [audioManifest, searchTerm]);

    useEffect(() => {
        if (tracks.length === 0) return;
        localStorage.setItem('radioOverlayCorner', corner);
        
        const snap = () => executeSnap(corner);
            
        if (isInitialMount.current) {
            executeSnap(corner, true);
            isInitialMount.current = false;
        } else {
            snap();
        }

        window.addEventListener('resize', snap);
        return () => window.removeEventListener('resize', snap);
    }, [corner, controls, tracks.length, executeSnap]);

    // Track height changes (from fold/unfold) and reposition instantly
    useEffect(() => {
        if (!containerRef.current || tracks.length === 0) return;
        const observer = new ResizeObserver(() => {
            executeSnap(corner, true);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [corner, tracks.length, executeSnap]);

    const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number, y: number } }) => {
        // info.point gives absolute page coordinates. Subtract scroll to get viewport-relative position.
        const x = info.point.x - window.scrollX;
        const y = info.point.y - window.scrollY;
        const midX = window.innerWidth / 2;
        const midY = window.innerHeight / 2;

        let newCorner: 'TL' | 'TR' | 'BL' | 'BR' = 'BR';
        if (x < midX && y < midY) newCorner = 'TL';
        else if (x >= midX && y < midY) newCorner = 'TR';
        else if (x < midX && y >= midY) newCorner = 'BL';

        if (corner === newCorner) {
            executeSnap(newCorner); // force resnap if corner didn't change
        } else {
            setCorner(newCorner);
        }
    };

    const currentTrackName = audioManifest[currentTrackIndex]?.filename
        ?.replace(/\.(mp3|wav|ogg|flac|m4a|aac)$/i, '')
        ?.replace(/[-_]/g, ' ')
        ?.toUpperCase() || 'UNKNOWN RECORD';

    return (
        <>
            {tracks.length > 0 && (
                <>
                    {/* Playlist Modal */}
            <Modal 
                isOpen={isListOpen} 
                onClose={() => setIsListOpen(false)} 
                title="RECORDS DATABASE / AUDIO_FILES"
            >
                {/* Search Bar */}
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCHING RECORDS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-white/10 p-2 pl-10 text-xs focus:border-banan-primary outline-none transition-colors tracking-widest text-white/80 uppercase font-mono"
                        />
                    </div>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto p-2 banan-scrollbar custom-scroll max-h-[50vh] min-h-[50vh] font-mono">
                    {filteredManifest.map((item) => (
                        <button
                            key={item.index}
                            onClick={() => selectTrack(item.index)}
                            className={`w-full flex items-center justify-between p-3 mb-1 text-left text-xs transition-all border ${currentTrackIndex === item.index
                                    ? 'bg-banan-primary/10 border-banan-primary/50 text-banan-primary'
                                    : 'bg-white/5 border-transparent hover:border-white/20 text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-4 flex-1 truncate">
                                <span className="text-[10px] opacity-30 font-bold">{String(item.index + 1).padStart(3, '0')}</span>
                                <span className="truncate tracking-wider uppercase">
                                    {item.filename.replace(/\.(mp3|wav|ogg|flac|m4a|aac)$/i, '').replace(/[-_]/g, ' ')}
                                </span>
                            </div>
                            {currentTrackIndex === item.index && isPlaying && (
                                <div className="flex items-end gap-[1px] h-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-[2px] bg-banan-primary animate-pulse" style={{ height: `${Math.random() * 100}%` }}></div>
                                    ))}
                                </div>
                            )}
                        </button>
                    ))}
                    {filteredManifest.length === 0 && (
                        <div className="text-center py-12 text-white/20 text-xs tracking-widest uppercase font-mono">
                            No entries found in database
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-3 bg-white/5 border-t border-white/10 flex justify-between text-[8px] text-white/40 tracking-[0.3em] uppercase font-mono">
                    <span>RECORDS: {audioManifest.length}</span>
                    <span>DATABASE_SCAN_COMPLETE</span>
                </div>
            </Modal>

            {/* Main Radio Overlay */}
            <motion.div
                ref={containerRef}
                drag
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                animate={controls}
                className={`fixed top-0 left-0 z-[9999] border-t border-l border-white/10 shadow-2xl flex flex-col w-[320px] overflow-hidden select-none cursor-move`}
                style={{ backgroundColor: COLORS.black, fontFamily: "'Space Mono', monospace" }}
            >
                {/* Top Brand Bar (always visible) */}
                <div className="flex items-center justify-between px-3 py-1 bg-white/5 border-b border-white/10">
                    <div className="flex items-center gap-2 font-mono">
                        <Music size={12} style={{ color: COLORS.primary }} />
                        <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: COLORS.primary }}>
                            RADIO SYSTEM
                        </span>
                    </div>
                    <div className="flex gap-1 items-center">
                        <button
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            onClick={() => setIsListOpen(true)}
                            className="p-1 hover:bg-white/10 rounded transition-colors mr-1 text-white/50 hover:text-banan-primary"
                            title="Open Database"
                        >
                            <List size={14} />
                        </button>
                        {error && <AlertCircle size={10} className="text-banan-red animate-pulse" />}
                        <button
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-banan-primary"
                            title={isCollapsed ? 'Expand' : 'Collapse'}
                        >
                            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </button>
                    </div>
                </div>

                {/* Collapsible Content (folds down from bar) */}
                <AnimatePresence initial={false}>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 flex flex-col gap-4">
                                {/* Track Info & Visualizer */}
                                <div className="flex items-center justify-between gap-4 h-12">
                                    <div className="flex-1 overflow-hidden" onClick={() => setIsListOpen(true)} onPointerDownCapture={(e) => e.stopPropagation()}>
                                        <div className="text-[9px] text-white/40 uppercase mb-1 cursor-pointer hover:text-banan-primary transition-colors">
                                            {error ? <span className="text-banan-red font-bold">SYSTEM ERROR</span> : "RUNNING / CLICK TO SWITCH"}
                                        </div>
                                        <div className="text-xs font-bold truncate w-full tracking-wider cursor-pointer transition-all" style={{ color: error ? 'var(--color-banan-red)' : COLORS.primary }}>
                                            {error ? "RE-INITIALIZATION REQUIRED" : currentTrackName}
                                        </div>
                                    </div>
                                    {/* Visualizer animation */}
                                    <div className="flex items-end gap-[2px] h-6 w-8 bg-white/5 p-1 border border-white/5">
                                        {visualizerData.map((data, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 transition-all duration-300"
                                                style={{
                                                    backgroundColor: error ? 'rgba(255, 255, 255, 0.2)' : COLORS.primary,
                                                    height: isPlaying ? '100%' : '10%',
                                                    animation: isPlaying ? `radio-bounce ${data.duration}s infinite alternate ${data.delay}s` : 'none'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Controls Bar */}
                                <div className="flex items-center justify-between gap-4" onPointerDownCapture={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={handlePrev}
                                            className="p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-white/60 hover:text-white"
                                        >
                                            <SkipBack size={16} />
                                        </button>

                                        <button
                                            onClick={togglePlay}
                                            className="p-3 border transition-all active:scale-95 flex items-center justify-center"
                                            style={{
                                                borderColor: COLORS.primary,
                                                backgroundColor: isPlaying ? 'transparent' : `${COLORS.primary}10`,
                                                color: COLORS.primary
                                            }}
                                        >
                                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                                        </button>

                                        <button
                                            onClick={handleNext}
                                            className="p-2 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-white/60 hover:text-white"
                                        >
                                            <SkipForward size={16} />
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="flex-1 flex items-center gap-3 bg-white/5 px-3 py-2 border border-white/10">
                                        <div className="flex-1 relative h-1 bg-white/10 overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full"
                                                style={{ backgroundColor: COLORS.primary, width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                                            ></div>
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration || 0}
                                                step="0.1"
                                                value={currentTime}
                                                onChange={handleSeek}
                                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Systematic Footer */}
                            <div className="px-3 py-1 flex justify-between border-t border-white/5 opacity-30 text-[8px] uppercase tracking-widest text-white">
                                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                                <span>{isPlaying ? 'STREAMING' : 'STANDBY'}</span>
                                <span>FAC-ID-022</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <style>
                {`
                @keyframes radio-bounce {
                    0% { transform: scaleY(0.4); opacity: 0.6; }
                    100% { transform: scaleY(1.2); opacity: 1; }
                }
                .banan-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .banan-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .banan-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(250, 255, 0, 0.2);
                    border-radius: 10px;
                }
                .banan-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(250, 255, 0, 0.5);
                }
                `}
            </style>
                </>
            )}
        </>
    );
}
