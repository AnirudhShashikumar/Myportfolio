import { learningPath, productLayers, workflow } from "./aboutContent";
import styles from "./About.module.css";

// One material, eight vertices. Matching topology lets GSAP interpolate every
// pose directly; no morph plugin, layout reads, or procedural graphics loop.
export const tracePoses = {
  inherited: "M500 -180 L500 -60 L500 60 L500 160 L500 250 L500 360 L500 470 L500 600",
  baseline: "M0 510 L143 510 L286 510 L429 510 L571 510 L714 510 L857 510 L1000 510",
  evolution: "M20 430 L340 430 L660 430 L980 430 L980 530 L660 530 L340 530 L20 530",
  adaptive: "M0 510 L143 510 L286 470 L429 470 L571 530 L714 530 L857 510 L1000 510",
  layers: "M730 70 L730 117 L730 164 L730 211 L730 258 L730 305 L730 352 L730 400",
  workflow: "M0 440 L143 440 L286 440 L429 440 L571 440 L714 440 L857 440 L1000 440",
  compressed: "M200 440 L286 440 L371 440 L457 440 L543 440 L629 440 L714 440 L800 440",
};

export default function AboutGeometry() {
  return <div className={styles.sharedGeometry} data-about-geometry aria-hidden="true">
    <svg className={styles.trace} data-about-trace viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path data-about-path d={tracePoses.inherited} />
      <path className={styles.activeTrace} data-about-path data-about-path-accent pathLength="1" d={tracePoses.inherited} />
      <g data-about-inherited><path d="M340 100 H660 M340 360 H660 M340 100 V360" /></g>
      <g className={styles.webMarks} data-about-web-marks><path d="M0 545 H110 M0 567 H65 M200 552 H360 V584 H200 Z M430 571 H520" /></g>
    </svg>
    <div className={styles.sharedLearning} data-about-shared="path">
      <p className={styles.caption}>2020 / FIRST WEBSITE</p>
      <ol role="list">{learningPath.map((step, index) => <li key={step} data-about-step={index}>{step}</li>)}</ol>
      <p className={styles.caption}>2026 / STILL LEARNING</p>
    </div>
    <div className={styles.sharedLayers} data-about-shared="layers">
      <p data-about-anchor="model">MODEL</p>
      <ol role="list">{productLayers.map(layer => <li key={layer} data-about-layer>{layer}</li>)}</ol>
      <p data-about-anchor="product">PRODUCT</p>
    </div>
    <ol role="list" className={styles.sharedProcess} data-about-shared="process">{workflow.map(step => <li key={step} data-about-workflow={step}>{step}{step === "BUILD" && <small data-about-build-note>AI-ASSISTED IMPLEMENTATION</small>}</li>)}</ol>
    <ol role="list" className={styles.sharedCompressed} data-about-shared="compressed">{["PROBLEM", "BUILD", "PITCH"].map(step => <li key={step}>{step}</li>)}</ol>
    <div className={styles.sharedTemporal} data-about-shared="temporal"><p>2020 / FIRST WEBSITE</p><p>2026 / STILL LEARNING</p></div>
  </div>;
}
