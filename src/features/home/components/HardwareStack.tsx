import { Cpu, Server, Database, LayoutTemplate, Activity, Globe, ShieldCheck, Waypoints } from 'lucide-react';
import { motion } from 'framer-motion';
import ShowcaseSection from './ShowcaseSection';

interface Node {
    title: string;
    stack: string;
    icon: React.ElementType;
    color: string;
}

const NODES: Record<string, Node> = {
    internet: {
        title: "Internet",
        stack: "World Wide Web",
        icon: Globe,
        color: "var(--color-banan-white)",
    },
    proxy: {
        title: "Nginx Proxy",
        stack: "Load Balancer",
        icon: Waypoints,
        color: "var(--color-banan-green)",
    },
    frontend: {
        title: "Frontend",
        stack: "React / Vite",
        icon: LayoutTemplate,
        color: "var(--color-banan-teal)",
    },
    backend: {
        title: "Backend API",
        stack: "FastAPI / Python",
        icon: Server,
        color: "var(--color-banan-primary)",
    },
    iam: {
        title: "IAM Server",
        stack: "Keycloak",
        icon: ShieldCheck,
        color: "var(--color-banan-red)",
    },
    db: {
        title: "Primary DB",
        stack: "PostgreSQL",
        icon: Database,
        color: "var(--color-stock-up)",
    },
    iamDb: {
        title: "Auth DB",
        stack: "PostgreSQL",
        icon: Database,
        color: "var(--color-stock-down)",
    }
};

const NodeCard = ({ node, delay }: { node: Node, delay: number }) => {
    const Icon = node.icon;
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay }}
            className="w-full h-full flex items-center justify-center p-2 md:py-8 md:px-4"
        >
            <div 
                className="relative p-2 sm:p-4 md:p-6 w-full max-w-[260px] bg-black/80 backdrop-blur-md rounded-xl border border-white/10 hover:border-white/30 transition-all group/node overflow-hidden"
                style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.05) inset` }}
            >
                <div className="absolute inset-0 opacity-0 group-hover/node:opacity-10 transition-opacity duration-500 blur-xl" style={{ backgroundColor: node.color }}></div>
                
                <div className="relative z-10 text-center flex flex-col items-center">
                    <div className="inline-flex items-center justify-center p-2 sm:p-3 md:p-4 bg-white/5 rounded-full border border-white/10 mb-2 sm:mb-3 group-hover/node:scale-110 transition-transform">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" style={{ color: node.color }} />
                    </div>
                    <h3 className="font-mono text-[9px] sm:text-xs md:text-md font-bold text-white uppercase tracking-widest leading-tight mb-1">{node.title}</h3>
                    <div className="text-white/60 font-mono text-[8px] sm:text-[10px] md:text-xs inline-flex flex-wrap items-center gap-1 sm:gap-2 justify-center w-full mt-1">
                        <Activity className="w-2 h-2 sm:w-3 sm:h-3 text-banan-primary animate-pulse shrink-0" />
                        <span className="truncate">{node.stack}</span>
                    </div>
                </div>

                {/* Data indicators */}
                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-banan-primary animate-ping"></div>
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/20"></div>
                </div>
            </div>
        </motion.div>
    );
};

const UniversalConnections = () => {
    const drawPath = (x1: number, y1: number, x2: number, y2: number, color: string, delay: number) => {
        const d = `M ${x1} ${y1} L ${x2} ${y2}`;
        return (
            <g key={`${x1}-${y1}-${x2}-${y2}`}>
                <path d={d} stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" fill="none" strokeDasharray="1 1" />
                <motion.path 
                    d={d} 
                    stroke={color} 
                    strokeWidth="0.6" 
                    fill="none" 
                    initial={{ pathLength: 0, opacity: 0 }} 
                    animate={{ pathLength: 1, opacity: [0, 1, 0] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay }} 
                />
            </g>
        )
    };

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Internet to Proxy */}
            {drawPath(50, 12.5, 50, 37.5, NODES.internet.color, 0)}
            
            {/* Proxy to Frontend */}
            {drawPath(50, 37.5, 16.666, 62.5, NODES.proxy.color, 0.5)}
            
            {/* Proxy to Backend */}
            {drawPath(50, 37.5, 50, 62.5, NODES.proxy.color, 0.8)}
            
            {/* Proxy to IAM */}
            {drawPath(50, 37.5, 83.333, 62.5, NODES.proxy.color, 1.1)}
            
            {/* Backend to DB */}
            {drawPath(50, 62.5, 50, 87.5, NODES.backend.color, 1.4)}
            
            {/* IAM to IAM DB */}
            {drawPath(83.333, 62.5, 83.333, 87.5, NODES.iam.color, 1.7)}
        </svg>
    )
}

export default function HardwareStack() {
    return (
        <ShowcaseSection title="Souveraineté technologique" icon={Cpu} maxWidth="max-w-6xl">
            <div className="mb-12 -mt-8 flex flex-col gap-2 max-w-2xl">
                <p className="text-banan-primary font-mono text-sm tracking-[0.2em] uppercase font-bold">
                    // PROTOCOLE D'INDÉPENDANCE
                </p>
                <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed italic">
                    Infrastructure 100% auto-hébergée. Zéro dépendance externe. Un contrôle total sur chaque octet de donnée BananINT.
                </p>
            </div>
            <div className="relative pt-6 md:pt-16 pb-6 md:pb-16 bg-black border border-white/20 rounded-3xl overflow-hidden group">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-banan-black -z-20"></div>
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen -z-10"
                    style={{
                        backgroundImage: `
                            repeating-linear-gradient(0deg, transparent, transparent 19px, var(--color-banan-white) 19px, var(--color-banan-white) 20px),
                            repeating-linear-gradient(90deg, transparent, transparent 19px, var(--color-banan-white) 19px, var(--color-banan-white) 20px)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                ></div>

                <div className="relative z-10 w-full mx-auto px-2 md:px-8">
                    <UniversalConnections />

                    {/* Perfect 3x4 Grid layout to match exact SVG coordinate percentages */}
                    <div className="grid grid-cols-3 gap-0 relative z-10 w-full h-full items-center justify-items-center">
                        {/* Row 1: Internet */}
                        <div className="w-full h-full"></div>
                        <NodeCard node={NODES.internet} delay={0} />
                        <div className="w-full h-full"></div>

                        {/* Row 2: Entry point */}
                        <div className="w-full h-full"></div>
                        <NodeCard node={NODES.proxy} delay={0.2} />
                        <div className="w-full h-full"></div>
                        
                        {/* Row 3: Logic Layer */}
                        <NodeCard node={NODES.frontend} delay={0.4} />
                        <NodeCard node={NODES.backend} delay={0.6} />
                        <NodeCard node={NODES.iam} delay={0.8} />

                        {/* Row 4: Data Layer */}
                        <div className="w-full h-full"></div>
                        <NodeCard node={NODES.db} delay={1.0} />
                        <NodeCard node={NODES.iamDb} delay={1.2} />
                    </div>
                </div>
            </div>
        </ShowcaseSection>
    );
}
