import { ShieldCheck, Terminal } from 'lucide-react';
import GameLayout from '../components/GameLayout';
import FairnessPanel from '../components/FairnessPanel';

const VERIFY_SNIPPET = `# Rejouez n'importe quel tirage après avoir révélé la graine serveur.
import hmac, hashlib

def roll(server_seed, client_seed, nonce, cursor=0):
    msg = f"{client_seed}:{nonce}:{cursor}".encode()
    digest = hmac.new(server_seed.encode(), msg, hashlib.sha256).digest()
    return (int.from_bytes(digest[:7], "big") >> 4) / float(1 << 52)

# Vérifiez d'abord l'engagement :
#   sha256(server_seed) == empreinte publiée AVANT vos mises`;

export default function FairnessPage() {
    return (
        <GameLayout
            icon={ShieldCheck}
            title="Le RNG Vérifiable"
            subtitle="La maison s'engage sur une graine avant votre mise. À vous de vérifier qu'elle n'a pas triché."
            accent="text-banan-osint"
            accentGlow="bg-banan-osint/20"
            floating={[ShieldCheck, Terminal]}
            floatingClass="text-banan-osint/[0.06]"
        >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-banan-osint">
                    Comment ça marche
                </h2>
                <ol className="flex flex-col gap-3 text-xs font-mono text-white/50 leading-relaxed">
                    <li>
                        <span className="text-banan-osint font-bold">1.</span> Le serveur tire une graine
                        secrète et publie uniquement son empreinte SHA-256. Elle est visible ci-dessous,{' '}
                        <em>avant</em> que vous ne misiez.
                    </li>
                    <li>
                        <span className="text-banan-osint font-bold">2.</span> Vous choisissez votre propre
                        graine client. Le serveur ne peut donc pas choisir la combinaison qui l'arrange.
                    </li>
                    <li>
                        <span className="text-banan-osint font-bold">3.</span> Chaque tirage vaut
                        HMAC-SHA256(graine serveur, « graine client:nonce »), le nonce augmentant d'une mise à
                        l'autre.
                    </li>
                    <li>
                        <span className="text-banan-osint font-bold">4.</span> Quand vous faites tourner la
                        paire, l'ancienne graine serveur est révélée. Son empreinte doit correspondre à celle
                        publiée à l'étape 1 — sinon la maison a triché.
                    </li>
                </ol>
            </div>

            <div className="bg-black/60 border border-banan-osint/20 rounded-2xl overflow-hidden">
                <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-banan-osint" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                        verify.py
                    </span>
                </div>
                <pre className="p-4 text-[11px] font-mono text-banan-osint/80 overflow-x-auto leading-relaxed">
                    {VERIFY_SNIPPET}
                </pre>
            </div>

            <FairnessPanel />

            <p className="text-[11px] font-mono text-white/30 uppercase text-center leading-relaxed">
                Ce panneau est également disponible sous chaque table du casino.
            </p>
        </GameLayout>
    );
}
