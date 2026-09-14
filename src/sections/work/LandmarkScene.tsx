import styles from "./GestureGlobeFeature.module.css";

type Point = readonly [number, number];

const openHand: readonly Point[] = [
  [80, 196], [54, 162], [35, 137], [23, 113], [12, 94],
  [59, 128], [55, 91], [51, 55], [47, 21],
  [78, 121], [77, 80], [76, 43], [75, 13],
  [97, 127], [103, 91], [107, 60], [110, 35],
  [113, 143], [127, 114], [137, 88], [145, 64],
];

const pinchHand: readonly Point[] = [
  [80, 196], [56, 162], [45, 137], [62, 115], [81, 101],
  [72, 129], [75, 111], [79, 101], [85, 98],
  [92, 133], [108, 108], [121, 91], [133, 78],
  [108, 143], [124, 127], [137, 112], [147, 98],
  [118, 155], [134, 147], [146, 138], [153, 124],
];

const fingers = [
  [0, 1, 2, 3, 4],
  [0, 5, 6, 7, 8],
  [0, 9, 10, 11, 12],
  [0, 13, 14, 15, 16],
  [0, 17, 18, 19, 20],
] as const;

function HandSkeleton({ variant, className = "" }: { variant: "open" | "pinch"; className?: string }) {
  const points = variant === "open" ? openHand : pinchHand;

  return (
    <svg className={`${styles.hand} ${className}`} viewBox="0 0 165 210" aria-hidden="true" focusable="false">
      <g className={styles.handLines}>
        {fingers.map((finger, index) => (
          <polyline
            key={index}
            data-gg-hand-line
            pathLength={1}
            points={finger.map((point) => points[point].join(",")).join(" ")}
          />
        ))}
        <polyline data-gg-hand-line pathLength={1} points={[5, 9, 13, 17].map((point) => points[point].join(",")).join(" ")} />
      </g>
      <g className={styles.handPoints}>
        {points.map(([x, y], index) => (
          <circle key={index} data-gg-hand-point cx={x} cy={y} r={index === 4 || index === 8 ? 2.8 : 1.7} />
        ))}
      </g>
      {variant === "pinch" && <circle className={styles.pinchTarget} cx="83" cy="100" r="12" />}
    </svg>
  );
}

const facePoints: readonly Point[] = [
  [86, 92], [101, 85], [118, 83], [134, 87], [151, 96],
  [91, 114], [106, 109], [132, 109], [147, 116],
  [119, 119], [110, 136], [120, 140], [131, 136],
  [98, 151], [119, 160], [141, 151],
];

function FaceLandmarks() {
  return (
    <svg className={styles.face} viewBox="0 0 240 230" aria-hidden="true" focusable="false">
      <path d="M 72 80 Q 72 26 120 25 Q 168 26 168 80 L 160 151 Q 145 184 120 190 Q 95 184 80 151 Z" />
      <path d="M 86 92 Q 102 82 113 91 M 127 91 Q 139 82 154 93 M 104 149 Q 120 157 136 149" />
      {facePoints.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="1.8" />)}
    </svg>
  );
}

const meshRings = [
  { y: 57, radius: 40 },
  { y: 100, radius: 88 },
  { y: 160, radius: 108 },
  { y: 220, radius: 88 },
  { y: 263, radius: 40 },
] as const;

const meshPoints = meshRings.map(({ y, radius }, ring) =>
  Array.from({ length: 8 }, (_, index): Point => {
    const angle = (index * Math.PI) / 4 + (ring % 2 ? Math.PI / 8 : 0);
    return [160 + Math.cos(angle) * radius, y + Math.sin(angle) * radius * 0.24];
  }),
);

export function SpatialMesh() {
  const lines: [Point, Point][] = [];

  meshPoints.forEach((ring, ringIndex) => {
    ring.forEach((point, pointIndex) => {
      lines.push([point, ring[(pointIndex + 1) % ring.length]]);
      if (ringIndex < meshPoints.length - 1) {
        lines.push([point, meshPoints[ringIndex + 1][pointIndex]]);
        lines.push([point, meshPoints[ringIndex + 1][(pointIndex + 1) % ring.length]]);
      }
    });
  });

  return (
    <svg className={styles.mesh} viewBox="0 0 320 320" aria-hidden="true" focusable="false">
      <g className={styles.meshLines}>
        {lines.map(([[x1, y1], [x2, y2]], index) => (
          <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <g className={styles.meshPoints}>
        {meshPoints.flat().map(([cx, cy], index) => <circle key={index} cx={cx} cy={cy} r="1.35" />)}
      </g>
    </svg>
  );
}

export default function LandmarkScene() {
  return (
    <>
      <div className={styles.perception} data-gg-perception>
        <div className={styles.sceneTopline}>
          <span>CAMERA INPUT / LANDMARK SPACE</span>
          <span className={styles.activeSignal}>TRACKING ACTIVE</span>
        </div>
        <div className={styles.perceptionField}>
          <span className={styles.reticle} aria-hidden="true" />
          <FaceLandmarks />
          <HandSkeleton variant="open" className={styles.openHand} />
          <span className={styles.faceCallout}>FACE LANDMARKS</span>
          <span className={styles.handCallout}>HAND LANDMARKS</span>
        </div>
        <p className={styles.sceneCaption}>01 / ACQUIRE&nbsp;&nbsp; OPEN HAND + FACE LANDMARKS</p>
      </div>

      <div className={styles.interaction} data-gg-interaction>
        <div className={styles.sceneTopline}>
          <span>GESTURE STATE / SPATIAL INPUT</span>
          <span className={styles.activeSignal}>TRACKING ACTIVE</span>
        </div>
        <div className={styles.interactionField}>
          <HandSkeleton variant="pinch" className={styles.pinchHand} />
          <span className={styles.gestureVector} data-gg-vector aria-hidden="true" />
          <div className={styles.sphere} data-gg-sphere>
            <SpatialMesh />
          </div>
          <div className={styles.secondHand} data-gg-second-hand>
            <HandSkeleton variant="pinch" />
          </div>
          <span className={styles.pinchCallout}>PINCH / OBJECT RESPONSE</span>
          <span className={styles.twoHandCallout} data-gg-two-hand-label>TWO HANDS / SCALE</span>
        </div>
        <p className={styles.sceneCaption}>02 / INTERPRET&nbsp;&nbsp; HAND MOVEMENT → SPATIAL RESPONSE</p>
      </div>
    </>
  );
}
