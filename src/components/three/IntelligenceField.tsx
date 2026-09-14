"use client";

import { Canvas } from "@react-three/fiber";
import { Component, type ReactNode, type RefObject } from "react";
import IntelligenceScene from "./IntelligenceScene";

type IntelligenceFieldProps = {
  pointer: RefObject<{ x: number; y: number }>;
  reducedMotion: boolean;
  isMobile: boolean;
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
  reducedMotion,
  isMobile,
}: IntelligenceFieldProps) {
  return (
    <FieldErrorBoundary>
      <Canvas
        aria-hidden="true"
        tabIndex={-1}
        dpr={isMobile ? 1 : [1, 1.5]}
        frameloop={reducedMotion ? "demand" : "always"}
        camera={{ position: [0, 0, 9], fov: 42, near: 0.1, far: 30 }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        fallback={null}
      >
        <IntelligenceScene pointer={pointer} reducedMotion={reducedMotion} />
      </Canvas>
    </FieldErrorBoundary>
  );
}
