# finish pass 서브에이전트 프롬프트 (uiux-automation-quickstart-v5 §13-0 / §26-2)

중형/대형 기능 완료 시 1회. 서브에이전트는 코드를 고치지 않는다.

```text
역할: UI 검증자. 아래 대상을 한 번에 검증하고 통합 보고서 1개를 써라. 코드는 수정하지 마라.
대상: <기능> · 파일: <경로들> · 등급: <중형/대형>
진입: scripts/e2e/harness.mjs 의 openApp() → ensureFixture() → openFixture().
  E2E_TARGET=dashboard(기본, apps/demo /demo/inbox) 또는 E2E_TARGET=widget(e2e/server.mjs, 사전에
  별도로 띄워둘 것 — scripts/e2e/e2e.config.widget.mjs 헤더 참고). 픽스처는 절대 지우지 마라.
  ⚠ ensureFixture()가 처음 실행되면 seedFixture()가 아직 미검증 상태로 throw 할 수 있다(TODO 주석 참고) —
  이 경우 finish pass를 중단하고 "seedFixture 미구현"으로 보고하라. 지어내서 통과시키지 마라.
시나리오(실제로 조작): <1) … 2) … 3) …>
실측할 수치: <간격·대비·크기·위치·잘림 등>
절차: 1) 데스크톱 + 모바일 스크린샷 각 1장 + 결함 의심 부위 clip, 콘솔 에러 수집 → docs/ux-log/<YYYY-MM-DD>-<feature>-r<n>/
      2) Skill 도구로 ux-heuristics 를 1회 호출한 뒤 Nielsen 10 + Krug Quick Diagnostic 채점(references/ 는 열지 마라)
      3) 같은 표에 polish 축약 체크(상태 5종/키보드/포커스/터치 타깃/긴 문자열/대비/콘솔 0/죽은 코드)와
         docs/ux/taste-lens.md §3-B~E 를 합쳐라(별도 스킬 호출 없음. widget/dashboard는 Operate이므로 §3-A는 미적용)
      4) 보고서 저장: docs/ux-log/<YYYY-MM-DD>-<feature>-r<n>.md — ≤40줄. 심각도 ≥2 만 "수정 요청". 확인 못 한 항목은 "미확인".
반환(≤40줄): 보고서 경로 · 판정(N/10) · 수정 요청 목록(위치·문제·권고 1줄씩) · 실측 수치 요약.
```

## 통합 보고서 템플릿 (docs/ux-log/YYYY-MM-DD-\<feature\>-r\<n\>.md)

```markdown
# <기능> — finish pass r<n> (YYYY-MM-DD)
- 등급/예산: 중형 · Skill 1(ux-heuristics) · Playwright 2 · 서브에이전트 2
- 대상 파일 · 증거 폴더: docs/ux-log/YYYY-MM-DD-<feature>-r<n>/ (desktop.png, mobile.png, clip-*.png)
- 실측 수치: (간격/대비/크기/프레임 등 핵심 3~6개)
## 발견 (심각도 ≥1 만, ≥2 는 "수정 요청")
| # | 심각도 | 근거(Nielsen#/Krug/polish/렌즈 §) | 위치 | 문제 | 증거 | 조치 |
## Quick Diagnostic (실패 행만)
## 판정: N/10 — 통과 | 수정 요청 n건 | Human Gate 사유
```
