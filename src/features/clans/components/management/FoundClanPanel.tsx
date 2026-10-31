import { Info, Plus } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import Panel from '../Panel';
import { CLAN_CREATION_COST } from '../../lib/useClanManagement';
import type { ClanManagement } from '../../lib/useClanManagement';

type FoundClanPanelProps = Pick<ClanManagement, 'newName' | 'setNewName' | 'newDesc' | 'setNewDesc' | 'bananas' | 'handleCreateClan'>;

/** Form to found a new clan. */
export default function FoundClanPanel({ newName, setNewName, newDesc, setNewDesc, bananas, handleCreateClan }: FoundClanPanelProps) {
    return (
        <Panel
            title="Fonder une unité"
            icon={Plus}
            accent="green"
            subtitle="Votre nom, vos règles, votre trésorerie."
        >
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-white/50 uppercase tracking-widest">
                        Nom du clan
                    </label>
                    <input
                        type="text"
                        value={newName}
                        onChange={e =>
                            setNewName(e.target.value.toUpperCase().replace(/[^A-Z0-9_ ]/g, ''))
                        }
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-banan-primary outline-none"
                        placeholder="EX: ALPHA_SQUAD..."
                        maxLength={20}
                    />
                    <div className="text-[11px] font-mono text-white/60 uppercase text-right">
                        {newName.length}/20 · 3 caractères minimum
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-white/50 uppercase tracking-widest">
                        Description
                    </label>
                    <textarea
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-banan-primary outline-none h-20"
                        placeholder="Objectifs de l'unité..."
                        maxLength={100}
                    />
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 text-red-400 text-[11px] font-bold uppercase mb-1">
                        <Info className="h-3 w-3" /> Coût de fondation
                    </div>
                    <p className="text-[11px] font-mono text-white/60">
                        <span className="text-banan-primary font-bold">
                            {formatNumber(CLAN_CREATION_COST)} 🍌
                        </span>{' '}
                        — il vous reste {formatNumber(bananas)} 🍌.
                    </p>
                </div>
                <button
                    onClick={handleCreateClan}
                    disabled={newName.trim().length < 3 || bananas < CLAN_CREATION_COST}
                    className="w-full bg-banan-primary text-black py-3.5 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Initialiser l'unité
                </button>
            </div>
        </Panel>
    );
}
