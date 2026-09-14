import SignalLines from "./SignalLines";
import styles from "./Graphics.module.css";

type BoundaryTone = "work-lab" | "lab-about" | "about-contact";

const tones = {
  "work-lab": styles.boundaryWorkLab,
  "lab-about": styles.boundaryLabAbout,
  "about-contact": styles.boundaryAboutContact,
};

export default function SectionBoundary({ tone }: { tone: BoundaryTone }) {
  return (
    <div
      className={`${styles.boundary} ${tones[tone]}`}
      data-section-boundary
      aria-hidden="true"
    >
      <div className={styles.boundaryGeometry} data-boundary-geometry>
        <SignalLines variant="boundary" />
      </div>
    </div>
  );
}
