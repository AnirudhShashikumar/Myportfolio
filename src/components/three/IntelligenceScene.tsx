/**
 * IntelligenceScene V2 — Engineering Constellation
 *
 * Full-viewport spatial environment. Not a contained graphic.
 * The constellation extends across and beyond the screen.
 *
 * Architecture:
 * - 6 domain anchor nodes with intentional positions and semantic connections
 * - 14 structural connective nodes — anonymous, mid-tier
 * - 32 peripheral atmosphere nodes — golden-angle distributed, fine signals
 * - Connection graph encodes real domain relationships:
 *   AI↔VISION, AI↔MULTIMODAL, VISION↔REMOTE SENSING,
 *   FULL-STACK↔AI, IoT↔SOFTWARE, MULTIMODAL↔REMOTE SENSING
 * - Idle: multi-frequency drift + breathing (no obvious loop)
 * - Pointer: damped tilt, restrained
 * - Reduced motion: immediate static resolve
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import {
  Group,
  MathUtils,
  PointsMaterial,
  LineBasicMaterial,
} from "three";

// ─── Types ──────────────────────────────────────────────────────────────────

type NodeDef = {
  position: [number, number, number];
  /** 0 = peripheral, 1 = structural, 2 = domain anchor */
  tier: 0 | 1 | 2;
  domain?: string;
};

type IntelligenceSceneProps = {
  pointer: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
};

// ─── Domain anchor nodes ─────────────────────────────────────────────────────
// Wider distribution for full-viewport composition.
// Positions chosen so the network reads as a spatial environment, not a diagram.
// Z-depth creates parallax feel even in orthographic-like view.

const DOMAIN_NODES: NodeDef[] = [
  { position: [-1.6, 2.1, 0.4], tier: 2, domain: "AI" },
  { position: [2.2, 1.4, -0.5], tier: 2, domain: "VISION" },
  { position: [-2.4, -0.3, -0.3], tier: 2, domain: "FULL-STACK" },
  { position: [1.8, -1.8, 0.6], tier: 2, domain: "IoT" },
  { position: [0.2, 2.6, -0.9], tier: 2, domain: "REMOTE SENSING" },
  { position: [-0.8, -2.2, 0.5], tier: 2, domain: "MULTIMODAL" },
];

// ─── Structural nodes ────────────────────────────────────────────────────────
// Connective tissue between domain anchors. Anonymous but visible.

const STRUCTURAL_NODES: NodeDef[] = [
  { position: [0.3, 1.7, 0.15], tier: 1 },
  { position: [-0.9, 1.1, -0.2], tier: 1 },
  { position: [1.4, 0.5, 0.3], tier: 1 },
  { position: [-1.5, 0.6, 0.35], tier: 1 },
  { position: [0.7, -0.4, -0.45], tier: 1 },
  { position: [-0.5, -0.8, -0.15], tier: 1 },
  { position: [1.1, -1.1, 0.25], tier: 1 },
  { position: [-1.8, -1.4, 0.1], tier: 1 },
  { position: [0.0, 0.3, 0.55], tier: 1 },
  { position: [2.0, -0.2, -0.35], tier: 1 },
  { position: [-0.3, 2.0, 0.2], tier: 1 },
  { position: [0.8, 1.2, -0.6], tier: 1 },
  { position: [-1.2, -0.5, 0.45], tier: 1 },
  { position: [0.5, -1.5, -0.2], tier: 1 },
];

// ─── Peripheral atmosphere nodes ─────────────────────────────────────────────
// Fine background signals spread widely. Golden angle for even coverage.

const PERIPHERAL_COUNT = 32;
const peripheralPositions: [number, number, number][] = Array.from(
  { length: PERIPHERAL_COUNT },
  (_, i) => {
    const phi = i * 2.39996; // golden angle
    const r = 2.6 + (i % 7) * 0.35;
    return [
      Math.cos(phi) * r * 1.2,
      Math.sin(phi) * r * 0.95,
      (((i * 13) % 17) - 8) * 0.15,
    ];
  },
);

const PERIPHERAL_NODES: NodeDef[] = peripheralPositions.map((position) => ({
  position,
  tier: 0,
}));

// ─── Connection graph ────────────────────────────────────────────────────────
// Two kinds of connections:
// 1. Semantic: intentional domain↔domain links reflecting real relationships
// 2. Structural: proximity-based bridging through structural nodes

function dist(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2,
  );
}

function nearestOf(
  source: [number, number, number],
  candidates: NodeDef[],
  maxCount: number,
  maxDist: number,
): NodeDef[] {
  return candidates
    .filter((c) => dist(source, c.position) < maxDist)
    .sort((a, b) => dist(source, a.position) - dist(source, b.position))
    .slice(0, maxCount);
}

const edgeList: number[] = [];

// ── Semantic domain↔domain connections ───────────────────────────────────────
// These encode real relationships, not random proximity.
const DOMAIN_MAP = Object.fromEntries(
  DOMAIN_NODES.map((n) => [n.domain!, n.position]),
);

const SEMANTIC_LINKS: [string, string][] = [
  ["AI", "VISION"],
  ["AI", "MULTIMODAL"],
  ["VISION", "REMOTE SENSING"],
  ["FULL-STACK", "AI"],
  ["IoT", "FULL-STACK"],
  ["MULTIMODAL", "REMOTE SENSING"],
];

for (const [a, b] of SEMANTIC_LINKS) {
  edgeList.push(...DOMAIN_MAP[a], ...DOMAIN_MAP[b]);
}

// ── Domain → 2 nearest structural nodes ──────────────────────────────────────
for (const dn of DOMAIN_NODES) {
  for (const sn of nearestOf(dn.position, STRUCTURAL_NODES, 2, 3.0)) {
    edgeList.push(...dn.position, ...sn.position);
  }
}

// ── Structural cross-links ───────────────────────────────────────────────────
for (let i = 0; i < STRUCTURAL_NODES.length; i++) {
  const a = STRUCTURAL_NODES[i];
  for (const b of nearestOf(a.position, STRUCTURAL_NODES.slice(i + 1), 1, 1.6)) {
    edgeList.push(...a.position, ...b.position);
  }
}

// ── Peripheral → nearest structural ──────────────────────────────────────────
for (const pn of PERIPHERAL_NODES) {
  for (const sn of nearestOf(pn.position, STRUCTURAL_NODES, 1, 3.5)) {
    edgeList.push(...pn.position, ...sn.position);
  }
}

// ─── Buffer arrays (static, module level) ────────────────────────────────────

function toFloat32(nodes: NodeDef[]): Float32Array {
  return new Float32Array(nodes.flatMap((n) => n.position));
}

const DOMAIN_POSITIONS = toFloat32(DOMAIN_NODES);
const STRUCTURAL_POSITIONS = toFloat32(STRUCTURAL_NODES);
const PERIPHERAL_POSITIONS = toFloat32(PERIPHERAL_NODES);
const LINE_POSITIONS = new Float32Array(edgeList);

// ─── Component ──────────────────────────────────────────────────────────────

export default function IntelligenceScene({
  pointer,
  reducedMotion,
}: IntelligenceSceneProps) {
  const group = useRef<Group>(null);
  const domainMat = useRef<PointsMaterial>(null);
  const structuralMat = useRef<PointsMaterial>(null);
  const peripheralMat = useRef<PointsMaterial>(null);
  const lineMat = useRef<LineBasicMaterial>(null);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;

    const t = clock.getElapsedTime();
    const px = pointer.current.x;
    const py = pointer.current.y;

    if (reducedMotion) {
      group.current.rotation.x = 0;
      group.current.rotation.y = 0;
      group.current.position.y = 0;
      return;
    }

    // ── Damped pointer tilt ──────────────────────────────────────────────────
    const targetRx = py * -0.055 + Math.sin(t * 0.08) * 0.015;
    const targetRy = px * 0.085 + Math.sin(t * 0.06) * 0.018;

    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      targetRx,
      1.2,
      delta,
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      targetRy,
      1.2,
      delta,
    );

    // ── Slow spatial drift ───────────────────────────────────────────────────
    group.current.position.y = Math.sin(t * 0.11) * 0.03;
    group.current.position.x = Math.sin(t * 0.07) * 0.015;

    // ── Domain node breathing ────────────────────────────────────────────────
    if (domainMat.current) {
      domainMat.current.opacity =
        0.82 + Math.sin(t * 0.38) * 0.04 + Math.sin(t * 0.15) * 0.025;
    }

    // ── Structural node breathing ────────────────────────────────────────────
    if (structuralMat.current) {
      structuralMat.current.opacity =
        0.55 + Math.sin(t * 0.24) * 0.04 + Math.sin(t * 0.43) * 0.02;
    }

    // ── Line intensity ───────────────────────────────────────────────────────
    if (lineMat.current) {
      lineMat.current.opacity =
        0.12 + Math.sin(t * 0.22) * 0.02 + Math.sin(t * 0.09) * 0.01;
    }

    // ── Peripheral breathing ─────────────────────────────────────────────────
    if (peripheralMat.current) {
      peripheralMat.current.opacity =
        0.38 + Math.sin(t * 0.18) * 0.05 + Math.sin(t * 0.31) * 0.025;
    }
  });

  return (
    <group ref={group}>
      {/* ── Connection lines ── sparse, structural, semantic */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[LINE_POSITIONS, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMat}
          color="#5a94b2"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </lineSegments>

      {/* ── Peripheral nodes ── fine atmospheric signals */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[PERIPHERAL_POSITIONS, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={peripheralMat}
          color="#6a9bb2"
          size={0.03}
          sizeAttenuation
          transparent
          opacity={0.38}
          depthWrite={false}
        />
      </points>

      {/* ── Structural nodes ── visible connective tissue */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[STRUCTURAL_POSITIONS, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={structuralMat}
          color="#9fc8de"
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </points>

      {/* ── Domain anchor nodes ── major signals */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[DOMAIN_POSITIONS, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={domainMat}
          color="#d4eaf5"
          size={0.085}
          sizeAttenuation
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
