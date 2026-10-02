import Image from "next/image";
import { chapters, movements, archives, learningPath, productLayers, workflow, type Plate } from "./aboutContent";
import styles from "./About.module.css";

export function AboutArchive({ kind, interactive = false }: { kind: keyof typeof archives; interactive?: boolean }) {
  const archive = archives[kind];
  return <figure className={styles.archive}>
    <Image src={archive.src} alt={archive.alt} width={archive.width} height={archive.height} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1100px) 45vw, 30vw" decoding="async" />
    <figcaption><span>{archive.year}</span>{archive.caption}</figcaption>
    {interactive && <a href={archive.src} target="_blank" rel="noreferrer">Inspect the original <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>}
  </figure>;
}
function LearningPath() {
  return <div className={styles.learningPath}><p className={styles.caption}>2020 / FIRST WEBSITE</p><ol role="list">{learningPath.map(step => <li key={step}>{step}</li>)}</ol><p className={styles.caption}>2026 / STILL LEARNING</p></div>;
}
function Process() {
  return <ol role="list" className={styles.process}>{workflow.map(step => <li key={step}>{step}{step === "BUILD" && <small>AI-ASSISTED IMPLEMENTATION</small>}</li>)}</ol>;
}
function ModelProduct() {
  return <div className={styles.modelProduct}><p>MODEL</p><ol role="list">{productLayers.map(layer => <li key={layer}>{layer}</li>)}</ol><p>PRODUCT</p></div>;
}
function Evidence({ lines }: { lines: string[] }) {
  return <ul role="list" className={styles.evidence}>{lines.map(line => <li key={line}>{line}</li>)}</ul>;
}
function Body({ text, human = false }: { text: string; human?: boolean }) {
  const lastSentence = "I spend time with friends and family, too.";
  return <p className={styles.body}>{human ? <>{text.slice(0, text.indexOf(lastSentence))}<span className={styles.friends}>{lastSentence}</span></> : text}</p>;
}
export function AboutVisualPlate({ plate, index }: { plate: Plate; index: number }) {
  const movement = movements[plate.movement];
  const hasArchive = plate.detail === "origin" || plate.detail === "learning";
  return <div className={`${styles.plate} ${styles.poster}`} data-about-plate={index} data-about-movement={movement.id} data-kind={plate.kind} data-detail={plate.detail}>
      <div className={styles.thought}>
        <p className={styles.display} data-about-title>{plate.title}</p>
        {plate.body && <Body text={plate.body} human={plate.kind === "human"} />}
        {plate.kind === "name" && <p className={styles.caption}>{movement.meta.join(" · ")}</p>}
        {plate.micro && <p className={styles.micro}>{plate.micro}</p>}
      </div>
      {hasArchive && <div className={styles.archiveColumn}>{plate.detail === "learning" && <p className={styles.caption}>2020 / FIRST WEBSITE<br /><span className={styles.temporalArrow}>↓</span></p>}<AboutArchive kind={plate.detail as "origin" | "learning"} /></div>}
      {plate.detail === "path" && <LearningPath />}
      {plate.detail === "layers" && <ModelProduct />}
      {plate.detail === "process" && <Process />}
      {plate.detail === "evidence" && <div className={styles.compressedProcess}><p className={styles.relationship}>{movement.headline[0]}</p><Evidence lines={movement.meta} /></div>}
      {plate.detail === "human" && <div className={styles.humanAside}><p className={styles.humanHeadline}>{movement.headline[0]}</p><Evidence lines={movement.meta} /></div>}
      {plate.detail === "closing" && <p className={styles.nextSystem}>{movement.headline[0]}</p>}
  </div>;
}
export function AboutEditorial({ cinematic }: { cinematic: boolean }) {
  return <article className={styles.editorial} data-about-editorial>
    <p className={styles.sectionLabel}>02 / ABOUT</p>
    {chapters.map((chapter, chapterIndex) => <div key={chapter} className={styles.chapter} data-about-chapter={chapterIndex}>
      {chapterIndex < 4 && <p className={styles.chapterLabel}>{chapter}</p>}
      {movements.filter(movement => movement.chapter === chapterIndex).map(movement => {
        const index = movements.indexOf(movement);
        return <section key={movement.id} className={styles.reading} data-about-reading={movement.id} aria-labelledby={`about-${movement.id}`}>
          <h3 id={`about-${movement.id}`} tabIndex={-1} className={styles.display}>{movement.display[0]}</h3>
          {index === 0 && <><p className={styles.invitation}>{movement.display[1]}</p><p className={styles.editorialName}>{movement.display[2]}</p></>}
          {index === 1 ? <><p className={styles.body}>{movement.body[0]}</p><h4 className={styles.headline}>{movement.headline[0]}</h4><div className={styles.archiveReading}><AboutArchive kind="origin" interactive={!cinematic} /><p className={styles.body}>{movement.body[1]}</p></div></> : <>
            {index === 3 ? <><p className={styles.body}>{movement.body[0]}</p><p className={styles.micro}>{movement.micro[0]}</p><h4 className={styles.visionHeadline}>{movement.headline.join("\n")}</h4><p className={styles.body}>{movement.body[1]}</p></> : <>
              {index === 4 && <ModelProduct />}{index === 5 && <Process />}{index === 8 && <h4 className={styles.humanHeadline}>{movement.headline[0]}</h4>}
              {movement.body.map(paragraph => <Body text={paragraph} key={paragraph} human={index === 8} />)}
            </>}
            {index === 2 && <><h4 className={styles.headline}>{movement.headline[0]}</h4><LearningPath /></>}
            {index === 5 && <h4 className={styles.fragility}>{movement.display[1]}</h4>}
            {index === 6 && <><h4 className={styles.relationship}>{movement.headline[0]}</h4><Evidence lines={movement.meta} /></>}
            {index === 7 && <><h4 className={styles.headline}>{movement.headline[0]}</h4><div className={styles.archiveReading}><p className={styles.caption}>2020 / FIRST WEBSITE<br />↓<br />2026 / STILL LEARNING</p><AboutArchive kind="learning" interactive={!cinematic} /></div></>}
            {index === 4 && <h4 className={styles.headline}>{movement.headline[0]}</h4>}
            {index === 8 && <Evidence lines={movement.meta} />}
            {index === 10 && <><h4 className={styles.closingHeadline}>{movement.display[1]}</h4><p className={styles.nextSystem}>{movement.headline[0]}</p><span className={styles.editorialQuestion} aria-hidden="true">?</span></>}
          </>}
          {movement.micro.slice(index === 3 ? 1 : 0).map(line => <p className={styles.micro} key={line}>{line}</p>)}
          {index === 0 && <p className={styles.caption}>{movement.meta.join(" · ")}</p>}
        </section>;
      })}
    </div>)}
    {!cinematic && <a className={styles.continue} href="#contact">Continue to Contact <span aria-hidden="true">↓</span></a>}
  </article>;
}
