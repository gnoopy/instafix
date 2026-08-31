// scripts/e2e/e2e.config.mjs — dashboard (@instafix/dashboard) finish-pass target.
// Primary UI/UX v5.1 finish-pass surface: apps/demo's /demo/inbox route, mode=local
// (LocalStorageStore, no server/API needed — see apps/demo/src/app/(site)/demo/inbox/demo-inbox.tsx).
// Widget target lives in ./e2e.config.widget.mjs — point harness.mjs at it via
// E2E_TARGET=widget (see harness.mjs comment).
//
// No auth exists in this product — isLoggedIn/login are no-ops.
export default {
  base: process.env.E2E_BASE || "http://localhost:3000",
  profileDir: ".e2e/profile-dashboard", // gitignore
  outDir: "docs/ux-log/e2e-latest",
  viewports: { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } },

  async isLoggedIn(_page) {
    return true; // no auth in this product
  },
  async login(_page) {
    // no-op
  },

  /**
   * Fixture = one feedback item visible in the inbox, created via the widget on
   * /demo (mode=local) so it flows through the SAME "instafix_demo_local" localStorage
   * key the dashboard reads (apps/demo/src/app/(site)/demo/playground.tsx and
   * demo-inbox.tsx both point at it in mode=local).
   *
   * TODO(verify in a real browser before first use): the exact annotation-composer
   * selectors below (marker placement → composer fields → submit) are NOT yet
   * verified — packages/widget/src/panel.ts only covers the *list* panel
   * (`.sp-fab`, `.sp-panel`, `.sp-card-*`), not the creation composer. Run
   * `npx playwright codegen http://localhost:3000/demo?mode=local` once to find the
   * real composer selectors, then fill in seedFixture below. Until then this will
   * throw loudly rather than silently pass — do not weaken it into a no-op.
   */
  async hasFixture(page) {
    await page.goto(`${this.base}/demo/inbox?mode=local`, { waitUntil: "domcontentloaded" });
    return (await page.locator('[data-status] :text("E2E 고정 샘플")').count()) > 0;
  },
  async seedFixture(_page) {
    throw new Error(
      "seedFixture unverified — run `npx playwright codegen http://localhost:3000/demo?mode=local`, " +
        "record: click the instafix-widget FAB (.sp-fab, pierces closed shadow DOM via Playwright locators) " +
        "→ place a marker → submit a feedback titled 'E2E 고정 샘플' → fill in this function, then delete this throw.",
    );
  },
  async openFixture(page) {
    await page.goto(`${this.base}/demo/inbox?mode=local`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".ifd-list", { state: "visible" });
  },
};
