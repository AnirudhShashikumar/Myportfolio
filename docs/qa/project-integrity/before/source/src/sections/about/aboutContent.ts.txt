// Approved copy: content/about-final-composition.md. Shared by both presentations.
export const chapters = ["PERSON / ORIGIN", "EVOLUTION / WHY INTELLIGENCE", "MODEL ↔ PRODUCT / HOW I BUILD", "HACKATHONS / STILL LEARNING", "HUMAN", "DIRECTION / OPEN SIGNAL"];
export const learningPath = ["PROGRAMMING", "SOFTWARE", "FULL-STACK", "AI", "COMPUTER VISION", "PHYSICAL + DIGITAL", "MULTIMODAL INTELLIGENCE"];
export const workflow = ["IDEA", "UNDERSTAND", "RESEARCH", "ARCHITECTURE", "BUILD", "TEST", "VALIDATE", "ITERATE"];
export const productLayers = ["DATA", "API", "LOGIC", "INTERFACE", "DEPLOYMENT", "VALIDATION"];
export const vision = ["IMAGE → DATA", "MOVEMENT → INTERACTION", "SPACE → INTERFACE"];
export const competitions = ["INCSEPTION 2.0 / 1ST PLACE", "PUSH PULL COMMIT / 3RD PLACE", "SMART INDIA HACKATHON 2026 / COLLEGE SHORTLIST FOR PROJECT SUBMISSION"];
export const sports = ["BASKETBALL / INTER-HOUSE SCHOOL / FIRST PLACE", "FOOTBALL / PUC / SECOND PLACE"];
export const archives = {
  origin: { src: "/achievements/presidency-html-competition-first-place-2020.jpg", width: 1800, height: 1277, alt: "Presidency School document awarding Anirudh First Position in its HTML website competition.", caption: "PRESIDENCY SCHOOL / HTML WEBSITE COMPETITION / FIRST POSITION", year: "2020 / FIRST WEBSITE" },
  learning: { src: "/achievements/google-ai-professional-certificate-2026.jpg", width: 1800, height: 1387, alt: "Google AI Professional Certificate issued to Anirudh Shashikumar through Coursera.", caption: "GOOGLE AI PROFESSIONAL CERTIFICATE / COMPLETED 2026 / 7 COURSES", year: "2026 / STILL LEARNING" },
};
export const movements = [
  { id: "M01", chapter: 0, display: ["THE SYSTEMS TELL\nPART OF THE STORY.", "NOW MEET\nTHE PERSON\nBUILDING THEM.", "ANIRUDH\nSHASHIKUMAR"], headline: [], body: ["I'm a Computer Science Engineering student interested in how AI, computer vision, software and hardware connect into complete systems."], micro: [], meta: ["COMPUTER SCIENCE ENGINEERING STUDENT", "BENGALURU, INDIA"] },
  { id: "M02", chapter: 0, display: ["IT STARTED\nWITH CURIOSITY."], headline: ["2020.\nFIRST WEBSITE."], body: ["Getting my first computer sparked the interest. Around seventh grade, during the COVID period, I started programming for fun: a few lines of logic could become something visible and interactive.", "In 2020, I entered my first proper Computer Science competition with a personal HTML/CSS website—login interface, forms and hyperlinks. It won First Position. Formal Computer Science classes during PUC later made programming more serious."], micro: ["THE FIRST PORTFOLIO, BEFORE THIS PORTFOLIO."], meta: ["ORIGIN / 2020"] },
  { id: "M03", chapter: 1, display: ["ONE LAYER\nOPENED ANOTHER."], headline: ["I WANTED TO KNOW\nHOW THEY CONNECT."], body: ["What began as making a website expanded into an interest in how software, AI, data, vision, hardware and interfaces work together."], micro: ["A LEARNING PATH, NOT A CAREER LADDER."], meta: [] },
  { id: "M04", chapter: 1, display: ["SOME PROBLEMS\nDON'T FIT\nINSIDE RULES."], headline: vision, body: ["Images, language and spatial information contain ambiguity. SAR-to-optical experiments made model architecture, training, loss functions and perceptual evaluation tangible.", "Vision interested me because software could respond to the physical world. Camera input and movement became ways to learn through interaction and play."], micro: ["FROM EXPLICIT RULES TO LEARNED PATTERNS.", "CAMERA AS INPUT."], meta: ["WHY AI", "WHY COMPUTER VISION"] },
  { id: "M05", chapter: 2, display: ["MODEL ↔ PRODUCT"], headline: ["THE PART I LIKE\nIS CONNECTING\nTHE LAYERS."], body: ["An intelligent component is only part of the experience. I enjoy connecting it to data, APIs, application logic, interfaces, deployment and validation."], micro: ["BETWEEN MODEL AND PRODUCT."], meta: [] },
  { id: "M06", chapter: 2, display: ["ARCHITECTURE FIRST.", "LOCALLY CORRECT\nCAN STILL BE\nGLOBALLY FRAGILE."], headline: [], body: ["I want to understand the problem and the system boundaries before implementation. The goal is not just working components, but a coherent system.", "I use AI tools to accelerate implementation, boilerplate, syntax, repetitive work and iteration. I own the architecture, context, technical decisions, integration, testing and validation.", "Generated implementation still has to be understood, integrated, tested and validated."], micro: ["ONE WORKFLOW. CLEAR RESPONSIBILITY."], meta: [] },
  { id: "M07", chapter: 3, display: ["THE SAME PROCESS.\nLESS TIME."], headline: ["PROBLEM → BUILD → PITCH"], body: ["Hackathons bring problem evaluation, architecture, building, testing and pitching into hours. I enjoy prioritizing with a team, integrating the work, shaping the interface and defending technical decisions."], micro: ["STRATEGY / ARCHITECTURE / BUILD / TEST / PITCH"], meta: competitions },
  { id: "M08", chapter: 3, display: ["CURRENT STATE:\nLEARNING."], headline: ["UNDERSTANDING\nWHAT'S UNDERNEATH."], body: ["I'm working on Machine Learning, Deep Learning, Data Structures & Algorithms, Database Systems and Full-Stack Product Engineering—moving from using tools toward understanding the principles underneath them."], micro: ["FIRST WEBSITE → STILL LEARNING."], meta: [] },
  { id: "M09", chapter: 4, display: ["NOT EVERYTHING\nIS A PROJECT."], headline: ["Movement. Music. People."], body: ["I train regularly at the gym and enjoy cricket, basketball and football. Music is part of daily life, often while travelling or working. I spend time with friends and family, too."], micro: [], meta: sports },
  { id: "M10", chapter: 5, display: ["I WANT TO BUILD\nSYSTEMS THAT\nDON'T JUST LIVE\nON A SCREEN."], headline: [], body: ["I want to connect intelligence to the physical world and turn complex ideas into something useful."], micro: ["INTELLIGENCE → INTERACTION → PHYSICAL WORLD"], meta: [] },
  { id: "M11", chapter: 5, display: ["PLACES TO BUILD.\nROOM TO LEARN.", "STILL LEARNING.\nSTILL BUILDING."], headline: ["NEXT SYSTEM\nUNKNOWN."], body: ["I'm interested in internships, hackathons, collaborations, startup projects, technical communities and meeting other builders—opportunities to learn and grow."], micro: ["LEAVE KNOWING MORE THAN WHEN I ENTERED."], meta: [] },
];
export type Detail = "origin" | "path" | "layers" | "process" | "evidence" | "learning" | "human" | "closing";
export type Plate = { movement: number; start: number; end: number; title: string; body?: string; micro?: string; detail?: Detail; kind?: "name" | "purpose" | "human" | "relationship" };
const m = movements;
export const plates: Plate[] = [
  { movement: 0, start: 0, end: .035, title: m[0].display[0] },
  { movement: 0, start: .035, end: .075, title: m[0].display[1] },
  { movement: 0, start: .075, end: .12, title: m[0].display[2], body: m[0].body[0], kind: "name" },
  { movement: 1, start: .12, end: .165, title: m[1].display[0], body: m[1].body[0], micro: m[1].meta[0] },
  { movement: 1, start: .165, end: .22, title: m[1].headline[0], body: m[1].body[1], micro: m[1].micro[0], detail: "origin" },
  { movement: 2, start: .22, end: .255, title: m[2].display[0], body: m[2].body[0], detail: "path", micro: m[2].micro[0] },
  { movement: 2, start: .255, end: .29, title: m[2].headline[0], detail: "path", micro: m[2].micro[0] },
  { movement: 3, start: .29, end: .345, title: m[3].display[0], body: m[3].body[0], micro: m[3].micro[0] },
  { movement: 3, start: .345, end: .40, title: vision.join("\n"), body: m[3].body[1], micro: m[3].micro[1], kind: "relationship" },
  { movement: 4, start: .40, end: .48, title: m[4].headline[0], body: m[4].body[0], detail: "layers", micro: m[4].micro[0] },
  { movement: 5, start: .48, end: .52, title: m[5].display[0], body: m[5].body[0], detail: "process", micro: m[5].micro[0] },
  { movement: 5, start: .52, end: .56, title: m[5].display[0], body: m[5].body[1], detail: "process", micro: m[5].micro[0] },
  { movement: 5, start: .56, end: .60, title: m[5].display[1], body: m[5].body[2] },
  { movement: 6, start: .60, end: .66, title: m[6].display[0], body: m[6].body[0], detail: "evidence", micro: m[6].micro[0] },
  { movement: 7, start: .66, end: .70, title: m[7].display[0], body: m[7].body[0], micro: m[7].micro[0] },
  { movement: 7, start: .70, end: .74, title: m[7].headline[0], detail: "learning", micro: m[7].micro[0] },
  { movement: 8, start: .74, end: .84, title: m[8].display[0], body: m[8].body[0], detail: "human", kind: "human" },
  { movement: 9, start: .84, end: .93, title: m[9].display[0], body: m[9].body[0], micro: m[9].micro[0], kind: "purpose" },
  { movement: 10, start: .93, end: .965, title: m[10].display[0], body: m[10].body[0], micro: m[10].micro[0] },
  { movement: 10, start: .965, end: 1, title: m[10].display[1], detail: "closing" },
];
