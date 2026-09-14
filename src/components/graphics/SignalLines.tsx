import styles from "./Graphics.module.css";

export default function SignalLines({ variant }: { variant: "hero" | "boundary" }) {
  return (
    <svg
      className={`${styles.signal} ${variant === "hero" ? styles.signalHero : styles.signalBoundary}`}
      viewBox="0 0 640 160"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        data-signal-path
        pathLength={1}
        d="M 0 126 C 154 126 185 106 306 106 S 454 42 640 42"
      />
      <path
        data-signal-path
        data-signal-branch
        pathLength={1}
        d="M 210 118 C 250 118 258 145 340 145 L 490 145"
      />
      <circle data-signal-node cx="306" cy="106" r="2.5" />
      <circle data-signal-node cx="490" cy="145" r="2" />
    </svg>
  );
}
