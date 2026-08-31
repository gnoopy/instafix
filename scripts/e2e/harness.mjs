// scripts/e2e/harness.mjs — project-agnostic per uiux-automation-quickstart-v5 §25.
// launchPersistentContext + a fixed fixture, seeded once, so finish-pass rounds after
// the first take seconds instead of the 1-2 minutes a fresh login/seed costs each time.
//
// Two surfaces in this repo, two configs: E2E_TARGET=dashboard (default) loads
// ./e2e.config.mjs (apps/demo /demo/inbox), E2E_TARGET=widget loads
// ./e2e.config.widget.mjs (the existing e2e/server.mjs fixture, port 3999 — start it
// separately first, see that config's header comment).

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core"; // playwright 를 쓰면 executablePath 불필요

const target = process.env.E2E_TARGET === "widget" ? "./e2e.config.widget.mjs" : "./e2e.config.mjs";
const cfg = (await import(target)).default;

export async function openApp(o = {}) {
  fs.mkdirSync(cfg.profileDir, { recursive: true });
  fs.mkdirSync(cfg.outDir, { recursive: true });
  const t0 = Date.now();
  const log = (...a) => console.log(`[e2e +${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);
  const ctx = await chromium.launchPersistentContext(cfg.profileDir, {
    ...(o.executablePath ? { executablePath: o.executablePath } : {}), // playwright-core 면 설치된 브라우저 경로를 넘긴다
    headless: process.env.E2E_HEADLESS !== "0",
    viewport: cfg.viewports.desktop,
    deviceScaleFactor: o.dpr || 1,
  });
  const page = ctx.pages()[0] || (await ctx.newPage());
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  if (await cfg.isLoggedIn(page)) log("session reused");
  else {
    await cfg.login(page);
    log("logged in");
  }
  return {
    page,
    ctx,
    base: cfg.base,
    log,
    async ensureFixture() {
      if (await cfg.hasFixture(page)) {
        log("fixture present");
        return false;
      }
      await cfg.seedFixture(page);
      log("fixture seeded");
      return true;
    },
    async openFixture() {
      await cfg.openFixture(page);
      log("fixture open");
    },
    async desktop() {
      await page.setViewportSize(cfg.viewports.desktop);
      await page.waitForTimeout(250);
    },
    async mobile() {
      await page.setViewportSize(cfg.viewports.mobile);
      await page.waitForTimeout(400);
    },
    /** clip 을 주면 결함 부위만 — 전체 화면 1장 = 토큰 1~2k. */
    async shot(name, clip) {
      const p = path.join(cfg.outDir, `${name}.png`);
      await page.screenshot({ path: p, ...(clip ? { clip } : {}) });
      log("shot", p);
      return p;
    },
    consoleErrors() {
      return errors;
    },
    async close() {
      await ctx.close();
    },
  };
}
