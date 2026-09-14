import Image from "next/image";
import Container from "@/components/ui/Container";
import AlgaeOSFlow from "./AlgaeOSFlow";
import AlgaeOSMotion from "./AlgaeOSMotion";
import styles from "./AlgaeOSFeature.module.css";

export default function AlgaeOSFeature() {
  return (
    <article className={styles.feature} aria-labelledby="algaeos-heading">
      <div className={styles.bridge}>
        <Container className={styles.bridgeInner}>
          <p className={styles.eyebrow}>03 / PHYSICAL SYSTEMS</p>
          <p className={styles.bridgeTitle}>FROM INTERFACES <span>TO ENVIRONMENTS.</span></p>
          <div className={styles.bridgeAxis} aria-hidden="true">
            <span>DIGITAL INTERACTION</span>
            <span className={styles.bridgeLine} />
            <span>PHYSICAL RESPONSE</span>
          </div>
        </Container>
      </div>

      <AlgaeOSMotion>
        <div className={styles.opening}>
          <Container className={styles.openingGrid}>
            <div className={styles.openingCopy}>
              <p className={styles.eyebrow}>03 / FEATURED</p>
              <h2 id="algaeos-heading">ALGAEOS</h2>
              <p className={styles.projectType}>IoT Environmental Intelligence</p>
              <p className={styles.statement} data-ao-statement><span>MEASURE.</span><span>CAPTURE.</span><span>RESPOND.</span></p>
              <p className={styles.summary}>
                A low-cost, dual-stage algae photobioreactor connects CO₂ capture and oxygen
                generation to environmental sensing, Arduino telemetry, and a monitoring dashboard.
              </p>
              <p className={styles.contribution}>PRIMARY CONTRIBUTION / IOT + SENSOR INTEGRATION</p>
            </div>

            <figure className={styles.prototype} data-ao-reveal>
              <div className={styles.prototypeFrame}>
                <Image
                  src="/projects/algaeos/algaeos-prototype-hero.jpg"
                  alt="Built AlgaeOS prototype with two illuminated algae reactor vessels, connecting tubes, and electronics on a base"
                  width={1280}
                  height={1347}
                  sizes="(max-width: 767px) 100vw, (max-width: 1200px) 48vw, 640px"
                  className={styles.prototypeImage}
                />
              </div>
              <figcaption>
                <span>PHYSICAL PROTOTYPE / DUAL-STAGE BIOREACTOR</span>
                <span>AIRFLOW · SENSING · TELEMETRY</span>
              </figcaption>
            </figure>
          </Container>
        </div>

        <section className={styles.system} aria-labelledby="algaeos-system-heading">
          <Container>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>ENGINEERING THE ENVIRONMENT</p>
                <h3 id="algaeos-system-heading">AIR MOVES. DATA FOLLOWS.</h3>
              </div>
              <p>
                Chlorella vulgaris in a dual-stage reactor forms the biological system;
                sensors and Arduino telemetry connect it to software.
              </p>
            </div>
            <AlgaeOSFlow />
          </Container>
        </section>

        <section className={styles.readout} aria-labelledby="algaeos-readout-heading">
          <Container>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>UNDER THE SYSTEM</p>
                <h3 id="algaeos-readout-heading">REACTOR → SENSOR → READOUT.</h3>
              </div>
              <p>Physical measurements became a monitoring workflow through embedded electronics and a custom dashboard.</p>
            </div>

            <div className={styles.readoutGrid}>
              <figure className={styles.hardware} data-ao-reveal>
                <div className={styles.hardwareFrame}>
                  <Image
                    src="/projects/algaeos/algaeos-iot-hardware.jpg"
                    alt="AlgaeOS hardware view showing reactor tubing, a breadboard, wiring, and an Arduino UNO board"
                    width={1280}
                    height={1389}
                    sizes="(max-width: 767px) 100vw, (max-width: 1200px) 38vw, 440px"
                    className={styles.hardwareImage}
                  />
                </div>
                <figcaption>
                  <span>01 / PHYSICAL INSTRUMENTATION</span>
                  <span>Documented system: Arduino UNO · MQ-135 · DHT22</span>
                </figcaption>
              </figure>

              <div className={styles.dashboardColumn}>
                <p className={styles.signalLine}>SENSOR INPUT <span aria-hidden="true">→</span> ARDUINO TELEMETRY <span aria-hidden="true">→</span> DASHBOARD</p>
                <span className={styles.telemetryTrace} data-ao-telemetry aria-hidden="true" />
                <figure className={styles.dashboard} data-ao-reveal>
                  <div className={styles.dashboardFrame}>
                    <Image
                      src="/projects/algaeos/algaeos-dashboard.jpg"
                      alt="AlgaeOS telemetry dashboard screenshot with CO₂ filtration readings, environmental panels, and an Arduino offline indicator"
                      width={2048}
                      height={1154}
                      sizes="(max-width: 767px) 100vw, (max-width: 1200px) 62vw, 850px"
                      className={styles.dashboardImage}
                    />
                  </div>
                  <figcaption>
                    <span>02 / DIGITAL OBSERVATION</span>
                    <span>Captured interface; the source screenshot shows Arduino offline.</span>
                  </figcaption>
                </figure>
                <p className={styles.dashboardNote}>
                  The dashboard presents inlet and outlet readings, filtration status, and environmental telemetry.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className={styles.observations} aria-labelledby="algaeos-observations-heading">
          <Container className={styles.observationsGrid}>
            <div className={styles.observationCopy}>
              <p className={styles.eyebrow}>PROTOTYPE OBSERVATIONS</p>
              <h3 id="algaeos-observations-heading">MEASURED IN THE BUILD.</h3>
              <p className={styles.observationCaveat}>Reported during prototype testing; these are project observations, not independently certified results.</p>
              <dl className={styles.metrics}>
                <div>
                  <dt>REPORTED CO₂ REDUCTION</dt>
                  <dd>&gt;40%</dd>
                </div>
                <div>
                  <dt>REPORTED INITIAL READING</dt>
                  <dd>~1500 <small>PPM</small></dd>
                </div>
                <div>
                  <dt>REPORTED TEST DIRECTION</dt>
                  <dd>&lt;900 <small>PPM</small></dd>
                </div>
                <div>
                  <dt>PROTOTYPE COST</dt>
                  <dd>&lt;₹2,500</dd>
                </div>
              </dl>
              <p className={styles.metricFootnote}>The reported CO₂ change was observed over the prototype test period, within hours.</p>
            </div>

            <figure className={styles.artifact}>
              <a href="/projects/algaeos/algaeos-system-infographic.jpg" target="_blank" rel="noopener noreferrer" className={styles.artifactLink}>
                <Image
                  src="/projects/algaeos/algaeos-system-infographic.jpg"
                  alt="AlgaeOS project infographic depicting the dual-stage algae reactor and the team's reported prototype observations"
                  width={572}
                  height={1024}
                  sizes="(max-width: 767px) 60vw, 280px"
                  className={styles.artifactImage}
                />
                <span>VIEW ORIGINAL INFOGRAPHIC ↗ <span className="sr-only">(opens in a new tab)</span></span>
              </a>
              <figcaption>PROJECT DOCUMENTATION / CLAIMS SHOWN ARE PROJECT-REPORTED</figcaption>
            </figure>
          </Container>
        </section>
      </AlgaeOSMotion>

      <div className={styles.endcap}>
        <Container className={styles.endcapInner}>
          <div>
            <p className={styles.eyebrow}>BMSIT · 1 SEMESTER · TEAM OF 4</p>
            <p className={styles.endcapTitle}>SOFTWARE, SENSORS, AND A LIVING SYSTEM.</p>
            <p className={styles.endcapMeta}>IOT · EMBEDDED SYSTEMS · ENVIRONMENTAL TECHNOLOGY · PHYSICAL PROTOTYPING</p>
            <p className={styles.creditLine}>ACADEMIC OUTCOME / 10 OF 10 PROJECT CREDITS</p>
          </div>
          <a href="#algaeos-detail" className={styles.projectAction}>
            EXPLORE ALGAEOS <span aria-hidden="true">↗</span>
          </a>
        </Container>
      </div>

      <div id="algaeos-detail" className={styles.detailAnchor} tabIndex={-1}>
        <Container>
          <p>Full AlgaeOS case study coming soon.</p>
        </Container>
      </div>
    </article>
  );
}
