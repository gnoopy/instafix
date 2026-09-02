/** All translatable string keys used by the widget. */
export interface Translations {
  // Panel
  "panel.title": string;
  "panel.ariaLabel": string;
  "panel.feedbackList": string;
  "panel.loading": string;
  "panel.close": string;
  "panel.deleteAll": string;
  "panel.deleteAllConfirmTitle": string;
  "panel.deleteAllConfirmMessage": string;
  "panel.deleteConfirmTitle": string;
  "panel.deleteConfirmMessage": string;
  "panel.deleteConfirmBulkMessage": string;
  "panel.search": string;
  "panel.searchAria": string;
  "panel.filterAll": string;
  "panel.loadError": string;
  "panel.retry": string;
  "panel.empty": string;
  "panel.showMore": string;
  "panel.showLess": string;
  "panel.resolve": string;
  "panel.reopen": string;
  "panel.delete": string;
  "panel.cancel": string;
  "panel.confirmDelete": string;
  "panel.loadMore": string;

  // Status filter labels
  "panel.statusAll": string;
  "panel.statusOpen": string;
  "panel.statusResolved": string;
  "panel.statusInProgress": string;
  "panel.statusWontFix": string;

  // Feedback type labels (UI display only)
  "type.label": string;
  "type.question": string;
  "type.change": string;
  "type.bug": string;
  "type.other": string;

  // Status segmented control label
  "status.label": string;

  // Page scope segmented control — keep panel results focused on the current
  // page or expand to the same template / all pages
  "scope.label": string;
  "scope.thisPage": string;
  "scope.thisType": string;
  "scope.all": string;

  // FAB toolbar
  /** aria-label on the FAB when the toolbar is visible (click to hide it). */
  "fab.hideTools": string;
  /** aria-label on the FAB when the toolbar is hidden (click to show it). */
  "fab.showTools": string;
  "fab.messages": string;
  "fab.annotate": string;
  "fab.targeting": string;
  "fab.annotations": string;

  // Annotator
  "annotator.instruction": string;
  "annotator.instantInstruction": string;
  "annotator.cancel": string;
  /** Shift-accumulate running count shown in the toolbar (G3 multi-select). */
  "annotator.selectionCount": string;

  // Popup (annotation form)
  "popup.placeholder": string;
  "popup.textareaAria": string;
  "popup.submitHintMac": string;
  "popup.submitHintOther": string;
  "popup.ariaLabel": string;
  "popup.cancel": string;
  "popup.submit": string;
  /** Shown when a previous draft is restored into the composer (G7). */
  "popup.draftRestored": string;
  "popup.discardDraft": string;
  /** Composer's "copy the full context + note as an agent prompt" button. */
  "popup.copyContext": string;
  "popup.copyContextCopied": string;
  "popup.copyContextFailed": string;

  // Identity modal
  "identity.title": string;
  "identity.nameLabel": string;
  "identity.namePlaceholder": string;
  "identity.emailLabel": string;
  "identity.emailPlaceholder": string;
  "identity.cancel": string;
  "identity.submit": string;

  // Markers
  "marker.approximate": string;
  "marker.aria": string;
  "marker.count": string;

  // FAB badge
  "fab.badge": string;

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": string;
  "feedback.error.message": string;
  "feedback.deleted.confirmation": string;

  // Badge
  "badge.count": string;

  // Bulk actions toolbar
  "bulk.selectAll": string;
  "bulk.selected": string;
  "bulk.resolve": string;
  "bulk.delete": string;
  "bulk.deselect": string;

  // Sort and group controls
  "sort.newest": string;
  "sort.oldest": string;
  "sort.byType": string;
  "sort.openFirst": string;
  "sort.label": string;
  "group.byPage": string;
  "group.feedbacks": string;

  // Stats bar
  "stats.open": string;
  "stats.resolved": string;
  "stats.bugs": string;
  "stats.progress": string;

  // Detail view
  "detail.back": string;
  "detail.title": string;
  "detail.status": string;
  "detail.message": string;
  "detail.editMessage": string;
  "detail.saveMessage": string;
  "detail.screenshot": string;
  "detail.screenshotAlt": string;
  "detail.metadata": string;
  "detail.annotation": string;
  "detail.page": string;
  "detail.author": string;
  "detail.date": string;
  "detail.viewport": string;
  "detail.browser": string;
  "detail.resolvedAt": string;
  /** Closure-date label for won't-fix feedbacks. */
  "detail.closedAt": string;
  "detail.goToAnnotation": string;
  "detail.element": string;
  "detail.selector": string;
  "detail.position": string;
  /** Target resolution status badges (G4/G7). */
  "detail.targetFound": string;
  "detail.targetApproximate": string;
  "detail.targetNotFound": string;
  "detail.reconnect": string;
  "detail.reconnectPicking": string;
  "detail.reconnectCancel": string;
  "detail.resolve": string;
  "detail.reopen": string;
  "detail.delete": string;
  "detail.diagnostics": string;
  "detail.diagnostics.console": string;
  "detail.diagnostics.network": string;
  "detail.diagnostics.expand": string;
  "detail.diagnostics.collapse": string;
  "detail.diagnostics.noEntries": string;

  // Keyboard shortcuts overlay
  "shortcuts.title": string;
  "shortcuts.navigate": string;
  "shortcuts.resolve": string;
  "shortcuts.delete": string;
  "shortcuts.search": string;
  "shortcuts.select": string;
  "shortcuts.help": string;
  "shortcuts.close": string;
  "shortcuts.hint": string;

  // Export controls
  "export.label": string;
  "export.xlsx": string;
  "export.json": string;
  "export.failedHint": string;

  // Copy for Claude Code (agent-targeted Markdown export)
  "agent.copyButton": string;
  "agent.scopeSelected": string;
  "agent.scopeOpenPage": string;
  "agent.handedOff": string;
  "agent.handedOffTitle": string;
  "agent.sendToAgent": string;
  "agent.sendToAgentFailed": string;
  "panel.deletedToast": string;
  "panel.deleteUndo": string;
  "detail.verifyFix": string;
  "detail.verifyThen": string;
  "detail.verifyNow": string;
  "detail.verifyKeepResolved": string;
  "detail.verifyReopen": string;
  "shortcuts.globalSection": string;
  "shortcuts.globalPanel": string;
  "shortcuts.globalAnnotate": string;
  "shortcuts.globalTargeting": string;
  "shortcuts.globalMarkers": string;
  "agent.previewTitle": string;
  "agent.previewEmpty": string;
  "agent.copyAction": string;
  "agent.cancel": string;
  "agent.copiedToast": string;
  "agent.copyFailedHint": string;
  "agent.previewAria": string;
  "detail.copyForAgent": string;

  // Voice input (G5)
  "voice.micLabel": string;
  "voice.micLabelListening": string;
  "voice.state.requestingPermission": string;
  "voice.state.listening": string;
  "voice.state.processing": string;
  "voice.state.unsupported": string;
  "voice.error.permissionDenied": string;
  "voice.error.noSpeech": string;
  "voice.error.audioCapture": string;
  "voice.error.network": string;
  "voice.error.aborted": string;
  "voice.error.unknown": string;
  /** Always-visible privacy note shown in place of a status caption while idle. */
  "voice.consent": string;

  // Onboarding tour (G8) — shown once to first-time users, 3 steps max.
  "onboarding.step1Title": string;
  "onboarding.step1Body": string;
  "onboarding.step2Title": string;
  "onboarding.step2Body": string;
  "onboarding.step3Title": string;
  "onboarding.step3Body": string;
  "onboarding.next": string;
  "onboarding.done": string;
  "onboarding.skip": string;
  /** e.g. "1/3" — step counter. */
  "onboarding.progress": string;

  // Right-click target-size picker (G8) — offered only when the smallest
  // element under the cursor and its nearest sized-up container differ.
  "popup.targetLabel": string;
  "popup.targetElement": string;
  "popup.targetContainer": string;
  "popup.legendLabel": string;

  // Multi-target preview (G8) — numbered on-page badges shown while composing
  // a multi-select (marquee) annotation, before submission.
  /** aria-label per badge, e.g. "Target 2". */
  "annotator.targetBadgeAria": string;
  "annotator.targetPreviewAlwaysShow": string;
  "annotator.resolutionLabel": string;
  "annotator.resolutionSummary": string;
  "annotator.resolutionDetail": string;

  // Settings panel — gear icon in the feedback list header, lets visitors
  // adjust theme/locale/position/accent/feature toggles live via
  // InstaFixInstance.updateConfig(), no host code required. Doubles as the
  // gear button's own aria-label.
  "settings.title": string;
  "settings.theme": string;
  "settings.themeLight": string;
  "settings.themeDark": string;
  "settings.themeAuto": string;
  "settings.locale": string;
  "settings.position": string;
  "settings.positionRight": string;
  "settings.positionLeft": string;
  "settings.accentColor": string;
  "settings.screenshots": string;
  "settings.diagnostics": string;
}

/** Every valid key of `Translations` as a string-literal union. */
export type TranslationKey = keyof Translations;

/** A translate function that returns the string for a given key. */
export type TFunction = (key: TranslationKey) => string;
