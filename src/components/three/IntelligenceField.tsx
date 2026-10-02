"use client";

import { Canvas } from "@react-three/fiber";
import {
  Component,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import IntelligenceScene from "./IntelligenceScene";

type IntelligenceFieldProps = {
  pointer: RefObject<{ x: number; y: number }>;
  motion: RefObject<OpeningMotion>;
  reducedMotion: boolean;
  isMobile: boolean;
  active: boolean;
};

export type OpeningMotion = {
  intro: number;
  scroll: number;
};

class FieldErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function IntelligenceField({
  pointer,
  motion,
  reducedMotion,
  isMobile,
  active,
}: IntelligenceFieldProps) {
  const [webglAvailable] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      return Boolean(context);
    } catch {
      return false;
    }
  });

  if (!webglAvailable) return null;

  return (
    <FieldErrorBoundary>
      <Canvas
        aria-hidden="true"
        tabIndex={-1}
        dpr={isMobile ? 1 : [1, 1.5]}
        frameloop={reducedMotion || !active ? "demand" : "always"}
        camera={{ position: [0, 0, 8], fov: 52, near: 0.1, far: 30 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => gl.setClearColor(0x030609, 0)}
        fallback={null}
      >
        <IntelligenceScene
          pointer={pointer}
          motion={motion}
          reducedMotion={reducedMotion}
          isMobile={isMobile}
        />
      </Canvas>
    </FieldErrorBoundary>
  );
}
