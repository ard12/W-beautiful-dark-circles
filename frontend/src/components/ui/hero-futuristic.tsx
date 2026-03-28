'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { ArrowRight, ChevronDown, LogIn } from 'lucide-react';
import type { Mesh } from 'three';

import {
  abs,
  add,
  blendScreen,
  float,
  mix,
  mod,
  mx_cell_noise_float,
  oneMinus,
  pass,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl';

const TEXTUREMAP = {
  src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
};
const DEPTHMAP = {
  src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
};

extend(THREE as never);

type HeroFuturisticProps = {
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  onPrimaryCta?: () => void;
  onSecondaryCta?: () => void;
  onScrollCta?: () => void;
  aside?: ReactNode;
};

const WIDTH = 300;
const HEIGHT = 300;

const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    const postProcessing = new THREE.PostProcessing(gl as never);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    const redOverlay = vec3(1, 0, 0).mul(oneMinus(scanLine)).mul(0.4);

    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, redOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0,
    );

    postProcessing.outputNode = withScanEffect.add(bloomPass);

    return postProcessing;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    progressRef.current.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    render.renderAsync();
  }, 1);

  return null;
};

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);
  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (rawMap && depthMap) {
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);
    const strength = 0.01;

    const tDepthMap = texture(depthMap);
    const tMap = texture(rawMap, uv().add(tDepthMap.r.mul(uPointer).mul(strength)));

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);
    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);
    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));
    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);
    const flow = oneMinus(smoothstep(0, 0.02, abs(tDepthMap.sub(uProgress))));
    const mask = dot.mul(flow).mul(vec3(10, 0, 0));
    const final = blendScreen(tMap, mask);

    return {
      material: new THREE.MeshBasicNodeMaterial({
        colorNode: final,
        transparent: true,
        opacity: 0,
      }),
      uniforms: { uPointer, uProgress },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    uniforms.uProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    if (meshRef.current?.material && 'opacity' in meshRef.current.material) {
      meshRef.current.material.opacity = THREE.MathUtils.lerp(
        meshRef.current.material.opacity,
        visible ? 1 : 0,
        0.07,
      );
    }
  });

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  return (
    <mesh ref={meshRef} scale={[w * 0.4, h * 0.4, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export function HeroFuturistic({
  badge = 'Sentinel Strategic Console',
  title = 'See the theater. Choose the response.',
  subtitle = 'AI-powered operational intelligence for the next decision window.',
  primaryCtaLabel = 'Open App',
  secondaryCtaLabel = 'Login',
  onPrimaryCta,
  onSecondaryCta,
  onScrollCta,
  aside,
}: HeroFuturisticProps) {
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [subtitleDelay, setSubtitleDelay] = useState(0);
  const [canUseWebGpu, setCanUseWebGpu] = useState(false);

  const titleWords = title.split(' ');

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.07));
    setSubtitleDelay(Math.random() * 0.1);
    setCanUseWebGpu(typeof navigator !== 'undefined' && 'gpu' in navigator);
  }, [titleWords.length]);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = window.setTimeout(() => setVisibleWords((value) => value + 1), 140);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => setSubtitleVisible(true), 250);
    return () => window.clearTimeout(timeout);
  }, [visibleWords, titleWords.length]);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#020816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,255,0.18),transparent_32%),linear-gradient(180deg,rgba(2,8,22,0.2),rgba(2,8,22,0.92))]" />
      <div className="absolute inset-0 sentinel-grid opacity-30" />

      {canUseWebGpu ? (
        <div className="absolute inset-0 opacity-90">
          <Canvas
            flat
            gl={async (props) => {
              const renderer = new THREE.WebGPURenderer(props as never);
              await renderer.init();
              return renderer as never;
            }}
          >
            <PostProcessing fullScreenEffect />
            <Scene />
          </Canvas>
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(239,68,68,0.34),transparent_20%),radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.22),transparent_46%)]" />
      )}

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center justify-between rounded-full border border-white/10 bg-slate-950/35 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
            <span className="text-[0.72rem] uppercase tracking-[0.42em] text-cyan-200/85">{badge}</span>
          </div>
          <div className="hidden items-center gap-3 text-xs uppercase tracking-[0.26em] text-slate-400 md:flex">
            <span>Live Signals</span>
            <span>Decision Support</span>
            <span>Explainable AI</span>
          </div>
        </div>

        <div className="grid items-center gap-12 py-12 lg:grid-cols-[minmax(0,1.15fr)_360px] lg:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100">
              Strategic landing surface
            </div>
            <div className="mt-8 space-y-2 text-4xl font-black uppercase leading-[0.92] md:text-6xl xl:text-7xl">
              <div className="flex flex-wrap gap-x-3 gap-y-2 overflow-hidden">
                {titleWords.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className={`hero-word ${index < visibleWords ? 'hero-word--visible' : ''}`}
                    style={{
                      animationDelay: `${index * 0.13 + (delays[index] || 0)}s`,
                      opacity: index < visibleWords ? undefined : 0,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <p
              className={`hero-subtitle mt-6 max-w-2xl text-base font-medium normal-case leading-8 text-slate-200/88 md:text-xl ${
                subtitleVisible ? 'hero-subtitle--visible' : ''
              }`}
              style={{
                animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`,
                opacity: subtitleVisible ? undefined : 0,
              }}
            >
              {subtitle}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={onPrimaryCta}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onSecondaryCta}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
              >
                {secondaryCtaLabel}
                <LogIn className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/55 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.45)] backdrop-blur">
            {aside}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onScrollCta}
            className="hero-scroll inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-5 py-3 text-sm text-slate-100 backdrop-blur transition hover:border-cyan-300/35"
          >
            Scroll to explore
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroFuturistic;
