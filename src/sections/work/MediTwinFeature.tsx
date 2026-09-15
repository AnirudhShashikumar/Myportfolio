import Image from "next/image";
import Container from "@/components/ui/Container";
import MediTwinMotion from "./MediTwinMotion";
import styles from "./MediTwinFeature.module.css";

const conceptStages = [
  ["01", "PATIENT STATE", "Individual health context"],
  ["02", "DIGITAL TWIN", "Patient representation"],
  ["03", "HEALTH MONITORING", "Personalized context"],
  ["04", "FITNESS PLAN", "Condition-aware recommendations"],
] as const;

const story = [
  ["01 / PROBLEM", "Health information is fragmented, while generic fitness guidance may not reflect individual health conditions."],
  ["02 / IDEA", "Use a digital-twin-inspired patient representation to organize personal health context."],
  ["03 / OUTPUT", "Provide personalized monitoring context and fitness-plan recommendations."],
] as const;

const formationSignals = ["ACTIVITY", "CONTEXT", "ROUTINE", "FITNESS"] as const;

export default function MediTwinFeature() {
  return (
    <article className={styles.feature} aria-labelledby="meditwin-heading">
      <MediTwinMotion>
        <div className={styles.bridge} data-mt-bridge>
          <Container className={styles.bridgeInner}>
            <p className={styles.eyebrow} data-mt-bridge-label>05 / RAPID PRODUCT EXECUTION</p>
            <div className={styles.bridgeAxis} aria-hidden="true">
              <span data-mt-bridge-from>ORGANIZATIONAL SYSTEMS</span>
              <span className={styles.bridgeLine} data-mt-bridge-line>
                <span data-mt-bridge-signal />
              </span>
              <span data-mt-bridge-to>PERSONAL SYSTEMS</span>
            </div>
          </Container>
        </div>

        <Container className={styles.mainGrid} data-mt-core>
          <div className={styles.storyColumn}>
            <header className={styles.opening} data-mt-opening>
              <div className={styles.titleRow}>
                <div>
                  <p className={styles.eyebrow} data-mt-entry-meta>05 / FEATURED</p>
                  <h2 id="meditwin-heading" data-mt-entry-title>MEDITWIN</h2>
                  <p className={styles.projectType} data-mt-entry-type>AI Healthcare Digital Twin</p>
                </div>
                <div
                  className={styles.achievementLead}
                  aria-label="First place at Incseption 2.0"
                  data-mt-achievement-lead
                >
                  <strong>1ST PLACE</strong>
                  <span>INCSEPTION 2.0</span>
                </div>
              </div>

              <p className={styles.statement} data-mt-statement>
                <span data-mt-statement-line>A DIGITAL TWIN</span>
                <span data-mt-statement-line>FOR PERSONAL</span>
                <span className={styles.healthWord} data-mt-statement-line>HEALTH.</span>
              </p>
              <p className={styles.summary} data-mt-entry-summary>
                An AI-driven healthcare concept combining personalized health monitoring with
                fitness-plan recommendations adapted to individual health conditions.
              </p>
              <p className={styles.role} data-mt-entry-role>TEAM PROJECT / CODE BLUE · 4 MEMBERS</p>
            </header>

            <section className={styles.formation} aria-labelledby="meditwin-formation-heading" data-mt-formation-section>
              <div className={styles.sectionHeading} data-mt-formation-heading>
                <p className={styles.eyebrow}>CONCEPT MODEL</p>
                <h3 id="meditwin-formation-heading">PERSONAL MODEL FORMATION.</h3>
              </div>

              <figure className={styles.formationFigure}>
                <div className={styles.formationGraphic} aria-hidden="true" data-mt-formation>
                  {formationSignals.map((signal, index) => (
                    <span
                      className={`${styles.contextSignal} ${styles[`contextSignal${index + 1}`]}`}
                      data-mt-context-signal
                      key={signal}
                    >
                      <i />
                      {signal}
                    </span>
                  ))}

                  <svg className={styles.formationMap} viewBox="0 0 600 300" role="presentation">
                    <path data-mt-converge-line pathLength="1" d="M104 65 C188 70 210 122 278 145" />
                    <path data-mt-converge-line pathLength="1" d="M496 65 C412 70 390 122 322 145" />
                    <path data-mt-converge-line pathLength="1" d="M104 235 C188 230 210 178 278 155" />
                    <path data-mt-converge-line pathLength="1" d="M496 235 C412 230 390 178 322 155" />
                    <ellipse data-mt-twin-ring cx="300" cy="150" rx="90" ry="116" />
                    <ellipse data-mt-twin-ring cx="300" cy="150" rx="66" ry="88" />
                    <ellipse data-mt-twin-ring cx="300" cy="150" rx="43" ry="58" />
                    <g className={styles.twinSilhouette} data-mt-twin-core>
                      <circle cx="300" cy="122" r="12" />
                      <path d="M274 190 C278 159 284 143 300 143 C316 143 322 159 326 190" />
                      <path d="M286 190 L282 220 M314 190 L318 220" />
                    </g>
                    <circle className={styles.twinCenter} data-mt-twin-center cx="300" cy="150" r="4" />
                  </svg>

                  <span className={styles.twinLabel} data-mt-twin-label>DIGITAL TWIN</span>
                </div>

                <div className={styles.duality} data-mt-duality aria-hidden="true">
                  <span data-mt-personal-context>PERSONAL CONTEXT</span>
                  <span className={styles.syncTrack} data-mt-sync-line>
                    <span data-mt-sync-signal />
                  </span>
                  <span data-mt-digital-twin>DIGITAL TWIN</span>
                </div>
                <figcaption>CONCEPT MODEL / PERSONAL CONTEXT ↔ DIGITAL REPRESENTATION</figcaption>
              </figure>
            </section>

            <section className={styles.concept} aria-labelledby="meditwin-concept-heading" data-mt-concept>
              <div className={styles.sectionHeading} data-mt-concept-heading>
                <p className={styles.eyebrow}>CONCEPT PATH</p>
                <h3 id="meditwin-concept-heading">HEALTH CONTEXT, MADE PERSONAL.</h3>
              </div>
              <ol className={styles.conceptPath}>
                {conceptStages.map(([index, title, detail], stageIndex) => (
                  <li key={index} data-mt-concept-stage>
                    <span className={styles.stageIndex}>{index}</span>
                    <strong>{title}</strong>
                    <span className={styles.stageDetail}>{detail}</span>
                    {stageIndex < conceptStages.length - 1 && (
                      <span className={styles.stageConnector} data-mt-concept-connector aria-hidden="true">
                        <span data-mt-concept-signal />
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.microStory} aria-label="MediTwin project framing" data-mt-transformation>
              {story.map(([label, copy], index) => (
                <div key={label} data-mt-transformation-stage>
                  <p className={styles.eyebrow}>{label}</p>
                  <p>{copy}</p>
                  {index < story.length - 1 && (
                    <span className={styles.storyConnector} data-mt-story-connector aria-hidden="true">
                      <span data-mt-story-signal />
                    </span>
                  )}
                </div>
              ))}
            </section>
          </div>

          <aside className={styles.evidence} aria-label="MediTwin achievement evidence">
            <div className={styles.executionStrip} data-mt-achievement>
              <div data-mt-achievement-item><span>BUILD WINDOW</span><strong>8 HOURS</strong></div>
              <div data-mt-achievement-item><span>FIELD</span><strong>~130 TEAMS</strong></div>
              <div className={styles.resultSignal} data-mt-achievement-item data-mt-achievement-result>
                <span>RESULT</span><strong>1ST PLACE</strong><i aria-hidden="true" />
              </div>
            </div>

            <figure className={styles.certificate} data-mt-certificate>
              <a
                href="/projects/meditwin/incseption-2-certificate.jpg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View the full MediTwin first-place certificate in a new tab"
              >
                <Image
                  src="/projects/meditwin/incseption-2-certificate.jpg"
                  alt="Official InCSEption 2.0 certificate awarded to team Code Blue for securing first place in the eight-hour hackathon"
                  width={3128}
                  height={2173}
                  sizes="(max-width: 767px) 100vw, (max-width: 1200px) 52vw, 650px"
                  className={styles.evidenceImage}
                />
              </a>
              <figcaption data-mt-certificate-caption>
                <span>OFFICIAL ACHIEVEMENT CERTIFICATE</span>
                <span>VIEW FULL EVIDENCE ↗</span>
              </figcaption>
            </figure>

            <div className={styles.awardRow} data-mt-execution>
              <figure className={styles.teamEvidence} data-mt-team-evidence>
                <div className={styles.teamImageFrame} data-mt-team-frame>
                  <Image
                    src="/projects/meditwin/incseption-2-team-award.jpg"
                    alt="Collage showing the four Code Blue team members during InCSEption 2.0 and receiving their first-place certificates"
                    width={899}
                    height={1599}
                    sizes="(max-width: 767px) 44vw, 180px"
                    className={styles.evidenceImage}
                  />
                </div>
                <figcaption data-mt-team-caption>CODE BLUE / TEAM + AWARD EVIDENCE</figcaption>
              </figure>
              <div className={styles.awardCopy}>
                <p className={styles.eyebrow} data-mt-execution-label>EXECUTION UNDER CONSTRAINT</p>
                <p className={styles.awardTitle}>
                  <span data-mt-execution-title>BUILT AND PRESENTED IN</span>
                  <span className={styles.oneDay} data-mt-execution-title>ONE DAY.</span>
                </p>
                <div className={styles.timeConstraint} data-mt-time aria-label="Eight-hour build window, from idea to presentation">
                  <span><strong>00H</strong> IDEA</span>
                  <span className={styles.timeTrack} aria-hidden="true">
                    <span data-mt-time-line />
                    <i data-mt-time-signal />
                  </span>
                  <span><strong>08H</strong> PRESENT</span>
                </div>
                <p data-mt-execution-copy>
                  A four-person team shaped the concept, monitoring workflows, and personalized
                  fitness recommendation direction during the eight-hour hackathon.
                </p>
                <p className={styles.organizer} data-mt-execution-organizer>GDG ON CAMPUS BMSIT&amp;M</p>
              </div>
            </div>
          </aside>
        </Container>

        <div className={styles.endcap} data-mt-endcap>
          <Container className={styles.endcapInner}>
            <div data-mt-endcap-copy>
              <p className={styles.eyebrow}>AI HEALTHCARE · DIGITAL TWIN · PERSONALIZED HEALTH</p>
              <p className={styles.endcapTitle}>A TEAM IDEA, BUILT AT HACKATHON SPEED.</p>
            </div>
            <a href="#meditwin-detail" className={styles.projectAction} data-mt-cta>
              VIEW MEDITWIN <span aria-hidden="true">↗</span>
            </a>
          </Container>
        </div>
      </MediTwinMotion>

      <div id="meditwin-detail" className={styles.detailAnchor} tabIndex={-1}>
        <Container><p>Full MediTwin case study coming soon.</p></Container>
      </div>
    </article>
  );
}
