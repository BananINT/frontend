import confetti from 'canvas-confetti';

const BANAN_COLORS = ['#FADE00', '#FFFFFF', '#FFB800'];
const JACKPOT_COLORS = ['#22D3EE', '#FADE00', '#FFFFFF'];

let bananaShape: confetti.Shape | null = null;
function getBananaShape() {
    if (!bananaShape) bananaShape = confetti.shapeFromText({ text: '🍌', scalar: 3 });
    return bananaShape;
}

export function fireWinConfetti() {
    confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 45,
        origin: { y: 0.6 },
        colors: BANAN_COLORS,
        zIndex: 200,
    });
}

export function fireJackpotConfetti() {
    const duration = 2500;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 65,
            startVelocity: 55,
            origin: { x: 0, y: 0.7 },
            colors: JACKPOT_COLORS,
            zIndex: 200,
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 65,
            startVelocity: 55,
            origin: { x: 1, y: 0.7 },
            colors: JACKPOT_COLORS,
            zIndex: 200,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();

    // Banana rain from the top, for maximum silliness
    confetti({
        particleCount: 40,
        spread: 100,
        startVelocity: 25,
        gravity: 0.6,
        scalar: 1,
        ticks: 250,
        origin: { x: 0.5, y: -0.1 },
        shapes: [getBananaShape()],
        zIndex: 200,
    });
}
