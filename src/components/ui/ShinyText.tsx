import { cn } from '@/lib/utils';
import type { CSSProperties, FC } from 'react';

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

const ShinyText: FC<ShinyTextProps> = ({ text, disabled = false, speed = 5, className }) => {
    const animationDuration = `${speed}s`;

    return (
        <div
            className={cn(
                "text-white bg-clip-text text-transparent inline-block bg-no-repeat",
                disabled ? "" : "animate-shine",
                className
            )}
            style={{
                // Yellow -> White -> Green gradient as requested
                backgroundImage: "linear-gradient(120deg, #FAFF00 0%, #ffffff 50%, #4ADE80 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                animationDuration: animationDuration,
                textShadow: "0 0 40px rgba(250, 255, 0, 0.4)",
                ...({} as CSSProperties)
            }}
        >
            {text}
        </div>
    );
};

export default ShinyText;
