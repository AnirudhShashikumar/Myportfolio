"use client";

import type { MutableRefObject, RefObject } from "react";
import { useEffect, useRef } from "react";

import type { OpeningMotion } from "@/components/three/IntelligenceField";

import styles from "./HeroKineticGrid.module.css";

export type HeroPointer = {
  x: number;
  y: number;
  px: number;
  py: number;
  velocityX: number;
  velocityY: number;
  lastTime: number;
  active: boolean;
};

type HeroKineticGridProps = {
  active: boolean;
  isMobile: boolean;
  motion: RefObject<OpeningMotion>;
  pointer: RefObject<HeroPointer>;
  reducedMotion: boolean;
  wakeRef: MutableRefObject<(() => void) | null>;
};

type GridNode = {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  activity: number;
  trail: number;
  revealAt: number;
  row: number;
  column: number;
  screenX: number;
  screenY: number;
  edge: number;
  label: string;
};

type GridConnection = {
  from: number;
  to: number;
  emphasis: number;
};

type GridField = {
  nodes: GridNode[];
  connections: GridConnection[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const normalized = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
};

const hash = (row: number, column: number) => {
  const value = Math.sin(row * 91.31 + column * 47.77) * 43758.5453;
  return value - Math.floor(value);
};

function buildField(width: number, height: number, isMobile: boolean): GridField {
  const shortEdge = Math.min(width, height);
  const spacing = isMobile
    ? clamp(width / 4.5, 78, 92)
    : clamp(shortEdge / 10.75, 72, 94);
  const columns = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;
  const offsetX = (width - (columns - 1) * spacing) / 2;
  const offsetY = (height - (rows - 1) * spacing) / 2;
  const nodes: GridNode[] = [];
  const connections: GridConnection[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const baseX = offsetX + column * spacing;
      const baseY = offsetY + row * spacing;
      nodes.push({
        baseX,
        baseY,
        x: baseX,
        y: baseY,
        vx: 0,
        vy: 0,
        activity: 0,
        trail: 0,
        revealAt: 0.06 + hash(row, column) * 0.56,
        row,
        column,
        screenX: baseX,
        screenY: baseY,
        edge: 0,
        label: `X / ${String(Math.round(baseX)).padStart(3, "0")}  Y / ${String(Math.round(baseY)).padStart(3, "0")}`,
      });
    }
  }

  const indexAt = (row: number, column: number) => row * columns + column;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const from = indexAt(row, column);

      if (column < columns - 1 && (row * 3 + column) % 4 !== 0) {
        connections.push({ from, to: indexAt(row, column + 1), emphasis: 0 });
      }

      if (row < rows - 1 && (row + column * 2) % 5 < 3) {
        connections.push({ from, to: indexAt(row + 1, column), emphasis: 0 });
      }

      if (
        row < rows - 1 &&
        column < columns - 1 &&
        (row * 5 + column * 3) % 11 === 0
      ) {
        connections.push({ from, to: indexAt(row + 1, column + 1), emphasis: 1 });
      }
    }
  }

  return { nodes, connections };
}

export default function HeroKineticGrid({
  active,
  isMobile,
  motion,
  pointer,
  reducedMotion,
  wakeRef,
}: HeroKineticGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
    if (active) wakeRef.current?.();
  }, [active, wakeRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let field: GridField = { nodes: [], connections: [] };
    let animationFrame = 0;
    let running = false;
    let disposed = false;
    let previousTime = 0;
    let previousIntro = -1;
    let previousScroll = -1;
    let currentPixelRatio = 0;

    const edgeVisibility = (x: number, y: number) => {
      const horizontal = Math.min(
        smoothstep(0, 82, x),
        smoothstep(0, 82, width - x),
      );
      const vertical = Math.min(
        smoothstep(0, 68, y),
        smoothstep(0, 68, height - y),
      );
      return Math.min(horizontal, vertical);
    };

    const draw = () => {
      const intro = reducedMotion ? 1 : motion.current.intro;
      const scroll = reducedMotion ? 0 : motion.current.scroll;
      const fieldVisibility =
        smoothstep(0.02, 0.88, intro) * (1 - smoothstep(0.66, 0.98, scroll));

      context.clearRect(0, 0, width, height);
      if (fieldVisibility <= 0.002) return;
      const stretch = smoothstep(0.42, 0.82, scroll) * (1 - smoothstep(0.88, 1, scroll));
      for (const node of field.nodes) {
        node.screenX = width / 2 + (node.x - width / 2) * (1 + stretch * 0.075);
        node.screenY = height / 2 + (node.y - height / 2) * (1 - stretch * 0.025);
        node.edge = edgeVisibility(node.screenX, node.screenY);
      }

      for (const connection of field.connections) {
        const from = field.nodes[connection.from];
        const to = field.nodes[connection.to];
        const reveal = Math.min(
          smoothstep(from.revealAt, from.revealAt + 0.26, intro),
          smoothstep(to.revealAt, to.revealAt + 0.26, intro),
        );
        if (reveal <= 0.002) continue;

        const activation = Math.max(from.activity, to.activity);
        const trail = Math.max(from.trail, to.trail);
        const edge = Math.min(from.edge, to.edge);
        const alpha =
          (0.015 + activation * 0.115 + trail * 0.07 + connection.emphasis * 0.006) *
          reveal *
          fieldVisibility *
          edge;

        if (alpha <= 0.002) continue;
        context.beginPath();
        context.moveTo(from.screenX, from.screenY);
        context.lineTo(to.screenX, to.screenY);
        context.strokeStyle = `rgba(119, 162, 181, ${alpha})`;
        context.lineWidth = activation > 0.52 ? 0.8 : 0.55;
        context.stroke();
      }

      let firstLabel: GridNode | null = null;
      let secondLabel: GridNode | null = null;
      const strength = (node: GridNode) => Math.max(node.activity, node.trail);

      for (const node of field.nodes) {
        const reveal = smoothstep(node.revealAt, node.revealAt + 0.24, intro);
        if (reveal <= 0.002) continue;

        const edge = node.edge;
        const signal = Math.max(node.activity, node.trail * 0.72);
        const alpha = (0.055 + signal * 0.38) * reveal * fieldVisibility * edge;
        const radius = 0.58 + signal * 1.12;

        context.beginPath();
        context.arc(node.screenX, node.screenY, radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(185, 211, 220, ${alpha})`;
        context.fill();

        if (signal > 0.58 && edge > 0.72) {
          context.beginPath();
          context.arc(node.screenX, node.screenY, 4.2 + signal * 2.2, 0, Math.PI * 2);
          context.strokeStyle = `rgba(132, 189, 207, ${signal * fieldVisibility * 0.16})`;
          context.lineWidth = 0.65;
          context.stroke();
          if (!firstLabel || strength(node) > strength(firstLabel)) {
            secondLabel = firstLabel;
            firstLabel = node;
          } else if (!secondLabel || strength(node) > strength(secondLabel)) secondLabel = node;
        }
      }

      if (!isMobile && !reducedMotion && firstLabel) {
        context.font = "500 8px ui-monospace, SFMono-Regular, Menlo, monospace";
        context.textBaseline = "middle";

        for (let index = 0; index < 2; index += 1) {
          const node = index === 0 ? firstLabel : secondLabel;
          if (!node) continue;
          const signal = Math.max(node.activity, node.trail);
          context.fillStyle = `rgba(165, 199, 211, ${signal * fieldVisibility * 0.34})`;
          context.fillText(node.label, node.screenX + 10, node.screenY - 8);
        }
      }
    };

    const updatePhysics = (time: number, deltaTime: number) => {
      if (isMobile || reducedMotion) return false;

      const sharedPointer = pointer.current;
      const pointerVelocityAge = Math.max(0, time - sharedPointer.lastTime);
      const velocityDecay = Math.exp(-pointerVelocityAge / 105);
      const pointerVelocityX = sharedPointer.velocityX * velocityDecay;
      const pointerVelocityY = sharedPointer.velocityY * velocityDecay;
      const radius = clamp(Math.min(width, height) * 0.19, 118, 184);
      const maxDisplacement = width <= 1024 ? 12 : 18;
      const spring = 25;
      const damping = Math.exp(-9.2 * deltaTime);
      let unsettled = false;

      for (const node of field.nodes) {
        let accelerationX = (node.baseX - node.x) * spring;
        let accelerationY = (node.baseY - node.y) * spring;
        let targetActivity = 0;

        if (sharedPointer.active) {
          const distanceX = node.x - sharedPointer.px;
          const distanceY = node.y - sharedPointer.py;
          const distance = Math.hypot(distanceX, distanceY);

          if (distance < radius) {
            const safeDistance = Math.max(distance, 1);
            const influence = (1 - distance / radius) ** 2;
            const repulsion = 165 * influence;
            accelerationX +=
              (distanceX / safeDistance) * repulsion + pointerVelocityX * 0.065 * influence;
            accelerationY +=
              (distanceY / safeDistance) * repulsion + pointerVelocityY * 0.065 * influence;
            targetActivity = influence;
            const pointerSpeed = Math.hypot(pointerVelocityX, pointerVelocityY);
            node.trail = Math.max(
              node.trail,
              influence * clamp(0.22 + pointerSpeed / 920, 0, 1),
            );
          }
        }

        const activityDelta = targetActivity - node.activity;
        node.activity += activityDelta * (1 - Math.exp(-13 * deltaTime));
        node.trail *= Math.exp(-2.9 * deltaTime);
        node.vx = (node.vx + accelerationX * deltaTime) * damping;
        node.vy = (node.vy + accelerationY * deltaTime) * damping;

        const speed = Math.hypot(node.vx, node.vy);
        if (speed > 94) {
          const speedScale = 94 / speed;
          node.vx *= speedScale;
          node.vy *= speedScale;
        }

        node.x += node.vx * deltaTime;
        node.y += node.vy * deltaTime;

        const displacementX = node.x - node.baseX;
        const displacementY = node.y - node.baseY;
        const displacement = Math.hypot(displacementX, displacementY);
        if (displacement > maxDisplacement) {
          const displacementScale = maxDisplacement / displacement;
          node.x = node.baseX + displacementX * displacementScale;
          node.y = node.baseY + displacementY * displacementScale;
          node.vx *= 0.72;
          node.vy *= 0.72;
        }

        if (
          Math.abs(node.vx) > 0.035 ||
          Math.abs(node.vy) > 0.035 ||
          Math.abs(activityDelta) > 0.002 ||
          node.trail > 0.004
        ) {
          unsettled = true;
        }
      }

      return unsettled;
    };

    const tick = (time: number) => {
      if (disposed || !activeRef.current) {
        running = false;
        previousTime = 0;
        return;
      }

      const deltaTime = previousTime
        ? clamp((time - previousTime) / 1000, 1 / 240, 1 / 30)
        : 1 / 60;
      previousTime = time;
      const unsettled = updatePhysics(time, deltaTime);
      const intro = motion.current.intro;
      const scroll = motion.current.scroll;
      const motionChanged =
        Math.abs(intro - previousIntro) > 0.0004 ||
        Math.abs(scroll - previousScroll) > 0.0004;

      draw();
      previousIntro = intro;
      previousScroll = scroll;

      if (!reducedMotion && (unsettled || intro < 0.999 || motionChanged)) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        running = false;
        previousTime = 0;
      }
    };

    const wake = () => {
      if (disposed || !activeRef.current || running) return;
      running = true;
      animationFrame = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const nextWidth = Math.round(bounds.width);
      const nextHeight = Math.round(bounds.height);
      if (nextWidth <= 0 || nextHeight <= 0) return;

      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        isMobile ? 1 : nextWidth <= 1024 ? 1.25 : 1.5,
      );

      if (
        nextWidth === width &&
        nextHeight === height &&
        Math.abs(pixelRatio - currentPixelRatio) < 0.01 &&
        field.nodes.length > 0
      ) {
        return;
      }

      width = nextWidth;
      height = nextHeight;
      currentPixelRatio = pixelRatio;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      field = buildField(width, height, isMobile);
      previousIntro = -1;
      previousScroll = -1;

      draw();
      if (!reducedMotion) wake();
    };

    wakeRef.current = wake;

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    return () => {
      disposed = true;
      running = false;
      wakeRef.current = null;
      resizeObserver.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [isMobile, motion, pointer, reducedMotion, wakeRef]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
