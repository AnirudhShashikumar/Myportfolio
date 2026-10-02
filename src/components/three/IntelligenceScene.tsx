"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  MathUtils,
  MeshBasicMaterial,
  PointsMaterial,
} from "three";

import type { OpeningMotion } from "./IntelligenceField";

type Vec3 = [number, number, number];

type ArcDefinition = {
  radii: [number, number];
  ranges: Array<[number, number]>;
  rotation: Vec3;
  offset: Vec3;
  segments: number;
};

type IntelligenceCoreData = {
  rings: Float32Array;
  orbits: Float32Array;
  farFrames: Float32Array;
  frames: Float32Array;
  nearFrames: Float32Array;
  connections: Float32Array;
  axis: Float32Array;
  nodes: Float32Array;
  anchors: Float32Array;
  surfaces: Float32Array;
  signalPath: Vec3[];
  signalSegments: Float32Array;
};

type IntelligenceSceneProps = {
  pointer: RefObject<{ x: number; y: number }>;
  motion: RefObject<OpeningMotion>;
  reducedMotion: boolean;
  isMobile: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function smoothstep(start: number, end: number, value: number) {
  const progress = clamp((value - start) / (end - start), 0, 1);
  return progress * progress * (3 - 2 * progress);
}

function rotatePoint(
  [sourceX, sourceY, sourceZ]: Vec3,
  [rotationX, rotationY, rotationZ]: Vec3,
  [offsetX, offsetY, offsetZ]: Vec3,
): Vec3 {
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);
  const cosZ = Math.cos(rotationZ);
  const sinZ = Math.sin(rotationZ);

  const xAfterX = sourceX;
  const yAfterX = sourceY * cosX - sourceZ * sinX;
  const zAfterX = sourceY * sinX + sourceZ * cosX;
  const xAfterY = xAfterX * cosY + zAfterX * sinY;
  const yAfterY = yAfterX;
  const zAfterY = -xAfterX * sinY + zAfterX * cosY;

  return [
    xAfterY * cosZ - yAfterY * sinZ + offsetX,
    xAfterY * sinZ + yAfterY * cosZ + offsetY,
    zAfterY + offsetZ,
  ];
}

function addSegment(target: number[], from: Vec3, to: Vec3) {
  target.push(...from, ...to);
}

function buildArcSegments(definitions: ArcDefinition[]) {
  const positions: number[] = [];

  for (const definition of definitions) {
    for (const [start, end] of definition.ranges) {
      for (let index = 0; index < definition.segments; index += 1) {
        const fromAngle = MathUtils.lerp(start, end, index / definition.segments);
        const toAngle = MathUtils.lerp(start, end, (index + 1) / definition.segments);
        const from = rotatePoint(
          [
            Math.cos(fromAngle) * definition.radii[0],
            Math.sin(fromAngle) * definition.radii[1],
            0,
          ],
          definition.rotation,
          definition.offset,
        );
        const to = rotatePoint(
          [
            Math.cos(toAngle) * definition.radii[0],
            Math.sin(toAngle) * definition.radii[1],
            0,
          ],
          definition.rotation,
          definition.offset,
        );
        addSegment(positions, from, to);
      }
    }
  }

  return new Float32Array(positions);
}

function buildFrameSegments(frames: Vec3[][]) {
  const positions: number[] = [];

  for (const frame of frames) {
    for (let index = 0; index < frame.length; index += 1) {
      addSegment(positions, frame[index], frame[(index + 1) % frame.length]);
    }
  }

  return new Float32Array(positions);
}

function buildConnections(nodes: Vec3[], pairs: Array<[number, number]>) {
  const positions: number[] = [];
  for (const [from, to] of pairs) addSegment(positions, nodes[from], nodes[to]);
  return new Float32Array(positions);
}

function selectPoints(nodes: Vec3[], indices: number[]) {
  return new Float32Array(indices.flatMap((index) => nodes[index]));
}

function toFloat32(points: Vec3[]) {
  return new Float32Array(points.flatMap((point) => point));
}

const RINGS: ArcDefinition[] = [
  {
    radii: [1.12, 0.94],
    ranges: [[-0.08 * Math.PI, 0.54 * Math.PI], [0.72 * Math.PI, 1.3 * Math.PI], [1.48 * Math.PI, 1.84 * Math.PI]],
    rotation: [0.28, -0.46, 0.18],
    offset: [0.04, 0.02, 0.38],
    segments: 11,
  },
  {
    radii: [1.72, 1.42],
    ranges: [[0.08 * Math.PI, 0.62 * Math.PI], [0.79 * Math.PI, 1.22 * Math.PI], [1.4 * Math.PI, 1.94 * Math.PI]],
    rotation: [-0.58, 0.34, -0.2],
    offset: [0.12, 0.08, -0.42],
    segments: 13,
  },
  {
    radii: [2.34, 1.84],
    ranges: [[-0.02 * Math.PI, 0.42 * Math.PI], [0.58 * Math.PI, 1.08 * Math.PI], [1.27 * Math.PI, 1.72 * Math.PI]],
    rotation: [0.7, 0.18, 0.38],
    offset: [-0.08, 0.12, -1.02],
    segments: 15,
  },
];

const ORBITS: ArcDefinition[] = [
  {
    radii: [2.68, 0.7],
    ranges: [[0.08 * Math.PI, 0.84 * Math.PI], [1.02 * Math.PI, 1.84 * Math.PI]],
    rotation: [0.34, 0.14, 0.72],
    offset: [0.08, 0.06, -0.18],
    segments: 17,
  },
  {
    radii: [2.46, 0.82],
    ranges: [[-0.12 * Math.PI, 0.72 * Math.PI], [0.94 * Math.PI, 1.72 * Math.PI]],
    rotation: [-0.26, 0.82, -0.34],
    offset: [0.16, -0.04, -0.64],
    segments: 16,
  },
  {
    radii: [2.08, 0.58],
    ranges: [[0.02 * Math.PI, 0.68 * Math.PI], [0.86 * Math.PI, 1.58 * Math.PI]],
    rotation: [1.02, 0.08, 0.12],
    offset: [-0.2, 0.12, 0.2],
    segments: 14,
  },
];

const PRIMARY_FRAME: Vec3[] = [
  [-1.18, 0.38, 0.28],
  [-0.78, -0.92, 0.82],
  [0.68, -1.16, 1.14],
  [1.46, -0.34, 0.66],
  [1.08, 1.08, 0.94],
  [-0.24, 1.5, 0.54],
];

const FAR_FRAME: Vec3[] = [
  [-1.62, -1.38, -1.42],
  [0.08, -1.9, -0.92],
  [1.54, -0.82, -1.34],
  [1.82, 0.74, -1.68],
  [0.34, 1.76, -1.22],
  [-1.22, 1.04, -1.58],
];

const RIGHT_FRAME: Vec3[] = [
  [0.42, -1.22, 0.08],
  [1.9, -0.74, 0.3],
  [2.24, 0.64, -0.02],
  [1.1, 1.54, -0.22],
  [0.18, 0.76, 0.16],
];

const INNER_FRAME: Vec3[] = [
  [-0.74, -0.54, 0.22],
  [0.38, -0.8, 0.42],
  [0.96, 0.14, 0.26],
  [0.34, 0.9, 0.56],
  [-0.62, 0.66, 0.34],
];

const DESKTOP_NODES: Vec3[] = [
  ...PRIMARY_FRAME,
  ...FAR_FRAME,
  [0.38, -0.8, 0.42],
  [0.96, 0.14, 0.26],
  [0.34, 0.9, 0.56],
  [-0.62, 0.66, 0.34],
  [0, 0, 0.06],
  [1.9, -0.74, 0.3],
  [2.24, 0.64, -0.02],
  [0.18, 0.76, 0.16],
];

const DESKTOP_CONNECTIONS: Array<[number, number]> = [
  [0, 16], [1, 12], [1, 16], [2, 12], [2, 17], [3, 13], [3, 17],
  [4, 14], [4, 18], [5, 14], [5, 16], [6, 12], [7, 12], [7, 16],
  [8, 17], [9, 18], [10, 14], [10, 18], [11, 15], [11, 16], [12, 13],
  [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19], [4, 10],
];

const SURFACES: Vec3[] = [
  [-0.74, -0.54, 0.2], [0.38, -0.8, 0.4], [0.96, 0.14, 0.24],
  [-0.62, 0.66, 0.32], [0.96, 0.14, 0.24], [0.34, 0.9, 0.54],
  [1.02, -0.5, -0.92], [1.66, 0.54, -1.3], [0.3, 1.2, -1.06],
];

const AXIS: Vec3[] = [
  [-0.34, -2.46, -1.56], [0.42, 2.5, 1.18],
  [-0.31, -1.36, -0.94], [-0.02, -1.41, -0.83],
  [0.02, 0.02, -0.08], [0.34, -0.04, 0.02],
  [0.26, 1.36, 0.62], [0.57, 1.31, 0.72],
];

const DESKTOP_SIGNAL_PATH: Vec3[] = [
  DESKTOP_NODES[7],
  DESKTOP_NODES[12],
  DESKTOP_NODES[13],
  DESKTOP_NODES[4],
  DESKTOP_NODES[10],
];

const MOBILE_NODES: Vec3[] = [
  [-1.02, 0.34, 0.24],
  [-0.66, -0.86, 0.68],
  [0.54, -1.02, 0.84],
  [1.2, -0.24, 0.48],
  [0.92, 0.94, 0.68],
  [-0.18, 1.24, 0.42],
  [-0.54, -0.44, 0.18],
  [0.3, -0.64, 0.34],
  [0.78, 0.1, 0.2],
  [0.26, 0.72, 0.42],
  [-0.46, 0.54, 0.28],
  [0, 0, 0.04],
];

const MOBILE_PRIMARY_FRAME = MOBILE_NODES.slice(0, 6);
const MOBILE_INNER_FRAME = MOBILE_NODES.slice(6, 11);

const MOBILE_CONNECTIONS: Array<[number, number]> = [
  [0, 11], [1, 6], [1, 11], [2, 7], [3, 8], [4, 9], [5, 9], [5, 11],
  [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [7, 11], [8, 11],
];

const MOBILE_SIGNAL_PATH: Vec3[] = [
  MOBILE_NODES[1],
  MOBILE_NODES[7],
  MOBILE_NODES[8],
  MOBILE_NODES[4],
];

const DESKTOP_DATA: IntelligenceCoreData = {
  rings: buildArcSegments(RINGS),
  orbits: buildArcSegments(ORBITS),
  farFrames: buildFrameSegments([FAR_FRAME]),
  frames: buildFrameSegments([PRIMARY_FRAME, RIGHT_FRAME]),
  nearFrames: buildFrameSegments([INNER_FRAME]),
  connections: buildConnections(DESKTOP_NODES, DESKTOP_CONNECTIONS),
  axis: toFloat32(AXIS),
  nodes: toFloat32(DESKTOP_NODES),
  anchors: selectPoints(DESKTOP_NODES, [1, 3, 4, 7, 9, 10, 13, 18]),
  surfaces: toFloat32(SURFACES),
  signalPath: DESKTOP_SIGNAL_PATH,
  signalSegments: buildConnections(DESKTOP_SIGNAL_PATH, [[0, 1], [1, 2], [2, 3], [3, 4]]),
};

const MOBILE_DATA: IntelligenceCoreData = {
  rings: buildArcSegments(RINGS.slice(0, 2)),
  orbits: buildArcSegments(ORBITS.slice(0, 2)),
  farFrames: buildFrameSegments([]),
  frames: buildFrameSegments([MOBILE_PRIMARY_FRAME]),
  nearFrames: buildFrameSegments([MOBILE_INNER_FRAME]),
  connections: buildConnections(MOBILE_NODES, MOBILE_CONNECTIONS),
  axis: toFloat32(AXIS.slice(0, 4)),
  nodes: toFloat32(MOBILE_NODES),
  anchors: selectPoints(MOBILE_NODES, [1, 3, 4, 7, 9]),
  surfaces: toFloat32(SURFACES.slice(0, 6)),
  signalPath: MOBILE_SIGNAL_PATH,
  signalSegments: buildConnections(MOBILE_SIGNAL_PATH, [[0, 1], [1, 2], [2, 3]]),
};

const FIRST_SIGNAL = new Float32Array([-0.24, 1.5, 0.54]);

function setSegmentProgress(
  geometry: BufferGeometry | null,
  positions: Float32Array,
  progress: number,
) {
  if (!geometry) return;
  const segmentCount = positions.length / 6;
  geometry.setDrawRange(0, Math.floor(segmentCount * clamp(progress, 0, 1)) * 2);
}

function setPointProgress(
  geometry: BufferGeometry | null,
  positions: Float32Array,
  progress: number,
) {
  if (!geometry) return;
  const pointCount = positions.length / 3;
  geometry.setDrawRange(0, Math.ceil(pointCount * clamp(progress, 0, 1)));
}

export default function IntelligenceScene({
  pointer,
  motion,
  reducedMotion,
  isMobile,
}: IntelligenceSceneProps) {
  const data = isMobile ? MOBILE_DATA : DESKTOP_DATA;
  const core = useRef<Group>(null);
  const farAssembly = useRef<Group>(null);
  const ringAssembly = useRef<Group>(null);
  const midAssembly = useRef<Group>(null);
  const nearAssembly = useRef<Group>(null);
  const parallax = useRef({ farZ: 0, ringX: 0, ringY: 0, midZ: 0, nearX: 0, nearY: 0, nearRotationY: 0 });

  const ringGeometry = useRef<BufferGeometry>(null);
  const orbitGeometry = useRef<BufferGeometry>(null);
  const farFrameGeometry = useRef<BufferGeometry>(null);
  const frameGeometry = useRef<BufferGeometry>(null);
  const nearFrameGeometry = useRef<BufferGeometry>(null);
  const connectionGeometry = useRef<BufferGeometry>(null);
  const axisGeometry = useRef<BufferGeometry>(null);
  const nodeGeometry = useRef<BufferGeometry>(null);
  const anchorGeometry = useRef<BufferGeometry>(null);
  const signalGeometry = useRef<BufferGeometry>(null);
  const signalPointAttribute = useRef<BufferAttribute>(null);

  const ringMaterial = useRef<LineBasicMaterial>(null);
  const orbitMaterial = useRef<LineBasicMaterial>(null);
  const farFrameMaterial = useRef<LineBasicMaterial>(null);
  const frameMaterial = useRef<LineBasicMaterial>(null);
  const nearFrameMaterial = useRef<LineBasicMaterial>(null);
  const connectionMaterial = useRef<LineBasicMaterial>(null);
  const axisMaterial = useRef<LineBasicMaterial>(null);
  const nodeMaterial = useRef<PointsMaterial>(null);
  const anchorMaterial = useRef<PointsMaterial>(null);
  const firstSignalMaterial = useRef<PointsMaterial>(null);
  const surfaceMaterial = useRef<MeshBasicMaterial>(null);
  const signalLineMaterial = useRef<LineBasicMaterial>(null);
  const signalPointMaterial = useRef<PointsMaterial>(null);

  useFrame(({ clock }, delta) => {
    if (!core.current) return;
    delta = reducedMotion ? 1 : Math.min(delta, 1 / 30);

    const elapsed = clock.elapsedTime;
    const intro = reducedMotion ? 1 : motion.current.intro;
    const scroll = reducedMotion ? 0 : motion.current.scroll;
    const formation = smoothstep(0.04, 0.96, intro);
    const axisFormation = smoothstep(0.025, 0.24, intro);
    const nodeFormation = smoothstep(0.11, 0.68, intro);
    const frameFormation = smoothstep(0.28, 0.88, intro);
    const orbitFormation = smoothstep(0.46, 0.98, intro);
    const ringFormation = smoothstep(0.62, 1, intro);
    const organization = reducedMotion ? 1 : smoothstep(0.16, 0.48, scroll);
    const identity = reducedMotion
      ? 0
      : smoothstep(0.62, 0.72, scroll) * (1 - smoothstep(0.82, 0.91, scroll));
    const evidence = reducedMotion ? 0 : smoothstep(0.82, 1, scroll);
    const contrast = 1 - identity * 0.3 - evidence * 0.58;
    const pointerScale = reducedMotion || isMobile ? 0 : 1;
    const baseX = isMobile ? 0.36 : 1.24;
    const baseY = isMobile ? 0.08 : 0.1;
    const baseScale = isMobile ? 0.82 : 1.25;

    core.current.position.set(baseX + evidence * 0.16, baseY + evidence * 0.08, -evidence * 0.58);
    core.current.scale.setScalar(
      baseScale * (0.92 + formation * 0.08) * (1 + evidence * 0.07),
    );

    if (farAssembly.current) {
      farAssembly.current.position.x = -evidence * 0.42;
      farAssembly.current.position.y = evidence * 0.16;
      parallax.current.farZ = MathUtils.damp(
        parallax.current.farZ,
        pointer.current.x * 0.006 * pointerScale,
        1.35,
        delta,
      );
      farAssembly.current.rotation.z = (1 - organization) * 0.16 + parallax.current.farZ;
      farAssembly.current.rotation.x = MathUtils.damp(
        farAssembly.current.rotation.x,
        pointer.current.y * -0.005 * pointerScale,
        1.2,
        delta,
      );
    }

    if (ringAssembly.current) {
      const ringDrift = reducedMotion ? 0 : Math.sin(elapsed * 0.075) * 0.009;
      parallax.current.ringX = MathUtils.damp(
        parallax.current.ringX,
        pointer.current.y * -0.011 * pointerScale,
        1.15,
        delta,
      );
      ringAssembly.current.rotation.x = (1 - organization) * -0.075 + parallax.current.ringX;
      parallax.current.ringY = MathUtils.damp(
        parallax.current.ringY,
        pointer.current.x * 0.014 * pointerScale,
        1.15,
        delta,
      );
      ringAssembly.current.rotation.y = (1 - organization) * 0.1 + parallax.current.ringY;
      ringAssembly.current.rotation.z = ringDrift;
    }

    if (midAssembly.current) {
      midAssembly.current.position.x = evidence * 0.18;
      parallax.current.midZ = MathUtils.damp(
        parallax.current.midZ,
        pointer.current.x * 0.012 * pointerScale,
        1.25,
        delta,
      );
      midAssembly.current.rotation.z = (1 - organization) * -0.1 + parallax.current.midZ;
      midAssembly.current.rotation.x = MathUtils.damp(
        midAssembly.current.rotation.x,
        pointer.current.y * -0.014 * pointerScale,
        1.2,
        delta,
      );
    }

    if (nearAssembly.current) {
      parallax.current.nearX = MathUtils.damp(
        parallax.current.nearX,
        pointer.current.x * 0.035 * pointerScale,
        1.7,
        delta,
      );
      nearAssembly.current.position.x = evidence * 0.48 + parallax.current.nearX;
      parallax.current.nearY = MathUtils.damp(
        parallax.current.nearY,
        pointer.current.y * 0.022 * pointerScale,
        1.7,
        delta,
      );
      nearAssembly.current.position.y = -evidence * 0.2 + parallax.current.nearY;
      parallax.current.nearRotationY = MathUtils.damp(
        parallax.current.nearRotationY,
        pointer.current.x * 0.026 * pointerScale,
        1.05,
        delta,
      );
      nearAssembly.current.rotation.y = (1 - organization) * -0.12 + parallax.current.nearRotationY;
      nearAssembly.current.rotation.x = MathUtils.damp(
        nearAssembly.current.rotation.x,
        pointer.current.y * -0.02 * pointerScale,
        1.05,
        delta,
      );
    }

    setSegmentProgress(axisGeometry.current, data.axis, axisFormation);
    setPointProgress(nodeGeometry.current, data.nodes, nodeFormation);
    setPointProgress(anchorGeometry.current, data.anchors, smoothstep(0.22, 0.78, intro));
    setSegmentProgress(farFrameGeometry.current, data.farFrames, frameFormation * 0.9);
    setSegmentProgress(frameGeometry.current, data.frames, frameFormation);
    setSegmentProgress(nearFrameGeometry.current, data.nearFrames, smoothstep(0.38, 0.94, intro));
    setSegmentProgress(
      connectionGeometry.current,
      data.connections,
      smoothstep(0.34, 0.92, intro) * (0.64 + organization * 0.36),
    );
    setSegmentProgress(orbitGeometry.current, data.orbits, orbitFormation * (0.72 + organization * 0.28));
    setSegmentProgress(ringGeometry.current, data.rings, ringFormation * (0.7 + organization * 0.3));

    if (axisMaterial.current) axisMaterial.current.opacity = axisFormation * 0.2 * contrast;
    if (farFrameMaterial.current) farFrameMaterial.current.opacity = frameFormation * (0.11 + organization * 0.04) * contrast;
    if (frameMaterial.current) frameMaterial.current.opacity = frameFormation * (0.22 + organization * 0.06) * contrast;
    if (nearFrameMaterial.current) nearFrameMaterial.current.opacity = frameFormation * (0.24 + organization * 0.08) * contrast;
    if (connectionMaterial.current) connectionMaterial.current.opacity = frameFormation * (0.095 + organization * 0.05) * contrast;
    if (orbitMaterial.current) orbitMaterial.current.opacity = orbitFormation * (0.105 + organization * 0.06) * contrast;
    if (ringMaterial.current) ringMaterial.current.opacity = ringFormation * (0.18 + organization * 0.08) * contrast;
    if (nodeMaterial.current) nodeMaterial.current.opacity = nodeFormation * 0.4 * contrast;
    if (anchorMaterial.current) anchorMaterial.current.opacity = smoothstep(0.22, 0.78, intro) * 0.76 * contrast;
    if (surfaceMaterial.current) surfaceMaterial.current.opacity = frameFormation * (0.028 + organization * 0.026) * contrast;
    if (firstSignalMaterial.current) {
      firstSignalMaterial.current.opacity = reducedMotion
        ? 0
        : smoothstep(0.025, 0.15, intro) * (1 - smoothstep(0.46, 0.7, intro));
    }

    const signalCycle = (elapsed % 10.5) / 10.5;
    const signalWindow = reducedMotion || isMobile
      ? 0
      : smoothstep(0.54, 0.61, signalCycle) * (1 - smoothstep(0.82, 0.9, signalCycle));
    const signalTravel = clamp((signalCycle - 0.56) / 0.27, 0, 1);
    const signalReadiness = smoothstep(0.94, 1, intro) * (1 - evidence);
    const signalStrength = signalWindow * signalReadiness * contrast;

    if (signalLineMaterial.current) signalLineMaterial.current.opacity = signalStrength * 0.52;
    if (signalPointMaterial.current) signalPointMaterial.current.opacity = signalStrength * 0.88;
    setSegmentProgress(signalGeometry.current, data.signalSegments, signalTravel);

    if (signalPointAttribute.current && data.signalPath.length > 1) {
      const scaledTravel = signalTravel * (data.signalPath.length - 1);
      const fromIndex = Math.min(Math.floor(scaledTravel), data.signalPath.length - 2);
      const localProgress = scaledTravel - fromIndex;
      const from = data.signalPath[fromIndex];
      const to = data.signalPath[fromIndex + 1];
      const positions = signalPointAttribute.current.array as Float32Array;
      positions[0] = MathUtils.lerp(from[0], to[0], localProgress);
      positions[1] = MathUtils.lerp(from[1], to[1], localProgress);
      positions[2] = MathUtils.lerp(from[2], to[2], localProgress);
      signalPointAttribute.current.needsUpdate = true;
    }
  });

  return (
    <group ref={core} key={isMobile ? "mobile-core" : "desktop-core"}>
      <group ref={farAssembly}>
        <lineSegments>
          <bufferGeometry ref={farFrameGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.farFrames, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={farFrameMaterial} color="#55717d" transparent opacity={0} depthWrite={false} />
        </lineSegments>
      </group>

      <group ref={ringAssembly}>
        <lineSegments>
          <bufferGeometry ref={ringGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.rings, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={ringMaterial} color="#91a9b3" transparent opacity={0} depthWrite={false} />
        </lineSegments>
        <lineSegments>
          <bufferGeometry ref={orbitGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.orbits, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={orbitMaterial} color="#708d99" transparent opacity={0} depthWrite={false} />
        </lineSegments>
      </group>

      <group ref={midAssembly}>
        <lineSegments>
          <bufferGeometry ref={axisGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.axis, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={axisMaterial} color="#b5c8cf" transparent opacity={0} depthWrite={false} />
        </lineSegments>
        <lineSegments>
          <bufferGeometry ref={frameGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.frames, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={frameMaterial} color="#91a9b3" transparent opacity={0} depthWrite={false} />
        </lineSegments>
        <lineSegments>
          <bufferGeometry ref={connectionGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.connections, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={connectionMaterial} color="#607f8c" transparent opacity={0} depthWrite={false} />
        </lineSegments>
        <points>
          <bufferGeometry ref={nodeGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.nodes, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={nodeMaterial}
            color="#a9c3cd"
            size={isMobile ? 0.05 : 0.058}
            sizeAttenuation
            transparent
            opacity={0}
            depthWrite={false}
          />
        </points>
        <mesh>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.surfaces, 3]} />
          </bufferGeometry>
          <meshBasicMaterial
            ref={surfaceMaterial}
            color="#78939e"
            side={DoubleSide}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>

      <group ref={nearAssembly}>
        <lineSegments>
          <bufferGeometry ref={nearFrameGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.nearFrames, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={nearFrameMaterial} color="#a5bbc3" transparent opacity={0} depthWrite={false} />
        </lineSegments>
        <points>
          <bufferGeometry ref={anchorGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.anchors, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={anchorMaterial}
            color="#d0e1e6"
            size={isMobile ? 0.065 : 0.082}
            sizeAttenuation
            transparent
            opacity={0}
            depthWrite={false}
          />
        </points>
        <lineSegments>
          <bufferGeometry ref={signalGeometry}>
            <bufferAttribute attach="attributes-position" args={[data.signalSegments, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={signalLineMaterial} color="#a8d8e8" transparent opacity={0} depthWrite={false} />
        </lineSegments>
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={signalPointAttribute}
              attach="attributes-position"
              args={[new Float32Array(data.signalPath[0]), 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={signalPointMaterial}
            color="#c8edf7"
            size={0.092}
            sizeAttenuation
            transparent
            opacity={0}
            depthWrite={false}
          />
        </points>
      </group>

      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[FIRST_SIGNAL, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={firstSignalMaterial}
          color="#d6f3fa"
          size={0.105}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
