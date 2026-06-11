// ProtectedAdminRoute — the security checkpoint for all /admin pages
//
// HOW IT WORKS:
//   1. Wait until we know if the user is logged in (initialized)
//   2. If no user → send them to /login
//   3. If logged in but NOT an admin → show 3D "Access Denied" for 3s, then redirect home
//   4. If ADMIN → let them through

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Stars } from "@react-three/drei";

// The rotating 3D gem shape used on both screens
function AdminOrb({ color }) {
  const mesh = useRef();
  useFrame((state) => {
    mesh.current.rotation.y = state.clock.elapsedTime * 0.5;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1}>
      <mesh ref={mesh}>
        {/* dodecahedron = 12-sided gem shape */}
        <dodecahedronGeometry args={[1.3, 0]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          distort={0.25}
          speed={1.5}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>
    </Float>
  );
}

// Reusable full-screen 3D canvas — color changes gold ↔ red depending on state
function Scene({ color }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Stars radius={100} depth={50} count={2000} factor={4} fade />
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={2} color={color} />
      <pointLight position={[-4, -2, 2]} intensity={0.5} color={color} />
      <AdminOrb color={color} />
    </Canvas>
  );
}

// Shown when admin identity is confirmed — green 3D screen for 2s then enters
function AccessGranted({ onEnter }) {
  useEffect(() => {
    const t = setTimeout(onEnter, 2000);
    return () => clearTimeout(t);
  }, [onEnter]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      <div className="absolute inset-0">
        <Scene color="#22c55e" />
      </div>
      <div className="absolute left-0 right-0 z-10 text-center" style={{ bottom: '25%' }}>
        {/* Green tick icon */}
        <div className="flex justify-center mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <p
          className="text-2xl font-bold tracking-[0.3em] uppercase"
          style={{ color: '#22c55e', fontFamily: "'Playfair Display', serif" }}
        >
          Access Granted
        </p>
        <p className="text-sm mt-2" style={{ color: '#9b96b0' }}>
          Welcome back, Admin.
        </p>
      </div>
    </div>
  );
}

// Shown when a non-admin user tries to access /admin
// Waits 3 seconds then calls onRedirect to go back home
function AccessDenied({ onRedirect }) {
  useEffect(() => {
    const t = setTimeout(onRedirect, 3000);
    return () => clearTimeout(t); // cleanup if user navigates away early
  }, [onRedirect]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* 3D red scene in background */}
      <div className="absolute inset-0">
        <Scene color="#ef4444" />
      </div>
      {/* Text overlay — sits below the 3D orb */}
      <div className="absolute left-0 right-0 z-10 text-center" style={{ bottom: '25%' }}>
        <p
          className="text-2xl font-bold tracking-[0.3em] uppercase"
          style={{ color: '#ef4444', fontFamily: "'Playfair Display', serif" }}
        >
          Access Denied
        </p>
        <p className="text-sm mt-2" style={{ color: '#9b96b0' }}>
          You don't have permission to view this page.
        </p>
        <p className="text-xs mt-1" style={{ color: '#6b6880' }}>
          Redirecting you home in 3 seconds...
        </p>
      </div>
    </div>
  );
}

export default function ProtectedAdminRoute() {
  const { user, initialized } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  // granted = false means still showing the Access Granted screen
  // granted = true means the 2s screen is done, render the actual admin page
  const [granted, setGranted] = useState(false);

  // RULE 1: Cookie check not done yet — show gold 3D verifying screen
  if (!initialized) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0a0f' }}>
        {/* 3D gold scene in background */}
        <div className="absolute inset-0">
          <Scene color="#c9a84c" />
        </div>
        {/* Text overlay */}
        <div className="absolute left-0 right-0 z-10 text-center" style={{ bottom: '25%' }}>
          <p
            className="text-xl font-semibold tracking-[0.3em] uppercase"
            style={{ color: '#c9a84c', fontFamily: "'Playfair Display', serif" }}
          >
            Verifying Access
          </p>
          <p className="text-sm mt-2 tracking-widest" style={{ color: '#9b96b0' }}>
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  // RULE 2: Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // RULE 3: Logged in but not admin → show red 3D Access Denied, then redirect home
  if (user.role !== "ADMIN") {
    return <AccessDenied onRedirect={() => navigate("/", { replace: true })} />;
  }

  // RULE 4: ✅ Admin — show green Access Granted screen first, then render the page
  if (!granted) {
    return <AccessGranted onEnter={() => setGranted(true)} />;
  }

  return <Outlet />;
}
