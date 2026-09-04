import type { Translations } from "./types.js";

export const ko: Translations = {
  // Panel
  "panel.title": "픽스노트",
  "panel.ariaLabel": "InstaFix 픽스노트 패널",
  "panel.feedbackList": "픽스노트 목록",
  "panel.loading": "픽스노트를 불러오는 중",
  "panel.close": "패널 닫기",
  "panel.deleteAll": "전체 삭제",
  "panel.deleteAllConfirmTitle": "전체 삭제",
  "panel.deleteAllConfirmMessage": "이 프로젝트의 모든 픽스노트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
  "panel.deleteConfirmTitle": "픽스노트 삭제",
  "panel.deleteConfirmMessage": "이 픽스노트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
  "panel.deleteConfirmBulkMessage": "픽스노트 {count}개를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
  "panel.search": "검색...",
  "panel.searchAria": "픽스노트 검색",
  "panel.filterAll": "전체",
  "panel.loadError": "불러오기 실패",
  "panel.retry": "다시 시도",
  "panel.empty": "아직 픽스노트가 없습니다",
  "panel.showMore": "더 보기",
  "panel.showLess": "간략히 보기",
  "panel.resolve": "해결",
  "panel.reopen": "다시 열기",
  "panel.delete": "삭제",
  "panel.cancel": "취소",
  "panel.confirmDelete": "삭제",
  "panel.loadMore": "더 불러오기 (남은 {remaining}개)",
  "panel.openDashboard": "대시보드 열기",

  // Status filter labels
  "panel.statusAll": "전체",
  "panel.statusOpen": "열림",
  "panel.statusResolved": "해결됨",
  "panel.statusInProgress": "진행 중",
  "panel.statusWontFix": "수정 안 함",

  // Feedback type labels
  "type.label": "유형",
  "type.question": "질문",
  "type.change": "변경 요청",
  "type.bug": "버그",
  "type.other": "기타",

  // Status segmented control label
  "status.label": "상태",

  // Page scope segmented control
  "scope.label": "범위",
  "scope.thisPage": "이 페이지",
  "scope.thisType": "이 유형",
  "scope.all": "모든 페이지",

  // FAB toolbar
  "fab.hideTools": "도구 숨기기",
  "fab.showTools": "도구 표시",
  "fab.messages": "사이드바 표시",
  "fab.annotate": "새 주석 만들기",
  "fab.targeting": "요소 자동 선택",
  "fab.annotations": "마커 표시/숨기기",

  // Annotator
  "annotator.instruction":
    "픽스노트를 남길 영역에 사각형을 그리세요. 방금 포커스한 요소에 픽스노트를 남기려면 Enter 키를 누르세요",
  "annotator.instantInstruction": "클릭한 지점에 픽스노트 남기기",
  "annotator.cancel": "취소",
  "annotator.selectionCount": "{count}개 선택됨 — 계속 추가하려면 다시 드래그하고, 완료하려면 Shift 없이 놓으세요",

  // Popup
  "popup.ariaLabel": "픽스노트 작성 양식",
  "popup.placeholder": "픽스노트 내용을 입력하세요...",
  "popup.textareaAria": "픽스노트 메시지",
  "popup.submitHintMac": "⌘+Enter로 전송",
  "popup.submitHintOther": "Ctrl+Enter로 전송",
  "popup.cancel": "취소",
  "popup.submit": "보내기",
  "popup.draftRestored": "임시 저장된 내용을 복원했습니다",
  "popup.discardDraft": "삭제",
  "popup.copyContext": "프롬프트 복사",
  "popup.copyContextCopied": "복사됨",
  "popup.copyContextFailed": "복사 실패",

  // Identity modal
  "identity.title": "본인 확인",
  "identity.nameLabel": "이름",
  "identity.namePlaceholder": "이름을 입력하세요",
  "identity.emailLabel": "이메일",
  "identity.emailPlaceholder": "your@email.com",
  "identity.cancel": "취소",
  "identity.submit": "계속",

  // Markers
  "marker.approximate": "근사 위치입니다 (신뢰도: {confidence}%)",
  "marker.aria": "픽스노트 #{number}: {type} — {message}",
  "marker.count": "픽스노트 마커 {count}개 표시됨",

  // FAB badge
  "fab.badge": "미해결 픽스노트 {count}개",

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": "픽스노트가 성공적으로 전송되었습니다",
  "feedback.error.message": "픽스노트 전송에 실패했습니다",
  "feedback.deleted.confirmation": "픽스노트가 삭제되었습니다",

  // Badge
  "badge.count": "미해결 픽스노트 {count}개",

  // Bulk actions toolbar
  "bulk.selectAll": "전체 선택",
  "bulk.selected": "{count}개 선택됨",
  "bulk.resolve": "해결",
  "bulk.delete": "삭제",
  "bulk.deselect": "선택 해제",

  // Sort and group controls
  "sort.newest": "최신순",
  "sort.oldest": "오래된순",
  "sort.byType": "유형별",
  "sort.openFirst": "열림 우선",
  "sort.label": "정렬",
  "group.byPage": "페이지별",
  "group.feedbacks": "픽스노트 {count}개",

  // Stats bar
  "stats.open": "열림",
  "stats.resolved": "해결됨",
  "stats.bugs": "버그",
  "stats.progress": "{percent}% 해결됨",

  // Detail view
  "detail.back": "뒤로",
  "detail.title": "픽스노트 #{number}",
  "detail.status": "상태",
  "detail.message": "메시지",
  "detail.editMessage": "메시지 수정",
  "detail.saveMessage": "저장",
  "detail.screenshot": "스크린샷",
  "detail.screenshotAlt": "주석이 표시된 영역의 스크린샷",
  "detail.metadata": "세부 정보",
  "detail.annotation": "주석",
  "detail.page": "페이지",
  "detail.author": "작성자",
  "detail.date": "생성일",
  "detail.viewport": "뷰포트",
  "detail.browser": "브라우저",
  "detail.resolvedAt": "해결 일시",
  "detail.closedAt": "종료 일시",
  "detail.goToAnnotation": "주석으로 이동",
  "detail.element": "요소",
  "detail.selector": "선택자",
  "detail.position": "위치",
  "detail.targetFound": "대상을 찾았습니다",
  "detail.targetApproximate": "근사 일치 (신뢰도 {confidence}%)",
  "detail.targetNotFound": "대상을 찾을 수 없습니다 — 아래에서 다시 연결하세요",
  "detail.reconnect": "다시 연결",
  "detail.reconnectPicking": "페이지에서 요소를 클릭하세요…",
  "detail.reconnectCancel": "취소",
  "detail.resolve": "해결",
  "detail.reopen": "다시 열기",
  "detail.delete": "삭제",
  "detail.diagnostics": "진단 정보",
  "detail.diagnostics.console": "콘솔",
  "detail.diagnostics.network": "실패한 네트워크 요청",
  "detail.diagnostics.expand": "진단 정보 표시",
  "detail.diagnostics.collapse": "진단 정보 숨기기",
  "detail.diagnostics.noEntries": "항목 없음",

  // Keyboard shortcuts overlay
  "shortcuts.title": "키보드 단축키",
  "shortcuts.navigate": "픽스노트 탐색",
  "shortcuts.resolve": "해결 / 다시 열기",
  "shortcuts.delete": "삭제",
  "shortcuts.search": "검색으로 이동",
  "shortcuts.select": "선택 전환",
  "shortcuts.help": "단축키 보기",
  "shortcuts.close": "닫기",
  "shortcuts.hint": "키보드 단축키",

  // Export controls
  "export.label": "내보내기",
  "export.xlsx": "Excel로 내보내기",
  "export.json": "JSON으로 내보내기",
  "export.failedHint": "내보내기에 실패했습니다 — 다시 시도해 주세요",

  // Copy Prompt
  "agent.copyButton": "프롬프트 복사",
  "agent.scopeSelected": "선택한 {count}건",
  "agent.scopeOpenPage": "이 페이지의 열린 항목 전체",
  "agent.handedOff": "전달됨",
  "agent.handedOffTitle": "이 항목의 프롬프트가 이미 에이전트에 전달되었습니다",
  "agent.sendToAgent": "Agent에게",
  "agent.sendToAgentFailed": "전달 실패 — 서버가 handoff를 지원하지 않습니다",
  "panel.deletedToast": "삭제됨",
  "panel.deleteUndo": "실행취소",
  "detail.verifyFix": "수정 확인하기",
  "detail.verifyThen": "캡처 당시",
  "detail.verifyNow": "현재 화면으로 이동",
  "detail.verifyKeepResolved": "확인 완료",
  "detail.verifyReopen": "재열기",
  "shortcuts.globalSection": "전역 (페이지 어디서나)",
  "shortcuts.globalPanel": "픽스노트 목록 열기",
  "shortcuts.globalAnnotate": "주석 그리기",
  "shortcuts.globalTargeting": "요소 자동 선택",
  "shortcuts.globalMarkers": "마커 표시 토글",
  "agent.previewTitle": "{count}개 항목을 프롬프트로 복사",
  "agent.previewEmpty": "아직 복사할 내용이 없습니다",
  "agent.copyAction": "복사",
  "agent.cancel": "취소",
  "agent.copiedToast": "{count}개 항목을 클립보드에 복사했습니다",
  "agent.copyFailedHint": "자동 복사에 실패했습니다 — 아래 텍스트를 선택해 직접 복사하세요",
  "agent.previewAria": "코딩 에이전트용 마크다운 미리보기",
  "detail.copyForAgent": "프롬프트 복사",

  // Voice input
  "voice.micLabel": "음성 입력 사용",
  "voice.micLabelListening": "음성 입력 중지",
  "voice.state.requestingPermission": "마이크 접근 권한을 요청하는 중…",
  "voice.state.listening": "듣는 중…",
  "voice.state.processing": "처리하는 중…",
  "voice.state.unsupported": "이 브라우저에서는 음성 입력을 지원하지 않습니다",
  "voice.error.permissionDenied": "마이크 접근이 거부되었습니다",
  "voice.error.noSpeech": "음성이 감지되지 않았습니다",
  "voice.error.audioCapture": "마이크를 사용할 수 없습니다",
  "voice.error.network": "네트워크 오류 — 다시 시도하세요",
  "voice.error.aborted": "음성 입력이 중지되었습니다",
  "voice.error.unknown": "음성 입력에 실패했습니다",
  "voice.consent":
    "음성 입력은 브라우저의 음성 인식 기능을 사용하며, 오디오가 브라우저 또는 OS에서 처리될 수 있습니다.",

  // Onboarding tour
  "onboarding.step1Title": "도구가 준비되었습니다",
  "onboarding.step1Body": "InstaFix 버튼 옆의 아이콘은 항상 표시되어 있어 버튼을 먼저 누를 필요가 없습니다.",
  "onboarding.step2Title": "원하는 곳을 선택하세요",
  "onboarding.step2Body": "주석 달기를 선택한 다음, 이야기하고 싶은 부분을 클릭하거나 드래그해 표시하세요.",
  "onboarding.step3Title": "AI를 위해 복사하세요",
  "onboarding.step3Body":
    '메모를 작성하거나 음성으로 입력한 후 "프롬프트 복사"를 눌러 코딩 어시스턴트에 바로 붙여넣을 수 있는 컨텍스트를 준비하세요.',
  "onboarding.next": "다음",
  "onboarding.done": "확인",
  "onboarding.skip": "건너뛰기",
  "onboarding.progress": "{current}/{total}",

  // Right-click target-size picker
  "popup.targetLabel": "픽스노트 대상",
  "popup.targetElement": "요소",
  "popup.targetContainer": "컨테이너",
  "popup.legendLabel": "번호가 매겨진 대상",

  // Multi-target preview
  "annotator.targetBadgeAria": "대상 {number}",
  "annotator.targetPreviewAlwaysShow": "항상 윤곽선 표시",
  "annotator.resolutionLabel": "표시",
  "annotator.resolutionSummary": "요약",
  "annotator.resolutionDetail": "상세",

  // Settings panel
  "settings.title": "설정",
  "settings.theme": "테마",
  "settings.themeLight": "라이트",
  "settings.themeDark": "다크",
  "settings.themeAuto": "자동",
  "settings.locale": "언어",
  "settings.position": "위치",
  "settings.positionRight": "오른쪽",
  "settings.positionLeft": "왼쪽",
  "settings.accentColor": "강조색",
  "settings.screenshots": "스크린샷",
  "settings.diagnostics": "진단정보",
};
