import { useEffect, useRef } from 'react';

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

    useEffect(() => {
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

            // Draw blobs with thresholding for "gooey" effect
            // We'll use a blurred shadow approach + threshold in compop
            // Actually, simple gradient blobs works best for 2D lava simulation

            blobs.forEach(blob => {
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
                gradient.addColorStop(0, 'rgba(250, 255, 0, 0.8)'); // BananINT Yellow
                gradient.addColorStop(1, 'rgba(250, 255, 0, 0)');
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
        };
    }, []);

    return (
        <div className="w-full h-full bg-black relative overflow-hidden rounded-3xl filter contrast-[20] bg-black">
            {/* 
            Contrast filter does the metaball magic:
            Blurs (gradients) + High Contrast = Sharp Edges where alpha overlaps
          */}
            <canvas
                ref={canvasRef}
                className="w-full h-full filter blur-[20px]"
                style={{ background: '#000' }}
            />
        </div>
    );
}
