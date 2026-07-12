import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

/**
 * Per-breakpoint visual diff reporter.
 *
 * For each failing visual test, collects:
 *   - the breakpoint name parsed from the test title (e.g. "320")
 *   - pixel diff counts/ratios parsed from Playwright's error message
 *   - paths to expected / actual / diff PNG attachments
 *
 * Writes a consolidated JSON + Markdown summary into
 * `tests/visual/__results__/diff-summary.{json,md}` and copies the diff PNGs
 * into a flat `tests/visual/__results__/diffs/` folder so they're easy to
 * upload or browse.
 */

type Metric = {
  breakpoint: string | null;
  testTitle: string;
  status: TestResult['status'];
  durationMs: number;
  diffPixels: number | null;
  diffRatio: number | null;
  expected: string | null;
  actual: string | null;
  diff: string | null;
  errorSnippet: string | null;
};

const OUT_DIR = join(process.cwd(), 'tests/visual/__results__');
const DIFFS_DIR = join(OUT_DIR, 'diffs');

const parseBreakpoint = (title: string): string | null => {
  const m = title.match(/@\s*(\d{2,4})px/);
  return m ? m[1] : null;
};

const parseDiffMetrics = (
  msg: string | undefined,
): { diffPixels: number | null; diffRatio: number | null } => {
  if (!msg) return { diffPixels: null, diffRatio: null };
  // Playwright phrasing: "12345 pixels (ratio 0.04 of all image pixels) are different."
  const pixels = msg.match(/(\d[\d,]*)\s+pixels?\s+\(ratio\s+([\d.]+)/i);
  if (pixels) {
    return {
      diffPixels: Number(pixels[1].replace(/,/g, '')),
      diffRatio: Number(pixels[2]),
    };
  }
  const ratioOnly = msg.match(/ratio\s+([\d.]+)/i);
  return {
    diffPixels: null,
    diffRatio: ratioOnly ? Number(ratioOnly[1]) : null,
  };
};

const copySafe = (src: string | null, destDir: string): string | null => {
  if (!src || !existsSync(src)) return null;
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, basename(src));
  copyFileSync(src, dest);
  return dest;
};

export default class VisualMetricsReporter implements Reporter {
  private metrics: Metric[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    // Only record visual results — passes get a row too so the summary
    // shows the full breakpoint matrix, not just failures.
    const isVisual =
      result.attachments.some((a) => /-(expected|actual|diff)\.png$/.test(a.name)) ||
      /projects layout @/.test(test.title);
    if (!isVisual) return;

    const find = (suffix: string) =>
      result.attachments.find((a) => a.name.endsWith(suffix))?.path ?? null;

    const expected = find('-expected.png');
    const actual = find('-actual.png');
    const diff = find('-diff.png');

    const errorMsg = result.error?.message ?? result.errors[0]?.message ?? '';
    const { diffPixels, diffRatio } = parseDiffMetrics(errorMsg);

    const bp = parseBreakpoint(test.title);
    const subdir = bp ? join(DIFFS_DIR, `${bp}px`) : DIFFS_DIR;

    this.metrics.push({
      breakpoint: bp,
      testTitle: test.title,
      status: result.status,
      durationMs: Math.round(result.duration),
      diffPixels,
      diffRatio,
      expected: copySafe(expected, subdir),
      actual: copySafe(actual, subdir),
      diff: copySafe(diff, subdir),
      errorSnippet: errorMsg ? errorMsg.split('\n').slice(0, 4).join('\n') : null,
    });
  }

  async onEnd(result: FullResult) {
    mkdirSync(OUT_DIR, { recursive: true });

    const summary = {
      status: result.status,
      generatedAt: new Date().toISOString(),
      breakpoints: this.metrics.sort((a, b) => {
        const an = Number(a.breakpoint ?? 0);
        const bn = Number(b.breakpoint ?? 0);
        return an - bn;
      }),
    };

    const jsonPath = join(OUT_DIR, 'diff-summary.json');
    writeFileSync(jsonPath, JSON.stringify(summary, null, 2));

    const lines: string[] = [
      '# Visual diff summary',
      '',
      `Run status: **${result.status}**  `,
      `Generated: ${summary.generatedAt}`,
      '',
      '| Breakpoint | Status | Diff pixels | Diff ratio | Duration |',
      '| --- | --- | --- | --- | --- |',
    ];
    for (const m of summary.breakpoints) {
      lines.push(
        `| ${m.breakpoint ?? '—'}px | ${m.status} | ${m.diffPixels ?? '—'} | ${
          m.diffRatio != null ? m.diffRatio.toFixed(4) : '—'
        } | ${m.durationMs}ms |`,
      );
    }
    const failed = summary.breakpoints.filter((m) => m.status !== 'passed');
    if (failed.length) {
      lines.push('', '## Failing breakpoints', '');
      for (const m of failed) {
        lines.push(`### ${m.breakpoint ?? '?'}px — ${m.testTitle}`);
        if (m.errorSnippet) {
          lines.push('', '```', m.errorSnippet, '```');
        }
        const rel = (p: string | null) =>
          p ? p.replace(`${process.cwd()}/`, '') : '—';
        lines.push(
          '',
          `- expected: ${rel(m.expected)}`,
          `- actual:   ${rel(m.actual)}`,
          `- diff:     ${rel(m.diff)}`,
          '',
        );
      }
    }

    const mdPath = join(OUT_DIR, 'diff-summary.md');
    writeFileSync(mdPath, lines.join('\n'));

    // Helpful console pointer; the `list` reporter handles per-test output.
    // eslint-disable-next-line no-console
    console.log(`\n[visual] Per-breakpoint summary: ${mdPath}`);
    // eslint-disable-next-line no-console
    console.log(`[visual] Diff PNGs:               ${DIFFS_DIR}`);

    // Ensure dirname is referenced so bundlers don't drop the import.
    void dirname;
  }
}
