// scripts/e2e/e2e.config.widget.mjs — widget (@instafix/widget) finish-pass target.
// Reuses the repo's existing Playwright fixture server (e2e/server.mjs, port 3999) rather
// than apps/demo: that server sets NODE_ENV=test before loading the widget script, which
// flips packages/widget/src/launcher.ts's shadowMode to "open" (see e2e/widget.spec.ts).
// apps/demo runs in real dev/prod mode → closed shadow root, same as production.
//
// Prerequisite: start the fixture server first (it is NOT started by this harness):
//   node e2e/server.mjs &   # or: bunx playwright test --list  (via webServer in playwright.config.ts)
//
// Select this config: E2E_TARGET=widget node scripts/e2e/<caller>.mjs  (see harness.mjs)
export default {
  base: process.env.E2E_BASE || "http://localhost:3999",
  profileDir: ".e2e/profile-widget", // gitignore
  outDir: "docs/ux-log/e2e-latest",
  viewports: { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } },

  async isLoggedIn(_page) {
    return true; // no auth
  },
  async login(_page) {
    // no-op
  },

  /**
   * Playwright's locator engine pierces shadow DOM (open AND closed) by default,
   * so `page.locator("instafix-widget").locator(...)` works without page.evaluate.
   * Verified selectors (packages/widget/src/panel.ts, launcher.ts): host element
   * `instafix-widget`, launcher button `.sp-fab`, panel `.sp-panel`, feedback cards
   * `.sp-card`. The reset endpoint is per-project: GET /api/reset?projectName=<name>.
   *
   * TODO(same gap as e2e.config.mjs): the annotation-creation composer (marker
   * placement → fields → submit) isn't verified yet. Fill in seedFixture once found.
   */
  async hasFixture(page) {
    await page.goto(`${this.base}?project=e2e-finish-pass`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("instafix-widget", { state: "attached" });
    return (await page.locator("instafix-widget").locator(".sp-card").count()) > 0;
  },
  async seedFixture(_page) {
    throw new Error(
      "seedFixture unverified — run `npx playwright codegen http://localhost:3999?project=e2e-finish-pass`, " +
        "record placing a marker and submitting a feedback titled 'E2E 고정 샘플' via the composer that " +
        "opens after clicking .sp-fab, then fill in this function and delete this throw.",
    );
  },
  async openFixture(page) {
    await page.locator("instafix-widget").locator(".sp-fab").click();
    await page.waitForSelector("instafix-widget", { state: "attached" });
    await page.locator("instafix-widget").locator(".sp-panel--open").waitFor();
  },
};
