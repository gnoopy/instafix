/** Generated prompt prose. Captured requests, selectors and code remain verbatim. */
import { interpolate } from "./i18n.js";

const ko = {
  "relative to viewport": "기준 뷰포트",
  "relative to target element": "기준 대상 요소",
  "UI change requests": "UI 수정 요청사항",
  "text in": "텍스트 포함 요소",
  "area (no element — page region)": "영역 (요소 없음 — 페이지 영역)",
  element: "요소",
  Quote: "인용문",
  semantic: "의미 기반 키",
  "nearby text": "주변 텍스트",
  "surrounding text": "앞뒤 텍스트",
  viewport: "뷰포트",
  "target element": "대상 요소",
  "relative to": "기준",
  Component: "컴포넌트",
  "DOM path": "DOM 경로",
  Computed: "계산된 스타일",
  Target: "대상",
  Selectors: "선택자",
  Context: "문맥",
  Bounds: "위치 및 크기",
  Targets: "대상 목록",
  Screenshot: "스크린샷",
  "Console errors/warnings (most recent last):": "콘솔 오류/경고 (최근 항목이 마지막):",
  "Failed network requests:": "실패한 네트워크 요청:",
  "network error": "네트워크 오류",
  "(no items)": "(항목 없음)",
  Page: "페이지",
  Viewport: "뷰포트",
  "Request (verbatim):": "요청사항 (원문):",
  "Target: (no anchor captured)": "대상: (기록된 기준 요소 없음)",
  "When a request is FIXED and verified, close it by its ID:":
    "요청사항을 수정하고 검증한 뒤 해당 ID로 완료 처리하세요:",
  '(or PATCH the feedback API for that ID with {"status":"resolved"})':
    '(또는 해당 ID의 피드백 API에 {"status":"resolved"}로 PATCH 요청)',
  "Review each request against the current code before making any change.":
    "변경하기 전에 각 요청사항을 현재 코드와 대조하세요.",
  "If a target is ambiguous or you can't find it in the code, report that instead of guessing.":
    "대상이 불명확하거나 코드에서 찾을 수 없으면 추측하지 말고 알리세요.",
  "Run the relevant tests after implementing each change.": "각 변경사항을 구현한 뒤 관련 테스트를 실행하세요.",
  'Component numbers are local to this region and match its inner selection badges. References such as "1", "①", or "1번" mean component 1 below. #1 refers to outer region #1, never component 1. Use selectors and context; do not renumber components or infer them from visual position.':
    '내부 요소 번호는 이 영역 안에서만 유효하며, 화면의 내부 선택 번호와 대응합니다. "1", "①", "1번"은 아래 목록의 요소 1번을 뜻합니다. #1은 바깥 영역 #1이며 내부 요소 1번이 아닙니다. 선택자와 문맥으로 요소를 식별하고, 번호를 다시 매기거나 화면 위치로 추측하지 마세요.',
  "Only target 1 is captured for this request. If the request refers to other target numbers, ask for clarification instead of guessing.":
    "이 요청에는 대상 1번만 기록되어 있습니다. 다른 대상 번호를 언급하면 추측하지 말고 확인을 요청하세요.",
  "({count} more target(s) omitted)": "(대상 {count}개 생략됨)",
  " (+{count} more)": " (외 {count}개)",
  "({count} more item(s) omitted — copy a smaller selection)": "(항목 {count}개 생략됨 — 선택 범위를 줄여 복사하세요)",
  "Region references use #N; bare numbers (1, 2, ①, 1번) identify components only inside the current region. For another region's component, write '#2 component 1'.":
    "바깥 선택 영역은 #번호로 지칭합니다. 기호 없는 번호(1, 2, ①, 1번)는 현재 영역 안의 요소 번호입니다. 다른 영역의 내부 요소는 '#2의 1번'처럼 지칭합니다.",
  "Screenshot file": "스크린샷 파일",
  "Selection bounds in screenshot": "스크린샷 안의 선택 영역 좌표",
  "Screenshot: unavailable (no image was captured or stored).":
    "스크린샷: 없음 (이미지가 캡처되거나 저장되지 않았습니다).",
  "Region #{number}: unavailable or ambiguous. Ask the user; do not guess its components or screenshot.":
    "영역 #{number}: 정보를 찾을 수 없거나 중복됩니다. 사용자에게 확인하고 요소나 스크린샷을 추측하지 마세요.",
  "Referenced region #{number} (context only)": "참조 영역 #{number} (참고 정보이며 별도 수정 요청 아님)",
  "Screenshot files are separate attachments. If a listed file is not accessible, ask the user to attach it; do not infer its contents.":
    "스크린샷 파일은 별도 첨부 자료입니다. 기재된 파일에 접근할 수 없으면 사용자에게 첨부를 요청하고 내용을 추측하지 마세요.",
} as const;

export function createPromptT(locale = "en") {
  const korean = locale.toLowerCase().split("-")[0] === "ko";
  return (key: keyof typeof ko, params: Record<string, string | number> = {}): string =>
    interpolate(korean ? ko[key] : key, params);
}
export type PromptT = ReturnType<typeof createPromptT>;
