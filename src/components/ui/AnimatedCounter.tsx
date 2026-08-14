import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '@app/utils/format';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
}

export default function AnimatedCounter({ value, duration = 900, className = '' }: AnimatedCounterProps) {
    const [display, setDisplay] = useState(0);
    const fromRef = useRef(0);

    useEffect(() => {
        const from = fromRef.current;
        const start = performance.now();

        let frame: number;
        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(from + (value - from) * eased));
            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            } else {
                fromRef.current = value;
            }
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [value, duration]);

    return <span className={className}>{formatNumber(display)}</span>;
}
