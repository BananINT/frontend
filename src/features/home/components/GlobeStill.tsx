// Suspense fallback for the lazily loaded three.js Globe. It mirrors the
// placeholder markup inside Globe.tsx exactly (wrapper + still image), so the
// swap to the live globe causes no layout shift and no visual jump.
export default function GlobeStill() {
    return (
        <div className="relative w-full h-full min-h-[500px] pointer-events-none" aria-hidden="true">
            <img
                src="/img/globe-still.webp"
                alt=""
                width={1000}
                height={1000}
                fetchPriority="high"
                className="absolute left-1/2 top-1/2 w-[min(100vw,950px)] h-auto -translate-x-1/2 -translate-y-1/2"
            />
        </div>
    );
}
