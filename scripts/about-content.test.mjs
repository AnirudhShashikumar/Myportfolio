// Node 24's native TS stripping reads the same model as the application.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { chapters, movements, plates, workflow, archives } from "../src/sections/about/aboutContent.ts";

test("eleven ordered movements form six broader chapters", () => {
  assert.equal(chapters.length, 6);
  assert.deepEqual(movements.map(m => m.id), Array.from({ length: 11 }, (_, i) => `M${String(i + 1).padStart(2, "0")}`));
  assert.deepEqual([...new Set(movements.map(m => m.chapter))], [0, 1, 2, 3, 4, 5]);
});
test("unequal normalized plates cover the full story without gaps", () => {
  assert.equal(plates[0].start, 0);
  assert.equal(plates.at(-1).end, 1);
  plates.forEach((plate, index) => {
    assert.ok(plate.end > plate.start && plate.title);
    if (index) assert.equal(plate.start, plates[index - 1].end);
  });
  assert.equal(new Set(plates.map(p => p.movement)).size, 11);
});
test("process, personal interests and claim qualifiers are preserved", () => {
  assert.deepEqual(workflow, ["IDEA", "UNDERSTAND", "RESEARCH", "ARCHITECTURE", "BUILD", "TEST", "VALIDATE", "ITERATE"]);
  assert.match(movements[0].body[0], /student interested/);
  assert.match(movements[8].body[0], /gym.*cricket.*basketball.*football.*Music.*friends and family/);
  assert.match(movements[9].display[0], /^I WANT TO BUILD/);
  assert.match(movements[6].meta[2], /COLLEGE SHORTLIST FOR PROJECT SUBMISSION$/);
  assert.equal(Object.keys(archives).length, 2);
});
test("production HTML contains the complete no-JS biography", () => {
  const html = readFileSync(new URL("../.next/server/app/index.html", import.meta.url), "utf8");
  assert.match(html, /data-cinematic="false"/);
  assert.equal((html.match(/data-about-reading="M\d+"/g) ?? []).length, 11);
  assert.equal((html.match(/data-about-chapter="\d"/g) ?? []).length, 6);
  for (const movement of movements) {
    assert.ok(html.includes(`id="about-${movement.id}"`));
    for (const body of movement.body) {
      const escaped = body.replaceAll("&", "&amp;").replaceAll("'", "&#x27;");
      // Human's final sentence is a separate inline block, with identical copy.
      if (movement.id === "M09") assert.ok(html.includes("friends and family, too."));
      else assert.ok(html.includes(escaped), movement.id);
    }
  }
  assert.ok(!html.includes("data-about-plate="), "no-JS render must not be an absolute plate stack");
  assert.ok(html.includes("Inspect the original") && html.includes("Continue to Contact"));
});
