import { Link } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { Banana, Radar, Shield, Skull, Target, Terminal } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import FloatingIcons from '@app/components/ui/FloatingIcons';
import ConfirmDialog from '@app/components/shared/ConfirmDialog';
import SootBanner from '@app/components/shared/SootBanner';
import ClanHeader from './components/ClanHeader';
import OsintPanel from './components/ops/OsintPanel';
import EliteContractsPanel from './components/ops/EliteContractsPanel';
import MassHackPanel from './components/ops/MassHackPanel';
import ApeRoulettePanel from './components/ops/ApeRoulettePanel';
import { useClanOps } from './lib/useClanOps';

/* ------------------------------------------------------------------- page */

export default function ClanOpsPage() {
    const ops = useClanOps();
    const { clanId, soot, treasury, activeHack, roulette, confirmRequest, setConfirmRequest, confirmBusy, runConfirmed } = ops;

    /* ----------------------------------------------------------------- views */

    if (!clanId) {
        return (
            <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
                <FloatingIcons icons={[Radar, Shield]} count={12} className="text-banan-osint/[0.05]" />
                <ClanHeader
                    title="Chambre d'opérations"
                    subtitle="Les opérations de groupe sont réservées aux unités constituées."
                    room="ops"
                    showTabs={false}
                />
                <div className="flex-1 flex items-start justify-center p-6 md:p-12 relative z-10">
                    <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-white/5 text-center space-y-4">
                        <Shield className="h-14 w-14 text-banan-primary mx-auto animate-pulse" />
                        <h3 className="text-base font-black uppercase text-white tracking-widest">Clan requis</h3>
                        <p className="text-[11px] font-mono text-white/50 uppercase leading-relaxed">
                            Hacking OSINT, contrats d'élite et Ape Roulette sont des activités coopératives.
                            Rejoignez ou fondez une unité pour y accéder.
                        </p>
                        <Link
                            to="/clan"
                            className="inline-block px-5 py-3 rounded-lg bg-banan-primary text-black font-black uppercase text-xs tracking-widest hover:bg-white transition-colors"
                        >
                            Trouver une unité
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
            <FloatingIcons icons={[Radar, Terminal, Target, Skull]} count={16} className="text-banan-osint/[0.05]" />

            <ClanHeader
                title="Chambre d'opérations"
                subtitle="Missions de groupe : infiltration OSINT, contrats d'élite, cible mondiale et barillet partagé."
                room="ops"
                stats={[
                    {
                        label: 'Trésor',
                        value: treasury === null ? '—' : formatNumber(treasury),
                        icon: Banana,
                        accent: 'text-banan-primary',
                    },
                    {
                        label: 'Opération',
                        value: activeHack ? `${activeHack.remaining_time}s` : 'Aucune',
                        accent: activeHack ? 'text-banan-osint' : 'text-white/60',
                    },
                    {
                        label: 'Barillet',
                        value: `${roulette?.remaining_chambers ?? 6}/6`,
                        accent: 'text-purple-300',
                    },
                ]}
            />

            <div className="flex-1 p-4 md:p-10 relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
                {soot.isSooty && <SootBanner />}

                <OsintPanel {...ops} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                    {/* Elite contracts ---------------------------------------- */}
                    <EliteContractsPanel {...ops} />

                    {/* Mass hack ---------------------------------------------- */}
                    <MassHackPanel {...ops} />
                </div>

                {/* Ape Roulette ------------------------------------------------ */}
                <ApeRoulettePanel {...ops} />
            </div>

            <AnimatePresence>
                {confirmRequest && (
                    <ConfirmDialog
                        request={confirmRequest}
                        busy={confirmBusy}
                        onCancel={() => setConfirmRequest(null)}
                        onConfirm={runConfirmed}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
