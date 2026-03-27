import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

function latLonToVector3(lat, lon, radius = 2) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function Arc({ start, end, color }) {
  const points = useMemo(() => {
    const startVector = latLonToVector3(start.lat, start.lon, 2.03);
    const endVector = latLonToVector3(end.lat, end.lon, 2.03);
    const mid = startVector
      .clone()
      .add(endVector)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(2.75);

    return new THREE.QuadraticBezierCurve3(
      startVector,
      mid,
      endVector,
    ).getPoints(50);
  }, [start, end]);

  return <Line points={points} color={color} lineWidth={1.5} transparent opacity={0.95} />;
}

function Marker({ lat, lon, color = "#f97316", scale = 1 }) {
  const position = useMemo(() => latLonToVector3(lat, lon, 2.06), [lat, lon]);

  return (
    <group position={position}>
      <mesh scale={0.07 * scale}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={0.18 * scale}>
        <torusGeometry args={[1, 0.07, 12, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function GlobeBody({ incidentPoint, markers, arcs }) {
  const globeRef = useRef(null);

  useFrame((_, delta) => {
    if (!globeRef.current) return;
    globeRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={globeRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#07111f"
          emissive="#0b2746"
          emissiveIntensity={0.55}
          metalness={0.25}
          roughness={0.65}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.012, 64, 64]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.16} />
      </mesh>

      <mesh scale={1.04}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.07} />
      </mesh>

      {incidentPoint ? (
        <Marker lat={incidentPoint.lat} lon={incidentPoint.lon} color="#fb7185" scale={1.25} />
      ) : null}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          lat={marker.lat}
          lon={marker.lon}
          color={marker.color}
          scale={marker.scale}
        />
      ))}

      {arcs.map((arc) => (
        <Arc key={arc.id} start={arc.start} end={arc.end} color={arc.color} />
      ))}
    </group>
  );
}

export default function StrategicGlobe({ incidentPoint, markers, arcs, title, subtitle }) {
  return (
    <div className="sentinel-panel relative min-h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#10284a_0%,#07111f_45%,#020611_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08),transparent_60%)]" />
      <div className="absolute left-5 top-5 z-10 max-w-sm">
        <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/80">
          Global Strategic Surface
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p>
      </div>

      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }}>
          <color attach="background" args={["#020611"]} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[6, 4, 5]} intensity={1.25} color="#ffffff" />
          <directionalLight position={[-5, -3, -4]} intensity={0.35} color="#38bdf8" />
          <Stars radius={55} depth={45} count={2200} factor={3.2} saturation={0} fade speed={0.25} />
          <GlobeBody incidentPoint={incidentPoint} markers={markers} arcs={arcs} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.25}
            maxPolarAngle={Math.PI / 1.85}
            autoRotate={false}
          />
        </Canvas>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-10 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/45 px-4 py-3 backdrop-blur">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Incident marker</p>
          <p className="mt-2 text-sm text-slate-200">Hot pink node marks the attacked site and anchors the analysis.</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/45 px-4 py-3 backdrop-blur">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Response arcs</p>
          <p className="mt-2 text-sm text-slate-200">Animated lanes indicate strategic response paths and consequence spread.</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/15 bg-slate-950/45 px-4 py-3 backdrop-blur">
          <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Risk zones</p>
          <p className="mt-2 text-sm text-slate-200">Blue markers highlight likely pressure points around the theater.</p>
        </div>
      </div>
    </div>
  );
}
