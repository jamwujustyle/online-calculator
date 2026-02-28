import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCcw } from 'lucide-react';
import { useI18n } from '../lib/i18n';
// @ts-ignore
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
// @ts-ignore
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// @ts-ignore
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader';
import { useLoader } from '@react-three/fiber';

interface ThreeViewerProps {
    fileUrl?: string;
    fileExt?: string;
    status: string;
}

/**
 * After the model loads, fit the camera so the model fills the viewport,
 * then save OrbitControls state so "reset" returns here.
 */
const CameraFramer = ({ controlsRef }: { controlsRef: React.RefObject<any> }) => {
    const { scene, camera } = useThree();

    useEffect(() => {
        // Wait a tick for geometry to settle
        const timeout = setTimeout(() => {
            const box = new THREE.Box3().setFromObject(scene);
            if (box.isEmpty()) return;

            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const distance = maxDim * 2;

            camera.position.set(center.x, center.y + distance * 0.3, center.z + distance);
            camera.lookAt(center);
            camera.updateProjectionMatrix();

            if (controlsRef.current) {
                controlsRef.current.target.copy(center);
                controlsRef.current.update();
                // Save this nicely framed state as the "reset" target
                controlsRef.current.saveState();
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [scene, camera, controlsRef]);

    return null;
};

const Model = ({ url, ext }: { url: string, ext: string }) => {
    if (!url) return null;

    try {
        if (ext === 'stl') {
            const geometry = useLoader(STLLoader as any, url) as unknown as THREE.BufferGeometry;
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
        } else if (ext === '3mf') {
            const group = useLoader(ThreeMFLoader as any, url) as unknown as THREE.Group;
            return (
                <group>
                    {group.children.map((child: any, i) => (
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
    const controlsRef = useRef<any>(null);
    const { t } = useI18n();

    const handleResetView = useCallback(() => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    }, []);

    if (status === 'processing') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-dark-900 rounded-xl border border-gray-700">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium animate-pulse">{t('processing')}</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-dark-900 rounded-xl border border-red-900/50">
                <div className="text-red-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <p className="text-red-400 font-medium">{t('failed_model')}</p>
            </div>
        );
    }

    if (!fileUrl || status === 'pending') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-dark-900 rounded-xl border border-gray-700 border-dashed">
                <div className="text-gray-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <p className="text-gray-500 font-medium">{t('no_model')}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-dark-900 rounded-xl border border-gray-700 overflow-hidden relative cursor-move">
            <Canvas shadows camera={{ position: [0, 50, 150], fov: 50 }}>
                <color attach="background" args={['#111827']} />

                {/* Simple 3-point lighting — no environment map, no metallic flicker */}
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
                <directionalLight position={[-10, -10, -5]} intensity={0.3} />
                <pointLight position={[0, 50, 0]} intensity={0.3} />

                <Center>
                    <Model url={fileUrl} ext={fileExt || 'stl'} />
                </Center>

                <CameraFramer controlsRef={controlsRef} />
                <OrbitControls ref={controlsRef} makeDefault />
            </Canvas>

            <button
                onClick={handleResetView}
                className="absolute top-4 right-4 bg-dark-800/80 hover:bg-dark-700 backdrop-blur text-gray-300 hover:text-white p-2 rounded-lg border border-gray-700 transition-colors flex items-center justify-center cursor-pointer"
                title={t('reset_view')}
            >
                <RotateCcw size={18} />
            </button>

            <div className="absolute bottom-4 right-4 bg-dark-800/80 backdrop-blur text-xs text-gray-400 px-3 py-1.5 rounded-full border border-gray-700 shadow-xl pointer-events-none">
                {t('viewer_hint')}
            </div>
        </div>
    );
};
