import Image from "next/image";
import Container from "@/components/ui/Container";
import MediFitMotion from "./MediFitMotion";
import styles from "./MediFitFeature.module.css";

const contextInputs = ["INDIVIDUAL", "HEALTH", "CONTEXT", "CONDITIONS"] as const;

const story = [
  ["01 / PROBLEM", "Generic health and fitness guidance does not necessarily reflect individual health conditions."],
  ["02 / SYSTEM", "Use digital-twin-inspired personalization to organize individual health context into structured recommendations."],
  ["03 / OUTPUT", "Personalized monitoring context and fitness-plan recommendations adapted to the individual."],
] as const;

export default function MediFitFeature() {
  return (
    <article className={styles.feature} aria-labelledby="medifit-heading">
      <MediFitMotion>
        <div className={styles.bridge} data-mf-bridge>
          <Container className={styles.bridgeInner}>
            <p className={styles.eyebrow} data-mf-bridge-label>06 / PERSONALIZED DIRECTION</p>
            <div className={styles.bridgeAxis} aria-hidden="true">
              <span data-mf-bridge-from>REPRESENTATION</span>
              <span className={styles.bridgeLine} data-mf-bridge-line>
                <span data-mf-bridge-signal />
              </span>
              <span data-mf-bridge-to>RECOMMENDATION</span>
            </div>
          </Container>
        </div>

        <div className={styles.opening} data-mf-opening>
          <Container className={styles.openingGrid}>
            <div className={styles.openingCopy}>
              <header>
                <p className={styles.eyebrow} data-mf-entry-meta>06 / FEATURED</p>
                <h2 id="medifit-heading" data-mf-entry-title>MEDIFIT</h2>
                <p className={styles.projectType} data-mf-entry-type>AI Healthcare / Digital Twin / Fitness</p>
              </header>

              <p className={styles.statement} data-mf-statement>
                <span data-mf-statement-line>FROM HEALTH</span>
                <span data-mf-statement-line>CONTEXT TO</span>
                <span className={styles.actionWord} data-mf-statement-line>PERSONAL ACTION.</span>
              </p>
              <p className={styles.summary} data-mf-entry-summary>
                MediFit explored digital-twin-driven personalization for health monitoring
                and fitness-plan recommendations adapted to individual health conditions.
              </p>
              <p className={styles.role} data-mf-entry-role>TEAM PROJECT · 4 MEMBERS · PRIMARY CONTRIBUTION / FULL STACK</p>
            </div>

            <div className={styles.statsColumn} data-mf-stats>
              <div className={styles.statsStrip}>
                <div data-mf-stat-item>
                  <span>RESULT</span>
                  <strong>3RD PLACE</strong>
                </div>
                <div data-mf-stat-item>
                  <span>BUILD WINDOW</span>
                  <strong>8 HOURS</strong>
                </div>
                <div data-mf-stat-item>
                  <span>FIELD</span>
                  <strong>50+ TEAMS</strong>
                </div>
                <div data-mf-stat-item>
                  <span>TEAM</span>
                  <strong>4 MEMBERS</strong>
                </div>
              </div>
              <div className={styles.contributionTag} data-mf-contribution-tag>
                <span>PRIMARY CONTRIBUTION</span>
                <strong>FULL STACK</strong>
              </div>
            </div>
          </Container>
        </div>

        <Container>
          {/* ---- PERSONALIZATION ENGINE ---- */}
          <section className={styles.engine} aria-labelledby="medifit-engine-heading" data-mf-engine-section>
            <div className={styles.sectionHeading} data-mf-engine-heading>
              <div>
                <p className={styles.eyebrow}>CONCEPT MODEL</p>
                <h3 id="medifit-engine-heading">PERSONALIZATION ENGINE.</h3>
              </div>
            </div>

            <figure>
              <div className={styles.engineGraphic} aria-hidden="true" data-mf-engine>
                {contextInputs.map((label, index) => (
                  <span
                    className={`${styles.contextNode} ${styles[`contextNode${index + 1}`]}`}
                    data-mf-context-node
                    key={label}
                  >
                    <i />
                    {label}
                  </span>
                ))}

                <svg className={styles.engineSVG} viewBox="0 0 700 260" role="presentation">
                  {/* Flows from corners to center box */}
                  <path data-mf-engine-input-flow pathLength="1" d="M80 45 C180 50 220 100 290 120" />
                  <path data-mf-engine-input-flow pathLength="1" d="M620 45 C520 50 480 100 410 120" />
                  <path data-mf-engine-input-flow pathLength="1" d="M80 215 C180 210 220 160 290 140" />
                  <path data-mf-engine-input-flow pathLength="1" d="M620 215 C520 210 480 160 410 140" />
                  {/* Core personalization box */}
                  <rect data-mf-engine-core x="280" y="105" width="140" height="50" rx="3" />
                  {/* Output flow */}
                  <path data-mf-engine-output-flow pathLength="1" d="M420 130 L510 130" />
                  {/* Output box */}
                  <rect data-mf-output-box x="510" y="110" width="120" height="40" rx="3" />
                  <text className={styles.outputLabel} data-mf-output-label x="570" y="134">
                    FITNESS PLAN
                  </text>
                </svg>

                <span className={styles.coreLabel} data-mf-core-label>PERSONALIZE</span>
                <span className={styles.mobileOutputLabel}>FITNESS PLAN</span>
              </div>
              <figcaption className={styles.engineCaption}>
                CONCEPT / INDIVIDUAL CONTEXT → PERSONALIZATION → STRUCTURED DIRECTION
              </figcaption>
            </figure>
          </section>

          <div className={styles.storyGrid} data-mf-story-grid>
            <div className={styles.narrativeColumn}>
              <section aria-label="MediFit project framing" data-mf-transformation>
                <div className={styles.transformation}>
                  {story.map(([label, copy], index) => (
                    <div className={styles.transformBlock} key={label} data-mf-story-block>
                      <p className={styles.eyebrow}>{label}</p>
                      <p>{copy}</p>
                      {index < story.length - 1 && (
                        <span className={styles.transformConnector} data-mf-transform-connector aria-hidden="true">
                          <span data-mf-transform-signal />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <div className={styles.fullStack} data-mf-fullstack>
                <p className={styles.eyebrow}>PRIMARY CONTRIBUTION</p>
                <p className={styles.fullStackTitle} data-mf-fullstack-title>FULL STACK</p>
                <span className={styles.fullStackRule} data-mf-fullstack-rule aria-hidden="true" />
                <p className={styles.fullStackCopy} data-mf-fullstack-copy>
                  Worked across the full-stack development of the MediFit platform,
                  helping transform the healthcare digital-twin concept into a functional
                  application with integrated workflows for personalized health monitoring
                  and fitness-plan recommendations.
                </p>
              </div>
            </div>

            <div className={styles.deliveryColumn}>
              <div className={styles.buildWindow} data-mf-build>
                <p className={styles.eyebrow}>BUILD CONSTRAINT</p>
                <div className={styles.buildTimeline} data-mf-build-timeline>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div className={styles.buildSegment} key={i} data-mf-build-segment />
                  ))}
                </div>
                <div className={styles.buildEndpoints}>
                  <span><strong>00H</strong> CONCEPT</span>
                  <span><strong>08H</strong> DEMO</span>
                </div>
                <p className={styles.deliveredTag} data-mf-delivered>DELIVERED</p>
              </div>

              <div className={styles.achievement} data-mf-achievement>
                <p className={styles.eyebrow}>OUTCOME</p>
                <div className={styles.achievementSequence} data-mf-achievement-sequence>
                  <span>BUILD</span>
                  <span aria-hidden="true" data-mf-achievement-line />
                  <span>PRESENT</span>
                  <span aria-hidden="true" data-mf-achievement-line />
                  <span>RESULT</span>
                </div>
                <div className={styles.achievementResult} data-mf-achievement-result>
                  <strong data-mf-result-text>3RD PLACE</strong>
                  <p className={styles.eyebrow} data-mf-result-event>PUSH, PULL, COMMIT</p>
                  <span className={styles.achievementAccent} data-mf-achievement-accent aria-hidden="true" />
                </div>
                <div className={styles.achievementMeta} data-mf-achievement-meta>
                  <span>50+ TEAMS</span>
                  <span>4-PERSON TEAM</span>
                  <span>8-HOUR HACKATHON</span>
                  <span>IEEE COMPUTER SOCIETY BMSIT&amp;M</span>
                </div>
              </div>
            </div>

            <div className={styles.evidenceColumn}>
              <figure className={styles.certificate} data-mf-certificate>
                <a
                  href="/projects/medifit/push-pull-commit-certificate.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View the full MediFit third-place certificate in a new tab"
                >
                  <Image
                    src="/projects/medifit/push-pull-commit-certificate.jpg"
                    alt="Official Push Pull Commit certificate awarded to Anirudh for securing third place in the eight-hour hackathon organized by IEEE Computer Society BMSIT&M"
                    width={1458}
                    height={1031}
                    sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 500px"
                    className={styles.evidenceImage}
                  />
                </a>
                <figcaption data-mf-certificate-caption>
                  <span>OFFICIAL ACHIEVEMENT CERTIFICATE</span>
                  <span>VIEW FULL EVIDENCE ↗</span>
                </figcaption>
              </figure>

              <div className={styles.teamSection} data-mf-team>
                <figure className={styles.teamEvidence} data-mf-team-evidence>
                  <div className={styles.teamImageFrame} data-mf-team-frame>
                    <Image
                      src="/projects/medifit/push-pull-commit-team-event.jpg"
                      alt="Push Pull Commit hackathon team and event photograph from the IEEE Computer Society event at BMSIT&M on 4 May 2026"
                      width={4032}
                      height={3024}
                      sizes="(max-width: 767px) 100vw, (max-width: 1200px) 50vw, 280px"
                      className={styles.evidenceImage}
                    />
                  </div>
                  <figcaption data-mf-team-caption>PUSH PULL COMMIT / TEAM + EVENT EVIDENCE / 2026</figcaption>
                </figure>
                <div className={styles.teamCopy} data-mf-team-copy>
                  <p className={styles.eyebrow}>EXECUTION UNDER CONSTRAINT</p>
                  <p>
                    A four-person team shaped the concept, full-stack application, and
                    personalized recommendation direction during the eight-hour hackathon
                    organized by IEEE Computer Society at BMS Institute of Technology and Management.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>

        {/* ---- ENDCAP / CTA ---- */}
        <div className={styles.endcap} data-mf-endcap>
          <Container className={styles.endcapInner}>
            <div data-mf-endcap-copy>
              <p className={styles.eyebrow}>AI HEALTHCARE · DIGITAL TWIN · PERSONALIZED FITNESS</p>
              <p className={styles.endcapTitle}>HEALTH CONTEXT, MADE ACTIONABLE.</p>
            </div>
            <a href="#medifit-detail" className={styles.projectAction} data-mf-cta>
              VIEW MEDIFIT <span aria-hidden="true">↗</span>
            </a>
          </Container>
        </div>

        {/* ---- FEATURED WORK CLOSING SIGNAL ---- */}
        <div className={styles.workClosing} data-mf-work-closing>
          <Container className={styles.closingInner}>
            <p className={styles.closingIndex} data-mf-closing-index>06 FEATURED SYSTEMS</p>
            <p className={styles.closingTitle} data-mf-closing-title>
              AI · VISION · IoT · FULL-STACK · HEALTHCARE
            </p>
            <p className={styles.closingSubline} data-mf-closing-sub>
              Six systems across multiple domains. One engineering practice.
            </p>
          </Container>
        </div>
      </MediFitMotion>

      <div id="medifit-detail" className={styles.detailAnchor} tabIndex={-1}>
        <Container><p>Full MediFit case study coming soon.</p></Container>
      </div>
    </article>
  );
}
