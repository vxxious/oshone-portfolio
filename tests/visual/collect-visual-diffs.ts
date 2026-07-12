#!/usr/bin/env bun
/**
 * Copies Playwright visual-diff artifacts into /mnt/documents/visual-diffs/
 * so the diff PNGs and per-breakpoint summary are easy to download from chat.
 *
 * Usage:  bun tests/visual/collect-visual-diffs.ts
 * Typically chained after the test run:
 *   bunx playwright test || bun tests/visual/collect-visual-diffs.ts
 */
import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'tests/visual/__results__');
const DEST = '/mnt/documents/visual-diffs';

if (!existsSync(SRC)) {
  console.error(`[visual] No results at ${SRC} — run the tests first.`);
  process.exit(0);
}

mkdirSync(DEST, { recursive: true });
cpSync(SRC, DEST, { recursive: true });

const summary = join(SRC, 'diff-summary.md');
if (existsSync(summary)) {
  console.log(readFileSync(summary, 'utf8'));
}
console.log(`\n[visual] Uploaded artifacts to ${DEST}`);
