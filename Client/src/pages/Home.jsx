import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MeshDistortMaterial, Float, Stars } from '@react-three/drei'

// A slowly rotating gold orb that floats in the hero
function GoldOrb() {
  const mesh = useRef()
  // useFrame runs every animation frame — we rotate the orb a tiny bit each frame
  useFrame((state) => {
    mesh.current.rotation.x = state.clock.elapsedTime * 0.15
    mesh.current.rotation.y = state.clock.elapsedTime * 0.2
  })
  return (
    // Float makes it bob up and down gently
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={mesh}>
        {/* icosahedronGeometry = a multi-faceted gem-like shape */}
        <icosahedronGeometry args={[1.4, 4]} />
        {/* MeshDistortMaterial warps the surface slightly — gives it a liquid gold look */}
        <MeshDistortMaterial
          color="#c9a84c"
          emissive="#b8922a"
          emissiveIntensity={0.3}
          distort={0.35}
          speed={1.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  )
}

function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative"
      style={{ background: 'linear-gradient(160deg, #0a0a0f 60%, #1a1428 100%)' }}
    >
      {/* ── 3D Canvas — sits behind all the text ── */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          {/* Stars fills the background with tiny white dots */}
          <Stars radius={80} depth={50} count={3000} factor={3} fade speed={0.5} />
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={2} color="#e8c96a" />
          <pointLight position={[-5, -3, -5]} intensity={0.5} color="#6040a0" />
          <GoldOrb />
        </Canvas>
      </div>

      {/* Eyebrow label */}
      <p
        className="text-xs font-semibold uppercase tracking-[4px] mb-5 relative z-10"
        style={{ color: '#c9a84c' }}
      >
        Curated Luxury
      </p>

      {/* Headline */}
      <h1
        className="text-5xl md:text-7xl font-bold mb-6 leading-tight relative z-10"
        style={{ fontFamily: "'Playfair Display', serif", color: '#f0ecff' }}
      >
        Discover Your
        <br />
        <span style={{ color: '#c9a84c' }}>Signature Style</span>
      </h1>

      {/* Sub-headline */}
      <p className="text-lg max-w-xl mb-10 relative z-10" style={{ color: '#9b96b0', lineHeight: 1.8 }}>
        Premium products, curated for those who appreciate the finest things.
        Shop our exclusive collections today.
      </p>

      {/* CTA buttons */}
      <div className="flex gap-4 flex-wrap justify-center relative z-10">
        <Link to="/products">
          <Button
            size="lg"
            style={{
              background: 'linear-gradient(135deg, #c9a84c, #e8c96a, #b8922a)',
              color: '#1a1400',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 24px #c9a84c44',
            }}
          >
            Browse Collection
          </Button>
        </Link>
        <Link to="/register">
          <Button
            size="lg"
            variant="outline"
            style={{ borderColor: '#2a2740', color: '#9b96b0' }}
          >
            Create Account
          </Button>
        </Link>
      </div>

      {/* Decorative gold line */}
      <div
        className="mt-20 w-24 h-px relative z-10"
        style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }}
      />
    </div>
  )
}

export default Home