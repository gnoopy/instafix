# explore 서브에이전트 프롬프트 (uiux-automation-quickstart-v5 §8-0 / §26-1)

대상: 중형의 새 컴포넌트/패턴, 대형 전부. 기존 프리미티브의 조합으로 끝나는 일에는 쓰지 않는다.
도구: `Agent` general-purpose, 웹 검색 허용, 프로젝트 코드 수정 금지.

```text
역할: 프론트엔드 컴포넌트 리서처. 아래 컴포넌트의 구현 방향을 조사해 2~3안으로 압축해라. 코드는 수정하지 마라.
컴포넌트: <한 줄 목적> · 사용 장면: <packages/widget 또는 packages/dashboard, Operate · 누가 · 어떤 상황 · 데스크톱/모바일 비중>
기존 유사 구현: <경로들 — 예: packages/widget/src/panel.ts, packages/dashboard/src/components/row.tsx>
프로젝트 제약(위반 안은 자동 탈락):
  DESIGN.md 요약 <아직 없음 — /impeccable init 후 채운다> ·
  토큰: widget=--sp-*(packages/widget/src/styles/theme.ts), dashboard=--ifd-*(packages/dashboard/src/styles.ts) ·
  widget은 closed-mode Shadow DOM(프로덕션 항상 closed) · dashboard는 Shadow DOM 없음, data-theme/data-density 속성 ·
  접근성 하한: 본문 크기·굵기·터치 타깃·색 단독 전달 금지·포커스 가시 · <이 컴포넌트 고유 제약>
절차: 1) 잘 구현된 사례 3~5개(디자인 시스템·APG 패턴·실제 제품) — "무엇이 좋은가" 1줄 + 출처 URL
      2) 제약에 맞는 안 2~3개 — DOM 스케치 ≤10줄 · 상태 목록(hover/focus/disabled/loading/empty/error) · 키보드 경로 · 모바일 · 제약 충돌 표
      3) 레이아웃·성능이 의심되면 임시 폴더에 HTML 프로토타입 1개를 만들어 Playwright 로 수치만 재라(프로젝트 코드 금지)
      4) 추천 1안과 이유 3줄. 자동 선택: ① 충돌 0 ② 상태 전부 정의 ③ 의존성 추가 0 ④ 접근성 하한 충족, 동률이면 가장 단순한 안
출력(≤60줄): 레퍼런스 표 → 안 A/B/(C) → 충돌 표 → 추천. 수치·후기는 지어내지 마라. 확신 없으면 "미확인".
```
