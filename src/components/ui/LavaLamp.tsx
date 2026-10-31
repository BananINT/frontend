import { useEffect, useRef } from 'react';
import { addThemeListener } from '@app/lib/theme';

// Helper to get runtime CSS variable values or fallback
const getCssVar = (name: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

// The canvas sits under a 20px blur + contrast filter, so its bitmap can be
// half resolution with no visible difference while painting a quarter of the pixels.
const RENDER_SCALE = 0.5;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

class Blob {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;

    // Coordinates are in CSS pixels of the lamp, independent of the bitmap size.
    constructor(width: number, height: number) {
        this.r = Math.random() * 80 + 40; // Size
        this.x = Math.random() * (width - this.r * 2) + this.r;
        this.y = Math.random() * (height - this.r * 2) + this.r;
        this.vx = (Math.random() - 0.5) * 1.5; // Velocity
        this.vy = (Math.random() - 0.5) * 1.5;
    }

    update(width: number, height: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.r < 0 || this.x + this.r > width) this.vx *= -1;
        if (this.y - this.r < 0 || this.y + this.r > height) this.vy *= -1;
    }
}

export default function LavaLamp() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const motionQuery = window.matchMedia?.(REDUCED_MOTION_QUERY);
        let reducedMotion = !!motionQuery?.matches;

        let blobs: Blob[] = [];
        let width = 300;
        let height = 300;
        let animationId: number | null = null;
        let inView = true;
        // Read once, then only again when the theme changes.
        let primaryRgb = getCssVar('--banan-primary-rgb', '250, 255, 0');

        const draw = () => {
            ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
            ctx.clearRect(0, 0, width, height);

            blobs.forEach(blob => {
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
                gradient.addColorStop(0, `rgba(${primaryRgb}, 0.8)`);
                gradient.addColorStop(1, `rgba(${primaryRgb}, 0)`);
                ctx.fillStyle = gradient;
                ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const init = () => {
            width = canvas.parentElement?.offsetWidth || 300;
            height = canvas.parentElement?.offsetHeight || 300;
            canvas.width = Math.max(1, Math.round(width * RENDER_SCALE));
            canvas.height = Math.max(1, Math.round(height * RENDER_SCALE));
            blobs = Array.from({ length: 8 }, () => new Blob(width, height));
            draw();
        };

        const animate = () => {
            blobs.forEach(blob => blob.update(width, height));
            draw();
            animationId = requestAnimationFrame(animate);
        };

        // Loop only while visible on screen, in a visible tab, without reduced motion.
        // Otherwise the last frame stays on the canvas as a still lamp.
        const syncLoop = () => {
            const shouldRun = inView && !document.hidden && !reducedMotion;
            if (shouldRun && animationId === null) {
                animationId = requestAnimationFrame(animate);
            } else if (!shouldRun && animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        };

        const unsubscribe = addThemeListener(() => {
            primaryRgb = getCssVar('--banan-primary-rgb', '250, 255, 0');
            draw();
        });

        const onMotionChange = () => {
            reducedMotion = !!motionQuery?.matches;
            syncLoop();
        };

        const observer = typeof IntersectionObserver !== 'undefined'
            ? new IntersectionObserver(([entry]) => {
                inView = entry.isIntersecting;
                syncLoop();
            })
            : null;

        window.addEventListener('resize', init);
        document.addEventListener('visibilitychange', syncLoop);
        motionQuery?.addEventListener('change', onMotionChange);
        observer?.observe(canvas);
        init();
        syncLoop();

        return () => {
            window.removeEventListener('resize', init);
            document.removeEventListener('visibilitychange', syncLoop);
            motionQuery?.removeEventListener('change', onMotionChange);
            observer?.disconnect();
            if (animationId !== null) cancelAnimationFrame(animationId);
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
