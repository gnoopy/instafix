import type { Translations } from "./types.js";

export const ko: Translations = {
  // Inbox chrome
  "inbox.regionLabel": "픽스노트 수신함",
  "inbox.listLabel": "픽스노트 목록",
  "inbox.statusFilter": "상태별 필터",
  "inbox.searchPlaceholder": "메시지 검색…",
  "inbox.searchAria": "픽스노트 검색",
  "inbox.clearSearch": "검색어 지우기",
  "inbox.resultsCount": "픽스노트 {count}개",
  "inbox.typeFilter": "유형별 필터",
  "inbox.typeAll": "모든 유형",
  "inbox.project": "프로젝트",
  "inbox.refresh": "새로고침",
  "inbox.loadMore": "더 불러오기 ({count})",

  // Empty / error states
  "inbox.emptyTitle": "아직 픽스노트가 없습니다",
  "inbox.emptySub": "위젯에서 전송된 픽스노트가 여기에 표시됩니다.",
  "inbox.emptyFilteredTitle": "표시할 항목이 없습니다",
  "inbox.emptyFilteredSub": "이 필터와 일치하는 픽스노트가 없습니다.",
  "inbox.viewAll": "전체 보기",
  "inbox.inboxZeroTitle": "모두 처리됨",
  "inbox.inboxZeroSub": "열려 있던 모든 픽스노트가 처리되었습니다.",
  "inbox.loadError": "픽스노트를 불러오지 못했습니다",
  "inbox.retry": "다시 시도",

  // Actions & toasts
  "inbox.cancel": "취소",
  "inbox.undo": "실행 취소",
  "inbox.actionFailed": "문제가 발생했습니다. 변경 사항을 되돌렸습니다.",
  "inbox.copied": "복사됨",
  "inbox.markedAs": "{status}(으)로 표시함",
  "inbox.deleted": "픽스노트가 삭제되었습니다",

  // Status labels
  "status.all": "전체",
  "status.open": "열림",
  "status.in_progress": "진행 중",
  "status.resolved": "해결됨",
  "status.wont_fix": "수정 안 함",

  // Feedback type labels
  "type.question": "질문",
  "type.change": "변경 요청",
  "type.bug": "버그",
  "type.other": "기타",

  // Drawer
  "drawer.title": "픽스노트 상세 정보",
  "drawer.close": "상세 정보 닫기",
  "drawer.openOnPage": "페이지에서 열기",
  "drawer.status": "상태",
  "drawer.author": "작성자",
  "drawer.page": "페이지",
  "drawer.viewport": "뷰포트",
  "drawer.submitted": "제출일",
  "drawer.browser": "브라우저",
  "drawer.anchor": "앵커",
  "drawer.diagnostics": "진단 정보",
  "drawer.showAllDiagnostics": "전체 보기 ({count})",
  "drawer.hideAnnotation": "주석 숨기기",
  "drawer.showAnnotation": "주석 표시",
  "drawer.screenshotAlt": "주석이 표시된 영역의 스크린샷",
  "drawer.zoomScreenshot": "스크린샷 확대",
  "drawer.noScreenshot": "이 픽스노트에는 스크린샷이 없습니다",
  "drawer.delete": "픽스노트 삭제",
  "drawer.deleteConfirm": "영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
  "drawer.deleteYes": "삭제",

  // Footer hint bar
  "hints.navigate": "탐색",
  "hints.open": "열림",
  "hints.resolve": "해결",
  "hints.inProgress": "진행 중",
  "hints.wontFix": "수정 안 함",
  "hints.help": "단축키",

  // Keyboard shortcuts overlay
  "shortcuts.title": "키보드 단축키",
  "shortcuts.close": "닫기",

  // Relative time
  "time.now": "방금",
  "time.minutes": "{n}분",
  "time.hours": "{n}시간",
  "time.days": "{n}일",
  "time.weeks": "{n}주",
  "time.month": "{n}개월",
  "time.months": "{n}개월",
  "time.year": "{n}년",
  "time.years": "{n}년",
};
