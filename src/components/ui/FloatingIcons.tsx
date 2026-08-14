import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface FloatingIconsProps {
    icons: LucideIcon[];
    count?: number;
    className?: string;
}

export default function FloatingIcons({ icons, count = 10, className = 'text-white/5' }: FloatingIconsProps) {
    const [items] = useState(() =>
        Array.from({ length: count }, (_, i) => {
            const Icon = icons[i % icons.length];
            return {
                Icon,
                top: Math.random() * 90,
                left: Math.random() * 92,
                size: 16 + Math.random() * 28,
                duration: 5 + Math.random() * 6,
                delay: Math.random() * 4,
                rot: Math.random() > 0.5 ? 15 : -15,
            };
        })
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {items.map(({ Icon, top, left, size, duration, delay, rot }, i) => (
                <Icon
                    key={i}
                    className={`absolute ${className}`}
                    style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        width: size,
                        height: size,
                        animation: `float-bob ${duration}s ease-in-out ${delay}s infinite`,
                        // @ts-expect-error -- custom property consumed by the float-bob keyframes
                        '--float-rot': `${rot}deg`,
                    }}
                />
            ))}
        </div>
    );
}
