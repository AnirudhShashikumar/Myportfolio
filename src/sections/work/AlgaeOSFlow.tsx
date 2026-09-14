import styles from "./AlgaeOSFeature.module.css";

const stages = [
  { index: "01", title: "AMBIENT AIR", detail: "Input to the system" },
  { index: "02", title: "CO₂ SENSING", detail: "Inlet observation" },
  { index: "03", title: "STAGE 01", detail: "Algae bioreactor" },
  { index: "04", title: "STAGE 02", detail: "Algae bioreactor" },
  { index: "05", title: "TELEMETRY", detail: "Environmental data" },
  { index: "06", title: "DASHBOARD", detail: "Monitored response" },
] as const;

export default function AlgaeOSFlow() {
  return (
    <div className={styles.flow} data-ao-flow>
      <div className={styles.flowHeader}>
        <p className={styles.eyebrow}>SYSTEM PATH / AIR TO DATA</p>
        <p>PHYSICAL FLOW + DIGITAL OBSERVATION</p>
      </div>
      <ol className={styles.flowStages}>
        {stages.map(({ index, title, detail }) => (
          <li key={index} className={styles.flowStage}>
            <span className={styles.flowIndex}>{index}</span>
            <strong>{title}</strong>
            <span className={styles.flowDetail}>{detail}</span>
          </li>
        ))}
      </ol>
      <svg className={styles.flowTrace} viewBox="0 0 1200 80" aria-hidden="true" focusable="false">
        <path
          data-ao-flow-line
          pathLength={1}
          d="M 0 42 H 214 V 24 H 325 V 42 H 508 V 60 H 622 V 42 H 806 V 24 H 920 V 42 H 1200"
        />
        <circle cx="214" cy="42" r="3" data-ao-sensor />
        <circle cx="508" cy="42" r="3" />
        <circle cx="806" cy="42" r="3" />
        <circle cx="1200" cy="42" r="3" />
      </svg>
      <p className={styles.flowFooter}>CHLORELLA VULGARIS / DUAL-STAGE PHOTOBIOREACTOR / ARDUINO TELEMETRY</p>
    </div>
  );
}
