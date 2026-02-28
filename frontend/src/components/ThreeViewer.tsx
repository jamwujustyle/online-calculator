// Empty import to satisfy types if needed, or just nothing.

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { useLoader } from '@react-three/fiber';

interface ThreeViewerProps {
    fileUrl?: string;
    fileExt?: string;
    status: string;
}

const Model = ({ url, ext }: { url: string, ext: string }) => {
    // We use useMemo to conditionally select loader, but Fiber's useLoader needs a stable loader reference.
    // For simplicity in this demo, since STL is most common, we'll try to load STL. 
    // A production app would have a more complex loader registry.

    if (!url) return null;

    try {
        if (ext === 'stl') {
            const geometry = useLoader(STLLoader as any, url) as unknown as THREE.BufferGeometry;

            // Auto center and scale is handled by <Stage> below, but we ensure material
            return (
                <mesh geometry={geometry}>
                    <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.1} />
                </mesh>
            );
        } else if (ext === 'obj') {
            const obj = useLoader(OBJLoader as any, url) as unknown as THREE.Group;

            return (
                <group>
                    {obj.children.map((child: any, i) => (
                        <mesh key={i} geometry={child.geometry}>
                            <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.1} />
                        </mesh>
                    ))}
                </group>
            );
        }
    } catch (e) {
        console.error("Error loading 3D model", e);
    }

    return null;
};

export const ThreeViewer = ({ fileUrl, fileExt, status }: ThreeViewerProps) => {
    if (status === 'processing') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-dark-900 rounded-xl border border-gray-700">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium animate-pulse">Analyzing 3D geometry...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-dark-900 rounded-xl border border-red-900/50">
                <div className="text-red-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <p className="text-red-400 font-medium">Failed to process model</p>
            </div>
        );
    }

    if (!fileUrl || status === 'pending') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-dark-900 rounded-xl border border-gray-700 border-dashed">
                <div className="text-gray-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <p className="text-gray-500 font-medium">No 3D model uploaded yet</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-dark-900 rounded-xl border border-gray-700 overflow-hidden relative cursor-move">
            <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
                <color attach="background" args={['#111827']} />

                <Stage environment="city" intensity={0.5} adjustCamera>
                    <Center>
                        <Model url={fileUrl} ext={fileExt || 'stl'} />
                    </Center>
                </Stage>
                <OrbitControls makeDefault />
            </Canvas>
            <div className="absolute bottom-4 right-4 bg-dark-800/80 backdrop-blur text-xs text-gray-400 px-3 py-1.5 rounded-full border border-gray-700">
                Left Click: Rotate | Right Click: Pan
            </div>
        </div>
    );
};
