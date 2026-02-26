import type { ReactNode, ComponentType } from 'react';

interface GameSectionProps {
    title: string;
    icon?: ComponentType<{ className?: string }>;
    children?: ReactNode;
    rightElement?: ReactNode;
    className?: string;
    headerClassName?: string;
}

export default function GameSection({
    title,
    icon: Icon,
    children,
    rightElement,
    className = "p-4",
    headerClassName = "mb-6"
}: GameSectionProps) {
    return (
        <div className={`w-full border-t border-white/10 bg-banan-black flex flex-col ${className}`}>
            <div className={`flex items-center gap-2 ${headerClassName}`}>
                {Icon && <Icon className="h-4 w-4 text-banan-primary" />}
                <h2 className="text-xl font-black text-banan-primary uppercase tracking-tighter">
                    {title}
                </h2>
                <div className="h-px flex-1 bg-white/10" />
                {rightElement && (
                    <div className="text-xs font-mono text-white/50">
                        {rightElement}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}
