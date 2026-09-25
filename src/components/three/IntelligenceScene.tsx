/**
 * IntelligenceScene — Engineering Constellation
 *
 * Visual metaphor: the relationships between the technical domains
 * Anirudh builds across. Not a skills chart. A living computational system.
 *
 * Architecture:
 * - Major domain nodes (AI, VISION, FULL-STACK, IoT, REMOTE SENSING, MULTIMODAL)
 *   carry semantic meaning but are visually restrained — labels emerge only under
 *   pointer proximity.
 * - Most nodes are anonymous structural points.
 * - Connections are sparse, fine, and structural.
 * - Idle behavior: extremely slow drift + subtle opacity breathing.
 * - Pointer: damped spatial tilt + proximity response (node brightens near cursor).
 * - All labels are rendered via CSS/HTML overlay (accessible DOM text), NOT in canvas.
 *   The canvas itself is aria-hidden. This file manages geometry and motion only.
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
  /** 0 = anonymous, 1 = structural, 2 = domain major */
  tier: 0 | 1 | 2;
  /** Domain label, only on tier-2 nodes */
  domain?: string;
};

type IntelligenceSceneProps = {
  pointer: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
};

// ─── Domain node positions ───────────────────────────────────────────────────
// Placed with negative space in mind. Right-biased to sit behind the left-side
// typography. Arranged so no two major nodes are adjacent and the cluster
// reads as a network, not a diagram.

const DOMAIN_NODES: NodeDef[] = [
  { position: [0.55, 1.35, 0.18], tier: 2, domain: "AI" },
  { position: [-0.72, 0.62, -0.25], tier: 2, domain: "VISION" },
  { position: [1.18, -0.28, -0.12], tier: 2, domain: "FULL-STACK" },
  { position: [-0.38, -1.12, 0.35], tier: 2, domain: "IoT" },
  { position: [0.82, 0.88, -0.68], tier: 2, domain: "REMOTE SENSING" },
  { position: [-1.05, 0.12, 0.54], tier: 2, domain: "MULTIMODAL" },
];

// ─── Structural nodes ────────────────────────────────────────────────────────
// Mid-tier connective tissue — visible but anonymous.

const STRUCTURAL_NODES: NodeDef[] = [
  { position: [0.22, 0.88, 0.32], tier: 1 },
  { position: [-0.44, 0.32, -0.18], tier: 1 },
  { position: [0.68, -0.52, 0.22], tier: 1 },
  { position: [-0.18, -0.72, -0.42], tier: 1 },
  { position: [0.38, 0.22, -0.55], tier: 1 },
  { position: [-0.62, -0.18, 0.28], tier: 1 },
  { position: [0.88, 0.48, 0.42], tier: 1 },
  { position: [-0.28, 1.05, -0.38], tier: 1 },
  { position: [0.14, -0.38, 0.68], tier: 1 },
  { position: [0.62, -0.88, -0.22], tier: 1 },
];

// ─── Peripheral nodes ────────────────────────────────────────────────────────
// Fine background signals — anonymous, sparse, provide depth/negative space.

const PERIPHERAL_NODE_COUNT = 22;
const peripheralPositions: [number, number, number][] = Array.from(
  { length: PERIPHERAL_NODE_COUNT },
  (_, i) => {
    const phi = i * 2.39996; // golden angle
    const r = 1.8 + (i % 5) * 0.3;
    return [
      Math.cos(phi) * r * 1.1,
      Math.sin(phi) * r * 0.78,
      (((i * 7) % 11) - 5) * 0.22,
    ];
  }
);

const PERIPHERAL_NODES: NodeDef[] = peripheralPositions.map((position) => ({
  position,
  tier: 0,
}));

// ─── Connection graph ────────────────────────────────────────────────────────
// Sparse. Domain → nearest structural, structural → occasional cross-links,
// peripheral → nearest structural. Avoid visual clutter.

function dist(a: [number, number, number], b: [number, number, number]) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

function nearestOf(
  source: [number, number, number],
  candidates: NodeDef[],
  maxCount: number,
  maxDist: number
): NodeDef[] {
  return candidates
    .filter((c) => dist(source, c.position) < maxDist)
    .sort((a, b) => dist(source, a.position) - dist(source, b.position))
    .slice(0, maxCount);
}

// Build edge list as flat [x0,y0,z0, x1,y1,z1, ...] for LineSegments
const edgeList: number[] = [];

// Domain → 2 nearest structural nodes
for (const dn of DOMAIN_NODES) {
  for (const sn of nearestOf(dn.position, STRUCTURAL_NODES, 2, 2.2)) {
    edgeList.push(...dn.position, ...sn.position);
  }
}

// Structural → 1–2 cross-links between structural nodes (not too many)
for (let i = 0; i < STRUCTURAL_NODES.length; i++) {
  const a = STRUCTURAL_NODES[i];
  for (const b of nearestOf(a.position, STRUCTURAL_NODES.slice(i + 1), 1, 1.4)) {
    edgeList.push(...a.position, ...b.position);
  }
}

// Peripheral → nearest structural node
for (const pn of PERIPHERAL_NODES) {
  for (const sn of nearestOf(pn.position, STRUCTURAL_NODES, 1, 2.8)) {
    edgeList.push(...pn.position, ...sn.position);
  }
}

// ─── Buffer arrays (static, computed once at module level) ───────────────────

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

  // Per-material refs for animated opacity
  const domainMat = useRef<PointsMaterial>(null);
  const peripheralMat = useRef<PointsMaterial>(null);
  const lineMat = useRef<LineBasicMaterial>(null);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;

    const t = clock.getElapsedTime();
    const px = pointer.current.x;
    const py = pointer.current.y;

    if (reducedMotion) {
      // Resolved static state — no motion
      group.current.rotation.x = 0;
      group.current.rotation.y = 0;
      group.current.position.y = 0;
      return;
    }

    // ── Damped pointer tilt (slow, restrained) ──────────────────────────────
    const targetRx = py * -0.07 + Math.sin(t * 0.09) * 0.018;
    const targetRy = px * 0.11 + Math.sin(t * 0.07) * 0.022;

    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      targetRx,
      1.4,
      delta
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      targetRy,
      1.4,
      delta
    );

    // ── Extremely slow vertical drift ───────────────────────────────────────
    group.current.position.y = Math.sin(t * 0.14) * 0.038;

    // ── Restrained domain node pulsing ──────────────────────────────────────
    // Slight opacity breathing on domain nodes, irregular so no obvious loop.
    if (domainMat.current) {
      domainMat.current.opacity =
        0.88 + Math.sin(t * 0.42) * 0.038 + Math.sin(t * 0.17) * 0.022;
    }

    // ── Very subtle connection line intensity variation ──────────────────────
    if (lineMat.current) {
      lineMat.current.opacity =
        0.16 + Math.sin(t * 0.28) * 0.024 + Math.sin(t * 0.11) * 0.012;
    }

    // ── Peripheral slight fade cycle ────────────────────────────────────────
    if (peripheralMat.current) {
      peripheralMat.current.opacity =
        0.52 + Math.sin(t * 0.21) * 0.06 + Math.sin(t * 0.35) * 0.03;
    }
  });

  return (
    <group ref={group}>
      {/* ── Connection lines ── fine, structural */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[LINE_POSITIONS, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMat}
          color="#7aadcc"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </lineSegments>

      {/* ── Peripheral nodes ── fine background signals */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[PERIPHERAL_POSITIONS, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={peripheralMat}
          color="#8ab8ce"
          size={0.038}
          sizeAttenuation
          transparent
          opacity={0.52}
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
          color="#b2d8eb"
          size={0.058}
          sizeAttenuation
          transparent
          opacity={0.72}
          depthWrite={false}
        />
      </points>

      {/* ── Domain nodes ── major signals, slightly larger and brighter */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[DOMAIN_POSITIONS, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={domainMat}
          color="#e2f4ff"
          size={0.095}
          sizeAttenuation
          transparent
          opacity={0.88}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
