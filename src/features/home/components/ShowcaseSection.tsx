import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

interface ShowcaseSectionProps {
    title: string;
    icon?: LucideIcon;
    badge?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
    centered?: boolean;
}

const revealVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export default function ShowcaseSection({ 
    title, 
    icon: Icon, 
    badge, 
    children, 
    className = "", 
    maxWidth = "max-w-6xl",
    centered = false 
}: ShowcaseSectionProps) {
    return (
        <motion.div 
            variants={revealVariants}
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className={`w-full ${maxWidth} mx-auto relative z-30 ${centered ? 'text-center my-16 sm:my-20' : 'text-left my-16 sm:my-25'} ${className}`}
        >
            <div className={`flex items-center gap-3 md:gap-4 ${centered ? 'justify-center mb-6 text-center flex-col md:flex-row' : 'mb-8 sm:mb-12 text-left'}`}>
                {Icon && <Icon className={`text-banan-primary shrink-0 ${centered ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'}`} />}
                <h2 className={`${centered ? 'text-[clamp(1.75rem,8vw,3rem)] md:text-5xl' : 'text-[clamp(1.75rem,7vw,2.25rem)] md:text-4xl'} font-black uppercase text-white tracking-tight min-w-0 [overflow-wrap:break-word]`}>
                    {title}
                </h2>
                {!centered && <div className="h-1 flex-1 bg-gradient-to-r from-banan-primary to-transparent ml-4" />}
                {!centered && badge && (
                    <div className="ml-auto">
                        {badge}
                    </div>
                )}
            </div>

            <div className="relative">
                {children}
            </div>
        </motion.div>
    );
}
