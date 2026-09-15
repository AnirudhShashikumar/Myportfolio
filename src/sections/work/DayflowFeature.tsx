import Image from "next/image";
import Container from "@/components/ui/Container";
import DayflowMotion from "./DayflowMotion";
import styles from "./DayflowFeature.module.css";

const architecture = [
  { number: "01", title: "USER", detail: "Login and session" },
  { number: "02", title: "NEXT.JS 16", detail: "Server checks · API · validation" },
  { number: "03", title: "SUPABASE", detail: "Auth · Storage · signed URLs" },
  { number: "04", title: "POSTGRESQL", detail: "Profile roles · RLS · RPC" },
] as const;

const leaveSteps = [
  "Request update",
  "Leave balance",
  "Notification",
  "Audit event",
] as const;

export default function DayflowFeature() {
  return (
    <article className={styles.feature} aria-labelledby="dayflow-heading">
      <div className={styles.bridge}>
        <Container className={styles.bridgeInner}>
          <p className={styles.eyebrow}>04 / PRODUCT ENGINEERING</p>
          <div className={styles.bridgeAxis} aria-hidden="true">
            <span>PHYSICAL SYSTEMS</span>
            <span className={styles.bridgeLine} />
            <span>DIGITAL OPERATIONS</span>
          </div>
          <p className={styles.bridgeTitle}>FROM SIGNALS TO SYSTEMS.</p>
        </Container>
      </div>

      <DayflowMotion>
        <div className={styles.opening} data-df-entry>
          <Container className={styles.openingGrid}>
            <div className={styles.openingCopy}>
              <p className={styles.eyebrow} data-df-entry-meta>04 / FEATURED</p>
              <h2 id="dayflow-heading" data-df-entry-title>DAYFLOW</h2>
              <p className={styles.projectType} data-df-entry-type>Full-Stack Human Operations</p>
              <p className={styles.statement} data-df-statement>
                <span data-df-platform>ONE PLATFORM.</span>
                <span data-df-workspaces-title>TWO WORKSPACES.</span>
              </p>
              <p className={styles.summary} data-df-entry-copy>
                A role-aware HR platform that separates employee workflows from management
                operations inside one connected product.
              </p>
              <p className={styles.contribution} data-df-entry-contribution>TEAM LEAD · FULL-STACK DEVELOPER / COLLABORATIVE PROJECT</p>
            </div>

            <figure className={styles.login} data-df-login>
              <div className={styles.imageFrame}>
                <Image
                  src="/projects/dayflow/dayflow-role-based-login.jpg"
                  alt="Dayflow sign-in screen showing Employee Portal and HR / Admin Portal choices in one shared interface"
                  width={2048}
                  height={1054}
                  sizes="(max-width: 767px) 100vw, (max-width: 1100px) 55vw, 760px"
                  className={styles.productImage}
                />
                <div className={styles.roleRouting} data-df-routing aria-hidden="true">
                  <span className={styles.routeNode} data-df-route-node>DAYFLOW</span>
                  <svg className={styles.routeMap} viewBox="0 0 420 112" preserveAspectRatio="none">
                    <path data-df-route-path pathLength="1" d="M210 8 V42 C210 62 112 52 112 86" />
                    <path data-df-route-path pathLength="1" d="M210 8 V42 C210 62 308 52 308 86" />
                  </svg>
                  <span className={styles.routeDestination} data-df-route-destination>EMPLOYEE</span>
                  <span className={styles.routeDestination} data-df-route-destination>HR / ADMIN</span>
                </div>
              </div>
              <figcaption>ROLE-AWARE ENTRY <span>CAPTURED PRODUCT INTERFACE</span></figcaption>
            </figure>
          </Container>
        </div>

        <section className={styles.workspaces} aria-labelledby="dayflow-workspaces-heading" data-df-workspaces>
          <Container>
            <div className={styles.sectionHeading} data-df-workspaces-heading>
              <div>
                <p className={styles.eyebrow}>TWO PURPOSE-BUILT EXPERIENCES</p>
                <h3 id="dayflow-workspaces-heading">SAME SYSTEM. DIFFERENT RESPONSIBILITIES.</h3>
              </div>
              <p>Personal work on one side. Organization-wide operations on the other.</p>
            </div>

            <div className={styles.roleRail} data-df-role-rail role="group" aria-label="Dayflow connects Employee and HR / Admin workspaces">
              <span data-df-role-label>EMPLOYEE</span>
              <span className={styles.roleLine} data-df-role-line aria-hidden="true" />
              <strong data-df-role-node>DAYFLOW</strong>
              <span className={styles.roleLine} data-df-role-line aria-hidden="true" />
              <span data-df-role-label>HR / ADMIN</span>
            </div>

            <div className={styles.workspaceGrid}>
              <figure className={styles.workspace} data-df-workspace="employee">
                <div className={styles.workspaceHeading} data-df-workspace-label>
                  <span>01 / EMPLOYEE WORKSPACE</span>
                  <strong>THE INDIVIDUAL VIEW</strong>
                </div>
                <div className={styles.imageFrame} data-df-workspace-frame>
                  <Image
                    src="/projects/dayflow/dayflow-employee-dashboard.jpg"
                    alt="Dayflow Employee dashboard with attendance, working hours, leave, payroll, and notification overview"
                    width={2048}
                    height={1115}
                    sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 620px"
                    className={styles.productImage}
                  />
                </div>
                <figcaption data-df-workspace-copy>Check in, request leave, view payroll, open private documents, and follow updates.</figcaption>
              </figure>

              <figure className={styles.workspace} data-df-workspace="admin">
                <div className={styles.workspaceHeading} data-df-workspace-label>
                  <span>02 / HR + ADMIN COMMAND CENTER</span>
                  <strong>THE ORGANIZATION VIEW</strong>
                </div>
                <div className={styles.imageFrame} data-df-workspace-frame>
                  <Image
                    src="/projects/dayflow/dayflow-admin-dashboard.jpg"
                    alt="Dayflow HR Admin dashboard showing employee, attendance, leave, payroll, reporting, and department operations"
                    width={2048}
                    height={1115}
                    sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 620px"
                    className={styles.productImage}
                  />
                </div>
                <figcaption data-df-workspace-copy>Manage people, approve leave, run payroll, report on operations, and review activity.</figcaption>
              </figure>
            </div>
          </Container>
        </section>

        <section className={styles.engineering} aria-labelledby="dayflow-engineering-heading">
          <Container>
            <div className={styles.sectionHeading} data-df-engineering-heading>
              <div>
                <p className={styles.eyebrow}>ENGINEERED BENEATH THE INTERFACE</p>
                <h3 id="dayflow-engineering-heading">ACCESS FOLLOWS THE ROLE.</h3>
              </div>
              <p>Portal selection guides the experience. Database-backed roles and server checks determine permission.</p>
            </div>

            <ol className={styles.architecture} aria-label="Dayflow application architecture" data-df-architecture>
              {architecture.map(({ number, title, detail }, index) => (
                <li key={number} className={styles.architectureNode} data-df-architecture-node>
                  <span className={styles.nodeNumber}>{number} / SYSTEM LAYER</span>
                  <strong>{title}</strong>
                  <span className={styles.nodeDetail}>{detail}</span>
                  {index < architecture.length - 1 && (
                    <span className={styles.architectureLine} data-df-architecture-line aria-hidden="true">
                      <span className={styles.architectureSignal} data-df-architecture-signal />
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <div className={styles.engineeringDetails}>
              <div className={styles.authorization} data-df-authorization>
                <p className={styles.eyebrow}>AUTHORIZATION RULE</p>
                <p className={styles.detailTitle} data-df-authorization-title><span>PORTAL</span><span> ≠ PERMISSION.</span></p>
                <p data-df-authorization-copy>A trusted database profile role routes the session to Employee or HR/Admin access. Server-side checks and Row Level Security protect the underlying data.</p>
                <p className={styles.detailMicro}>PRIVATE DOCUMENTS / SHORT-LIVED SIGNED URLS</p>
              </div>

              <div className={styles.transaction} data-df-transaction>
                <p className={styles.eyebrow}>ONE TRANSACTIONAL WORKFLOW</p>
                <p className={styles.detailTitle}>LEAVE APPROVAL.</p>
                <ol>
                  {leaveSteps.map((step, index) => (
                    <li key={step} data-df-transaction-node>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {step}
                      {index < leaveSteps.length - 1 && (
                        <span className={styles.transactionConnector} data-df-transaction-line aria-hidden="true">
                          <span className={styles.transactionSignal} data-df-transaction-signal />
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </section>

        <section className={styles.verification} aria-labelledby="dayflow-verification-heading" data-df-verification>
          <Container className={styles.verificationGrid}>
            <div>
              <p className={styles.eyebrow}>ENGINEERING STATUS</p>
              <h3 id="dayflow-verification-heading" data-df-verification-title><span>VERIFIED.</span> <span>STILL EVOLVING.</span></h3>
              <p data-df-verification-copy>Repository checks, public authentication smoke tests, and protected-route redirects pass. Production hardening remains in progress.</p>
            </div>
            <div>
              <dl className={styles.qualitySignals}>
                <div data-df-verification-check><span className={styles.verificationMark} aria-hidden="true">✓</span><dt>AUTOMATED TESTS</dt><dd>68 PASSING</dd></div>
                <div data-df-verification-check><span className={styles.verificationMark} aria-hidden="true">✓</span><dt>TYPECHECK</dt><dd>PASSING</dd></div>
                <div data-df-verification-check><span className={styles.verificationMark} aria-hidden="true">✓</span><dt>LINT</dt><dd>PASSING</dd></div>
                <div data-df-verification-check><span className={styles.verificationMark} aria-hidden="true">✓</span><dt>PRODUCTION BUILD</dt><dd>PASSING</dd></div>
              </dl>
              <p className={styles.pending} data-df-verification-pending>AUTHENTICATED E2E · DIRECT RLS VALIDATION · MIGRATIONS · MOBILE QA · WCAG AA AUDIT STILL IN PROGRESS</p>
            </div>
          </Container>
        </section>
      </DayflowMotion>

      <div className={styles.endcap}>
        <Container className={styles.endcapInner}>
          <div>
            <p className={styles.eyebrow}>FULL-STACK · HR TECH · SAAS</p>
            <p className={styles.endcapTitle}>ONE PLATFORM. TWO PURPOSE-BUILT EXPERIENCES.</p>
            <p className={styles.endcapMeta}>NEXT.JS 16 · TYPESCRIPT · SUPABASE · POSTGRESQL · RLS</p>
          </div>
          <a href="#dayflow-detail" className={styles.projectAction}>EXPLORE DAYFLOW <span aria-hidden="true">↗</span></a>
        </Container>
      </div>

      <div id="dayflow-detail" className={styles.detailAnchor} tabIndex={-1}>
        <Container><p>Full Dayflow case study coming soon.</p></Container>
      </div>
    </article>
  );
}
