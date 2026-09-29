import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useTheme } from '@app/hooks/useTheme';


// TYPES
interface ArcData {
    order: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    arcAlt: number;
    color?: string;
}

// CONFIGURATION & DATA
// Helper to get runtime CSS variable values or fallback
const getCssVar = (name: string, fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

const getGlobeConfig = () => ({
    pointSize: 4,
    globeColor: getCssVar('--banan-background', "#050505"),
    showAtmosphere: true,
    atmosphereColor: getCssVar('--banan-primary', "#FAFF00"),
    atmosphereAltitude: 0.15,
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: `rgba(${getCssVar('--banan-primary-rgb', '250, 255, 0')}, 0.5)`, // Semi-transparent yellow
    ambientLight: getCssVar('--banan-white', "#ffffff"),
    directionalLeftLight: getCssVar('--banan-primary', "#FAFF00"), // Yellow tint
    directionalTopLight: getCssVar('--banan-white', "#ffffff"),
    pointLight: getCssVar('--banan-white', "#ffffff"),
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    manualRotate: false, // User requested non-interactable
    autoRotate: true,
    autoRotateSpeed: 0.5,
});

// Less flashy / less saturated colors as requested
// Fallback colors
const COLORS_BASE = ["#E8E8A6", "#E0E0E0", "#98D6AA"]; // Desaturated Yellow, Off-White, Desaturated Green

// Arc Data
const ARC_DATA_BASE: ArcData[] = [
    { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.1 },
    { order: 1, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2 },
    { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -1.303396, endLng: 36.852443, arcAlt: 0.5 },
    { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2 },
    { order: 2, startLat: 51.5072, startLng: -0.1276, endLat: 3.139, endLng: 101.6869, arcAlt: 0.3 },
    { order: 2, startLat: -15.785493, startLng: -47.909029, endLat: 36.162809, endLng: -115.119411, arcAlt: 0.3 },
    { order: 3, startLat: -33.8688, startLng: 151.2093, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3 },
    { order: 3, startLat: 21.3099, startLng: -157.8581, endLat: 40.7128, endLng: -74.006, arcAlt: 0.3 },
    { order: 3, startLat: -6.2088, startLng: 106.8456, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3 },
    { order: 4, startLat: 11.986597, startLng: 8.571831, endLat: -15.595412, endLng: -56.05918, arcAlt: 0.5 },
    { order: 4, startLat: -34.6037, startLng: -58.3816, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.7 },
    { order: 4, startLat: 51.5072, startLng: -0.1276, endLat: 48.8566, endLng: -2.3522, arcAlt: 0.1 },
    { order: 5, startLat: 14.5995, startLng: 120.9842, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3 },
    { order: 5, startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093, arcAlt: 0.2 },
    { order: 5, startLat: 34.0522, startLng: -118.2437, endLat: 48.8566, endLng: -2.3522, arcAlt: 0.2 },
    { order: 6, startLat: -15.432563, startLng: 28.315853, endLat: 1.094136, endLng: -63.34546, arcAlt: 0.7 },
    { order: 6, startLat: 37.5665, startLng: 126.978, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.1 },
    { order: 6, startLat: 22.3193, startLng: 114.1694, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3 },
    { order: 7, startLat: -19.885592, startLng: -43.951191, endLat: -15.595412, endLng: -56.05918, arcAlt: 0.1 },
    { order: 7, startLat: 48.8566, startLng: -2.3522, endLat: 52.52, endLng: 13.405, arcAlt: 0.1 },
    { order: 7, startLat: 52.52, startLng: 13.405, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2 },
    { order: 8, startLat: -8.833221, startLng: 13.264837, endLat: -33.936138, endLng: 18.436529, arcAlt: 0.2 },
    { order: 8, startLat: 49.2827, startLng: -123.1207, endLat: 52.3676, endLng: 4.9041, arcAlt: 0.2 },
    { order: 8, startLat: 1.3521, startLng: 103.8198, endLat: 40.7128, endLng: -74.006, arcAlt: 0.5 },
    { order: 9, startLat: 51.5072, startLng: -0.1276, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2 },
    { order: 9, startLat: 22.3193, startLng: 114.1694, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.7 },
    { order: 9, startLat: 1.3521, startLng: 103.8198, endLat: -34.6037, endLng: -58.3816, arcAlt: 0.5 },
    { order: 10, startLat: -22.9068, startLng: -43.1729, endLat: 28.6139, endLng: 77.209, arcAlt: 0.7 },
    { order: 10, startLat: 34.0522, startLng: -118.2437, endLat: 31.2304, endLng: 121.4737, arcAlt: 0.3 },
    { order: 10, startLat: -6.2088, startLng: 106.8456, endLat: 52.3676, endLng: 4.9041, arcAlt: 0.3 },
    { order: 11, startLat: 41.9028, startLng: 12.4964, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2 },
    { order: 11, startLat: -6.2088, startLng: 106.8456, endLat: 31.2304, endLng: 121.4737, arcAlt: 0.2 },
    { order: 11, startLat: 22.3193, startLng: 114.1694, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.2 },
    { order: 12, startLat: 34.0522, startLng: -118.2437, endLat: 37.7749, endLng: -122.4194, arcAlt: 0.1 },
    { order: 12, startLat: 35.6762, startLng: 139.6503, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.2 },
    { order: 12, startLat: 22.3193, startLng: 114.1694, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.3 },
    { order: 13, startLat: 52.52, startLng: 13.405, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3 },
    { order: 13, startLat: 11.986597, startLng: 8.571831, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.3 },
    { order: 13, startLat: -22.9068, startLng: -43.1729, endLat: -34.6037, endLng: -58.3816, arcAlt: 0.1 },
    { order: 14, startLat: -33.936138, startLng: 18.436529, endLat: 21.395643, endLng: 39.883798, arcAlt: 0.3 },
];

function genRandomNumbers(min: number, max: number, count: number) {
    const arr: number[] = [];
    while (arr.length < count) {
        const r = Math.floor(Math.random() * (max - min)) + min;
        if (arr.indexOf(r) === -1) arr.push(r);
    }
    return arr;
}

export default function Globe() {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const animationFrameId = useRef<number | null>(null);

    const [geoJson, setGeoJson] = useState<{ features: { geometry: unknown, properties: unknown }[] } | null>(null);
    const [loaded, setLoaded] = useState(false);
    const { theme } = useTheme();

    // Fetch Data
    useEffect(() => {
        // Optimization: Load local file instead of fetching from GitHub
        fetch('/data/countries.geojson')
            .then(res => res.json())
            .then(setGeoJson)
            .catch(err => console.error("Failed to load globe data", err));
    }, []);

    // Initialize
    useEffect(() => {
        const currentContainer = containerRef.current;
        if (!geoJson || !currentContainer) return;

        let isMounted = true;
        let fadeTimeout: ReturnType<typeof setTimeout>;

        // Delay the heavy Three.js instantiation to allow the browser to paint
        // the rest of the page layout and initial animations without hitching.
        const initTimeout = setTimeout(() => {
            if (!isMounted || !currentContainer) return;

            // Cleanup any existing
            if (rendererRef.current) {
                currentContainer.innerHTML = '';
                rendererRef.current.dispose();
            }

            const w = currentContainer.clientWidth;
            const h = currentContainer.clientHeight;

            // 1. Setup Scene, Camera, Renderer
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setClearColor(0x000000, 0);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(w, h);
            currentContainer.appendChild(renderer.domElement);
            renderer.domElement.style.background = 'transparent';
            rendererRef.current = renderer;

            const scene = new THREE.Scene();
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(45, w / h, 1, 4000);
            camera.position.z = 300;
            cameraRef.current = camera;

            const GLOBE_CONFIG = getGlobeConfig();

            // Resolve themed colors for arcs
            const COLORS = [
                getCssVar('--banan-primary', COLORS_BASE[0]),
                getCssVar('--banan-white', COLORS_BASE[1]),
                getCssVar('--banan-green', COLORS_BASE[2])
            ];

            const ARC_DATA = ARC_DATA_BASE.map(arc => ({
                ...arc,
                color: COLORS[Math.floor(Math.random() * COLORS.length)]
            }));

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = false; // Disable Zoom
            controls.enablePan = false;  // Disable Pan
            controls.enableRotate = false; // Disable Manual Rotation
            controls.autoRotate = GLOBE_CONFIG.autoRotate;
            controls.autoRotateSpeed = GLOBE_CONFIG.autoRotateSpeed;
            controls.minDistance = 200;
            controls.maxDistance = 500;
            controlsRef.current = controls;

            // 2. Setup Lighting
            const ambientLight = new THREE.AmbientLight(GLOBE_CONFIG.ambientLight, 0.6);
            scene.add(ambientLight);

            const dLight1 = new THREE.DirectionalLight(GLOBE_CONFIG.directionalLeftLight, 1);
            dLight1.position.set(-400, 100, 400);
            scene.add(dLight1);

            const dLight2 = new THREE.DirectionalLight(GLOBE_CONFIG.directionalTopLight, 1);
            dLight2.position.set(-200, 500, 200);
            scene.add(dLight2);

            const pLight = new THREE.PointLight(GLOBE_CONFIG.pointLight, 0.8);
            pLight.position.set(-200, 500, 200);
            scene.add(pLight);

            // 3. Init Globe - THIS IS THE HEAVY SYNCHRONOUS OPERATION
            const globe = new ThreeGlobe()
                .hexPolygonsData(geoJson.features)
                .hexPolygonResolution(3)
                .hexPolygonMargin(0.7)
                .showAtmosphere(GLOBE_CONFIG.showAtmosphere)
                .atmosphereColor(GLOBE_CONFIG.atmosphereColor)
                .atmosphereAltitude(GLOBE_CONFIG.atmosphereAltitude)
                .hexPolygonColor(() => GLOBE_CONFIG.polygonColor);

            // Material Config
            const globeMaterial = globe.globeMaterial() as THREE.MeshPhongMaterial;
            globeMaterial.color = new THREE.Color(GLOBE_CONFIG.globeColor);
            globeMaterial.emissive = new THREE.Color(GLOBE_CONFIG.emissive);
            globeMaterial.emissiveIntensity = GLOBE_CONFIG.emissiveIntensity;
            globeMaterial.shininess = GLOBE_CONFIG.shininess;

            // Data Building - Points & Arcs
            const points: Array<ArcData & { size: number, color: string, lat: number, lng: number }> = [];
            ARC_DATA.forEach(arc => {
                const color = arc.color || getCssVar("--color-banan-white", "#ffffff");
                points.push({ ...arc, lat: arc.startLat, lng: arc.startLng, size: GLOBE_CONFIG.pointSize, color });
                points.push({ ...arc, lat: arc.endLat, lng: arc.endLng, size: GLOBE_CONFIG.pointSize, color });
            });

            // Filter unique points
            const uniquePoints = points.filter((v, i, a) =>
                a.findIndex(v2 => v2.lat === v.lat && v2.lng === v.lng) === i
            );

            // Arcs Config
            globe
                .arcsData(ARC_DATA)
                .arcStartLat(d => (d as ArcData).startLat)
                .arcStartLng(d => (d as ArcData).startLng)
                .arcEndLat(d => (d as ArcData).endLat)
                .arcEndLng(d => (d as ArcData).endLng)
                .arcColor((d: object) => (d as ArcData).color || '#ffffff')
                .arcAltitude(d => (d as ArcData).arcAlt)
                .arcStroke(0.5)
                .arcDashLength(GLOBE_CONFIG.arcLength)
                .arcDashGap(4)
                .arcDashInitialGap(d => (d as ArcData).order)
                .arcDashAnimateTime(GLOBE_CONFIG.arcTime);

            // Points Config
            globe
                .pointsData(uniquePoints)
                .pointColor(d => (d as { color: string }).color)
                .pointAltitude(0)
                .pointRadius(2);

            // Rings Config (Dynamic)
            globe
                .ringsData([])
                // @ts-expect-error - three-globe types are often incomplete
                .ringColor(d => () => (d as { color: string }).color)
                .ringMaxRadius(GLOBE_CONFIG.maxRings)
                .ringPropagationSpeed(3)
                .ringRepeatPeriod(GLOBE_CONFIG.arcTime * GLOBE_CONFIG.arcLength / GLOBE_CONFIG.rings);

            scene.add(globe);

            // Animation Loop
            const animate = () => {
                if (!isMounted) return;
                animationFrameId.current = requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);

                // Randomly add rings
                if (Math.random() > 0.97) {
                    const numberOfRings = genRandomNumbers(0, uniquePoints.length, Math.floor(uniquePoints.length * 0.8));
                    globe.ringsData(uniquePoints.filter((_, i) => numberOfRings.includes(i)));
                }
            };
            animate();

            // Reveal the globe smoothly
            fadeTimeout = setTimeout(() => {
                if (isMounted) setLoaded(true);
            }, 100);

            const handleResize = () => {
                if (!currentContainer || !cameraRef.current || !rendererRef.current) return;
                const width = currentContainer.clientWidth;
                const height = currentContainer.clientHeight;

                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(width, height);
            };

            window.addEventListener('resize', handleResize);

            // Attach resize handler to window so we can clean it up
            (window as Window & { _globeHandleResize?: () => void })._globeHandleResize = handleResize;

        }, 1500); // Wait 1.5s for the initial page reveals and split-flap animations to fully finish!

        return () => {
            isMounted = false;
            clearTimeout(initTimeout);
            clearTimeout(fadeTimeout);
            
            const win = window as Window & { _globeHandleResize?: () => void };
            if (win._globeHandleResize) {
                window.removeEventListener('resize', win._globeHandleResize);
                delete win._globeHandleResize;
            }
            
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            const currentRenderer = rendererRef.current;
            if (currentRenderer) {
                currentRenderer.dispose();
                const domElement = currentRenderer.domElement;
                if (currentContainer && domElement) {
                    try { currentContainer.removeChild(domElement); } catch (err) {
                        console.warn("Failed to remove globe canvas", err);
                    }
                }
            }
        };

    }, [geoJson, theme]);


    return (
        <div
            ref={containerRef}
            className={`w-full h-full min-h-[500px] pointer-events-none transition-opacity duration-1000 ease-in-out bg-transparent ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ cursor: 'default', background: 'transparent' }}
        />
    );
}
