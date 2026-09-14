import Image from "next/image";
import Container from "@/components/ui/Container";
import ObservationGraphic from "./ObservationGraphic";
import SatQueryMotion from "./SatQueryMotion";
import WorkflowRoutes from "./WorkflowRoutes";
import styles from "./SatQueryFeature.module.css";

export default function SatQueryFeature() {
  return (
    <div className={styles.feature}>
      <p className="sr-only">
        SatQuery AI routes single-image, optical and SAR, and bi-temporal Earth
        observations to specialist models, then brings their outputs together as
        evidence-backed geospatial intelligence.
      </p>

      <SatQueryMotion>
        <div className={styles.stage}>
          <Container className={styles.stageInner}>
            <div className={styles.identity} data-sq-identity>
              <p className={styles.systemLabel}>01 / FLAGSHIP</p>
              <h2 id="work-heading">SATQUERY AI</h2>
              <p className={styles.projectType}>Multimodal Geospatial Intelligence</p>
            </div>

            <div className={styles.statement} data-sq-statement>
              <p className={styles.statementMain}>
                <span>ASK EARTH</span>
                <span>ANYTHING.</span>
              </p>
              <p className={styles.statementSupport}>
                Get Evidence,<br />Not Just Answers.
              </p>
            </div>

            <ObservationGraphic />
            <WorkflowRoutes />

            <figure className={styles.product} data-sq-product>
              <div className={styles.productHeading}>
                <span>INTELLIGENCE / REAL SOFTWARE</span>
                <span>SATQUERY AI</span>
              </div>
              <div className={styles.productPlane}>
                <Image
                  src="/projects/satquery-ai/satquery-main-interface-dark.jpg"
                  alt="SatQuery AI dark interface showing its three analysis workflows, satellite imagery input, and evidence-first query workspace"
                  width={2940}
                  height={1736}
                  sizes="(max-width: 767px) 100vw, (max-width: 1200px) 86vw, 1100px"
                  className={styles.productImage}
                />
              </div>
              <figcaption>THE ABSTRACT SYSTEM RESOLVES INTO AN EVIDENCE-FIRST INTERFACE.</figcaption>
            </figure>
          </Container>
        </div>
      </SatQueryMotion>

      <div className={styles.endcap}>
        <Container className={styles.endcapInner}>
          <div>
            <p className={styles.systemLabel}>SMART INDIA HACKATHON 2026 / 26167</p>
            <p className={styles.endcapTitle}>EARTH OBSERVATION → INTELLIGENCE</p>
            <p className={styles.endcapMeta}>SPACE TECHNOLOGY · MULTIMODAL AI · REMOTE SENSING</p>
          </div>
          <a href="#satquery-detail" className={styles.projectAction}>
            EXPLORE SATQUERY AI <span aria-hidden="true">↗</span>
          </a>
        </Container>
      </div>

      <div id="satquery-detail" className={styles.detailAnchor} tabIndex={-1}>
        <Container>
          <p>Full SatQuery AI case study coming soon.</p>
        </Container>
      </div>
    </div>
  );
}
