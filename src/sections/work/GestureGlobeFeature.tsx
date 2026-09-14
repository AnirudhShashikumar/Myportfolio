import Image from "next/image";
import Container from "@/components/ui/Container";
import GestureGlobeMotion from "./GestureGlobeMotion";
import LandmarkScene from "./LandmarkScene";
import styles from "./GestureGlobeFeature.module.css";

export default function GestureGlobeFeature() {
  return (
    <article className={styles.feature} aria-labelledby="gesture-globe-heading">
      <div className={styles.bridge}>
        <Container className={styles.bridgeInner}>
          <p className={styles.eyebrow}>02 / INTERACTION</p>
          <div className={styles.bridgeAxis} aria-hidden="true">
            <span>PLANETARY INTELLIGENCE</span>
            <span className={styles.axisLine} />
            <span>HUMAN INPUT</span>
          </div>
          <p className={styles.bridgeStatement}>VISION <span>BECOMES</span> INTERFACE.</p>
          <p className={styles.bridgeSubline}>From observing the world to interpreting movement within it.</p>
        </Container>
      </div>

      <GestureGlobeMotion>
        <div className={styles.stage}>
          <Container className={styles.stageInner}>
            <div className={styles.identity} data-gg-identity>
              <p className={styles.eyebrow}>02 / FEATURED</p>
              <h2 id="gesture-globe-heading">GESTURE GLOBE</h2>
              <p className={styles.projectType}>Real-Time Vision-Driven Interaction</p>
            </div>

            <div className={styles.statement} data-gg-statement>
              <p className={styles.statementMain}><span>INTERACT</span><span>WITHOUT</span><span>TOUCH.</span></p>
              <p className={styles.statementSupport}>
                Live camera tracking translates hand gestures into direct spatial interaction.
              </p>
            </div>

            <p className="sr-only">
              Gesture Globe uses live camera input to track face and hand landmarks. A pinch gesture
              changes a cyan spatial object, while two-hand movement changes its scale. The images
              below show the working real-time system.
            </p>
            <LandmarkScene />

            <figure className={styles.reveal} data-gg-reveal>
              <div className={styles.revealHeading}>
                <span>FROM LANDMARKS TO LIVE INTERACTION</span>
                <span>GESTURE GLOBE / REAL SYSTEM</span>
              </div>
              <div className={styles.revealGrid}>
                <div className={styles.mainFrame}>
                  <Image
                    src="/projects/gesture-globe/gesture-globe-pinch-control.jpg"
                    alt="Gesture Globe camera view with face and hand landmarks as a pinch gesture moves a cyan sphere"
                    width={2834}
                    height={1556}
                    sizes="(max-width: 767px) 100vw, (max-width: 1200px) 68vw, 900px"
                    className={styles.revealImage}
                  />
                  <span>01 / PINCH INTERACTION</span>
                </div>
                <div className={styles.stateFrames}>
                  <div className={styles.stateFrame}>
                    <Image
                      src="/projects/gesture-globe/globe-two-hand-tracking.jpg"
                      alt="Gesture Globe tracking both hands and facial landmarks during a two-hand interaction"
                      width={2838}
                      height={1546}
                      sizes="(max-width: 767px) 50vw, 340px"
                      className={styles.revealImage}
                    />
                    <span>02 / TWO-HAND INPUT</span>
                  </div>
                  <div className={styles.stateFrame}>
                    <Image
                      src="/projects/gesture-globe/globe-globe-scale.jpg"
                      alt="Gesture Globe showing an expanded cyan spatial sphere responding to hand movement"
                      width={2838}
                      height={1558}
                      sizes="(max-width: 767px) 50vw, 340px"
                      className={styles.revealImage}
                    />
                    <span>03 / SPATIAL SCALE</span>
                  </div>
                </div>
              </div>
              <figcaption>CAMERA → LANDMARKS → GESTURE → SPATIAL RESPONSE</figcaption>
            </figure>
          </Container>
        </div>
      </GestureGlobeMotion>

      <div className={styles.endcap}>
        <Container className={styles.endcapInner}>
          <div>
            <p className={styles.eyebrow}>HUMAN MOVEMENT / DIGITAL RESPONSE</p>
            <p className={styles.endcapTitle}>THE HUMAN BECOMES THE CONTROLLER.</p>
            <p className={styles.endcapMeta}>COMPUTER VISION · HUMAN-COMPUTER INTERACTION · REAL-TIME GESTURES</p>
          </div>
          <a href="#gesture-globe-detail" className={styles.projectAction}>
            EXPLORE GESTURE GLOBE <span aria-hidden="true">↗</span>
          </a>
        </Container>
      </div>

      <div id="gesture-globe-detail" className={styles.detailAnchor} tabIndex={-1}>
        <Container>
          <p>Full Gesture Globe case study coming soon.</p>
        </Container>
      </div>
    </article>
  );
}
