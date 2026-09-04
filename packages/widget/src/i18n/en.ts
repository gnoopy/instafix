import type { Translations } from "./types.js";

export const en: Translations = {
  // Panel
  "panel.title": "Fix notes",
  "panel.ariaLabel": "InstaFix fix note panel",
  "panel.feedbackList": "Fix note list",
  "panel.loading": "Loading fix notes",
  "panel.close": "Close panel",
  "panel.deleteAll": "Delete all",
  "panel.deleteAllConfirmTitle": "Delete all",
  "panel.deleteAllConfirmMessage": "Delete all fix notes for this project? This action cannot be undone.",
  "panel.deleteConfirmTitle": "Delete fix note",
  "panel.deleteConfirmMessage": "Delete this fix note? This action cannot be undone.",
  "panel.deleteConfirmBulkMessage": "Delete {count} fix note(s)? This action cannot be undone.",
  "panel.search": "Search...",
  "panel.searchAria": "Search fix notes",
  "panel.filterAll": "All",
  "panel.loadError": "Failed to load",
  "panel.retry": "Retry",
  "panel.empty": "No fix notes yet",
  "panel.showMore": "Show more",
  "panel.showLess": "Show less",
  "panel.resolve": "Resolve",
  "panel.reopen": "Reopen",
  "panel.delete": "Delete",
  "panel.cancel": "Cancel",
  "panel.confirmDelete": "Delete",
  "panel.loadMore": "Load more ({remaining} remaining)",
  "panel.openDashboard": "Open dashboard",

  // Status filter labels
  "panel.statusAll": "All",
  "panel.statusOpen": "Open",
  "panel.statusResolved": "Resolved",
  "panel.statusInProgress": "In progress",
  "panel.statusWontFix": "Won't fix",

  // Fix note type labels
  "type.label": "Type",
  "type.question": "Question",
  "type.change": "Change",
  "type.bug": "Bug",
  "type.other": "Other",

  // Status segmented control label
  "status.label": "Status",

  // Page scope segmented control
  "scope.label": "Scope",
  "scope.thisPage": "This page",
  "scope.thisType": "This type",
  "scope.all": "All pages",

  // FAB toolbar
  "fab.hideTools": "Hide tools",
  "fab.showTools": "Show tools",
  "fab.messages": "Show sidebar",
  "fab.annotate": "Create new annotation",
  "fab.targeting": "Auto-target an element",
  "fab.annotations": "Show or hide markers",

  // Annotator
  "annotator.instruction":
    "Draw a rectangle on the area to comment — or press Enter to comment on the last focused element",
  "annotator.instantInstruction": "Comment on the clicked spot",
  "annotator.cancel": "Cancel",
  "annotator.selectionCount": "{count} selected — drag again to add, or release without Shift to finish",

  // Popup
  "popup.ariaLabel": "Fix note form",
  "popup.placeholder": "Describe your fix note...",
  "popup.textareaAria": "Fix note message",
  "popup.submitHintMac": "\u2318+Enter to send",
  "popup.submitHintOther": "Ctrl+Enter to send",
  "popup.cancel": "Cancel",
  "popup.submit": "Send",
  "popup.draftRestored": "Draft restored",
  "popup.discardDraft": "Discard",
  "popup.copyContext": "Copy prompt",
  "popup.copyContextCopied": "Copied",
  "popup.copyContextFailed": "Copy failed",

  // Identity modal
  "identity.title": "Identify yourself",
  "identity.nameLabel": "Name",
  "identity.namePlaceholder": "Your name",
  "identity.emailLabel": "Email",
  "identity.emailPlaceholder": "your@email.com",
  "identity.cancel": "Cancel",
  "identity.submit": "Continue",

  // Markers
  "marker.approximate": "Approximate position (confidence: {confidence}%)",
  "marker.aria": "Fix note #{number}: {type} — {message}",
  "marker.count": "{count} fix note markers displayed",

  // FAB badge
  "fab.badge": "{count} unresolved fix notes",

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": "Fix note sent successfully",
  "feedback.error.message": "Failed to send fix note",
  "feedback.deleted.confirmation": "Fix note deleted",

  // Badge
  "badge.count": "{count} unresolved fix notes",

  // Bulk actions toolbar
  "bulk.selectAll": "Select all",
  "bulk.selected": "{count} selected",
  "bulk.resolve": "Resolve",
  "bulk.delete": "Delete",
  "bulk.deselect": "Deselect",

  // Sort and group controls
  "sort.newest": "Newest first",
  "sort.oldest": "Oldest first",
  "sort.byType": "By type",
  "sort.openFirst": "Open first",
  "sort.label": "Sort",
  "group.byPage": "By page",
  "group.feedbacks": "{count} fix notes",

  // Stats bar
  "stats.open": "Open",
  "stats.resolved": "Resolved",
  "stats.bugs": "Bugs",
  "stats.progress": "{percent}% resolved",

  // Detail view
  "detail.back": "Back",
  "detail.title": "Fix note #{number}",
  "detail.status": "Status",
  "detail.message": "Message",
  "detail.editMessage": "Edit message",
  "detail.saveMessage": "Save",
  "detail.screenshot": "Screenshot",
  "detail.screenshotAlt": "Screenshot of the annotated area",
  "detail.metadata": "Details",
  "detail.annotation": "Annotation",
  "detail.page": "Page",
  "detail.author": "Author",
  "detail.date": "Created",
  "detail.viewport": "Viewport",
  "detail.browser": "Browser",
  "detail.resolvedAt": "Resolved at",
  "detail.closedAt": "Closed at",
  "detail.goToAnnotation": "Go to annotation",
  "detail.element": "Element",
  "detail.selector": "Selector",
  "detail.position": "Position",
  "detail.targetFound": "Target found",
  "detail.targetApproximate": "Approximate match ({confidence}% confidence)",
  "detail.targetNotFound": "Target not found — reconnect below",
  "detail.reconnect": "Reconnect",
  "detail.reconnectPicking": "Click the element on the page…",
  "detail.reconnectCancel": "Cancel",
  "detail.resolve": "Resolve",
  "detail.reopen": "Reopen",
  "detail.delete": "Delete",
  "detail.diagnostics": "Diagnostics",
  "detail.diagnostics.console": "Console",
  "detail.diagnostics.network": "Failed network",
  "detail.diagnostics.expand": "Show diagnostics",
  "detail.diagnostics.collapse": "Hide diagnostics",
  "detail.diagnostics.noEntries": "No entries",

  // Keyboard shortcuts overlay
  "shortcuts.title": "Keyboard shortcuts",
  "shortcuts.navigate": "Navigate fix notes",
  "shortcuts.resolve": "Resolve / Reopen",
  "shortcuts.delete": "Delete",
  "shortcuts.search": "Focus search",
  "shortcuts.select": "Toggle selection",
  "shortcuts.help": "Show shortcuts",
  "shortcuts.close": "Close",
  "shortcuts.hint": "Keyboard shortcuts",

  // Export controls
  "export.label": "Export",
  "export.xlsx": "Export Excel",
  "export.json": "Export JSON",
  "export.failedHint": "Export failed — please try again",

  // Copy Prompt
  "agent.copyButton": "Copy Prompt",
  "agent.scopeSelected": "Selected {count} item(s)",
  "agent.scopeOpenPage": "All open items on this page",
  "agent.handedOff": "Handed off",
  "agent.handedOffTitle": "This item's prompt was already handed to an agent",
  "agent.sendToAgent": "To agent",
  "agent.sendToAgentFailed": "Handoff failed — the server doesn't support it",
  "panel.deletedToast": "Deleted",
  "panel.deleteUndo": "Undo",
  "detail.verifyFix": "Verify fix",
  "detail.verifyThen": "As captured",
  "detail.verifyNow": "Go to live view",
  "detail.verifyKeepResolved": "Looks fixed",
  "detail.verifyReopen": "Reopen",
  "shortcuts.globalSection": "Global (anywhere on the page)",
  "shortcuts.globalPanel": "Open fix note panel",
  "shortcuts.globalAnnotate": "Draw annotation",
  "shortcuts.globalTargeting": "Auto-select element",
  "shortcuts.globalMarkers": "Toggle markers",
  "agent.previewTitle": "Copy {count} item(s) as a prompt",
  "agent.previewEmpty": "Nothing to copy yet",
  "agent.copyAction": "Copy",
  "agent.cancel": "Cancel",
  "agent.copiedToast": "Copied {count} item(s) to clipboard",
  "agent.copyFailedHint": "Automatic copy failed — select the text below and copy it manually",
  "agent.previewAria": "Markdown preview for the coding agent",
  "detail.copyForAgent": "Copy Prompt",

  // Voice input
  "voice.micLabel": "Use voice input",
  "voice.micLabelListening": "Stop voice input",
  "voice.state.requestingPermission": "Requesting microphone access…",
  "voice.state.listening": "Listening…",
  "voice.state.processing": "Processing…",
  "voice.state.unsupported": "Voice input isn't supported in this browser",
  "voice.error.permissionDenied": "Microphone access denied",
  "voice.error.noSpeech": "No speech detected",
  "voice.error.audioCapture": "Microphone unavailable",
  "voice.error.network": "Network error — try again",
  "voice.error.aborted": "Voice input stopped",
  "voice.error.unknown": "Voice input failed",
  "voice.consent": "Voice uses your browser's speech recognition — audio may be processed by your browser or OS.",

  // Onboarding tour
  "onboarding.step1Title": "Your tools are ready",
  "onboarding.step1Body": "The icons next to the InstaFix button are always there — no need to click it first.",
  "onboarding.step2Title": "Select anything",
  "onboarding.step2Body": "Choose Annotate, then click or drag on the page to mark what you want to talk about.",
  "onboarding.step3Title": "Copy for your AI",
  "onboarding.step3Body":
    'Write or dictate a note, then use "Copy Prompt" to paste ready-made context into your coding assistant.',
  "onboarding.next": "Next",
  "onboarding.done": "Got it",
  "onboarding.skip": "Skip",
  "onboarding.progress": "{current}/{total}",

  // Right-click target-size picker
  "popup.targetLabel": "Commenting on",
  "popup.targetElement": "Element",
  "popup.targetContainer": "Container",
  "popup.legendLabel": "Numbered targets",

  // Multi-target preview
  "annotator.targetBadgeAria": "Target {number}",
  "annotator.targetPreviewAlwaysShow": "Always show outlines",
  "annotator.resolutionLabel": "Showing",
  "annotator.resolutionSummary": "Summary",
  "annotator.resolutionDetail": "Detail",

  // Settings panel
  "settings.title": "Settings",
  "settings.theme": "Theme",
  "settings.themeLight": "Light",
  "settings.themeDark": "Dark",
  "settings.themeAuto": "Auto",
  "settings.locale": "Language",
  "settings.position": "Position",
  "settings.positionRight": "Right",
  "settings.positionLeft": "Left",
  "settings.accentColor": "Accent color",
  "settings.screenshots": "Screenshots",
  "settings.diagnostics": "Diagnostics",
};
