import TechnicalGrid from "./TechnicalGrid";
import styles from "./Graphics.module.css";

type SectionTone = "work" | "lab" | "about" | "contact";

const tones = {
  work: styles.fieldWork,
  lab: styles.fieldLab,
  about: styles.fieldAbout,
  contact: styles.fieldContact,
};

export default function SectionField({ tone }: { tone: SectionTone }) {
  return (
    <div className={`${styles.sectionField} ${tones[tone]}`} data-section-field aria-hidden="true">
      {(tone === "work" || tone === "lab") && <TechnicalGrid variant={tone} />}
      <span className={styles.fieldGlow} />
      {tone === "work" && <span className={styles.workFrame} />}
      {tone === "lab" && (
        <svg className={styles.orbit} viewBox="0 0 320 180" focusable="false">
          <path d="M 16 170 A 158 158 0 0 1 304 170" />
          <circle cx="271" cy="57" r="3" />
        </svg>
      )}
      {tone === "about" && <span className={styles.editorialRule} />}
      {tone === "contact" && <span className={styles.contactAnchor} />}
    </div>
  );
}
