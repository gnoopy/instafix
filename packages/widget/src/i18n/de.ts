import type { Translations } from "./types.js";

export const de: Translations = {
  // Panel
  "panel.title": "Fix Notes",
  "panel.ariaLabel": "InstaFix-Fix-Note-Panel",
  "panel.feedbackList": "Fix-Note-Liste",
  "panel.loading": "Fix Notes werden geladen",
  "panel.close": "Panel schließen",
  "panel.deleteAll": "Alle löschen",
  "panel.deleteAllConfirmTitle": "Alle löschen",
  "panel.deleteAllConfirmMessage":
    "Alle Fix Notes für dieses Projekt löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
  "panel.deleteConfirmTitle": "Fix Note löschen",
  "panel.deleteConfirmMessage": "Dieses Fix Note löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
  "panel.deleteConfirmBulkMessage": "{count} Fix Note(s) löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
  "panel.search": "Suchen...",
  "panel.searchAria": "Fix Notes suchen",
  "panel.filterAll": "Alle",
  "panel.loadError": "Laden fehlgeschlagen",
  "panel.retry": "Erneut versuchen",
  "panel.empty": "Noch keine Fix Note",
  "panel.showMore": "Mehr anzeigen",
  "panel.showLess": "Weniger anzeigen",
  "panel.resolve": "Erledigen",
  "panel.reopen": "Wieder öffnen",
  "panel.delete": "Löschen",
  "panel.cancel": "Abbrechen",
  "panel.confirmDelete": "Löschen",
  "panel.loadMore": "Mehr laden ({remaining} verbleibend)",
  "panel.openDashboard": "Dashboard öffnen",

  // Status filter labels
  "panel.statusAll": "Alle",
  "panel.statusOpen": "Offen",
  "panel.statusResolved": "Erledigt",
  "panel.statusInProgress": "In Arbeit",
  "panel.statusWontFix": "Wird nicht behoben",

  // Fix Note type labels
  "type.label": "Typ",
  "type.question": "Frage",
  "type.change": "Änderung",
  "type.bug": "Fehler",
  "type.other": "Sonstiges",

  // Status segmented control label
  "status.label": "Status",

  // Page scope segmented control
  "scope.label": "Bereich",
  "scope.thisPage": "Diese Seite",
  "scope.thisType": "Dieser Typ",
  "scope.all": "Alle Seiten",

  // FAB toolbar
  "fab.hideTools": "Werkzeuge ausblenden",
  "fab.showTools": "Werkzeuge einblenden",
  "fab.messages": "Seitenleiste anzeigen",
  "fab.annotate": "Bereich auswählen",
  "fab.targeting": "Element automatisch anvisieren",
  "fab.annotations": "Markierungen ein- oder ausblenden",
  "fab.freeze": "Seite einfrieren",
  "fab.unfreeze": "Seite freigeben",
  "fab.moveLeft": "Leiste nach links verschieben",
  "fab.moveRight": "Leiste nach rechts verschieben",

  // Annotator
  "annotator.instruction":
    "Zeichne ein Rechteck um den Bereich, den du kommentieren möchtest — oder drücke die Eingabetaste, um das zuletzt fokussierte Element zu kommentieren",
  "annotator.instantInstruction": "Kommentar zur angeklickten Stelle",
  "annotator.cancel": "Abbrechen",
  "annotator.selectionCount":
    "{count} ausgewählt — erneut ziehen zum Hinzufügen, oder ohne Umschalttaste loslassen zum Abschließen",

  // Popup
  "popup.ariaLabel": "Fix-Note-Formular",
  "popup.placeholder": "Beschreibe deine Fix Note...",
  "popup.textareaAria": "Fix-Note-Nachricht",
  "popup.submitHintMac": "⌘+Enter zum Senden",
  "popup.submitHintOther": "Strg+Enter zum Senden",
  "popup.cancel": "Abbrechen",
  "popup.submit": "Senden",
  "popup.draftRestored": "Entwurf wiederhergestellt",
  "popup.discardDraft": "Verwerfen",
  "popup.clearMessage": "Notiz löschen",
  "popup.undoClear": "Löschen rückgängig machen",
  "popup.redoClear": "Löschen wiederholen",
  "popup.copyContext": "Prompt kopieren",
  "popup.copyContextCopied": "Kopiert",
  "popup.copyContextFailed": "Kopieren fehlgeschlagen",

  // Identity modal
  "identity.title": "Identifiziere dich",
  "identity.nameLabel": "Name",
  "identity.namePlaceholder": "Dein Name",
  "identity.emailLabel": "E-Mail",
  "identity.emailPlaceholder": "deine@email.de",
  "identity.cancel": "Abbrechen",
  "identity.submit": "Fortfahren",

  // Markers
  "marker.approximate": "Ungefähre Position (Konfidenz: {confidence}%)",
  "marker.aria": "Fix Note #{number}: {type} — {message}",
  "marker.count": "{count} Fix Note-Markierungen angezeigt",

  // FAB badge
  "fab.badge": "{count} unerledigte Fix Notes",

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": "Fix Note erfolgreich gesendet",
  "feedback.error.message": "Fix Note konnte nicht gesendet werden",
  "feedback.deleted.confirmation": "Fix Note gelöscht",

  // Badge
  "badge.count": "{count} unerledigte Fix Notes",

  // Bulk actions toolbar
  "bulk.selectAll": "Alle auswählen",
  "bulk.selected": "{count} ausgewählt",
  "bulk.resolve": "Erledigen",
  "bulk.delete": "Löschen",
  "bulk.deselect": "Abwählen",

  // Sort and group controls
  "sort.newest": "Neueste zuerst",
  "sort.oldest": "Älteste zuerst",
  "sort.byType": "Nach Typ",
  "sort.openFirst": "Offene zuerst",
  "sort.label": "Sortieren",
  "group.byPage": "Nach Seite",
  "group.feedbacks": "{count} Fix Notes",

  // Stats bar
  "stats.open": "Offen",
  "stats.resolved": "Erledigt",
  "stats.bugs": "Fehler",
  "stats.progress": "{percent}% erledigt",

  // Detail view
  "detail.back": "Zurück",
  "detail.title": "Fix Note #{number}",
  "detail.status": "Status",
  "detail.message": "Nachricht",
  "detail.editMessage": "Nachricht bearbeiten",
  "detail.saveMessage": "Speichern",
  "detail.screenshot": "Screenshot",
  "detail.screenshotAlt": "Screenshot des markierten Bereichs",
  "detail.metadata": "Details",
  "detail.annotation": "Anmerkung",
  "detail.page": "Seite",
  "detail.author": "Autor",
  "detail.date": "Erstellt",
  "detail.viewport": "Viewport",
  "detail.browser": "Browser",
  "detail.resolvedAt": "Erledigt am",
  "detail.closedAt": "Geschlossen am",
  "detail.goToAnnotation": "Zur Anmerkung",
  "detail.element": "Element",
  "detail.selector": "Selektor",
  "detail.position": "Position",
  "detail.targetFound": "Ziel gefunden",
  "detail.targetApproximate": "Ungefähre Übereinstimmung ({confidence}% Konfidenz)",
  "detail.targetNotFound": "Ziel nicht gefunden — unten neu verbinden",
  "detail.reconnect": "Neu verbinden",
  "detail.reconnectPicking": "Klicke auf das Element auf der Seite…",
  "detail.reconnectCancel": "Abbrechen",
  "detail.resolve": "Erledigen",
  "detail.reopen": "Wieder öffnen",
  "detail.delete": "Löschen",
  "detail.diagnostics": "Diagnose",
  "detail.diagnostics.console": "Konsole",
  "detail.diagnostics.network": "Fehlgeschlagenes Netzwerk",
  "detail.diagnostics.expand": "Diagnose anzeigen",
  "detail.diagnostics.collapse": "Diagnose ausblenden",
  "detail.diagnostics.noEntries": "Keine Einträge",

  // Keyboard shortcuts overlay
  "shortcuts.title": "Tastenkürzel",
  "shortcuts.navigate": "Fix Notes navigieren",
  "shortcuts.resolve": "Erledigen / Wieder öffnen",
  "shortcuts.delete": "Löschen",
  "shortcuts.search": "Suche fokussieren",
  "shortcuts.select": "Auswahl umschalten",
  "shortcuts.help": "Kürzel anzeigen",
  "shortcuts.close": "Schließen",
  "shortcuts.hint": "Tastenkürzel",

  // Export controls
  "export.label": "Exportieren",
  "export.xlsx": "Excel exportieren",
  "export.json": "JSON exportieren",
  "export.failedHint": "Export fehlgeschlagen — bitte erneut versuchen",

  // Prompt kopieren
  "agent.copyButton": "Prompt kopieren",
  "agent.scopeSelected": "{count} ausgewählte(s) Element(e)",
  "agent.scopeOpenPage": "Alle offenen Einträge dieser Seite",
  "agent.scopeOpenTemplate": "Alle offenen Einträge auf diesem Seitentyp",
  "agent.scopeOpenAll": "Alle offenen Einträge über alle Seiten (Stapel)",
  "agent.handedOff": "Übergeben",
  "agent.handedOffTitle": "Der Prompt dieses Eintrags wurde bereits an einen Agenten übergeben",
  "agent.sendToAgent": "An Agent",
  "agent.sendToAgentFailed": "Übergabe fehlgeschlagen — der Server unterstützt sie nicht",
  "panel.deletedToast": "Gelöscht",
  "panel.deleteUndo": "Rückgängig",
  "detail.verifyFix": "Korrektur prüfen",
  "detail.verifyThen": "Bei der Aufnahme",
  "detail.verifyNow": "Zur Live-Ansicht",
  "detail.verifyKeepResolved": "Sieht behoben aus",
  "detail.verifyReopen": "Wieder öffnen",
  "shortcuts.globalSection": "Global (überall auf der Seite)",
  "shortcuts.globalPanel": "Fix Note-Panel öffnen",
  "shortcuts.globalAnnotate": "Annotation zeichnen",
  "shortcuts.globalTargeting": "Element automatisch wählen",
  "shortcuts.globalMarkers": "Marker umschalten",
  "agent.previewTitle": "{count} Eintrag/Einträge als Prompt kopieren",
  "agent.previewEmpty": "Noch nichts zu kopieren",
  "agent.copyAction": "Kopieren",
  "agent.cancel": "Abbrechen",
  "agent.copiedToast": "{count} Eintrag/Einträge in die Zwischenablage kopiert",
  "agent.copyFailedHint":
    "Automatisches Kopieren fehlgeschlagen — markieren Sie den Text unten und kopieren Sie ihn manuell",
  "agent.previewAria": "Markdown-Vorschau für den Coding-Agenten",
  "detail.copyForAgent": "Prompt kopieren",

  // Spracheingabe
  "voice.micLabel": "Spracheingabe verwenden",
  "voice.micLabelListening": "Spracheingabe stoppen",
  "voice.state.requestingPermission": "Mikrofonzugriff wird angefragt…",
  "voice.state.listening": "Hört zu…",
  "voice.state.processing": "Verarbeitung…",
  "voice.state.unsupported": "Spracheingabe wird in diesem Browser nicht unterstützt",
  "voice.error.permissionDenied": "Mikrofonzugriff verweigert",
  "voice.error.noSpeech": "Keine Sprache erkannt",
  "voice.error.audioCapture": "Mikrofon nicht verfügbar",
  "voice.error.network": "Netzwerkfehler — erneut versuchen",
  "voice.error.aborted": "Spracheingabe gestoppt",
  "voice.error.unknown": "Spracheingabe fehlgeschlagen",
  "voice.consent":
    "Die Spracheingabe nutzt die Spracherkennung deines Browsers — Audio kann von Browser oder Betriebssystem verarbeitet werden.",

  // Erste-Schritte-Tour
  "onboarding.step1Title": "Deine Werkzeuge sind bereit",
  "onboarding.step1Body": "Die Symbole neben dem InstaFix-Button sind immer da — kein Klick nötig, um sie zu sehen.",
  "onboarding.step2Title": "Beliebiges auswählen",
  "onboarding.step2Body":
    "Wähle Kommentieren und klicke oder ziehe dann auf der Seite, um zu markieren, worüber du sprechen möchtest.",
  "onboarding.step3Title": "Für deine KI kopieren",
  "onboarding.step3Body":
    "Schreibe oder diktiere eine Notiz und nutze dann „Prompt kopieren“, um fertigen Kontext in deinen Coding-Assistenten einzufügen.",
  "onboarding.next": "Weiter",
  "onboarding.done": "Verstanden",
  "onboarding.skip": "Überspringen",
  "onboarding.progress": "{current}/{total}",

  // Zielgrößen-Auswahl (Rechtsklick)
  "popup.targetLabel": "Kommentar zu",
  "popup.targetElement": "Element",
  "popup.targetContainer": "Container",
  "popup.legendLabel": "Nummerierte Ziele",

  // Mehrfachziel-Vorschau
  "annotator.targetBadgeAria": "Ziel {number}",
  "annotator.targetPreviewAlwaysShow": "Umrisse immer anzeigen",
  "annotator.resolutionLabel": "Anzeige",
  "annotator.resolutionSummary": "Übersicht",
  "annotator.resolutionDetail": "Detail",

  // Settings panel
  "settings.title": "Einstellungen",
  "settings.theme": "Design",
  "settings.themeLight": "Hell",
  "settings.themeDark": "Dunkel",
  "settings.themeAuto": "Automatisch",
  "settings.locale": "Sprache",
  "settings.position": "Position",
  "settings.positionRight": "Rechts",
  "settings.positionLeft": "Links",
  "settings.accentColor": "Akzentfarbe",
  "settings.screenshots": "Screenshots",
  "settings.diagnostics": "Diagnosedaten",
  "settings.requireIdentity": "Nach Identität fragen",
};
