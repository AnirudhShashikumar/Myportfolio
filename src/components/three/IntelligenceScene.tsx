"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import { Group, MathUtils, PointsMaterial } from "three";

type Node = readonly [number, number, number];

type IntelligenceSceneProps = {
  pointer: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
};

const STRANDS = 3;
const NODES_PER_STRAND = 11;

const coreNodes: Node[] = [];

for (let strand = 0; strand < STRANDS; strand += 1) {
  for (let step = 0; step < NODES_PER_STRAND; step += 1) {
    const progress = step / (NODES_PER_STRAND - 1);
    const angle = progress * Math.PI * 2.7 + (strand * Math.PI * 2) / STRANDS;
    const radius = 0.27 + Math.sin(progress * Math.PI) * 0.8;

    coreNodes.push([
      Math.cos(angle) * radius * 1.25,
      (progress - 0.5) * 3.4,
      Math.sin(angle) * radius * 0.95,
    ]);
  }
}

const hubNodes: Node[] = [
  [0, 0, 0],
  [0.34, 0.4, 0.3],
  [-0.42, -0.3, -0.2],
  [0.16, -0.52, 0.52],
  [-0.25, 0.62, -0.45],
];

const peripheralNodes: Node[] = Array.from({ length: 14 }, (_, index) => {
  const angle = index * 2.39996;
  const radius = 2.0 + (index % 4) * 0.32;

  return [
    Math.cos(angle) * radius * 1.25,
    Math.sin(angle) * radius * 0.85,
    (((index * 7) % 9) - 4) * 0.28,
  ];
});

function toPositions(nodes: Node[]) {
  return new Float32Array(nodes.flatMap((node) => [...node]));
}

function nearestCoreNodes(node: Node, count: number) {
  return [...coreNodes]
    .sort((first, second) => {
      const firstDistance =
        (node[0] - first[0]) ** 2 +
        (node[1] - first[1]) ** 2 +
        (node[2] - first[2]) ** 2;
      const secondDistance =
        (node[0] - second[0]) ** 2 +
        (node[1] - second[1]) ** 2 +
        (node[2] - second[2]) ** 2;

      return firstDistance - secondDistance;
    })
    .slice(0, count);
}

const connections: number[] = [];

function connect(start: Node, end: Node) {
  connections.push(...start, ...end);
}

for (let strand = 0; strand < STRANDS; strand += 1) {
  for (let step = 0; step < NODES_PER_STRAND - 1; step += 1) {
    connect(
      coreNodes[strand * NODES_PER_STRAND + step],
      coreNodes[strand * NODES_PER_STRAND + step + 1],
    );
  }
}

for (let step = 1; step < NODES_PER_STRAND; step += 3) {
  for (let strand = 0; strand < STRANDS; strand += 1) {
    connect(
      coreNodes[strand * NODES_PER_STRAND + step],
      coreNodes[((strand + 1) % STRANDS) * NODES_PER_STRAND + step],
    );
  }
}

for (const node of hubNodes) {
  for (const neighbor of nearestCoreNodes(node, 3)) {
    connect(node, neighbor);
  }
}

for (const node of peripheralNodes) {
  connect(node, nearestCoreNodes(node, 1)[0]);
}

const CORE_POSITIONS = toPositions(coreNodes);
const HUB_POSITIONS = toPositions(hubNodes);
const PERIPHERAL_POSITIONS = toPositions(peripheralNodes);
const LINE_POSITIONS = new Float32Array(connections);

export default function IntelligenceScene({
  pointer,
  reducedMotion,
}: IntelligenceSceneProps) {
  const group = useRef<Group>(null);
  const coreMaterial = useRef<PointsMaterial>(null);

  useFrame(({ clock }, delta) => {
    if (reducedMotion || !group.current) return;

    const time = clock.getElapsedTime();
    const targetX = pointer.current.y * -0.055 + Math.sin(time * 0.13) * 0.025;
    const targetY = pointer.current.x * 0.085 + Math.sin(time * 0.1) * 0.035;

    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      targetX,
      1.8,
      delta,
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      targetY,
      1.8,
      delta,
    );
    group.current.position.y = Math.sin(time * 0.18) * 0.045;

    if (coreMaterial.current) {
      coreMaterial.current.opacity = 0.82 + Math.sin(time * 0.55) * 0.045;
    }
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[LINE_POSITIONS, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#8fb7cc" transparent opacity={0.18} depthWrite={false} />
      </lineSegments>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[PERIPHERAL_POSITIONS, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#95bcd1"
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[CORE_POSITIONS, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={coreMaterial}
          color="#d3efff"
          size={0.072}
          sizeAttenuation
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </points>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[HUB_POSITIONS, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#effaff"
          size={0.11}
          sizeAttenuation
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
