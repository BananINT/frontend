import { useEffect, useRef, useState } from 'react';
import { addThemeListener } from '@app/lib/theme';

// Helper to get runtime CSS variable values or fallback
const getCssVar = (name: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

class Blob {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.r = Math.random() * 80 + 40; // Size
        this.x = Math.random() * (canvas.width - this.r * 2) + this.r;
        this.y = Math.random() * (canvas.height - this.r * 2) + this.r;
        this.vx = (Math.random() - 0.5) * 1.5; // Velocity
        this.vy = (Math.random() - 0.5) * 1.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.r < 0 || this.x + this.r > this.canvas.width) this.vx *= -1;
        if (this.y - this.r < 0 || this.y + this.r > this.canvas.height) this.vy *= -1;
    }
}

export default function LavaLamp() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [_, setThemeTick] = useState(0);

    useEffect(() => {
        // Force re-render when theme changes to pick up new colors
        const unsubscribe = addThemeListener(() => {
            setThemeTick(t => t + 1);
        });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let blobs: Blob[] = [];
        let animationId: number;

        const init = () => {
            canvas.width = canvas.parentElement?.offsetWidth || 300;
            canvas.height = canvas.parentElement?.offsetHeight || 300;
            blobs = Array.from({ length: 8 }, () => new Blob(canvas));
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update blobs
            blobs.forEach(blob => blob.update());

            // Use RGB variable for safer opacity handling
            const primaryRgb = getCssVar('--banan-primary-rgb', '250, 255, 0');

            blobs.forEach(blob => {
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
                gradient.addColorStop(0, `rgba(${primaryRgb}, 0.8)`);
                gradient.addColorStop(1, `rgba(${primaryRgb}, 0)`);
                ctx.fillStyle = gradient;
                ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', init);
        init();
        animate();

        return () => {
            window.removeEventListener('resize', init);
            cancelAnimationFrame(animationId);
            unsubscribe();
        };
    }, []);

    return (
        <div className="w-full h-full bg-banan-background relative overflow-hidden rounded-3xl filter contrast-[20]">
            <canvas
                ref={canvasRef}
                className="w-full h-full filter blur-[20px]"
                style={{ background: 'var(--color-banan-background)' }}
            />
        </div>
    );
}
