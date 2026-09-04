# dashboard-launcher — r1 (2026-09-04)

Feature: widget panel "Open dashboard" button (`dashboardUrl` config) + widget→dashboard accent-color sync. Commit `4d46db7` (PR #15, unreleased). Ran as a delayed finish-pass — original implementation shipped without one after a 9h process stall (see conversation). Evidence: `docs/ux-log/e2e-latest/dashboard-link-{desktop,mobile}-panel-header.png`, e2e/server.mjs fixture with `dashboardUrl` set, `apps/demo` `/demo` live-write check.

## Fix batch (r1, applied before recheck)

- **Header wrap (Impeccable polish, severity: layout drift)**: 4th header button (text+icon, matched siblings) overflowed the flex-wrap row alone on desktop 1440px (confirmed via before/after screenshot — 3 buttons filled the row edge-to-edge without it). Fixed: icon-only (matches `closeBtn` precedent) + native `title` tooltip added for hover discoverability. Recheck: all 4 buttons fit one row, desktop and mobile (390px).

## ux-heuristics (Nielsen + Krug), recheck — score 8/10

| # | Heuristic | Finding | Severity | Status |
|---|---|---|---|---|
| 1 | #4 Consistency | New button is icon-only; 3 siblings are icon+text | 2 (minor) | Accepted trade-off — text label caused the wrap fixed above; icon (external-link) is a standard web convention |
| 2 | #6 Recognition, Krug mystery-meat | Touch users have no hover; `title` tooltip inert on tap | 1-2 | Accepted — mis-tap opens a tab, zero data loss, trivially reversible |
| 3 | #5 Error prevention | Button never renders without `dashboardUrl` — no dead link possible | — | Pass |
| 4 | #2 Match w/ real world | External-link icon signals "leaves this context" before click | — | Pass |
| 5 | #9 Error recovery | `syncSharedAccentColor`/read side both catch corrupt JSON, fall back silently | — | Pass |

No severity-3/4 issues. Touch-target height (~27px) matches the 3 existing sibling buttons in this row — a pre-existing density choice, not a regression, out of this feature's scope to change.

## Taste lens §3-B~E (Operate surface, `docs/ux/taste-lens.md`)

| # | §  | Location | Finding | Class |
|---|---|---|---|---|
| 1 | B | panel.ts / settings-storage.ts | No new async/loading state — sync `window.open` + localStorage read/write; both have defensive fallbacks | 채택 (pass) |
| 2 | C | panel.ts | Focus stays in origin tab after click (no trap) | 채택 (pass) |
| 3 | D | i18n/*.ts | "Open dashboard"/"대시보드 열기" — plain, no jargon/placeholder | 채택 (pass) |
| 4 | E | icons.ts, styles/base.ts | Inline SVG matches existing hand-drawn icon convention (no new library); CSS uses `--sp-*` tokens for color/radius, raw px for spacing (matches every sibling rule) | 채택 (pass) |

No §5 always-reject-list conflicts. Zero adopted findings requiring further code change.

## Recheck

`bun run verify`: 107 files / 2640 tests green, 0 console errors on both harness captures and the live `/demo` write-path check. Ship.
