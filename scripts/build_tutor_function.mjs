#!/usr/bin/env node
/**
 * Builds the deployable payload for the `tutor-grade` Edge Function.
 *
 * Two problems this solves:
 *
 *  1. An Edge Function cannot read `content/<site>/**` at runtime — that content
 *     lives in the repository, not in Supabase. So the grounding pack is
 *     compiled into a generated module.
 *  2. Hand-copying the deterministic tutor into the function would create a
 *     second source of truth that silently drifts. Instead the canonical
 *     modules under `lib/tutor/` are copied verbatim, with their imports
 *     rewritten to the explicit `.ts` specifiers Deno requires.
 *
 * Everything under `supabase/functions/tutor-grade/_generated/` is output.
 * Never edit it by hand; run `npm run build:tutor-fn`.
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
const outDir = path.join(repo, "supabase/functions/tutor-grade/_generated");

/** Disease sites that ship a tutor rubric. Add a site by adding its content. */
const SITES = ["prostate"];

/** Content files are authored on Windows; CRLF is noise inside a prompt. */
const read = (file) => readFileSync(file, "utf8").replace(/\r\n/g, "\n");

function buildGroundingPack(site) {
  const base = path.join(repo, "content", site);
  const rubric = read(path.join(base, "tutor/TUTOR_RUBRIC.md")).trim();

  const conceptDir = path.join(base, "concepts");
  const conceptFiles = readdirSync(conceptDir)
    .filter((f) => f.endsWith(".md"))
    .sort();
  const conceptIds = conceptFiles.map((f) => f.replace(/\.md$/, ""));
  const concepts = conceptFiles
    .map(
      (f) =>
        `### conceptId: ${f.replace(/\.md$/, "")}\n${read(path.join(conceptDir, f)).trim()}`,
    )
    .join("\n\n");

  const index = JSON.parse(read(path.join(base, "sources/index.json")));
  const sourceIds = index.sources.map((s) => s.id);
  const sources = index.sources
    .map((s) => `- sourceId: ${s.id} | ${s.title} (${s.publisher}, ${s.year})`)
    .join("\n");

  return {
    site,
    rubric,
    concepts,
    sources,
    allowedIds: [...conceptIds, ...sourceIds],
  };
}

/** Deno resolves module specifiers literally, so extensionless imports fail. */
function toDenoImports(source) {
  return source.replace(/from "(\.\/[A-Za-z0-9_-]+)"/g, 'from "$1.ts"');
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// 1. Canonical tutor modules, copied verbatim with Deno-compatible specifiers.
for (const name of ["schema", "deterministic", "merge"]) {
  const source = readFileSync(path.join(repo, "lib/tutor", `${name}.ts`), "utf8");
  writeFileSync(
    path.join(outDir, `${name}.ts`),
    `// GENERATED from lib/tutor/${name}.ts — do not edit. Run: npm run build:tutor-fn\n` +
      toDenoImports(source),
    "utf8",
  );
}

// 2. Grounding packs compiled from content/, published as a static asset.
//
// The Edge Function fetches this at runtime rather than embedding it. That
// keeps content the single source of truth: editing a rubric or a concept and
// pushing updates the tutor without redeploying the function.
const packs = Object.fromEntries(SITES.map((site) => [site, buildGroundingPack(site)]));
const publicDir = path.join(repo, "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(
  path.join(publicDir, "tutor-grounding.json"),
  JSON.stringify({ version: 1, generatedFrom: "content/<site>", packs }, null, 2),
  "utf8",
);

for (const [site, pack] of Object.entries(packs)) {
  const bytes = pack.rubric.length + pack.concepts.length + pack.sources.length;
  console.log(
    `${site}: ${pack.allowedIds.length} identifiants autorisés, socle ${(bytes / 1024).toFixed(1)} Ko`,
  );
}
console.log(`modules: ${path.relative(repo, outDir)}`);
console.log(`socle publie: public/tutor-grounding.json`);
