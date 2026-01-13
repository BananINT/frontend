import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function GlobeMesh() {
    const meshRef = useRef<THREE.Mesh>(null);
    const pointsRef = useRef<THREE.Points>(null);

    // Generate random points on sphere
    const particlesPosition = useMemo(() => {
        const count = 3000;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const theta = THREE.MathUtils.randFloatSpread(360);
            const phi = THREE.MathUtils.randFloatSpread(360);

            // Approximate spherical distribution (not perfect but good for visuals)
            const x = 2 * Math.sin(theta) * Math.cos(phi);
            const y = 2 * Math.sin(theta) * Math.sin(phi);
            const z = 2 * Math.cos(theta);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        return positions;
    }, []);

    useFrame((_) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001;
        }
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
        }
    });

    return (
        <group>
            {/* Core Sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshStandardMaterial
                    color="#0B0B0B"
                    emissive="#FAFF00"
                    emissiveIntensity={0.1}
                    wireframe={true}
                    transparent
                    opacity={0.1}
                />
            </mesh>

            {/* Particle Cloud */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[particlesPosition, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.02}
                    color="#FAFF00"
                    sizeAttenuation
                    transparent
                    opacity={0.8}
                />
            </points>

            {/* Markers (Static for now to demo) */}
            {[
                [1.5, 0.5, 1], [-1, 1, 1.2], [0, -1.5, 1]
            ].map((pos, i) => (
                <mesh key={i} position={new THREE.Vector3(...pos)} scale={0.1}>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshBasicMaterial color="#4ADE80" />
                </mesh>
            ))}
        </group>
    );
}

export default function ThreeGlobe() {
    return (
        <div className="w-full h-[600px] relative z-10">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#FAFF00" />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <GlobeMesh />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}
