import styles from "./SatQueryFeature.module.css";

const workflows = [
  { index: "01", label: "SINGLE IMAGE" },
  { index: "02", label: "OPTICAL + SAR" },
  { index: "03", label: "BI-TEMPORAL" },
] as const;

export default function WorkflowRoutes() {
  return (
    <div className={styles.analysis} data-sq-analysis>
      <div className={styles.routes} data-sq-routes>
        <p className={styles.systemLabel}>OBSERVATIONS / ANALYSIS CHANNELS</p>
        <ol className={styles.workflowList}>
          {workflows.map(({ index, label }) => (
            <li key={index} className={styles.workflow}>
              <span>{index}</span>
              <strong>{label}</strong>
              <span className={styles.workflowNode} aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>

      <svg className={styles.routeLines} viewBox="0 0 420 280" aria-hidden="true" focusable="false">
        <path data-sq-route-line pathLength={1} d="M 0 50 C 140 50 156 140 360 140" />
        <path data-sq-route-line pathLength={1} d="M 0 140 H 360" />
        <path data-sq-route-line pathLength={1} d="M 0 230 C 140 230 156 140 360 140" />
        <circle data-sq-route-node cx="360" cy="140" r="3" />
      </svg>

      <p className={styles.router} data-sq-router>SPECIALIST ROUTING</p>

      <div className={styles.evidence} data-sq-evidence>
        <p className={styles.systemLabel}>MODEL OUTPUT / VALIDATED</p>
        <h3>EVIDENCE</h3>
        <p>PROVENANCE · CONFIDENCE</p>
        <p>LIMITATIONS · VALIDATION</p>
      </div>
    </div>
  );
}
