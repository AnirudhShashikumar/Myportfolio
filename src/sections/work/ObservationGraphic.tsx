import Image from "next/image";
import styles from "./SatQueryFeature.module.css";

export default function ObservationGraphic() {
  return (
    <figure className={styles.observation} data-sq-observation>
      <div className={styles.observationVisual} aria-hidden="true">
        <Image
          src="/projects/satquery-ai/satquery-landing-hero.jpg"
          alt=""
          fill
          sizes="(max-width: 767px) 100vw, 45vw"
          className={styles.observationImage}
        />
        <div className={styles.earth}>
          <svg viewBox="0 0 320 320" focusable="false">
            <circle cx="160" cy="160" r="127" />
            <ellipse cx="160" cy="160" rx="58" ry="127" />
            <path d="M 38 125 Q 160 158 282 125 M 34 185 Q 160 218 286 185" />
            <path d="M 160 33 V 287 M 33 160 H 287" />
          </svg>
        </div>
        <span className={styles.observationOrbit} />
        <span className={styles.observationPoint} />
      </div>
      <figcaption className={styles.observationCaption}>
        <span>EARTH OBSERVATION</span>
        <span>OPTICAL / SAR / TIME</span>
      </figcaption>
    </figure>
  );
}
