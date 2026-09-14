import styles from "./Graphics.module.css";

type GridVariant = "hero" | "work" | "lab";

const variants = {
  hero: styles.gridHero,
  work: styles.gridWork,
  lab: styles.gridLab,
};

export default function TechnicalGrid({ variant }: { variant: GridVariant }) {
  return (
    <div className={`${styles.grid} ${variants[variant]}`} aria-hidden="true">
      <span className={styles.gridCross} />
      <span className={styles.gridCorner} />
    </div>
  );
}
