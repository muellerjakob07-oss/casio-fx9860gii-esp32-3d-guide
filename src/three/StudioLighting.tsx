import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import type { ThemeMode } from '../types'

interface StudioLightingProps {
  theme: ThemeMode
}

export function StudioLighting({ theme }: StudioLightingProps) {
  const isDark = theme === 'dark'

  return (
    <>
      <color attach="background" args={[isDark ? '#0e1015' : '#eceff4']} />
      <fog attach="fog" args={[isDark ? '#0e1015' : '#eceff4', 440, 920]} />

      {/* 3-Point Apple Product Studio Lighting */}
      <ambientLight intensity={isDark ? 0.34 : 0.56} />

      {/* Key Light — Warm-white overhead front-right softbox */}
      <directionalLight
        position={[125, 220, 145]}
        intensity={isDark ? 1.85 : 1.75}
        color="#fffcf5"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={20}
        shadow-camera-far={650}
        shadow-camera-left={-155}
        shadow-camera-right={155}
        shadow-camera-top={155}
        shadow-camera-bottom={-155}
        shadow-bias={-0.0003}
      />

      {/* Fill Light — Soft cool left fill */}
      <directionalLight
        position={[-140, 115, 70]}
        intensity={isDark ? 0.72 : 0.85}
        color="#dcebff"
      />

      {/* Rim / Separation Light — Back edge definition for dark PCB & housing */}
      <directionalLight
        position={[-20, 95, -180]}
        intensity={isDark ? 1.1 : 0.65}
        color="#e0f2fe"
      />

      {/* Subtle underneath bounce so front face stays crisp even while flipped */}
      <hemisphereLight
        args={[isDark ? '#b8d0ef' : '#ffffff', isDark ? '#1c202a' : '#cbd5e1', isDark ? 0.38 : 0.55]}
      />

      {/* Procedural Offline Studio HDRI Reflections (zero external network fetches!) */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={isDark ? 2.4 : 2.8}
          color="#ffffff"
          scale={[180, 110, 1]}
          position={[0, 160, 40]}
          rotation={[Math.PI / 2.2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={isDark ? 1.6 : 1.4}
          color="#dbeafe"
          scale={[140, 60, 1]}
          position={[-160, 80, -30]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={isDark ? 1.8 : 1.5}
          color="#fef3c7"
          scale={[120, 50, 1]}
          position={[160, 70, 80]}
          rotation={[0, -Math.PI / 2.4, 0]}
        />
        <Lightformer
          form="ring"
          intensity={isDark ? 1.1 : 0.8}
          color="#e2e8f0"
          scale={80}
          position={[0, 110, -160]}
          rotation={[0.3, 0, 0]}
        />
      </Environment>

      {/* Soft Studio Contact Shadows on the tabletop plane (baked once for buttery 60fps!) */}
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={isDark ? 0.5 : 0.3}
        scale={340}
        blur={2.4}
        far={120}
        resolution={256}
        frames={1}
        color={isDark ? '#000000' : '#334155'}
      />
    </>
  )
}
