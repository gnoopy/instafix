import { InstaFixIdentity, InstaFixConfig, InstaFixInstance } from './instafix-core.cjs';
export { AnchorData, AnnotationPayload, AnnotationResponse, FeedbackPayload, FeedbackResponse, FeedbackStatus, FeedbackType, InstaFixConfig, InstaFixHeadersOption, InstaFixHttpConfig, InstaFixInstance, InstaFixLocale, InstaFixPublicEvents, InstaFixStore, InstaFixStoreConfig, RectData } from './instafix-core.cjs';

/** All translatable string keys used by the widget. */
interface Translations {
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
    /** aria-label + visible label on the header button that opens the dashboard (`config.dashboardUrl`) in a new tab. Only rendered when that option is set. */
    "panel.openDashboard": string;
    "panel.statusAll": string;
    "panel.statusOpen": string;
    "panel.statusResolved": string;
    "panel.statusInProgress": string;
    "panel.statusWontFix": string;
    "type.label": string;
    "type.question": string;
    "type.change": string;
    "type.bug": string;
    "type.other": string;
    "status.label": string;
    "scope.label": string;
    "scope.thisPage": string;
    "scope.thisType": string;
    "scope.all": string;
    /** aria-label on the FAB when the toolbar is visible (click to hide it). */
    "fab.hideTools": string;
    /** aria-label on the FAB when the toolbar is hidden (click to show it). */
    "fab.showTools": string;
    "fab.messages": string;
    "fab.annotate": string;
    "fab.targeting": string;
    "fab.annotations": string;
    "fab.freeze": string;
    "fab.unfreeze": string;
    "fab.moveLeft": string;
    "fab.moveRight": string;
    "annotator.instruction": string;
    "annotator.instantInstruction": string;
    "annotator.cancel": string;
    /** Shift-accumulate running count shown in the toolbar (G3 multi-select). */
    "annotator.selectionCount": string;
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
    /** aria-label on the small icon button that clears the note textarea in one click. */
    "popup.clearMessage": string;
    /** aria-label on the button that restores the textarea content after clearMessage — enabled only right after a clear. */
    "popup.undoClear": string;
    /** aria-label on the button that re-applies a clearMessage after undoClear — enabled only right after an undo. */
    "popup.redoClear": string;
    /** Composer's "copy the full context + note as an agent prompt" button. */
    "popup.copyContext": string;
    "popup.copyContextCopied": string;
    "popup.copyContextFailed": string;
    "identity.title": string;
    "identity.nameLabel": string;
    "identity.namePlaceholder": string;
    "identity.emailLabel": string;
    "identity.emailPlaceholder": string;
    "identity.cancel": string;
    "identity.submit": string;
    "marker.approximate": string;
    "marker.aria": string;
    "marker.count": string;
    "fab.badge": string;
    "feedback.sent.confirmation": string;
    "feedback.error.message": string;
    "feedback.deleted.confirmation": string;
    "badge.count": string;
    "bulk.selectAll": string;
    "bulk.selected": string;
    "bulk.resolve": string;
    "bulk.delete": string;
    "bulk.deselect": string;
    "sort.newest": string;
    "sort.oldest": string;
    "sort.byType": string;
    "sort.openFirst": string;
    "sort.label": string;
    "group.byPage": string;
    "group.feedbacks": string;
    "stats.open": string;
    "stats.resolved": string;
    "stats.bugs": string;
    "stats.progress": string;
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
    "shortcuts.title": string;
    "shortcuts.navigate": string;
    "shortcuts.resolve": string;
    "shortcuts.delete": string;
    "shortcuts.search": string;
    "shortcuts.select": string;
    "shortcuts.help": string;
    "shortcuts.close": string;
    "shortcuts.hint": string;
    "export.label": string;
    "export.xlsx": string;
    "export.json": string;
    "export.failedHint": string;
    "agent.copyButton": string;
    "agent.scopeSelected": string;
    "agent.scopeOpenPage": string;
    "agent.scopeOpenTemplate": string;
    "agent.scopeOpenAll": string;
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
    "popup.targetLabel": string;
    "popup.targetElement": string;
    "popup.targetContainer": string;
    "popup.legendLabel": string;
    /** aria-label per badge, e.g. "Target 2". */
    "annotator.targetBadgeAria": string;
    "annotator.targetPreviewAlwaysShow": string;
    "annotator.resolutionLabel": string;
    "annotator.resolutionSummary": string;
    "annotator.resolutionDetail": string;
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
type TranslationKey = keyof Translations;
/** A translate function that returns the string for a given key. */
type TFunction = (key: TranslationKey) => string;

/**
 * Register a custom locale at runtime. Partial dictionaries are welcome —
 * missing keys fall back to English per key, so overriding a single string
 * never requires copying the whole catalog.
 */
declare const registerLocale: (code: string, translations: Partial<Translations>) => void;
/**
 * Dynamically import a built-in locale and register it. Returns the loaded
 * translations or `null` if the locale isn't a known built-in. Custom
 * locales registered via {@link registerLocale} bypass this loader.
 */
declare const loadLocale: (locale: string) => Promise<Partial<Translations> | null>;

/**
 * Author identity persisted by the widget — alias of core's
 * `InstaFixIdentity` (one concept, one shape; the alias keeps the widget's
 * historical export name working).
 */
type Identity = InstaFixIdentity;

/**
 * Initialize the InstaFix feedback widget.
 *
 * @example
 * ```ts
 * import { initInstaFix } from '@instafix/widget'
 *
 * const { destroy } = initInstaFix({
 *   endpoint: '/api/instafix',
 *   projectName: 'my-project',
 * })
 * ```
 */
declare function initInstaFix(config: InstaFixConfig): InstaFixInstance;

export { type Identity, type TFunction, type TranslationKey, type Translations, initInstaFix, loadLocale, registerLocale };
