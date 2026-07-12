import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression tests for the Projects sticky-scroll layout.
 * Run with:  bunx playwright test
 * Update baselines with:  bunx playwright test --update-snapshots
 *
 * Assumes a dev server is running at http://localhost:8080 (Vite default for this project).
 */
export default defineConfig({
  testDir: './tests/visual',
  snapshotDir: './tests/visual/__screenshots__',
  // All failed-test artifacts (expected/actual/diff PNGs, traces, videos,
  // and our per-breakpoint metrics JSON) are written here. The folder is
  // also copied to /mnt/documents/visual-diffs after a failing run by the
  // `scripts/collect-visual-diffs.ts` helper so they're easy to download.
  outputDir: './tests/visual/__results__',
  fullyParallel: true,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/visual/__report__', open: 'never' }],
    ['json', { outputFile: 'tests/visual/__results__/report.json' }],
    ['./tests/visual/metrics-reporter.ts'],
  ],
  expect: {
    // Tolerate harmless anti-aliasing / subpixel font rendering differences
    // while still failing on genuine layout shifts or overlap.
    //   - threshold: per-pixel color sensitivity (0 strict … 1 loose)
    //   - maxDiffPixelRatio: % of total pixels allowed to differ
    //   - maxDiffPixels: hard cap on differing pixels (small absolute floor)
    //   - animations: freeze CSS animations/transitions for stable captures
    //   - caret: hide blinking text caret
    //   - scale: device-pixel-ratio normalized so 1x baselines compare cleanly
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixelRatio: 0.02,
      maxDiffPixels: 250,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',
    ...devices['Desktop Chrome'],
    // Capture rich artifacts on failure so we can inspect what changed.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
