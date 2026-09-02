**한국어** · [English](./README.en.md)

<div align="center">

<h1>InstaFix</h1>

**클라이언트 피드백을, 정확한 그 지점에.**

클라이언트가 개발 중인 웹사이트에 직접 주석을 남길 수 있는 가벼운 피드백 위젯입니다.
사각형을 그리고, 코멘트를 남기고, 버그를 추적하세요 — 라이브 사이트 위에서 바로.

![Demo](./demo.gif)

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

> **[InstaFix 실제로 써보기 →](https://instafix.realstory.blog/demo)** — 라이브 사이트 위에서 바로 주석을 그리고, 피드백을 남기고, 버그를 추적해보세요.

> [!NOTE]
> InstaFix는 [NeosiaNexus](https://github.com/NeosiaNexus)가 만든 **[SitePing](https://github.com/NeosiaNexus/SitePing)**을 포크해서 새 이름으로 이어가는 프로젝트입니다. 무엇이 바뀌었는지, 저작권/라이선스는 어떻게 처리했는지는 [출처](#provenance) 항목을 참고하세요.

---

## InstaFix를 쓰는 이유

Slack 스레드, 이메일, Notion 문서를 뒤지며 클라이언트 피드백을 쫓아다니지 마세요. InstaFix는 클라이언트가 보고 있는 바로 그 요소에 고정된, **맥락이 살아있는** 피드백 방법을 제공합니다.

| | InstaFix | Marker.io | BugHerd |
|---|---|---|---|
| **셀프 호스팅** | 가능 — 내 DB, 내 데이터 | 불가 (SaaS) | 불가 (SaaS) |
| **패키지 설치** | GitHub에서 `npm install` — 레지스트리 제약 없음 | npm + 스크립트 태그 | 스크립트 태그만 |
| **프레임워크 친화도** | Next.js 퍼스트클래스 지원 | 프레임워크 무관 | 프레임워크 무관 |
| **가격** | 무료 & 오픈소스 | 월 $39부터 | 월 $42부터 |
| **DOM 기반 주석** | 다중 셀렉터(CSS + XPath + 텍스트) | 스크린샷 기반 | 핀 기반 |
| **레이아웃 변경에도 주석 유지** | 유지됨 (퍼센트 상대좌표) | 유지 안 됨 (픽셀 좌표) | 부분적으로 유지 |

## 기능

- **사각형 주석** — 클라이언트가 페이지 위에 직접 영역을 그리고, 유형과 메시지를 남길 수 있음
- **DOM 기반 영속성** — 주석이 픽셀이 아니라 요소에 결속되어, 레이아웃이 바뀌어도 유지됨
- **즉석 우클릭 코멘트** — 옵트인 방식이며, 키보드/수정키 컨텍스트 메뉴를 가로채지 않음
- **스크린샷 + 진단 정보** — 주석 영역의 JPEG 캡처(프라이버시 마스킹 포함)와 콘솔/네트워크 캡처, 둘 다 옵트인
- **트리아지 인박스** — `<InstaFixInbox />`(`@instafix/dashboard`): Linear 스타일, 키보드 우선, 라이트/다크, 7개 로케일
- **기본 내장된 안정성** — 백오프 재시도 + localStorage 큐로, 불안정한 네트워크에서도 코멘트를 잃지 않음
- **Shadow DOM 격리** — 위젯 CSS가 사이트로 새어나가지 않고, 사이트 CSS가 위젯을 깨뜨리지도 않음
- **기본적으로 개발 환경 전용** — `forceShow: true`를 주지 않는 한 프로덕션 빌드에서는 자동으로 숨겨짐
- **가벼움** — gzip 기준 ~30KB(ESM); 패널·스크린샷 엔진·비영어 로케일은 필요할 때만 로드됨

<a id="quickstart"></a>
## 빠른 시작

### 코딩 에이전트에게 그대로 맡기기

가장 빠른 방법 — 아래를 Claude Code / Cursor / Copilot 등에 붙여넣고 나머지는 맡기세요:

```text
이 프로젝트에 InstaFix(셀프 호스팅 피드백 위젯)를 설치하고 설정해줘:

1. npx github:gnoopy/instafix#cli-dist init 을 실행하고, 각 질문에서 제안하는 기본값을 그대로 선택해.
2. 이 명령이 설치하라고 알려주는 github:gnoopy/instafix#*-dist 패키지를 npm install로 설치해.
3. 이 명령은 components/instafix-widget.tsx 를 생성하는데, 여기서 InstaFixWidget이라는 컴포넌트를 내보내. 이 프로젝트의 루트 레이아웃(Next.js App Router라면 app/layout.tsx, 다른 프레임워크라면 그에 해당하는 루트 레이아웃/루트 컴포넌트) <body> 안에 <InstaFixWidget /> 을 한 번만 추가해줘. @/components/instafix-widget 에서 import하면 되고(이 프로젝트가 @/ 별칭을 안 쓴다면 import 경로를 알맞게 조정해), 이 컴포넌트는 아무것도 렌더링하지 않으니(return null) 정확한 위치는 중요하지 않아. 조건문으로 감싸지 마 — forceShow가 설정되지 않는 한 개발 환경 밖에서는 이미 자동으로 아무 동작도 하지 않게 되어 있어.
```

이게 전부입니다 — 이제 클라이언트가 사이트에 사각형을 그리고 피드백을 남길 수 있습니다.

### 직접 설치하고 싶다면?

InstaFix는 npm 레지스트리에 배포되어 있지 않습니다 — 이건 "아직 안 했다"가 아니라 의도된 선택입니다. 모든 패키지는 대신 이 저장소의 빌드 결과물에서 바로 설치됩니다. 일회성 `<package>-dist` 브랜치를 통해서요: 설치 경험은 동일하고, 패키지 이름 대신 GitHub URL을 쓴다는 점만 다릅니다.

```bash
# 1. API 라우트 + 바로 쓸 수 있는 위젯 컴포넌트를 대화형으로 만들어줍니다.
#    프로젝트에 Prisma 스키마가 없다면 Prisma를 가정하는 대신 SQLite
#    (better-sqlite3, 외부 서비스 불필요)를 기본값으로 제안하거나,
#    혼자 작업 중이라면 DB 없는 ".instafix/ 폴더" 옵션을 고를 수 있습니다.
npx github:gnoopy/instafix#cli-dist init

# 2. init이 알려준 패키지를 설치하세요 — SQLite를 선택한 경우:
npm install github:gnoopy/instafix#widget-dist github:gnoopy/instafix#adapter-sqlite-dist
# 이미 Prisma를 쓴다면: github:gnoopy/instafix#adapter-prisma-dist
# 혼자 쓰는 로컬 히스토리를 원한다면: github:gnoopy/instafix#adapter-fs-dist
```

`init`은 `components/instafix-widget.tsx`를 생성하지만 레이아웃 파일은 건드리지 않습니다 — 임의의 레이아웃 파일을 안전하게 수정하려면 사람(혹은 에이전트)이 직접 확인하는 편이 낫기 때문입니다. 설치가 끝나면 아래를 Claude Code / Cursor / Copilot 등에 붙여넣으세요:

```text
npx github:gnoopy/instafix#cli-dist init 명령이 components/instafix-widget.tsx 를 생성했고, 여기서 InstaFixWidget이라는 컴포넌트를 내보내. 내 앱의 루트 레이아웃 — Next.js App Router라면 app/layout.tsx, 다른 프레임워크라면 그에 해당하는 루트 레이아웃/루트 컴포넌트 — 에 <InstaFixWidget /> 을 추가해줘. @/components/instafix-widget 에서 import하면 되고(이 프로젝트가 @/ 별칭을 안 쓴다면 import 경로를 알맞게 조정해), 다른 전역 프로바이더들과 함께 <body> 안 어딘가에 한 번만 넣어줘 — 이 컴포넌트는 아무것도 렌더링하지 않으니(return null) 정확한 위치는 중요하지 않아. 조건문으로 감싸지 마: forceShow가 설정되지 않는 한 개발 환경 밖에서는 이미 자동으로 아무 동작도 하지 않게 되어 있어.
```

피드백은 컴포넌트 하나로 트리아지할 수 있습니다:

```tsx
import { InstaFixInbox } from "@instafix/dashboard";

<InstaFixInbox projects="my-app" endpoint="/api/instafix" theme="auto" />
```

(설치 방법은 동일합니다: `npm install github:gnoopy/instafix#dashboard-dist`)

서버가 없다면? 위젯은 `store: new LocalStorageStore()`(`github:gnoopy/instafix#adapter-localstorage-dist`)로 완전히 클라이언트 사이드에서도 동작합니다.

**InstaFix 제거하기**: 락파일과 `package.json`을 되돌리고(`git checkout -- package.json package-lock.json` 또는 사용 중인 락파일), `app/api/instafix/`와 `components/instafix-widget.tsx`를 삭제한 뒤 다시 설치하세요.

## 문서

전체 문서는 **[instafix.realstory.blog/docs](https://instafix.realstory.blog/docs)**(영어, 프랑스어, 한국어)에 있습니다 — 이 문서에 나오는 모든 옵션, 기본값, 동작은 실제 소스 코드를 기준으로 검증되어 있습니다.

| 패키지 | | 문서 |
|---|---|---|
| [`@instafix/widget`](./packages/widget) | 피드백 위젯 (프레임워크 무관 + React 훅) | [위젯](https://instafix.realstory.blog/docs/widget) · [설정](https://instafix.realstory.blog/docs/widget/configuration) · [스크린샷](https://instafix.realstory.blog/docs/widget/screenshots) |
| [`@instafix/dashboard`](./packages/dashboard) | 트리아지 인박스 컴포넌트 + 헤드리스 훅 | [대시보드](https://instafix.realstory.blog/docs/dashboard) · [테마](https://instafix.realstory.blog/docs/dashboard/theming) |
| [`@instafix/adapter-prisma`](./packages/adapter-prisma) | 프로덕션용 서버 어댑터 (인증, CORS, webhook) | [Prisma 어댑터](https://instafix.realstory.blog/docs/adapters/prisma) |
| [`@instafix/adapter-sqlite`](./packages/adapter-sqlite) | 프로덕션용 서버 어댑터, 외부 서비스 불필요 | [SQLite 어댑터](https://instafix.realstory.blog/docs/adapters/sqlite) |
| [`@instafix/adapter-fs`](./packages/adapter-fs) | DB 없음 — `.instafix/` 아래 평문 파일, 혼자 개발하는 경우용 | [파일시스템 어댑터](https://instafix.realstory.blog/docs/adapters/fs) |
| [`@instafix/adapter-memory`](./packages/adapter-memory) | 인메모리 스토어 (테스트, 데모용) | [메모리 어댑터](https://instafix.realstory.blog/docs/adapters/memory) |
| [`@instafix/adapter-localstorage`](./packages/adapter-localstorage) | 클라이언트 사이드 스토어 (서버 불필요) | [localStorage 어댑터](https://instafix.realstory.blog/docs/adapters/localstorage) |
| [`@instafix/cli`](./packages/cli) | `init` / `sync` / `status` / `doctor` | [CLI](https://instafix.realstory.blog/docs/cli) |

## 기여하기

버그 리포트, 로케일 번역, 문서 수정, 기능 추가 — 무엇이든 도움이 됩니다. 로케일 추가는 첫 PR로 가장 부담 없는 항목입니다. [CONTRIBUTING.md](./CONTRIBUTING.md)에서 시작하세요.

추가 기능(시맨틱 앵커, 스크린샷 저장소 백엔드, 포지셔닝 수정 등은 전부 포크에서 나왔습니다)을 담은 포크를 유지 중이신가요? 업스트림 PR — 혹은 무엇을 만들었는지 설명하는 이슈만이라도 — 을 남겨주시면 모두에게 도움이 됩니다.

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
