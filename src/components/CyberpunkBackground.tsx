import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Grid } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = ({ count, reducedMotion }: { count: number, reducedMotion: boolean }) => {
  const ref = useRef<THREE.Points>(null);
  
  // Create a memoized array of random positions
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Cylinder distribution
      const r = 20 * Math.sqrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const y = (Math.random() - 0.5) * 20;
      const z = r * Math.sin(theta);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00E5FF"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
};

export const CyberpunkBackground: React.FC = () => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      if (width < 768) setDevice('mobile');
      else if (width < 1024) setDevice('tablet');
      else setDevice('desktop');
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const particleCount = device === 'mobile' ? 50 : device === 'tablet' ? 200 : 500;
  // Reduce pixel ratio on mobile for 60fps performance
  const dpr: [number, number] = device === 'mobile' ? [1, 1] : [1, 2];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -10, backgroundColor: '#050816' }}>
      <Canvas camera={{ position: [0, 2, 10], fov: 60 }} dpr={dpr} style={{ opacity: 0.6 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00E5FF" />
        <directionalLight position={[-10, 10, -5]} intensity={1} color="#FF0080" />
        
        {/* Animated Particle Field */}
        <ParticleField count={particleCount} reducedMotion={reducedMotion} />
        
        {/* Holographic Grid Floor */}
        <Grid
          position={[0, -2, 0]}
          args={[100, 100]}
          cellSize={1}
          cellThickness={1}
          cellColor="#00E5FF"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#FF0080"
          fadeDistance={30}
          fadeStrength={1}
        />
        
        {/* Fog to hide the edges */}
        <fog attach="fog" args={['#050816', 10, 40]} />
      </Canvas>
    </div>
  );
};
