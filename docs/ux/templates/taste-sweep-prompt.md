# taste 스윕 프롬프트 (uiux-automation-quickstart-v5 §15-1 / §26-3)

릴리스/클러스터 종료 시 1회만.

```text
docs/ux/taste-lens.md §3-B~E 로 <packages/widget · packages/dashboard 화면 목록> 을 감사해
(둘 다 Operate — §3-A는 미적용). 업스트림 스킬 본문(.claude/skills/design-taste-frontend,
.claude/skills/redesign-existing-projects)은 읽지 말고 렌즈 파일만 써.
각 발견을 렌즈 §4 표로 채택 / 기각(§5 조항, DESIGN.md 미확정이면 "기각(DESIGN.md 미확정)") / 측정 요청으로
분류하고, 측정 요청은 scripts/e2e/harness.mjs · 스크립트로 실측해 "실측 확정 / 가설 유지"로 갱신해.
코드는 고치지 마. 결과는 docs/ux-log/<YYYY-MM-DD>-release-taste.md 1개로 저장하고 ≤40줄로 요약해.
```
