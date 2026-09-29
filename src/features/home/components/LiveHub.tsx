import { useEffect, useState, useRef } from 'react';
import { Terminal, Activity, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShowcaseSection from './ShowcaseSection';

interface LogEntry {
    id: number;
    timestamp: string;
    level: 'INFO' | 'WARN' | 'CRITICAL';
    message: string;
}

// Mock removed

export default function LiveHub() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch('/api/stats/logs');
                if (response.ok) {
                    const data = await response.json();
                    
                    interface RawLog {
                        id: number;
                        timestamp: string;
                        type: string;
                        message: string;
                    }

                    // Filter out already existing logs to prevent duplicates
                    setLogs(prev => {
                        const existingIds = new Set(prev.map(l => l.id));
                        const newEntries = (data as RawLog[]).filter((d: RawLog) => !existingIds.has(d.id)).map((d: RawLog) => ({
                            id: d.id,
                            timestamp: d.timestamp.substring(11, 19),
                            level: d.type as 'INFO' | 'WARN' | 'CRITICAL',
                            message: d.message
                        })).reverse(); // Reverse to add oldest first from the new batch
                        
                        if (newEntries.length === 0) return prev;
                        
                        const merged = [...prev, ...newEntries];
                        if (merged.length > 50) return merged.slice(merged.length - 50);
                        return merged;
                    });
                }
            } catch (err) {
                console.error("Failed to fetch game logs", err);
            }
        };

        // Initial fetch
        fetchLogs();

        // Poll every 5 seconds
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'INFO': return 'text-banan-green';
            case 'WARN': return 'text-banan-teal';
            case 'CRITICAL': return 'text-banan-red';
            default: return 'text-white/50';
        }
    };

    return (
        <ShowcaseSection title="Terminal d'Activité" icon={Terminal}>
            <div className="mx-auto max-w-4xl min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0B]">
                {/* Window Header */}
                <div className="bg-white/5 border-b border-white/10 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-banan-primary animate-pulse" />
                        <span className="text-xs font-mono uppercase tracking-widest text-white/50">Flux Global // Live</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-banan-primary/50 animate-pulse"></div>
                    </div>
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[url('/img/grid.svg')] opacity-5 z-0"></div>
                <div className="absolute inset-x-0 top-0 h-[2px] bg-banan-primary/20 pointer-events-none z-10 animate-[scan_4s_linear_infinite]"></div>

                {/* Log Content */}
                <div 
                    ref={containerRef}
                    className="relative z-10 h-[260px] min-w-0 overflow-y-auto p-3 font-mono text-xs sm:h-[300px] sm:p-6 sm:text-sm"
                >
                    <AnimatePresence initial={false}>
                        {logs.map((log) => (
                            <motion.div 
                                key={log.id}
                                initial={false}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-3 flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1 sm:flex-nowrap sm:gap-3"
                            >
                                <span className="shrink-0 text-white/30">[{log.timestamp}]</span>
                                <span className={`${getLevelColor(log.level)} font-bold shrink-0 w-16`}>
                                    {log.level}
                                </span>
                                <span className="min-w-0 basis-full break-words text-white/80 opacity-90 sm:basis-auto">
                                    {log.level === 'CRITICAL' && <AlertTriangle className="w-3 h-3 inline-block mr-1 -mt-0.5 text-banan-red" />}
                                    {log.message}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {/* Blinking cursor */}
                    <div className="mt-2 flex items-center gap-2 text-banan-primary">
                        <span>&gt;</span>
                        <motion.div 
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            className="w-2 h-4 bg-banan-primary"
                        />
                    </div>
                </div>
            </div>
        </ShowcaseSection>
    );
}
