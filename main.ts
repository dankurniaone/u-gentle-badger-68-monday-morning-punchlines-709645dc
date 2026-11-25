// Monday Morning Punchlines — make.fun entry
// Writes one joke about Monday mornings to entry.txt and proves it fits
// the sealed gate (UTF-8, 1-200 characters, single non-blank line) before
// the file is trusted. Node 22, standard library only.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE = "I told Monday I'd work from home. Monday told my Wi-Fi.";

const MIN_CHARS = 1;
const MAX_CHARS = 200;

function resolveOutputDir(): string {
  // The harness points here first; fall back to the plain /output dir.
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR ?? process.env.OUTPUT_DIR;
  return fromEnv && fromEnv.trim().length > 0 ? fromEnv : "/output";
}

function gateProblems(text: string): string[] {
  const problems: string[] = [];
  if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
    problems.push(`length ${text.length} outside ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    problems.push("line is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("must be a single line");
  }
  // Guard against a mojibake slip: the bytes must round-trip as UTF-8.
  const roundTrip = Buffer.from(text, "utf8").toString("utf8");
  if (roundTrip !== text) {
    problems.push("not clean UTF-8");
  }
  return problems;
}

function main(): void {
  const problems = gateProblems(JOKE);
  if (problems.length > 0) {
    throw new Error(`gate failed: ${problems.join("; ")}`);
  }

  // --check validates the joke without writing anything, so the gate can
  // be probed in a dry run before the real output lands.
  if (process.argv.includes("--check")) {
    console.log(`gate ok: ${JOKE.length} chars`);
    return;
  }

  const outDir = resolveOutputDir();
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, JOKE, "utf8");

  const back = readFileSync(target, "utf8");
  if (back !== JOKE) {
    throw new Error("round-trip check failed: file differs from the joke");
  }
  console.log(`wrote entry.txt: ${JOKE.length} chars`);
}

main();
