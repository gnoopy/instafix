**한국어** · [English](./README.en.md)

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/brand/logo-horizontal-dark.png">
  <img src="./assets/brand/logo-horizontal.png" alt="InstaFix" height="64">
</picture>

**AI 코딩 에이전트와 디버깅할 때, 화면을 가리키기만 하면 프롬프트가 완성됩니다.**

Claude Code, Cursor 같은 AI 코딩 에이전트와 함께 개발할 때 쓰는 가벼운 브라우저 위젯입니다.
에이전트가 만든 화면에서 문제되는 부분을 클릭하거나 사각형으로 표시하고 짧은 메모만 남기면,
정확한 DOM 대상·스크린샷·콘솔 에러까지 담긴 프롬프트가 즉시 클립보드에 복사됩니다 — 에이전트 채팅창에 붙여넣기만 하면 끝입니다.
이렇게 남기는 의견 하나하나가 **픽스노트(fix note)** 로 기록됩니다.

![Demo](./demo.gif)

[![npm](https://img.shields.io/npm/v/%40instafix%2Fwidget?style=flat&colorA=000000&colorB=000000&label=npm)](https://www.npmjs.com/package/@instafix/widget)
[![Website](https://img.shields.io/badge/website-instafix.realstory.blog-000000?style=flat&colorA=000000&colorB=000000)](https://instafix.realstory.blog)
[![Live Demo](https://img.shields.io/badge/demo-try%20it%20live-22c55e?style=flat&colorA=000000)](https://instafix.realstory.blog/demo)
[![Docs](https://img.shields.io/badge/docs-instafix.realstory.blog%2Fdocs-0066ff?style=flat&colorA=000000)](https://instafix.realstory.blog/docs)
[![license](https://img.shields.io/github/license/gnoopy/instafix?style=flat&colorA=000000&colorB=000000)](./LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/gnoopy/instafix/ci.yml?style=flat&colorA=000000&colorB=000000)](https://github.com/gnoopy/instafix/actions)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/gnoopy/instafix/codeql.yml?label=CodeQL&style=flat&colorA=000000&colorB=000000)](https://github.com/gnoopy/instafix/security/code-scanning)
[![coverage](https://img.shields.io/codecov/c/github/gnoopy/instafix?style=flat&colorA=000000&colorB=000000)](https://app.codecov.io/gh/gnoopy/instafix)
[![OpenSSF Scorecard](https://img.shields.io/ossf-scorecard/github.com/gnoopy/instafix?label=scorecard&style=flat&colorA=000000&colorB=000000)](https://scorecard.dev/viewer/?uri=github.com/gnoopy/instafix)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/badge/widget-~30%20KB%20gzip%20(ESM)-blue)](./packages/widget/.size-limit.json)

[**문서**](https://instafix.realstory.blog/docs) &middot; [빠른 시작](https://instafix.realstory.blog/docs/quickstart) &middot; [라이브 데모](https://instafix.realstory.blog/demo) &middot; [기여 가이드](./CONTRIBUTING.md)

</div>

> **[InstaFix 실제로 써보기 →](https://instafix.realstory.blog/demo)** — 화면을 클릭해 주석을 남기고, 에이전트에게 바로 줄 프롬프트로 복사되는 걸 확인해보세요.

> [!NOTE]
> InstaFix는 [NeosiaNexus](https://github.com/NeosiaNexus)가 만든 **[SitePing](https://github.com/NeosiaNexus/SitePing)**을 포크해서 새 이름으로 이어가는 프로젝트입니다. 무엇이 바뀌었는지, 저작권/라이선스는 어떻게 처리했는지는 [출처](#provenance) 항목을 참고하세요.

---

## 기능

- **말로 설명할 필요 없이, 클릭 한 번으로 정확한 대상 지정** — "왼쪽에서 두 번째 카드", "그 버튼 아래 여백" 같은 애매한 표현 대신 마우스로 직접 짚습니다. 요소 위에 마우스를 올렸다가 클릭하면 그 요소가 자동으로 선택되고, 사각형으로 드래그하면 여러 요소를 한 번에 선택할 수 있습니다. 이렇게 선택한 요소는 CSS/XPath/텍스트 기반의 정확한 DOM 셀렉터로 자동 기록됩니다. 개발 서버에서는 그 요소를 렌더링한 **React 컴포넌트 이름까지 함께 기록**되어, 에이전트가 관련 파일을 바로 찾을 수 있습니다
- **프롬프트 복사(Copy Prompt)** — 남긴 메모·정확한 DOM 셀렉터·스크린샷 경로·콘솔 에러를 마크다운 프롬프트 하나로 정리해 클립보드에 복사합니다. Claude Code, Cursor 등 어떤 코딩 에이전트에도 바로 붙여넣을 수 있습니다. 각 항목(픽스노트)마다 고유 ID와 "다 고치면 이렇게 표시해줘"라는 안내가 함께 담겨서, **에이전트가 수정을 마친 항목을 스스로 완료 처리**합니다
- **복사·붙여넣기 없이 터미널로 바로 전달** (`instafix prompt` · `/instafix` · "Agent에게") — 쌓인 픽스노트를 `npx @instafix/cli prompt | claude -p` 명령 하나로 새 에이전트 세션에 통째로 넘기거나, 지금 작업 중인 Claude Code 세션에 `/instafix`라고 입력해서 그대로 가져오거나, 패널의 "Agent에게" 버튼을 눌러 `instafix watch`가 켜진 세션으로 바로 보낼 수 있습니다
- **DOM 기반 영속성** — 주석이 픽셀이 아니라 요소에 결속되어, 에이전트가 레이아웃을 바꿔도 주석이 유지됨
- **스크린샷 + 진단 정보** — 주석 영역을 JPEG로 캡처하고(민감한 부분은 자동으로 가림 처리) 콘솔/네트워크 로그도 함께 담을 수 있습니다 (둘 다 켜고 끌 수 있음) — "에러가 난다"고 말로 설명하는 대신 실제 콘솔 로그를 그대로 프롬프트에 넣을 수 있습니다. 디자인 시안을 보여주고 싶다면 메모 입력창에 이미지를 ⌘V로 바로 붙여넣으면 됩니다
- **내 앱 색상과 절대 헷갈리지 않는 위젯 색** — 페이지에 이미 쓰이고 있는 브랜드 색을 자동으로 읽어서, 툴바·팝오버·패널·마커를 그 색과 뚜렷이 구분되는 색 하나로 통일해서 보여줍니다 (`autoSelectionColor: false`로 끄면 직접 지정한 `accentColor`를 씀)
- **로컬 히스토리 (`.instafix/` 폴더)** — DB 없이 프로젝트 폴더에 작업 이력(과 스크린샷)을 평문으로 남기고 언제든 검색 가능 (`@instafix/adapter-fs`)
- **팀용 관리 화면 (트리아지 인박스)** — `<InstaFixInbox />`(`@instafix/dashboard`): 여러 명이 함께 픽스노트를 검토하고 정리하고 싶을 때 쓰는 화면입니다. Linear 스타일의 키보드 중심 UI, 라이트/다크 테마, 8개 언어 지원
- **기본 내장된 안정성** — 백오프 재시도 + localStorage 큐로, 불안정한 네트워크에서도 코멘트를 잃지 않음
- **Shadow DOM 격리 + 다른 플로팅 위젯과 겹치지 않음** — 위젯 CSS가 사이트로 새어나가지 않고, 사이트 CSS가 위젯을 깨뜨리지도 않음. 최댓값 z-index를 써서 다른 요소에 가려지지 않고, 배포 미리보기 툴바(Vercel 툴바 등)나 채팅 버블처럼 같은 자리에 이미 뭔가 떠 있으면 반대쪽 하단 모서리로 자동으로 옮겨감 (`avoidOverlays: false`로 끌 수 있음)
- **기본적으로 개발 환경 전용** — `forceShow: true`를 주지 않는 한 프로덕션 빌드에서는 자동으로 숨겨짐
- **가벼움** — gzip 기준 ~30KB(ESM); 패널·스크린샷 엔진·비영어 로케일은 필요할 때만 로드됨

<a id="quickstart"></a>
## 빠른 시작

### 코딩 에이전트에게 그대로 맡기기

가장 빠른 방법 — 아래를 Claude Code / Cursor / Copilot 등에 붙여넣고 나머지는 맡기세요:

```text
이 프로젝트에 InstaFix(셀프 호스팅 픽스노트 위젯)를 설치하고 설정해줘:

1. npx @instafix/cli@latest init 을 실행하고, 각 질문에서 제안하는 기본값을 그대로 선택해.
2. 이 명령이 설치하라고 알려주는 @instafix/* 패키지를 npm install로 설치해.
3. 이 명령은 components/instafix-widget.tsx 를 생성하는데, 여기서 InstaFixWidget이라는 컴포넌트를 내보내. 이 프로젝트의 루트 레이아웃(Next.js App Router라면 app/layout.tsx, 다른 프레임워크라면 그에 해당하는 루트 레이아웃/루트 컴포넌트) <body> 안에 <InstaFixWidget /> 을 한 번만 추가해줘. @/components/instafix-widget 에서 import하면 되고(이 프로젝트가 @/ 별칭을 안 쓴다면 import 경로를 알맞게 조정해), 이 컴포넌트는 아무것도 렌더링하지 않으니(return null) 정확한 위치는 중요하지 않아. 조건문으로 감싸지 마 — forceShow가 설정되지 않는 한 개발 환경 밖에서는 이미 자동으로 아무 동작도 하지 않게 되어 있어.
```

이게 전부입니다 — 이제 화면에 사각형을 그리고 메모를 남기면, 에이전트에게 바로 줄 프롬프트로 복사할 수 있습니다.

쌓인 픽스노트를 에이전트에게 넘기는 방법은 아래 중 편한 걸 고르세요:

```bash
# 열려 있는 픽스노트 전체(또는 --id로 고른 것만)를 새 에이전트 세션으로 전달
npx @instafix/cli prompt --status open | claude -p

# 에이전트가 고친 항목은 스스로 완료 처리합니다 (방법은 프롬프트 안에 적혀 있음)
npx @instafix/cli resolve <ID>
```

지금 작업 중인 Claude Code 세션에서 바로 이어서 처리하고 싶다면, 그 세션에 `/instafix`라고 입력하세요(`init`을 실행하면 이 슬래시 커맨드도 함께 설치됩니다). 브라우저를 벗어나고 싶지 않다면, 픽스노트 카드나 상세 화면에 있는 **"Agent에게"** 버튼을 누르세요 — 백그라운드에서 `instafix watch`를 켜둔 세션이 그 내용을 바로 이어받아 처리합니다.

### 직접 설치하고 싶다면?

```bash
# 1. API 라우트 + 바로 쓸 수 있는 위젯 컴포넌트를 대화형으로 만들어줍니다.
#    InstaFix 자체 저장소는 이 프로젝트의 다른 DB와 무관합니다 — SQLite
#    (better-sqlite3, 외부 서비스 불필요)가 기본 제안이고, 혼자 작업 중이라면
#    DB 없는 ".instafix/ 폴더" 옵션을 고를 수 있습니다.
npx @instafix/cli@latest init

# 2. init이 알려준 패키지를 설치하세요 — SQLite를 선택한 경우:
npm install @instafix/widget @instafix/adapter-sqlite
# 혼자 쓰는 로컬 히스토리를 원한다면: @instafix/adapter-fs
```

`init`은 `components/instafix-widget.tsx`를 생성하지만 레이아웃 파일은 건드리지 않습니다 — 임의의 레이아웃 파일을 안전하게 수정하려면 사람(혹은 에이전트)이 직접 확인하는 편이 낫기 때문입니다. 설치가 끝나면 아래를 Claude Code / Cursor / Copilot 등에 붙여넣으세요:

```text
npx @instafix/cli@latest init 명령이 components/instafix-widget.tsx 를 생성했고, 여기서 InstaFixWidget이라는 컴포넌트를 내보내. 내 앱의 루트 레이아웃 — Next.js App Router라면 app/layout.tsx, 다른 프레임워크라면 그에 해당하는 루트 레이아웃/루트 컴포넌트 — 에 <InstaFixWidget /> 을 추가해줘. @/components/instafix-widget 에서 import하면 되고(이 프로젝트가 @/ 별칭을 안 쓴다면 import 경로를 알맞게 조정해), 다른 전역 프로바이더들과 함께 <body> 안 어딘가에 한 번만 넣어줘 — 이 컴포넌트는 아무것도 렌더링하지 않으니(return null) 정확한 위치는 중요하지 않아. 조건문으로 감싸지 마: forceShow가 설정되지 않는 한 개발 환경 밖에서는 이미 자동으로 아무 동작도 하지 않게 되어 있어.
```

쌓인 픽스노트는 아래 컴포넌트 하나만 붙이면 한 화면에서 확인하고 정리할 수 있습니다:

```tsx
import { InstaFixInbox } from "@instafix/dashboard";

<InstaFixInbox projects="my-app" endpoint="/api/instafix" theme="auto" />
```

(설치: `npm install @instafix/dashboard`)

**InstaFix 제거하기**: 락파일과 `package.json`을 되돌리고(`git checkout -- package.json package-lock.json` 또는 사용 중인 락파일), `app/api/instafix/`와 `components/instafix-widget.tsx`를 삭제한 뒤 다시 설치하세요.

### 아직 릴리스되지 않은 최신 기능을 먼저 써보고 싶다면 (Nightly)

npm에는 release-please가 커밋 규칙에 따라 정식으로 태그를 찍은 버전만 올라갑니다. main 브랜치 tip을 그대로 따라가는 `<package>-dist` GitHub 브랜치도 계속 유지되므로, 아직 릴리스 전인 기능을 먼저 써보고 싶다면 패키지 이름 대신 GitHub URL로 설치하면 됩니다 — 설치 경험은 동일합니다:

```bash
npx github:gnoopy/instafix#cli-dist init
npm install github:gnoopy/instafix#widget-dist github:gnoopy/instafix#adapter-sqlite-dist
```

일반적인 용도로는 위쪽의 npm 설치를 쓰세요 — nightly 브랜치는 매 push마다 갱신되고 버전이 고정되지 않아 하위 호환이 보장되지 않습니다.

## 문서

전체 문서는 **[instafix.realstory.blog/docs](https://instafix.realstory.blog/docs)**(영어, 프랑스어, 한국어)에 있습니다 — 이 문서에 나오는 모든 옵션, 기본값, 동작은 실제 소스 코드를 기준으로 검증되어 있습니다.

| 패키지 | | 문서 |
|---|---|---|
| [`@instafix/widget`](./packages/widget) | 픽스노트 위젯 (프레임워크 무관 + React 훅) | [위젯](https://instafix.realstory.blog/docs/widget) · [설정](https://instafix.realstory.blog/docs/widget/configuration) · [스크린샷](https://instafix.realstory.blog/docs/widget/screenshots) |
| [`@instafix/dashboard`](./packages/dashboard) | 트리아지 인박스 컴포넌트 + 헤드리스 훅 | [대시보드](https://instafix.realstory.blog/docs/dashboard) · [테마](https://instafix.realstory.blog/docs/dashboard/theming) |
| [`@instafix/adapter-sqlite`](./packages/adapter-sqlite) | 프로덕션용 서버 어댑터, 외부 서비스 불필요 | [SQLite 어댑터](https://instafix.realstory.blog/docs/adapters/sqlite) |
| [`@instafix/adapter-fs`](./packages/adapter-fs) | DB 없음 — `.instafix/` 아래 평문 파일, 혼자 개발하는 경우용 | [파일시스템 어댑터](https://instafix.realstory.blog/docs/adapters/fs) |
| [`@instafix/cli`](./packages/cli) | `init` / `prompt` / `resolve` / `watch` / `sync` / `status` / `doctor` | [CLI](https://instafix.realstory.blog/docs/cli) |

### 개발/배포 환경별로 어댑터 나눠 쓰기

`adapter-fs`(로컬 `npm run dev`)와 `adapter-sqlite`(배포된 `npm run start`)는 한 번 고르고 끝나는 양자택일이 아니라, 같은 `route.ts`에서 `NODE_ENV`로 갈라 **둘 다** 쓰는 게 자연스럽습니다 — 자세한 내용과 코드 예시는 [개발/프로덕션 어댑터 나눠 쓰기](https://instafix.realstory.blog/docs/adapters/dev-vs-production) 문서를 참고하세요.

## 기여하기

버그 리포트, 로케일 번역, 문서 수정, 기능 추가 — 무엇이든 도움이 됩니다. 로케일 추가는 첫 PR로 가장 부담 없는 항목입니다. [CONTRIBUTING.md](./CONTRIBUTING.md)에서 시작하세요.

시맨틱 앵커, 스크린샷 저장소 백엔드, 포지셔닝 수정처럼 지금까지 여러 유용한 기능이 포크에서 먼저 나왔습니다. 이런 추가 기능을 담은 포크를 유지하고 계신가요? 업스트림에 PR을 보내주시거나, 여의치 않다면 무엇을 만들었는지 설명하는 이슈만 남겨주셔도 모두에게 도움이 됩니다.

<a id="contributors"></a>
## 기여자 (Contributors)

한 줄의 코드, 로케일, 문서 수정, 버그 리포트 하나하나가 InstaFix를 더 낫게 만듭니다. 이곳까지 와주신 모든 분들, 특히 첫 기여를 해주신 분들께 감사드립니다.

_이 목록은 InstaFix 저장소에 실제로 기여한 사람만 표시합니다 — 이 프로젝트가 포크한 SitePing과 어떤 관계인지는 [출처](#provenance) 항목을 참고하세요._

이 프로젝트는 [all-contributors](https://allcontributors.org) 규격을 따릅니다 — 어떤 형태의 기여든 인정됩니다 ([이모지 키](https://allcontributors.org/docs/en/emoji-key)).

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/gnoopy"><img src="https://avatars.githubusercontent.com/u/63867369?v=4?s=100" width="100px;" alt="Olsen Matheo"/><br /><sub><b>Olsen Matheo</b></sub></a><br /><a href="https://github.com/gnoopy/instafix/commits?author=gnoopy" title="Code">💻</a> <a href="#maintenance-gnoopy" title="Maintenance">🚧</a> <a href="https://github.com/gnoopy/instafix/commits?author=gnoopy" title="Documentation">📖</a> <a href="#design-gnoopy" title="Design">🎨</a> <a href="#infra-gnoopy" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#ideas-gnoopy" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/gnoopy/instafix/pulls?q=is%3Apr+reviewed-by%3Agnoopy" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/gnoopy/instafix/commits?author=gnoopy" title="Tests">⚠️</a> <a href="#projectManagement-gnoopy" title="Project Management">📆</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

> 이 목록에 이름을 올리고 싶으신가요? 코드, 문서, 번역, 버그 리포트, 디자인 아이디어 — 무엇이든 인정됩니다. [CONTRIBUTING.md](./CONTRIBUTING.md)에서 시작하세요. 메인테이너가 `@all-contributors please add @your-username for code, doc`라고 코멘트를 남기면 [@all-contributors](https://allcontributors.org/docs/en/bot/usage) 봇이 자동으로 추가해줍니다.

### 활동

![InstaFix activity](https://repobeats.axiom.co/api/embed/9ac0c24e3801b4397a9ed90af984dfec23323d1c.svg "Repobeats analytics image")

<sub>활동 그래프 제공: <a href="https://repobeats.axiom.co">Repobeats</a>.</sub>

---

## Star 히스토리

[![Star History Chart](https://api.star-history.com/svg?repos=gnoopy/instafix&type=Date)](https://star-history.com/#gnoopy/instafix&Date)

---

<a id="provenance"></a>
## 출처 (Provenance)

InstaFix는 [NeosiaNexus](https://github.com/NeosiaNexus)가 만들고 관리해온 **SitePing**([NeosiaNexus/SitePing](https://github.com/NeosiaNexus/SitePing), MIT 라이선스)을 포크하면서 시작됐습니다. 이후 새 이름·npm 스코프·저장소로 리브랜딩됐고, 그 이후로도 계속 갈라져나가고 있습니다 — 새 로케일, SQLite 어댑터, CLI 등 업스트림에는 없는 기능들이 추가됐습니다.

- **라이선스**: MIT, 변경 없음. [LICENSE](./LICENSE)에는 원본 NeosiaNexus/SitePing 저작권 고지와 현재 저작권 고지가 라이선스 자체의 조건에 따라 함께 실려 있습니다.
- **커밋 히스토리**: 이 저장소는 GitHub 네이티브 fork가 아니라 새로 체크아웃한 상태에서 시작했기 때문에, SitePing의 원본 커밋 히스토리나 issue/PR 링크를 그대로 가지고 있지 않습니다 — 그 히스토리는 [NeosiaNexus/SitePing](https://github.com/NeosiaNexus/SitePing)에 남아 있습니다.
- **기여자**: [위 목록](#contributors)은 *이* 저장소에 기여한 사람만을 표시합니다. 이 코드베이스에 직접 기여하지 않았기 때문에 SitePing 자체의 기여자는 포함되어 있지 않습니다 — 그 프로젝트의 기여 이력은 [SitePing의 기여자 목록](https://github.com/NeosiaNexus/SitePing/graphs/contributors)을 참고하세요.
- InstaFix와 SitePing 중 무엇을 쓸지 검토 중이시라면: 이 프로젝트는 NeosiaNexus와 제휴 관계도, 그들의 보증을 받은 것도 아닙니다. 둘 다 확인해보고 맞는 쪽을 쓰세요.

## 라이선스

[MIT](./LICENSE)

---

<div align="center">
  <sub>Built by <a href="https://github.com/gnoopy">@gnoopy</a></sub>
</div>
