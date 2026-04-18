import { cn } from '@app/lib/utils';
import type { ReactNode } from 'react';

interface AuroraProps {
    children: ReactNode;
    className?: string;
}

export default function Aurora({ children, className }: AuroraProps) {
    return (
        <div className={cn("relative w-full overflow-hidden bg-banan-background", className)}>
            {/* Cleaner Gradient Background - No heavy blurs that cause banding */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: `
                    radial-gradient(circle at 50% -20%, rgba(250, 255, 0, 0.12) 0%, transparent 60%),
                    radial-gradient(circle at 100% 100%, rgba(74, 222, 128, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 0% 100%, rgba(250, 255, 0, 0.05) 0%, transparent 50%)
                `
                }}
            />

            {/* Scanline Effect overlay for texture */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[url('/img/noise.svg')]" />

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
