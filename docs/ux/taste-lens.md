# taste 렌즈 — instafix (기준일 2026-09-01)

> 역할: Impeccable 아래의 검증 렌즈. Authority 아님. 코드 수정 금지. 발견은 측정 전까지 가설.
> 업스트림: design-taste-frontend, redesign-existing-projects (참조용, `.claude/skills/`). 실행 단위는 이 파일.
> 상태: **초안 — `/impeccable init`으로 PRODUCT.md/DESIGN.md 생성 전.** §5 상시 기각 목록의 DESIGN.md 조항은
> DESIGN.md 확정 후 채워야 한다. 그 전까지 taste lens를 돌리면 §5 인용 없이 "기각(DESIGN.md 미확정)"으로만 표기한다.

## 0. 상수

- 다이얼: DESIGN_VARIANCE 3 / MOTION_INTENSITY 2 / VISUAL_DENSITY 5 — 추론 금지, 대화 중 상향 금지.
  (제안 기본값: 신뢰 우선·접근성 필수 개발자 도구 성격. `/impeccable init` 뒤 DESIGN.md와 맞춰 재확인할 것.)
- 리디자인 모드: 항상 Preserve (greenfield / overhaul 진입 금지)
- 적용 화면: **packages/widget**, **packages/dashboard** — 둘 다 Operate 모드(앱 셸/에디터/도구)다.
  Persuade/Read taste read는 이 두 서피스에 적용하지 않는다(§3-B~E만). `apps/demo`의 랜딩/문서 페이지는
  이 렌즈의 범위 밖(별도 결정 시 확장).

## 1. taste read 형식

Operate 서피스만 다루므로 이 절은 **사용하지 않는다**(§7A-2 매트릭스). 랜딩/문서 페이지를 이 렌즈 범위에
포함시키기로 결정하면 이 절을 quickstart §7A-3 원본 형식으로 채운다.

## 2. 기계 lint 대상 (scripts/taste-lint.* — 아직 미작성, 선택)

- 동일 크기 카드 3열 feature row (해당 없음 가능성 높음 — Operate UI)
- 연속 섹션의 레이아웃 패밀리 반복
- 같은 의도의 CTA 중복(라벨만 다른 두 버튼) — 예: dashboard의 status-menu / row 액션 중복 여부
- 장식용 상태점 · 장식용 구분자
- 네이티브 window.confirm / alert 잔존 — widget panel.ts의 `.sp-confirm-*` 커스텀 다이얼로그가 실제로
  전체 삭제 확인 등에서 native confirm을 대체하는지 확인 대상
- (프로젝트별) 테마 × 색 쌍 대비 계산 — dashboard는 `data-theme="dark|light"` + `data-density`
  조합이 있으므로 조합별 전수 계산 스크립트가 필요하다(§7A-5)
- ※ 제외(Impeccable detector 보유): em-dash 남용, 아이브로우/키커, nested cards, AI 팔레트, gradient text,
  marketing buzzword, low-contrast(단일 테마), marquee, numbered section labels, pulsing dot, icon tile stack

## 3. taste lens 체크리스트 (Playwright 통과 후, Operate이므로 B~E만)

- A. 템플릿성 — **미적용**(Operate 서피스)
- B. 상태 완전성: loading / empty / error / success / disabled / permission / 긴 콘텐츠 / 오프라인 — 화면당 표
  - widget: `.sp-loading` / `.sp-empty` / 삭제 확인(`.sp-confirm-*`) 등 기존 상태 요소가 실제로 전부 도달 가능한지
  - dashboard: `.ifd-list`의 empty/loading, `.ifd-loadmore` 이후 로드 실패, drawer 열림 중 항목 삭제 등
- C. 전략적 누락: 법률 링크 · 뒤로 가기 · 404 · 인라인 검증 · skip 링크 · 현재 위치 표시 · 재시도 경로 · 포커스 복귀
  - widget/dashboard는 앱 셸 컴포넌트이므로 "뒤로 가기·404"는 대개 해당 없음 — 포커스 복귀(패널 닫힘 후
    FAB로), 키보드 경로, 재시도 경로(로드 실패 시) 중심으로 판단
- D. 콘텐츠: 가짜 이름/수치 · 클리셰 카피 · "Oops" · 느낌표 남발 · placeholder-only 라벨 · 전문용어
- E. 코드 품질: div soup · 하드코딩 px · z-index 난수 · alt 누락 · 죽은 prop/컴포넌트(grep으로 사용처 확인)

## 4. 출력 형식

| # | 절 | 위치(file:line) | 발견 | 분류 | 근거 / 기각 조항 |

분류 = 채택 / 기각(조항) / 측정 요청.
"측정 요청"은 스크립트·Playwright로 확인한 뒤 "실측 확정" 또는 "가설 유지"로 갱신한다.
통과 = 실측 확정 결함 0 + B·C 누락 0. A는 미적용(Operate).
저장: `docs/ux-log/YYYY-MM-DD-<feature>-r<n>-taste.md` (finish pass에서는 통합 보고서에 합침, §13-0)

## 5. 상시 기각 목록 (재토론 금지, 근거 조항 명시)

**DESIGN.md 확정 전까지 비어 있다.** `/impeccable init` 완료 후, 현재 코드에서 "바꾸지 않을 것"을 여기로
옮겨 적는다(새 결정이 아니라 기존 제약의 문서화이므로 Human Gate 불필요 — quickstart §24 절차 1).
알려진 후보(코드에서 이미 관찰됨, DESIGN.md 조항 번호만 비어 있음):

- 서체 교체 → DESIGN.md §TBD
- 아이콘 라이브러리 교체 → DESIGN.md §TBD
- widget: closed-mode Shadow DOM 해제 → DESIGN.md §TBD (프로덕션에서 항상 closed, `packages/widget/src/launcher.ts`)
- dashboard: `ifd-` 클래스 프리픽스 / `--ifd-*` 토큰 체계 교체 → DESIGN.md §TBD
- 새 모션 의존성(motion/GSAP) → 의존성 정책 §TBD
- 하드코딩 색(원색명 클래스) → 토큰 정책 §TBD (widget은 `--sp-*`, dashboard는 `--ifd-*`)
- 문서·코드·title의 em-dash → 화면 카피만 판단
- 업스트림 "Upgrade Techniques" / "Fix Priority 1. Font swap" 절 전체 → 본 렌즈 §0 (표현 레버는 Impeccable 담당)

## 6. 이 렌즈가 다루지 않는 것

- 사용성(Nielsen) → ux-heuristics
- 설계 리뷰·디자인 특정성 → /impeccable critique
- 기술 감사(a11y·perf·responsive) → /impeccable audit
- 릴리스 표준 → web-design-guidelines
