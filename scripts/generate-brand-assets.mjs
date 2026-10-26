// Offline asset generation. Uses the installed Next.js font/rendering tools;
// none of this generator is imported by the application.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const font = await readFile(require.resolve("next/dist/compiled/@vercel/og/Geist-Regular.ttf"));
const proposal = "docs/qa/seo-branding/brand-proposal";
await mkdir(proposal, { recursive: true });

async function render(element, width, height) {
  const response = new ImageResponse(element, {
    width, height,
    fonts: [{ name: "Geist", data: font, weight: 400, style: "normal" }],
  });
  return Buffer.from(await response.arrayBuffer());
}

// A letter from the existing name typography, proposed for owner approval.
const icon = await render(h("div", {
  style: {
    width: "100%", height: "100%", background: "#070a0c", color: "#edf4f6",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "Geist", fontSize: 192, lineHeight: 1, paddingBottom: 8,
  },
}, "A"), 256, 256);
await writeFile(`${proposal}/icon-256.png`, icon);
const frames = await Promise.all([16, 32, 48].map(size => sharp(icon).resize(size, size).png().toBuffer()));
for (const [index, size] of [16, 32, 48].entries()) {
  await writeFile(`${proposal}/favicon-${size}.png`, frames[index]);
}
const directory = Buffer.alloc(6 + frames.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
for (const [index, size] of [16, 32, 48].entries()) {
  const entry = 6 + index * 16;
  directory[entry] = size;
  directory[entry + 1] = size;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frames[index].length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frames[index].length;
}
await writeFile(`${proposal}/favicon.ico`, Buffer.concat([directory, ...frames]));
await sharp(icon).resize(180, 180).removeAlpha().png().toFile(`${proposal}/apple-touch-icon.png`);

const field = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <g fill="none" stroke="#728a95" stroke-width="1">
    <path opacity=".15" d="M740 0v630M900 0v630M1060 0v630M0 78h1200M0 550h1200"/>
    <g opacity=".25" transform="translate(1038 192)">
      <circle r="120"/><circle r="80"/><circle r="40"/>
      <path d="M-150 0h300M0-150v300M-106-106l212 212M-106 106l212-212"/>
      <path d="m0-120 104 60v120L0 120l-104-60V-60Z"/>
    </g>
  </g>
  <g fill="#a9d6ff" opacity=".5"><circle cx="1038" cy="192" r="3"/><circle cx="918" cy="192" r="2"/><circle cx="1038" cy="72" r="2"/></g>
</svg>`;
const preview = await render(h("div", {
  style: {
    position: "relative", width: "100%", height: "100%", display: "flex",
    flexDirection: "column", padding: "47px 76px", background: "#070a0c",
    color: "#edf4f6", fontFamily: "Geist",
  },
},
  h("img", { src: `data:image/svg+xml;base64,${Buffer.from(field).toString("base64")}`, width: 1200, height: 630, alt: "", style: { position: "absolute", top: 0, left: 0 } }),
  h("div", { style: { display: "flex", fontSize: 18, letterSpacing: 3, color: "#8d9fa7" } }, "PORTFOLIO / SELECTED SYSTEMS"),
  h("div", { style: { display: "flex", flexDirection: "column", marginTop: 98, fontSize: 96, letterSpacing: -5, lineHeight: 1.04 } },
    h("div", null, "ANIRUDH"), h("div", null, "SHASHIKUMAR")),
  h("div", { style: { display: "flex", marginTop: 34, fontSize: 30, letterSpacing: -0.5, color: "#b8c5ca" } }, "Engineering the Next Era of Intelligence"),
  h("div", { style: { display: "flex", position: "absolute", left: 76, bottom: 38, fontSize: 17, letterSpacing: 2, color: "#8d9fa7" } }, "AI / VISION / SOFTWARE / PHYSICAL SYSTEMS"),
), 1200, 630);
await sharp(preview).removeAlpha().png().toFile("public/opengraph-image.png");

// Enlarged nearest-neighbor samples keep the true 16/32px raster visible.
const samples = await Promise.all(frames.slice(0, 2).map((frame, index) => sharp(frame).resize((index + 1) * 80, (index + 1) * 80, { kernel: "nearest" }).toBuffer()));
await sharp({ create: { width: 640, height: 280, channels: 3, background: "#151a1d" } })
  .composite([{ input: icon, left: 12, top: 12 }, { input: samples[0], left: 300, top: 100 }, { input: samples[1], left: 420, top: 60 }])
  .png().toFile(`${proposal}/icon-review.png`);
console.log("Wrote the static social preview and proposed icon assets. Installing the icon requires owner approval.");
