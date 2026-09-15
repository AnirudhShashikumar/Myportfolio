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

export default function MediTwinFeature() {
  return (
    <article className={styles.feature} aria-labelledby="meditwin-heading">
      <div className={styles.bridge}>
        <Container className={styles.bridgeInner}>
          <p className={styles.eyebrow}>05 / RAPID PRODUCT EXECUTION</p>
          <div className={styles.bridgeAxis} aria-hidden="true">
            <span>ENGINEERING SYSTEMS</span>
            <span className={styles.bridgeLine} />
            <span>BUILDING UNDER PRESSURE</span>
          </div>
        </Container>
      </div>

      <MediTwinMotion>
        <Container className={styles.mainGrid}>
          <div className={styles.storyColumn}>
            <header className={styles.opening}>
              <div className={styles.titleRow}>
                <div>
                  <p className={styles.eyebrow}>05 / FEATURED</p>
                  <h2 id="meditwin-heading">MEDITWIN</h2>
                  <p className={styles.projectType}>AI Healthcare Digital Twin</p>
                </div>
                <div className={styles.achievementLead} aria-label="First place at Incseption 2.0">
                  <strong>1ST PLACE</strong>
                  <span>INCSEPTION 2.0</span>
                </div>
              </div>

              <p className={styles.statement} data-mt-statement>
                <span>A DIGITAL TWIN</span>
                <span>FOR PERSONAL HEALTH.</span>
              </p>
              <p className={styles.summary}>
                An AI-driven healthcare concept combining personalized health monitoring with
                fitness-plan recommendations adapted to individual health conditions.
              </p>
              <p className={styles.role}>TEAM PROJECT / CODE BLUE · 4 MEMBERS</p>
            </header>

            <section className={styles.concept} aria-labelledby="meditwin-concept-heading">
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>CONCEPT PATH</p>
                <h3 id="meditwin-concept-heading">HEALTH CONTEXT, MADE PERSONAL.</h3>
              </div>
              <ol className={styles.conceptPath}>
                {conceptStages.map(([index, title, detail], stageIndex) => (
                  <li key={index}>
                    <span className={styles.stageIndex}>{index}</span>
                    <strong>{title}</strong>
                    <span className={styles.stageDetail}>{detail}</span>
                    {stageIndex < conceptStages.length - 1 && (
                      <span className={styles.stageConnector} data-mt-path aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.microStory} aria-label="MediTwin project framing">
              {story.map(([label, copy]) => (
                <div key={label}>
                  <p className={styles.eyebrow}>{label}</p>
                  <p>{copy}</p>
                </div>
              ))}
            </section>
          </div>

          <aside className={styles.evidence} aria-label="MediTwin achievement evidence">
            <div className={styles.executionStrip}>
              <div><span>BUILD WINDOW</span><strong>8 HOURS</strong></div>
              <div><span>FIELD</span><strong>~130 TEAMS</strong></div>
              <div><span>RESULT</span><strong>1ST PLACE</strong></div>
            </div>

            <figure className={styles.certificate} data-mt-reveal>
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
              <figcaption>
                <span>OFFICIAL ACHIEVEMENT CERTIFICATE</span>
                <span>VIEW FULL EVIDENCE ↗</span>
              </figcaption>
            </figure>

            <div className={styles.awardRow}>
              <figure className={styles.teamEvidence} data-mt-reveal>
                <Image
                  src="/projects/meditwin/incseption-2-team-award.jpg"
                  alt="Collage showing the four Code Blue team members during InCSEption 2.0 and receiving their first-place certificates"
                  width={899}
                  height={1599}
                  sizes="(max-width: 767px) 44vw, 180px"
                  className={styles.evidenceImage}
                />
                <figcaption>CODE BLUE / TEAM + AWARD EVIDENCE</figcaption>
              </figure>
              <div className={styles.awardCopy}>
                <p className={styles.eyebrow}>EXECUTION UNDER CONSTRAINT</p>
                <p className={styles.awardTitle}>BUILT AND PRESENTED IN ONE DAY.</p>
                <p>
                  A four-person team shaped the concept, monitoring workflows, and personalized
                  fitness recommendation direction during the eight-hour hackathon.
                </p>
                <p className={styles.organizer}>GDG ON CAMPUS BMSIT&amp;M</p>
              </div>
            </div>
          </aside>
        </Container>
      </MediTwinMotion>

      <div className={styles.endcap}>
        <Container className={styles.endcapInner}>
          <div>
            <p className={styles.eyebrow}>AI HEALTHCARE · DIGITAL TWIN · PERSONALIZED HEALTH</p>
            <p className={styles.endcapTitle}>A TEAM IDEA, BUILT AT HACKATHON SPEED.</p>
          </div>
          <a href="#meditwin-detail" className={styles.projectAction}>
            VIEW MEDITWIN <span aria-hidden="true">↗</span>
          </a>
        </Container>
      </div>

      <div id="meditwin-detail" className={styles.detailAnchor} tabIndex={-1}>
        <Container><p>Full MediTwin case study coming soon.</p></Container>
      </div>
    </article>
  );
}
