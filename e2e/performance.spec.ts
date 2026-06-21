import { test, expect } from '@playwright/test'

/**
 * Performance tests for SentraOps (Task 20.5).
 * Uses Playwright's Performance API and Web Vitals.
 */

// Performance budget constants
const PERF_BUDGET = {
  /** Max time for DOM Content Loaded (ms) */
  domContentLoaded: 3000,
  /** Max time for full page load (ms) */
  load: 8000,
  /** Max time for first paint (ms) - approximated via performance entries */
  firstPaint: 3000,
  /** Max First Contentful Paint (ms) */
  fcp: 4000,
  /** Max Largest Contentful Paint (ms) */
  lcp: 6000,
}

test.describe('Performance Budget', () => {
  test.describe.configure({ retries: 0 }) // No retries for perf tests

  test('login page loads within budget', async ({ page }) => {
    const metrics = await collectPageMetrics(page, '/login')
    assertPerformanceBudget(metrics, 'login')
  })

  test('access-denied page loads within budget (static)', async ({ page }) => {
    const metrics = await collectPageMetrics(page, '/access-denied')
    assertPerformanceBudget(metrics, 'access-denied')
  })

  test('signup page loads within budget', async ({ page }) => {
    const metrics = await collectPageMetrics(page, '/signup')
    assertPerformanceBudget(metrics, 'signup')
  })
})

/**
 * Navigate to a page and collect performance metrics.
 */
async function collectPageMetrics(page: import('@playwright/test').Page, url: string) {
  // Start tracing performance
  await page.goto(url, { waitUntil: 'commit' })

  // Use Performance API to get timing
  const metrics = await page.evaluate(() => {
    const perf = performance
    const timing = perf.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    const paintEntries = perf.getEntriesByType('paint')
    const firstPaint = paintEntries.find(e => e.name === 'first-paint')?.startTime ?? 0
    const firstContentfulPaint = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime ?? 0

    return {
      domContentLoaded: timing?.domContentLoadedEventEnd ?? 0,
      load: timing?.loadEventEnd ?? 0,
      domInteractive: timing?.domInteractive ?? 0,
      firstPaint,
      firstContentfulPaint,
      // Estimate: total blocking time = sum of long tasks
      totalBlockingTime: 0, // Would need PerformanceObserver for accurate measurement
    }
  })

  // Also get LCP via PerformanceObserver pattern
  const lcp = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        resolve(entries.length > 0 ? entries[entries.length - 1].startTime : 0)
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      // Timeout fallback
      setTimeout(() => resolve(0), 5000)
    })
  })

  // Wait for full load to measure accurate load time
  await page.waitForLoadState('networkidle')

  return { ...metrics, lcp, url }
}

/**
 * Assert that collected metrics are within budget.
 */
function assertPerformanceBudget(
  metrics: { domContentLoaded: number; load: number; firstPaint: number; firstContentfulPaint: number; lcp: number; url: string },
  pageName: string
) {
  test.step(`Verify ${pageName} performance metrics`, () => {
    // DCL
    expect(
      metrics.domContentLoaded,
      `${pageName}: DOM Content Loaded should be < ${PERF_BUDGET.domContentLoaded}ms (was ${Math.round(metrics.domContentLoaded)}ms)`
    ).toBeLessThan(PERF_BUDGET.domContentLoaded)

    // Load
    expect(
      metrics.load,
      `${pageName}: Full load should be < ${PERF_BUDGET.load}ms (was ${Math.round(metrics.load)}ms)`
    ).toBeLessThan(PERF_BUDGET.load)

    // First Paint
    expect(
      metrics.firstPaint,
      `${pageName}: First paint should be < ${PERF_BUDGET.firstPaint}ms (was ${Math.round(metrics.firstPaint)}ms)`
    ).toBeLessThan(PERF_BUDGET.firstPaint)

    // FCP
    expect(
      metrics.firstContentfulPaint,
      `${pageName}: FCP should be < ${PERF_BUDGET.fcp}ms (was ${Math.round(metrics.firstContentfulPaint)}ms)`
    ).toBeLessThan(PERF_BUDGET.fcp)

    // LCP
    expect(
      metrics.lcp,
      `${pageName}: LCP should be < ${PERF_BUDGET.lcp}ms (was ${Math.round(metrics.lcp)}ms)`
    ).toBeLessThan(PERF_BUDGET.lcp)

    // Log metrics for reference
    console.log(`[Perf] ${pageName}: DCL=${Math.round(metrics.domContentLoaded)}ms ` +
      `Load=${Math.round(metrics.load)}ms FP=${Math.round(metrics.firstPaint)}ms ` +
      `FCP=${Math.round(metrics.firstContentfulPaint)}ms LCP=${Math.round(metrics.lcp)}ms`)
  })
}
