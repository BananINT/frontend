import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import ShowcaseSection from './ShowcaseSection';

interface GameEvent {
    id: number;
    timestamp: string;
    type: string;
    message: string;
}

const eventColor = (type: string) => {
    if (type === 'MARKET') return 'text-banan-primary border-banan-primary/40';
    if (type === 'CLAN' || type === 'MASS-HACK' || type === 'OSINT') return 'text-banan-teal border-banan-teal/40';
    if (type === 'CASINO' || type === 'ROULETTE') return 'text-rose-400 border-rose-400/40';
    if (type === 'GOLDEN') return 'text-amber-300 border-amber-300/40';
    return 'text-white/70 border-white/25';
};

export default function LiveHub() {
    const [events, setEvents] = useState<GameEvent[]>([]);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        let mounted = true;
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/stats/logs');
                if (!response.ok) throw new Error('Events unavailable');
                const data: GameEvent[] = await response.json();
                if (mounted) {
                    setEvents(data.slice(0, 6));
                    setStatus('ready');
                }
            } catch {
                if (mounted) setStatus('error');
            }
        };
        fetchEvents();
        const interval = window.setInterval(fetchEvents, 5000);
        return () => { mounted = false; window.clearInterval(interval); };
    }, []);

    return (
        <ShowcaseSection title="Ça bouge dans le jeu" icon={Activity}>
            <div className="grid gap-8 border-t border-white/20 pt-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.28em] text-banan-primary">Les derniers coups</p>
                    <p className="mt-5 max-w-sm text-2xl font-bold leading-tight text-white/85 sm:text-3xl">Ce que les bananiers viennent de faire.</p>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50">
                        {status === 'ready' ? 'Les événements du jeu se mettent à jour ici toutes les cinq secondes.' : status === 'loading' ? 'On récupère les derniers événements.' : 'Le flux est momentanément indisponible.'}
                    </p>
                    <Link to="/clicker" className="mt-6 inline-flex items-center gap-2 font-mono text-sm font-bold text-banan-primary underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-banan-primary">
                        Entrer dans le jeu <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                </div>
                <div className="min-w-0">
                    {events.length ? (
                        <ol className="border-l border-banan-primary/35 pl-6 sm:pl-8">
                            {events.map(event => (
                                <li key={event.id} className="relative border-b border-white/10 py-5 first:pt-0">
                                    <span className="absolute -left-[31px] top-7 h-3 w-3 rounded-full border-2 border-banan-primary bg-black sm:-left-[39px]" aria-hidden="true" />
                                    <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className={`border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${eventColor(event.type)}`}>{event.type}</span>
                                        <time dateTime={event.timestamp} className="font-mono text-xs tabular-nums text-white/40">{event.timestamp.slice(11, 16)}</time>
                                    </div>
                                    <p className="break-words text-sm leading-relaxed text-white/80 sm:text-base">{event.message}</p>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className="border-l border-banan-primary/35 py-8 pl-6 text-sm text-white/55 sm:pl-8">
                            {status === 'loading' ? 'Chargement des événements…' : status === 'error' ? 'Impossible d’afficher les événements pour le moment.' : 'Aucun événement récent à afficher.'}
                        </div>
                    )}
                </div>
            </div>
        </ShowcaseSection>
    );
}
