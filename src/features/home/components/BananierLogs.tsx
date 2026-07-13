
import { FileCode2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ShowcaseSection from './ShowcaseSection';

const LOGS = [
    { op: "TTL_404", time: "23:42:01", text: "Je suis entré pour une banane, j'ai fini par investir l'équivalent du PIB du Venezuela dans le BNDAQ. Ne regrette rien." },
    { op: "CHEF_PROJET", time: "02:14:59", text: "Si mon équipe mettait autant d'efforts dans le projet GATE que sur BananINT... on aurait fini avant d'avoir rendu les livrables de Helene Charbon." },
    { op: "XX-WIN3T-XX", time: "11:22:33", text: "Avis à tous les bananiers : arrêtez de spammer le réseau. Nous avons 80% de saturation sur le routeur central. Le WIFI EST ENCORE MORT" },
    { op: "OWOTUCKY_AWINT", time: "08:12:00", text: "Arrêtez d'acheter des actions PINTE_COIN, tout le monde sait que ça pue la merde." },
    { op: "X_x_SNIPER_x_X", time: "05:51:22", text: "J'ai cliqué 400 000 fois. Ma souris est morte. Mon couple est mort. Mais j'ai débloqué le skin Or. Worth it." },
    { op: "Nova_Admin", time: "11:24:43", text: "Au début je pensais que c'était une blague de MiNET. Ensuite j'ai compris. Maintenant BananINT est ma religion." },
];

export default function BananierLogs() {
    return (
        <ShowcaseSection title="Avis Des Bananiers" icon={FileCode2} centered>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {LOGS.map((log, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        className="p-6 bg-[#0a0a0a] border border-white/10 hover:border-banan-primary/50 transition-colors rounded-2xl relative group overflow-hidden"
                    >
                        {/* Decoding effect */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-banan-primary/50 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-linear"></div>

                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                            <span className="font-mono text-xs text-banan-primary font-bold">{log.op}</span>
                        </div>
                        
                        <p className="font-mono text-sm leading-relaxed text-white/70">
                            {'>'} {log.text}
                        </p>
                    </motion.div>
                ))}
            </div>
        </ShowcaseSection>
    );
}
