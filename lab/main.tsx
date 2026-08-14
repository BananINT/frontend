import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router';
import '../src/main.css';
import { SCENARIOS } from './scenarios';

const PAGES: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
    dice: lazy(() => import('../src/features/casino/pages/DicePage')),
    wheel: lazy(() => import('../src/features/casino/pages/WheelPage')),
    plinko: lazy(() => import('../src/features/casino/pages/PlinkoPage')),
    plinkoMulti: lazy(() => import('../src/features/casino/pages/PlinkoPage')),
    mines: lazy(() => import('../src/features/casino/pages/MinesPage')),
    crash: lazy(() => import('../src/features/casino/pages/CrashPage')),
    crashPoll: lazy(() => import('../src/features/casino/pages/CrashPage')),
    blackjack: lazy(() => import('../src/features/casino/pages/BlackjackPage')),
    slots: lazy(() => import('../src/features/casino/pages/SlotsPage')),
    roulette: lazy(() => import('../src/features/casino/pages/RoulettePage')),
    rouletteDud: lazy(() => import('../src/features/casino/pages/RoulettePage')),
    lottery: lazy(() => import('../src/features/casino/pages/LotteryPage')),
    lobby: lazy(() => import('../src/features/casino/CasinoPage')),
    clan: lazy(() => import('../src/features/clans/ClanPage')),
    clanOps: lazy(() => import('../src/features/clans/ClanOpsPage')),
};

const params = new URLSearchParams(window.location.search);
const which = params.get('page') ?? 'dice';
const Page = PAGES[which];

// Chrome's headless window has a 500px floor, so narrow viewports are emulated
// with an iframe: media queries inside one resolve against the frame's width.
const frameWidth = params.get('frame');
if (frameWidth) {
    const inner = new URLSearchParams(params);
    inner.delete('frame');
    const iframe = document.createElement('iframe');
    iframe.src = `${window.location.pathname}?${inner}`;
    iframe.style.cssText = `width:${frameWidth}px;height:900px;border:0`;
    document.body.innerHTML = '';
    document.body.appendChild(iframe);
    window.addEventListener('message', (e) => {
        const out = document.createElement('pre');
        out.id = 'lab-report';
        out.textContent = JSON.stringify(e.data, null, 1);
        document.body.appendChild(out);
    });
    throw new Error('frame host');
}

// `?widget=<name>` renders a single component statically, for eyeballing.
const widget = params.get('widget');
if (widget) {
    void import('./widgets').then(({ WIDGETS }) => {
        const W = WIDGETS[widget];
        createRoot(document.getElementById('root')!).render(<W />);
    });
    // Stops module evaluation so the page below is never mounted.
    throw new Error('widget host');
}

// `?shell=1` mounts the page inside the real RootLayout (header, footer, the
// whole scroll shell) — page-only mounting cannot reproduce scroll behaviour.
const RootLayout = lazy(() => import('../src/layouts/RootLayout'));

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        {/* `?path=/clan` lets route-aware chrome (tabs, active links) resolve. */}
        <MemoryRouter initialEntries={[params.get('path') ?? '/']}>
            <Suspense fallback={<div>…</div>}>
                <Routes>
                    {params.has('shell') ? (
                        <Route element={<RootLayout />}>
                            <Route path="*" element={<Page />} />
                        </Route>
                    ) : (
                        <Route path="*" element={<Page />} />
                    )}
                </Routes>
            </Suspense>
        </MemoryRouter>
    </StrictMode>
);

// ---- Scroll probe -----------------------------------------------------------

/** `?scroll=1` reports who can actually scroll, and by how much. */
if (params.has('scroll')) {
    setTimeout(() => {
        const rows: string[] = [];
        const de = document.documentElement;
        rows.push(
            `documentElement scrollHeight=${de.scrollHeight} clientHeight=${de.clientHeight} ` +
                `overflowY=${getComputedStyle(de).overflowY} scrollable=${de.scrollHeight > de.clientHeight}`
        );
        rows.push(
            `body scrollHeight=${document.body.scrollHeight} clientHeight=${document.body.clientHeight}`
        );
        for (const el of Array.from(document.querySelectorAll<HTMLElement>('#root *'))) {
            const cs = getComputedStyle(el);
            const clips = /auto|scroll|hidden/.test(cs.overflowY);
            if (!clips) continue;
            rows.push(
                `${el.tagName}.${el.className.toString().slice(0, 40)} ` +
                    `overflowY=${cs.overflowY} height=${cs.height} ` +
                    `scrollH=${el.scrollHeight} clientH=${el.clientHeight} ` +
                    `scrollable=${el.scrollHeight > el.clientHeight + 1}`
            );
        }
        // Can the window actually move?
        window.scrollTo(0, 5000);
        rows.push(`window.scrollY after scrollTo(5000) = ${window.scrollY}`);
        const out = document.createElement('pre');
        out.id = 'lab-report';
        out.textContent = rows.join('\n');
        document.body.appendChild(out);
    }, 2500);
}

// ---- DOM sampler -----------------------------------------------------------

/** `?sample=<css>` logs how many nodes match, every 250ms, for 8s. */
const sample = params.get('sample');
if (sample) {
    const series: string[] = [];
    const t0 = Date.now();
    const timer = setInterval(() => {
        const nodes = Array.from(document.querySelectorAll<HTMLElement>(sample));
        const alpha = nodes.map((n) => Number(getComputedStyle(n).opacity).toFixed(2)).join(',');
        series.push(`${Date.now() - t0}ms:${nodes.length}[${alpha}]`);
    }, 250);
    setTimeout(() => {
        clearInterval(timer);
        const out = document.createElement('pre');
        out.id = 'lab-sample';
        out.textContent = series.join(' ');
        document.body.appendChild(out);
    }, 8000);
}

// ---- Layout-shift probe -----------------------------------------------------

function findAnchor(prefix: string): HTMLElement | null {
    const all = Array.from(document.querySelectorAll<HTMLElement>('#root *'));
    return all.reverse().find((el) => (el.textContent ?? '').trim().startsWith(prefix)) ?? null;
}

if (params.has('probe')) {
    const scenario = SCENARIOS[which];
    const emit = (m: unknown) => (window as unknown as { __emit: (m: unknown) => void }).__emit(m);
    const report: Record<string, unknown>[] = [];

    // Only shifts caused by playing count; the initial mount is not one.
    let cls = 0;
    let counting = false;
    new PerformanceObserver((list) => {
        if (!counting) return;
        for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
            if (!entry.hadRecentInput) cls += entry.value;
        }
    }).observe({ type: 'layout-shift', buffered: true });

    const measure = (label: string) => {
        const el = findAnchor(scenario.anchor);
        const column = document.querySelector('#root .flex-1 > *');
        report.push({
            label,
            anchorTop: el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null,
            docHeight: Math.round(document.documentElement.scrollHeight),
            overflowX: Math.round(document.documentElement.scrollWidth - window.innerWidth),
            cls: Number(cls.toFixed(4)),
            ...(params.has('trace')
                ? {
                      trace: Array.from(document.querySelectorAll<HTMLElement>('#root *')).map(
                          (c) =>
                              `${c.tagName}.${c.className.toString().slice(0, 24)}|${Math.round(
                                  c.getBoundingClientRect().top + window.scrollY
                              )}|${Math.round(c.getBoundingClientRect().height)}`
                      ),
                  }
                : {}),
            ...(params.has('verbose') && column
                ? {
                      blocks: Array.from(column.querySelectorAll(':scope > *, :scope > * > *')).map(
                          (c) => `${c.className.toString().slice(0, 28)}=${Math.round(c.getBoundingClientRect().height)}`
                      ),
                  }
                : {}),
        });
    };

    // Some tables (the lottery) only render once their state has arrived, so
    // any step scheduled at 0 is replayed until the table is up.
    const bootstrap = scenario.steps.filter((s) => s.at === 0);

    // The scenario clock only starts once the table is actually on screen.
    const waitForMount = setInterval(() => {
        bootstrap.forEach((s) => s.msg && emit(s.msg));
        if (!findAnchor(scenario.anchor)) return;
        clearInterval(waitForMount);

        // Web fonts reflow the header when they swap in; that is a load-time
        // shift, not an interaction one, so it must not pollute the reading.
        void document.fonts.ready.then(() => setTimeout(start, 250));
        const start = () => {
            counting = true;
            scenario.steps.forEach((s) => s.msg && setTimeout(() => emit(s.msg), s.at));
            scenario.marks.forEach((m) => setTimeout(() => measure(m.label), m.at));

            const last = Math.max(...scenario.marks.map((m) => m.at));
            setTimeout(() => {
                const payload = { page: which, width: window.innerWidth, report };
                const out = document.createElement('pre');
                out.id = 'lab-report';
                out.textContent = JSON.stringify(payload, null, 1);
                document.body.appendChild(out);
                if (window.parent !== window) window.parent.postMessage(payload, '*');
            }, last + 400);
        };
    }, 50);
}
