import { ArrowUpRight, FileText, Plus } from 'lucide-react';

interface TimelineEvent {
    date: string;
    title: string;
    description: string;
    file: string;
    log: string[];
    conclusion: string;
}

// These records are deliberately fictional campus folklore, not a dated account of real events.
const EVENTS: TimelineEvent[] = [
    {
        date: 'SEP 2025',
        title: "L'Étincelle Originelle",
        description: 'Une banane apparaît dans les discussions. Personne ne revendique officiellement la responsabilité du potassium.',
        file: 'DOSSIER 001 / PREMIER CONTACT',
        log: ['Objet observé : une banane.', 'Nombre de témoins fiables : variable.', 'Niveau de gravité : beaucoup trop élevé pour un fruit.'],
        conclusion: 'L’enquête recommande de ne surtout pas demander pourquoi.',
    },
    {
        date: 'OCT 2025',
        title: 'La Réserve Fédérale Bananière',
        description: 'Les premières expérimentations de BananINT circulent entre étudiants sur le campus.',
        file: 'DOSSIER 002 / CIRCULATION',
        log: ['Une personne en parle à une autre.', 'Cette autre personne en parle à trois autres.', 'Le service comptable refuse de reconnaître la banane comme devise.'],
        conclusion: 'Le bouche-à-oreille reste notre technologie la plus instable.',
    },
    {
        date: 'NOV 2025',
        title: "L'Incident MiNET",
        description: 'Une rumeur affirme qu’une banane aurait traversé un câble Ethernet. Aucun paquet n’a souhaité témoigner.',
        file: 'DOSSIER 003 / RÉSEAU',
        log: ['Ping : pong.', 'Ping : banane.', 'Diagnostic : le câble nie toute implication.'],
        conclusion: 'Le câble réclame un avocat.',
    },
    {
        date: 'DEC 2025',
        title: "L'Incident du BDE",
        description: 'Une banane dépose sa candidature au BDE. Le formulaire exige un prénom.',
        file: 'DOSSIER 004 / PROCÈS-VERBAL',
        log: ['Point 1 : la banane demande la parole.', 'Point 2 : la parole lui est refusée.', 'Point 3 : le procès-verbal est mystérieusement jaune.'],
        conclusion: 'La banane fait appel. L’appel est occupé.',
    },
    {
        date: 'JAN 2026',
        title: 'La Secte',
        description: 'Le protocole prend de l’ampleur. Ses membres prétendent qu’il ne s’agit que d’un jeu. Le protocole refuse de commenter.',
        file: 'DOSSIER 005 / ORGANIGRAMME',
        log: ['Présidence : non renseignée.', 'Trésorerie : une peau de banane.', 'Mot de passe du jour : [CAVIARDÉ].'],
        conclusion: 'Structure officielle introuvable. Ambiance très officielle.',
    },
    {
        date: '??? ????',
        title: '[SIGNAL PERDU]',
        description: 'Toute transmission ultérieure a été chiffrée. Le protocole continue, quelque part, hors de portée.',
        file: 'DOSSIER 006 / TRANSMISSION INCOMPLÈTE',
        log: ['Connexion au serveur…', 'Déchiffrement : 0 %', 'Dernier message lisible : « Vous êtes encore là ? »'],
        conclusion: 'Page suivante introuvable.',
    },
];

export default function ProtocolTimeline() {
    return (
        <section aria-labelledby="timeline-title" className="mx-auto w-full max-w-6xl text-left">
            <div className="mb-12 border-t border-banan-primary/60 pt-5 md:mb-20">
                <h2 id="timeline-title" className="font-sans text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] text-white sm:text-5xl md:text-7xl">Les <span className="text-banan-primary">incidents.</span></h2>
            </div>

            <ol className="relative">
                {EVENTS.map((event, index) => {
                    const isLast = index === EVENTS.length - 1;
                    return (
                        <li key={event.file} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 md:grid-cols-[minmax(0,13rem)_2rem_minmax(0,1fr)] md:gap-x-6">
                            <div className="hidden pt-2 text-right md:block">
                                <span className={`font-mono text-2xl font-bold tracking-[-0.08em] lg:text-3xl ${isLast ? 'text-white/40' : 'text-banan-primary'}`}>{event.date}</span>
                            </div>

                            <div className="relative flex justify-center" aria-hidden="true">
                                {!isLast && <div className="absolute top-4 -bottom-4 w-px bg-gradient-to-b from-banan-primary/70 to-banan-primary/15" />}
                                <div className={`relative z-10 mt-2 h-4 w-4 rounded-full border-[3px] bg-banan-black shadow-[0_0_18px_var(--color-banan-primary)] ${isLast ? 'border-white/50' : 'border-banan-primary'}`} />
                            </div>

                            <div className={`min-w-0 border-b border-white/10 pb-14 md:pb-20 ${isLast ? 'border-b-0' : ''}`}>
                                <p className="mb-3 font-mono text-sm font-bold tracking-wider text-banan-primary md:hidden">[{event.date}]</p>
                                <h3 className={`max-w-2xl break-words font-sans font-black uppercase leading-[0.98] tracking-[-0.045em] text-white ${index === 0 ? 'text-[clamp(1.5rem,7.5vw,1.875rem)] sm:text-5xl lg:text-6xl' : 'text-[clamp(1.5rem,7.5vw,1.875rem)] sm:text-4xl lg:text-5xl'} ${isLast ? 'text-white/70' : ''}`}>{event.title}</h3>
                                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">{event.description}</p>

                                <details className="group mt-7 max-w-2xl border-t border-white/20 open:border-banan-primary/60">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.13em] text-banan-primary transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-banan-primary [&::-webkit-details-marker]:hidden">
                                        <span className="flex items-center gap-3"><FileText aria-hidden="true" className="h-4 w-4 shrink-0" /><span><span className="group-open:hidden">Ouvrir</span><span className="hidden group-open:inline">Refermer</span> le dossier {String(index + 1).padStart(2, '0')}</span></span>
                                        <Plus aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-45" />
                                    </summary>
                                    <div className="mb-3 border-l-2 border-banan-primary bg-white/[0.035] px-4 py-5 sm:px-6">
                                        <p className="border-b border-white/10 pb-4 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">{event.file}</p>
                                        <ul className="space-y-3 py-5 font-mono text-xs leading-relaxed text-white/75 sm:text-sm">
                                            {event.log.map((line, lineIndex) => <li key={line}><span className="mr-3 text-banan-primary/60">{String(lineIndex + 1).padStart(2, '0')} /</span>{line}</li>)}
                                        </ul>
                                        <p className="flex gap-2 border-t border-white/10 pt-4 text-sm leading-relaxed text-banan-primary"><ArrowUpRight aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{event.conclusion}</p>
                                    </div>
                                </details>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
