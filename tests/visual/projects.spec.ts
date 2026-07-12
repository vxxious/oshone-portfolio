import { test, expect, type Page } from '@playwright/test';

/**
 * Visual regression: Projects sticky-scroll layout.
 *
 * Captures full-page screenshots at common small breakpoints to catch
 * overlap, layout shifts, or trapped masked-text regressions.
 *
 * To refresh baselines after an intentional design change:
 *   bunx playwright test --update-snapshots
 */

/**
 * Per-breakpoint tolerances.
 *
 * Smaller viewports have proportionally fewer pixels, so a fixed ratio is too
 * strict — a handful of subpixel font shifts can blow past the budget. We
 * loosen `threshold` (per-pixel color sensitivity) and `maxDiffPixelRatio`
 * (share of pixels allowed to differ) on the narrowest screens, and tighten
 * them as the viewport grows. `maxDiffPixels` is an absolute floor so tiny
 * captures still tolerate a minimum number of antialiased pixels.
 */
const BREAKPOINTS = [
  {
    name: '320',
    width: 320,
    height: 568,
    threshold: 0.35,
    maxDiffPixelRatio: 0.05,
    maxDiffPixels: 400,
  },
  {
    name: '375',
    width: 375,
    height: 812,
    threshold: 0.25,
    maxDiffPixelRatio: 0.03,
    maxDiffPixels: 300,
  },
  {
    name: '768',
    width: 768,
    height: 1024,
    threshold: 0.18,
    maxDiffPixelRatio: 0.015,
    maxDiffPixels: 250,
  },
] as const;

const settle = async (page: Page) => {
  // Wait for fonts, images, and any GSAP failsafe / ScrollTrigger refresh.
  await page.evaluate(() => (document as Document & { fonts?: FontFaceSet }).fonts?.ready);
  await page.waitForLoadState('networkidle');
  // Force every lazy image into the viewport so it loads before the snapshot.
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? null
          : new Promise<void>((res) => {
              img.addEventListener('load', () => res(), { once: true });
              img.addEventListener('error', () => res(), { once: true });
            })
      )
    );
  });
  await page.waitForTimeout(300);
};

for (const bp of BREAKPOINTS) {
  test(`projects layout @ ${bp.name}px has no overlap or shifts`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto('/projects');
    await settle(page);

    await expect(page).toHaveScreenshot(`projects-${bp.name}.png`, {
      fullPage: true,
      threshold: bp.threshold,
      maxDiffPixelRatio: bp.maxDiffPixelRatio,
      maxDiffPixels: bp.maxDiffPixels,
    });
  });
}
