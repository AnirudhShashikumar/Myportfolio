import SectionField from "@/components/graphics/SectionField";
import AlgaeOSFeature from "./AlgaeOSFeature";
import DayflowFeature from "./DayflowFeature";
import GestureGlobeFeature from "./GestureGlobeFeature";
import MediFitFeature from "./MediFitFeature";
import MediTwinFeature from "./MediTwinFeature";
import ProjectHandoff, { WorkCoordinate, WorkExit } from "./WorkNavigation";
import SatQueryFeature from "./SatQueryFeature";
import WorkAssets from "./WorkAssets";
import styles from "./Work.module.css";

const projects = [
  { number: "01", name: "SATQUERY AI" },
  { number: "02", name: "GESTURE GLOBE" },
  { number: "03", name: "ALGAEOS" },
  { number: "04", name: "DAYFLOW" },
  { number: "05", name: "MEDITWIN" },
  { number: "06", name: "MEDIFIT" },
] as const;

export default function Work() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className={`visual-section ${styles.work}`}
      data-visual-tone="work"
    >
      <SectionField tone="work" />
      <WorkAssets />
      <WorkCoordinate projects={projects} />

      <div className={styles.projectSlot} data-work-project="0">
        <SatQueryFeature />
      </div>

      <ProjectHandoff
        index={0}
        from={projects[0]}
        to={projects[1]}
        fromTheme="satquery"
        toTheme="gesture"
        sourceLine="EVIDENCE-FIRST EARTH INTELLIGENCE"
        targetLine="COMPUTER VISION × SPATIAL INTERACTION"
        transitionLabel="OBSERVATION → INTERACTION"
      />

      <div className={styles.projectSlot} data-work-project="1">
        <GestureGlobeFeature />
      </div>

      <ProjectHandoff
        index={1}
        from={projects[1]}
        to={projects[2]}
        fromTheme="gesture"
        toTheme="algaeos"
        sourceLine="HUMAN MOVEMENT / DIGITAL RESPONSE"
        targetLine="ENVIRONMENTAL SENSING / PHYSICAL RESPONSE"
        transitionLabel="TRAJECTORY → TELEMETRY"
      />

      <div className={styles.projectSlot} data-work-project="2">
        <AlgaeOSFeature />
      </div>

      <ProjectHandoff
        index={2}
        from={projects[2]}
        to={projects[3]}
        fromTheme="algaeos"
        toTheme="dayflow"
        sourceLine="PHYSICAL SYSTEM / LIVE SIGNALS"
        targetLine="FULL-STACK OPERATIONS / STRUCTURED ACCESS"
        transitionLabel="PHYSICAL SYSTEM → SOFTWARE SYSTEM"
      />

      <div className={styles.projectSlot} data-work-project="3">
        <DayflowFeature />
      </div>

      <ProjectHandoff
        index={3}
        from={projects[3]}
        to={projects[4]}
        fromTheme="dayflow"
        toTheme="meditwin"
        sourceLine="OPERATIONAL SOFTWARE / TWO WORKSPACES"
        targetLine="AI HEALTHCARE / PERSONAL CONTEXT"
        transitionLabel="OPERATIONS → PERSONAL MODEL"
      />

      <div className={styles.projectSlot} data-work-project="4">
        <MediTwinFeature />
      </div>

      <ProjectHandoff
        index={4}
        from={projects[4]}
        to={projects[5]}
        fromTheme="meditwin"
        toTheme="medifit"
        sourceLine="DIGITAL-TWIN-INSPIRED HEALTH CONTEXT"
        targetLine="PERSONALIZED FITNESS / WORKING BUILD"
        transitionLabel="RELATED IDEA / DIFFERENT BUILD"
        restrained
      />

      <div className={styles.projectSlot} data-work-project="5">
        <MediFitFeature />
      </div>

      <WorkExit />
    </section>
  );
}
