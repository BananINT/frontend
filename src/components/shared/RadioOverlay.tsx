import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, AlertCircle, List, Search } from 'lucide-react';
import Modal from '@app/components/shared/Modal';
import { motion, useAnimation } from 'framer-motion';

// Use Vite's import.meta.glob to automatically map the public/audio folder
const rawAudioFiles = import.meta.glob('/public/audio/*.{mp3,wav,ogg,flac,m4a,aac}', { eager: true, as: 'url' }) as Record<string, string>;

export default function RadioOverlay() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isListOpen, setIsListOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
        carbon: 'var(--color-banan-carbon)',  // Deep Background
        glass: 'rgba(255,255,255,0.05)',
        structure: 'rgba(255,255,255,0.1)'
    };

    const audioManifest = useMemo(() => {
        return Object.keys(rawAudioFiles).map(filePath => filePath.split('/').pop()!).sort();
    }, []);

    const tracks = audioManifest.map((filename: string) => `/audio/${encodeURIComponent(filename)}`);

    useEffect(() => {
        if (tracks.length > 0) {
            const audio = new Audio();
            audio.volume = volume;
            audioRef.current = audio;

            const handleEnded = () => handleNext();
            const handleError = () => {
                setError(`LOAD ERROR: ${audioManifest[currentTrackIndex]}`);
                setIsPlaying(false);
            };
            const handleCanPlay = () => setError(null);

            audio.addEventListener('ended', handleEnded);
            audio.addEventListener('error', handleError);
            audio.addEventListener('canplay', handleCanPlay);

            audio.src = tracks[currentTrackIndex];

            return () => {
                audio.pause();
                audio.removeEventListener('ended', handleEnded);
                audio.removeEventListener('error', handleError);
                audio.removeEventListener('canplay', handleCanPlay);
                audioRef.current = null;
            };
        }
    }, []);

    useEffect(() => {
        if (audioRef.current && tracks.length > 0) {
            audioRef.current.src = tracks[currentTrackIndex];
            if (isPlaying) {
                audioRef.current.play().catch(() => setIsPlaying(false));
            }
        }
    }, [currentTrackIndex]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
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
    };

    const handleNext = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    };

    const handlePrev = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    };

    const selectTrack = (index: number) => {
        setCurrentTrackIndex(index);
        if (!isPlaying) togglePlay();
        setIsListOpen(false);
    };

    const toggleMute = () => setIsMuted(!isMuted);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
        if (isMuted) setIsMuted(false);
    };

    const executeSnap = (targetCorner: 'TL' | 'TR' | 'BL' | 'BR', instant = false) => {
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
    };

    const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: any) => {
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

    if (tracks.length === 0) return null;

    const currentTrackName = audioManifest[currentTrackIndex]
        ?.replace(/\.(mp3|wav|ogg|flac|m4a|aac)$/i, '')
        ?.replace(/[-_]/g, ' ')
        ?.toUpperCase() || 'UNKNOWN UNIT';

    const filteredManifest = audioManifest.map((name: string, index: number) => ({ name, index }))
        .filter((item: { name: string, index: number }) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
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
    }, [corner, controls, tracks.length]);

    return (
        <>
            {/* Playlist Modal */}
            <Modal isOpen={isListOpen} onClose={() => setIsListOpen(false)} title="UNIT DATABASE / AUDIO_FILES">
                {/* Search Bar */}
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH UNITS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-white/10 p-2 pl-10 text-xs focus:border-banan-primary outline-none transition-colors tracking-widest text-white/80 uppercase font-mono"
                        />
                    </div>
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto p-2 banan-scrollbar custom-scroll max-h-[50vh] min-h-[50vh] font-mono">
                    {filteredManifest.map((item: { name: string, index: number }) => (
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
                                    {item.name.replace(/\.(mp3|wav|ogg|flac|m4a|aac)$/i, '').replace(/[-_]/g, ' ')}
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
                {/* Header / Brand Bar */}
                <div className="flex items-center justify-between px-3 py-1 bg-white/5 border-b border-white/10">
                    <div className="flex items-center gap-2 font-mono">
                        <Music size={12} style={{ color: COLORS.primary }} />
                        <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: COLORS.primary }}>
                            RADIO-OPERATOR SYSTEM
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
                        {error && <AlertCircle size={10} className="text-red-500 animate-pulse" />}
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isPlaying ? 'var(--color-banan-green)' : (error ? 'var(--color-banan-red)' : 'var(--color-banan-gray)') }}></div>
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-4">
                    {/* Track Info & Visualizer */}
                    <div className="flex items-center justify-between gap-4 h-12">
                        <div className="flex-1 overflow-hidden" onClick={() => setIsListOpen(true)} onPointerDownCapture={(e) => e.stopPropagation()}>
                            <div className="text-[9px] text-white/40 uppercase mb-1 cursor-pointer hover:text-banan-primary transition-colors">
                                {error ? <span className="text-red-500 font-bold">SYSTEM ERROR</span> : "UNIT STREAM / CLICK TO SEARCH"}
                            </div>
                            <div className="text-xs font-bold truncate w-full tracking-wider cursor-pointer transition-all" style={{ color: error ? 'var(--color-banan-red)' : COLORS.primary }}>
                                {error ? "RE-INITIALIZATION REQUIRED" : currentTrackName}
                            </div>
                        </div>
                        {/* Visualizer animation */}
                        <div className="flex items-end gap-[2px] h-6 w-8 bg-white/5 p-1 border border-white/5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="flex-1 transition-all duration-300"
                                    style={{
                                        backgroundColor: error ? 'var(--color-banan-gray)' : COLORS.primary,
                                        height: isPlaying ? `${Math.random() * 80 + 20}%` : '10%',
                                        animation: isPlaying ? `radio-bounce ${0.3 + Math.random() * 0.5}s infinite alternate` : 'none'
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

                        {/* Volume Section */}
                        <div className="flex-1 flex items-center gap-3 bg-white/5 px-3 py-2 border border-white/10">
                            <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
                                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                            </button>
                            <div className="flex-1 relative h-1 bg-white/10 overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full transition-all duration-150"
                                    style={{ backgroundColor: COLORS.primary, width: `${(isMuted ? 0 : volume) * 100}%` }}
                                ></div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Systematic Footer */}
                <div className="px-3 py-1 flex justify-between border-t border-white/5 opacity-30 text-[8px] uppercase tracking-widest text-white">
                    <span>VOL: {Math.round(volume * 100)}%</span>
                    <span>{isPlaying ? 'STREAMING' : 'STANDBY'}</span>
                    <span>FAC-ID-022</span>
                </div>
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
    );
}
