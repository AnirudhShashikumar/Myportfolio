"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import {
  BufferAttribute,
  Group,
  LineBasicMaterial,
  MathUtils,
  MeshBasicMaterial,
  PointsMaterial,
} from "three";
import type { OpeningMotion } from "./IntelligenceField";

type NodeDef = {
  position: [number, number, number];
  tier: 0 | 1 | 2;
  domain?: string;
};

type IntelligenceSceneProps = {
  pointer: RefObject<{ x: number; y: number }>;
  motion: RefObject<OpeningMotion>;
  reducedMotion: boolean;
  isMobile: boolean;
};

const DOMAIN_NODES: NodeDef[] = [
  { position: [-1.6, 2.1, 0.4], tier: 2, domain: "AI" },
  { position: [2.2, 1.4, -0.5], tier: 2, domain: "VISION" },
  { position: [-2.4, -0.3, -0.3], tier: 2, domain: "FULL-STACK" },
  { position: [1.8, -1.8, 0.6], tier: 2, domain: "IoT" },
  { position: [0.2, 2.6, -0.9], tier: 2, domain: "REMOTE SENSING" },
  { position: [-0.8, -2.2, 0.5], tier: 2, domain: "MULTIMODAL" },
];

const STRUCTURAL_NODES: NodeDef[] = [
  { position: [0.3, 1.7, 0.15], tier: 1 },
  { position: [-0.9, 1.1, -0.2], tier: 1 },
  { position: [1.4, 0.5, 0.3], tier: 1 },
  { position: [-1.5, 0.6, 0.35], tier: 1 },
  { position: [0.7, -0.4, -0.45], tier: 1 },
  { position: [-0.5, -0.8, -0.15], tier: 1 },
  { position: [1.1, -1.1, 0.25], tier: 1 },
  { position: [-1.8, -1.4, 0.1], tier: 1 },
  { position: [0, 0.3, 0.55], tier: 1 },
  { position: [2, -0.2, -0.35], tier: 1 },
  { position: [-0.3, 2, 0.2], tier: 1 },
  { position: [0.8, 1.2, -0.6], tier: 1 },
  { position: [-1.2, -0.5, 0.45], tier: 1 },
  { position: [0.5, -1.5, -0.2], tier: 1 },
];

const peripheralPositions: [number, number, number][] = Array.from(
  { length: 32 },
  (_, index) => {
    const phi = index * 2.39996;
    const radius = 2.6 + (index % 7) * 0.35;
    return [
      Math.cos(phi) * radius * 1.2,
      Math.sin(phi) * radius * 0.95,
      (((index * 13) % 17) - 8) * 0.15,
    ];
  },
);

const PERIPHERAL_NODES: NodeDef[] = peripheralPositions.map((position) => ({
  position,
  tier: 0,
}));

function distance(a: [number, number, number], b: [number, number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function nearestOf(
  source: [number, number, number],
  candidates: NodeDef[],
  maxCount: number,
  maxDistance: number,
) {
  return candidates
    .filter((candidate) => distance(source, candidate.position) < maxDistance)
    .sort((a, b) => distance(source, a.position) - distance(source, b.position))
    .slice(0, maxCount);
}

const domainMap = Object.fromEntries(
  DOMAIN_NODES.map((node) => [node.domain!, node.position]),
);
const semanticLinks: [string, string][] = [
  ["AI", "VISION"],
  ["AI", "MULTIMODAL"],
  ["VISION", "REMOTE SENSING"],
  ["FULL-STACK", "AI"],
  ["IoT", "FULL-STACK"],
  ["MULTIMODAL", "REMOTE SENSING"],
];
const edges: number[] = [];

for (const [from, to] of semanticLinks) {
  edges.push(...domainMap[from], ...domainMap[to]);
}
for (const domain of DOMAIN_NODES) {
  for (const structural of nearestOf(domain.position, STRUCTURAL_NODES, 2, 3)) {
    edges.push(...domain.position, ...structural.position);
  }
}
for (let index = 0; index < STRUCTURAL_NODES.length; index += 1) {
  const source = STRUCTURAL_NODES[index];
  for (const target of nearestOf(source.position, STRUCTURAL_NODES.slice(index + 1), 1, 1.6)) {
    edges.push(...source.position, ...target.position);
  }
}
for (const peripheral of PERIPHERAL_NODES) {
  for (const structural of nearestOf(peripheral.position, STRUCTURAL_NODES, 1, 3.5)) {
    edges.push(...peripheral.position, ...structural.position);
  }
}

function toFloat32(nodes: NodeDef[]) {
  return new Float32Array(nodes.flatMap((node) => node.position));
}

function scatterFrom(finalPositions: Float32Array, salt: number) {
  const scattered = new Float32Array(finalPositions.length);
  for (let index = 0; index < finalPositions.length; index += 3) {
    const seed = index / 3 + salt;
    scattered[index] = Math.sin(seed * 12.9898) * 5.8;
    scattered[index + 1] = Math.cos(seed * 7.113) * 3.8;
    scattered[index + 2] = -5.5 + ((seed * 17.17) % 6.5);
  }
  return scattered;
}

const DOMAIN_FINAL = toFloat32(DOMAIN_NODES);
const STRUCTURAL_FINAL = toFloat32(STRUCTURAL_NODES);
const PERIPHERAL_FINAL = toFloat32(PERIPHERAL_NODES);
const LINE_FINAL = new Float32Array(edges);
const DOMAIN_SCATTER = scatterFrom(DOMAIN_FINAL, 2);
const STRUCTURAL_SCATTER = scatterFrom(STRUCTURAL_FINAL, 17);
const PERIPHERAL_SCATTER = scatterFrom(PERIPHERAL_FINAL, 31);
const LINE_SCATTER = scatterFrom(LINE_FINAL, 47);

function smoothstep(start: number, end: number, value: number) {
  const progress = MathUtils.clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function updatePositions(
  attribute: BufferAttribute | null,
  finalPositions: Float32Array,
  scatteredPositions: Float32Array,
  intro: number,
  scroll: number,
) {
  if (!attribute) return;

  const formation = smoothstep(0.08, 0.9, intro);
  const collapseIn = smoothstep(0.46, 0.59, scroll);
  const collapseOut = smoothstep(0.82, 0.95, scroll);
  const collapse = collapseIn * (1 - collapseOut);
  const evidenceExpansion = smoothstep(0.82, 1, scroll);
  const positions = attribute.array as Float32Array;

  for (let index = 0; index < positions.length; index += 3) {
    const baseX = MathUtils.lerp(scatteredPositions[index], finalPositions[index], formation);
    const baseY = MathUtils.lerp(scatteredPositions[index + 1], finalPositions[index + 1], formation);
    const baseZ = MathUtils.lerp(scatteredPositions[index + 2], finalPositions[index + 2], formation);
    const axisX = baseX * 0.055;
    const axisY = baseY * 0.58;
    const axisZ = baseZ * 1.9;
    const expandedX = baseX * 1.34;
    const expandedY = baseY * 1.08;
    const expandedZ = baseZ - evidenceExpansion * 1.25;

    positions[index] = MathUtils.lerp(MathUtils.lerp(baseX, axisX, collapse), expandedX, evidenceExpansion);
    positions[index + 1] = MathUtils.lerp(MathUtils.lerp(baseY, axisY, collapse), expandedY, evidenceExpansion);
    positions[index + 2] = MathUtils.lerp(MathUtils.lerp(baseZ, axisZ, collapse), expandedZ, evidenceExpansion);
  }
  attribute.needsUpdate = true;
}

export default function IntelligenceScene({
  pointer,
  motion,
  reducedMotion,
  isMobile,
}: IntelligenceSceneProps) {
  const group = useRef<Group>(null);
  const signal = useRef<Group>(null);
  const signalMaterial = useRef<MeshBasicMaterial>(null);
  const ringMaterial = useRef<MeshBasicMaterial>(null);
  const domainMaterial = useRef<PointsMaterial>(null);
  const structuralMaterial = useRef<PointsMaterial>(null);
  const peripheralMaterial = useRef<PointsMaterial>(null);
  const lineMaterial = useRef<LineBasicMaterial>(null);
  const domainAttribute = useRef<BufferAttribute>(null);
  const structuralAttribute = useRef<BufferAttribute>(null);
  const peripheralAttribute = useRef<BufferAttribute>(null);
  const lineAttribute = useRef<BufferAttribute>(null);

  const domainPositions = useMemo(() => new Float32Array(DOMAIN_FINAL), []);
  const structuralPositions = useMemo(() => new Float32Array(STRUCTURAL_FINAL), []);
  const peripheralPositionsBuffer = useMemo(() => new Float32Array(PERIPHERAL_FINAL), []);
  const linePositions = useMemo(() => new Float32Array(LINE_FINAL), []);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;

    const elapsed = clock.getElapsedTime();
    const intro = reducedMotion ? 1 : motion.current.intro;
    const scroll = reducedMotion ? 0 : motion.current.scroll;
    const formation = smoothstep(0.08, 0.9, intro);
    const collapse = smoothstep(0.46, 0.59, scroll) * (1 - smoothstep(0.82, 0.95, scroll));
    const evidence = smoothstep(0.82, 1, scroll);

    updatePositions(domainAttribute.current, DOMAIN_FINAL, DOMAIN_SCATTER, intro, scroll);
    updatePositions(structuralAttribute.current, STRUCTURAL_FINAL, STRUCTURAL_SCATTER, intro, scroll);
    updatePositions(peripheralAttribute.current, PERIPHERAL_FINAL, PERIPHERAL_SCATTER, intro, scroll);
    updatePositions(lineAttribute.current, LINE_FINAL, LINE_SCATTER, intro, scroll);

    const pointerScale = isMobile || reducedMotion ? 0 : 1;
    const targetX = pointer.current.y * -0.045 * pointerScale;
    const targetY = pointer.current.x * 0.07 * pointerScale;
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, targetX, 1.5, delta);
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, targetY + scroll * 0.08, 1.5, delta);
    group.current.position.x = reducedMotion ? 0 : Math.sin(elapsed * 0.07) * 0.012;
    group.current.position.y = reducedMotion ? 0 : Math.sin(elapsed * 0.1) * 0.022;
    group.current.position.z = MathUtils.lerp(0, -0.8, evidence);
    const scale = 1 - collapse * 0.08 + evidence * 0.1;
    group.current.scale.setScalar(scale);

    if (signal.current && signalMaterial.current && ringMaterial.current) {
      const firstSignal = smoothstep(0.03, 0.2, intro) * (1 - smoothstep(0.42, 0.63, intro));
      signal.current.visible = firstSignal > 0.001;
      signal.current.scale.setScalar(0.7 + smoothstep(0.05, 0.42, intro) * 2.1);
      signalMaterial.current.opacity = firstSignal;
      ringMaterial.current.opacity = firstSignal * 0.32;
    }

    if (domainMaterial.current) {
      domainMaterial.current.opacity = formation * (0.8 - collapse * 0.5 - evidence * 0.22);
    }
    if (structuralMaterial.current) {
      structuralMaterial.current.opacity = formation * (0.5 - collapse * 0.38 - evidence * 0.17);
    }
    if (peripheralMaterial.current) {
      peripheralMaterial.current.opacity = formation * (0.3 - collapse * 0.26 - evidence * 0.12);
    }
    if (lineMaterial.current) {
      lineMaterial.current.opacity = formation * (0.13 - collapse * 0.105 - evidence * 0.075);
    }
  });

  return (
    <group ref={group}>
      <group ref={signal} position={DOMAIN_NODES[0].position}>
        <mesh>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial ref={signalMaterial} color="#def7ff" transparent depthWrite={false} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.11, 0.12, 32]} />
          <meshBasicMaterial ref={ringMaterial} color="#8fd9ef" transparent depthWrite={false} />
        </mesh>
      </group>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute ref={lineAttribute} attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMaterial} color="#5a94b2" transparent opacity={0} depthWrite={false} />
      </lineSegments>

      <points>
        <bufferGeometry>
          <bufferAttribute ref={peripheralAttribute} attach="attributes-position" args={[peripheralPositionsBuffer, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={peripheralMaterial} color="#6a9bb2" size={isMobile ? 0.026 : 0.03} sizeAttenuation transparent opacity={0} depthWrite={false} />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute ref={structuralAttribute} attach="attributes-position" args={[structuralPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={structuralMaterial} color="#9fc8de" size={isMobile ? 0.042 : 0.05} sizeAttenuation transparent opacity={0} depthWrite={false} />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute ref={domainAttribute} attach="attributes-position" args={[domainPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={domainMaterial} color="#d4eaf5" size={isMobile ? 0.07 : 0.085} sizeAttenuation transparent opacity={0} depthWrite={false} />
      </points>
    </group>
  );
}
