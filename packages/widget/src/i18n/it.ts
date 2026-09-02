import type { Translations } from "./types.js";

/** Italian translations (it-IT). */
export const it: Translations = {
  // Panel
  "panel.title": "Feedback",
  "panel.ariaLabel": "Pannello feedback di InstaFix",
  "panel.feedbackList": "Elenco feedback",
  "panel.loading": "Caricamento feedback",
  "panel.close": "Chiudi pannello",
  "panel.deleteAll": "Elimina tutto",
  "panel.deleteAllConfirmTitle": "Elimina tutto",
  "panel.deleteAllConfirmMessage":
    "Eliminare tutti i feedback per questo progetto? Questa azione non può essere annullata.",
  "panel.deleteConfirmTitle": "Elimina feedback",
  "panel.deleteConfirmMessage": "Eliminare questo feedback? Questa azione non può essere annullata.",
  "panel.deleteConfirmBulkMessage": "Eliminare {count} feedback? Questa azione non può essere annullata.",
  "panel.search": "Cerca...",
  "panel.searchAria": "Cerca feedback",
  "panel.filterAll": "Tutti",
  "panel.loadError": "Caricamento non riuscito",
  "panel.retry": "Riprova",
  "panel.empty": "Nessun feedback ancora",
  "panel.showMore": "Mostra di più",
  "panel.showLess": "Mostra meno",
  "panel.resolve": "Risolvi",
  "panel.reopen": "Riapri",
  "panel.delete": "Elimina",
  "panel.cancel": "Annulla",
  "panel.confirmDelete": "Elimina",
  "panel.loadMore": "Carica altro ({remaining} rimanenti)",

  // Status filter labels
  "panel.statusAll": "Tutti",
  "panel.statusOpen": "Aperto",
  "panel.statusResolved": "Risolto",
  "panel.statusInProgress": "In corso",
  "panel.statusWontFix": "Non verrà corretto",

  // Feedback type labels
  "type.label": "Tipo",
  "type.question": "Domanda",
  "type.change": "Modifica",
  "type.bug": "Bug",
  "type.other": "Altro",

  // Status segmented control label
  "status.label": "Stato",

  // Page scope segmented control
  "scope.label": "Ambito",
  "scope.thisPage": "Questa pagina",
  "scope.thisType": "Questo tipo",
  "scope.all": "Tutte le pagine",

  // FAB toolbar
  "fab.hideTools": "Nascondi strumenti",
  "fab.showTools": "Mostra strumenti",
  "fab.messages": "Mostra barra laterale",
  "fab.annotate": "Crea nuova annotazione",
  "fab.targeting": "Seleziona automaticamente un elemento",
  "fab.annotations": "Mostra o nascondi i marcatori",

  // Annotator
  "annotator.instruction":
    "Disegna un rettangolo sull'area da commentare — oppure premi Invio per commentare l'ultimo elemento attivo",
  "annotator.instantInstruction": "Commenta il punto selezionato",
  "annotator.cancel": "Annulla",
  "annotator.selectionCount":
    "{count} selezionato/i — trascina di nuovo per aggiungere, o rilascia senza Maiusc per terminare",

  // Popup
  "popup.ariaLabel": "Modulo feedback",
  "popup.placeholder": "Descrivi il tuo feedback...",
  "popup.textareaAria": "Messaggio di feedback",
  "popup.submitHintMac": "⌘+Invio per inviare",
  "popup.submitHintOther": "Ctrl+Invio per inviare",
  "popup.cancel": "Annulla",
  "popup.submit": "Invia",
  "popup.draftRestored": "Bozza ripristinata",
  "popup.discardDraft": "Scarta",
  "popup.copyContext": "Copia prompt",
  "popup.copyContextCopied": "Copiato",
  "popup.copyContextFailed": "Copia non riuscita",

  // Identity modal
  "identity.title": "Identificati",
  "identity.nameLabel": "Nome",
  "identity.namePlaceholder": "Il tuo nome",
  "identity.emailLabel": "Email",
  "identity.emailPlaceholder": "tua@email.com",
  "identity.cancel": "Annulla",
  "identity.submit": "Continua",

  // Markers
  "marker.approximate": "Posizione approssimativa (confidenza: {confidence}%)",
  "marker.aria": "Feedback #{number}: {type} — {message}",
  "marker.count": "{count} marcatori di feedback visualizzati",

  // FAB badge
  "fab.badge": "{count} feedback non risolti",

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": "Feedback inviato con successo",
  "feedback.error.message": "Invio del feedback non riuscito",
  "feedback.deleted.confirmation": "Feedback eliminato",

  // Badge
  "badge.count": "{count} feedback non risolti",

  // Bulk actions toolbar
  "bulk.selectAll": "Seleziona tutto",
  "bulk.selected": "{count} selezionati",
  "bulk.resolve": "Risolvi",
  "bulk.delete": "Elimina",
  "bulk.deselect": "Deseleziona",

  // Sort and group controls
  "sort.newest": "Più recenti",
  "sort.oldest": "Più vecchi",
  "sort.byType": "Per tipo",
  "sort.openFirst": "Aperti prima",
  "sort.label": "Ordina",
  "group.byPage": "Per pagina",
  "group.feedbacks": "{count} feedback",

  // Stats bar
  "stats.open": "Aperti",
  "stats.resolved": "Risolti",
  "stats.bugs": "Bug",
  "stats.progress": "{percent}% risolti",

  // Detail view
  "detail.back": "Indietro",
  "detail.title": "Feedback #{number}",
  "detail.status": "Stato",
  "detail.message": "Messaggio",
  "detail.editMessage": "Modifica messaggio",
  "detail.saveMessage": "Salva",
  "detail.screenshot": "Schermata",
  "detail.screenshotAlt": "Schermata dell'area annotata",
  "detail.metadata": "Dettagli",
  "detail.annotation": "Annotazione",
  "detail.page": "Pagina",
  "detail.author": "Autore",
  "detail.date": "Creato",
  "detail.viewport": "Viewport",
  "detail.browser": "Browser",
  "detail.resolvedAt": "Risolto il",
  "detail.closedAt": "Chiuso il",
  "detail.goToAnnotation": "Vai all'annotazione",
  "detail.element": "Elemento",
  "detail.selector": "Selettore",
  "detail.position": "Posizione",
  "detail.targetFound": "Target trovato",
  "detail.targetApproximate": "Corrispondenza approssimativa (confidenza {confidence}%)",
  "detail.targetNotFound": "Target non trovato — riconnetti qui sotto",
  "detail.reconnect": "Riconnetti",
  "detail.reconnectPicking": "Clicca sull'elemento nella pagina…",
  "detail.reconnectCancel": "Annulla",
  "detail.resolve": "Risolvi",
  "detail.reopen": "Riapri",
  "detail.delete": "Elimina",
  "detail.diagnostics": "Diagnostica",
  "detail.diagnostics.console": "Console",
  "detail.diagnostics.network": "Rete fallita",
  "detail.diagnostics.expand": "Mostra diagnostica",
  "detail.diagnostics.collapse": "Nascondi diagnostica",
  "detail.diagnostics.noEntries": "Nessuna voce",

  // Keyboard shortcuts overlay
  "shortcuts.title": "Scorciatoie da tastiera",
  "shortcuts.navigate": "Naviga i feedback",
  "shortcuts.resolve": "Risolvi / Riapri",
  "shortcuts.delete": "Elimina",
  "shortcuts.search": "Cerca",
  "shortcuts.select": "Attiva selezione",
  "shortcuts.help": "Mostra scorciatoie",
  "shortcuts.close": "Chiudi",
  "shortcuts.hint": "Scorciatoie da tastiera",

  // Export controls
  "export.label": "Esporta",
  "export.xlsx": "Esporta Excel",
  "export.json": "Esporta JSON",
  "export.failedHint": "Esportazione non riuscita — riprova",

  // Copia prompt
  "agent.copyButton": "Copia prompt",
  "agent.scopeSelected": "{count} elemento/i selezionato/i",
  "agent.scopeOpenPage": "Tutti gli elementi aperti di questa pagina",
  "agent.handedOff": "Consegnato",
  "agent.handedOffTitle": "Il prompt di questo elemento è già stato consegnato a un agente",
  "agent.sendToAgent": "All'agente",
  "agent.sendToAgentFailed": "Consegna non riuscita — il server non la supporta",
  "panel.deletedToast": "Eliminato",
  "panel.deleteUndo": "Annulla",
  "detail.verifyFix": "Verifica la correzione",
  "detail.verifyThen": "Al momento della cattura",
  "detail.verifyNow": "Vai alla vista attuale",
  "detail.verifyKeepResolved": "Corretto",
  "detail.verifyReopen": "Riapri",
  "shortcuts.globalSection": "Globale (ovunque nella pagina)",
  "shortcuts.globalPanel": "Apri il pannello feedback",
  "shortcuts.globalAnnotate": "Disegna annotazione",
  "shortcuts.globalTargeting": "Selezione automatica",
  "shortcuts.globalMarkers": "Attiva/disattiva marcatori",
  "agent.previewTitle": "Copia {count} elemento/i come prompt",
  "agent.previewEmpty": "Niente da copiare per ora",
  "agent.copyAction": "Copia",
  "agent.cancel": "Annulla",
  "agent.copiedToast": "{count} elemento/i copiato/i negli appunti",
  "agent.copyFailedHint": "Copia automatica non riuscita — seleziona il testo qui sotto e copialo manualmente",
  "agent.previewAria": "Anteprima Markdown per l'agente di coding",
  "detail.copyForAgent": "Copia prompt",

  // Input vocale
  "voice.micLabel": "Usa input vocale",
  "voice.micLabelListening": "Ferma input vocale",
  "voice.state.requestingPermission": "Richiesta accesso al microfono…",
  "voice.state.listening": "In ascolto…",
  "voice.state.processing": "Elaborazione…",
  "voice.state.unsupported": "L'input vocale non è supportato in questo browser",
  "voice.error.permissionDenied": "Accesso al microfono negato",
  "voice.error.noSpeech": "Nessun parlato rilevato",
  "voice.error.audioCapture": "Microfono non disponibile",
  "voice.error.network": "Errore di rete — riprova",
  "voice.error.aborted": "Input vocale interrotto",
  "voice.error.unknown": "Input vocale non riuscito",
  "voice.consent":
    "L'input vocale usa il riconoscimento vocale del tuo browser — l'audio potrebbe essere elaborato dal browser o dal sistema operativo.",

  // Tour introduttivo
  "onboarding.step1Title": "I tuoi strumenti sono pronti",
  "onboarding.step1Body": "Le icone accanto al pulsante InstaFix sono sempre lì — non serve cliccarci prima.",
  "onboarding.step2Title": "Seleziona qualsiasi cosa",
  "onboarding.step2Body": "Scegli Annota, poi clicca o trascina sulla pagina per segnare ciò di cui vuoi parlare.",
  "onboarding.step3Title": "Copia per la tua IA",
  "onboarding.step3Body":
    'Scrivi o detta una nota, poi usa "Copia prompt" per incollare un contesto pronto nel tuo assistente di coding.',
  "onboarding.next": "Avanti",
  "onboarding.done": "Capito",
  "onboarding.skip": "Salta",
  "onboarding.progress": "{current}/{total}",

  // Selettore dimensione target (clic destro)
  "popup.targetLabel": "Commento su",
  "popup.targetElement": "Elemento",
  "popup.targetContainer": "Contenitore",
  "popup.legendLabel": "Obiettivi numerati",

  // Anteprima multi-target
  "annotator.targetBadgeAria": "Target {number}",
  "annotator.targetPreviewAlwaysShow": "Mostra sempre i contorni",
  "annotator.resolutionLabel": "Visualizzazione",
  "annotator.resolutionSummary": "Riepilogo",
  "annotator.resolutionDetail": "Dettaglio",

  // Settings panel
  "settings.title": "Impostazioni",
  "settings.theme": "Tema",
  "settings.themeLight": "Chiaro",
  "settings.themeDark": "Scuro",
  "settings.themeAuto": "Automatico",
  "settings.locale": "Lingua",
  "settings.position": "Posizione",
  "settings.positionRight": "Destra",
  "settings.positionLeft": "Sinistra",
  "settings.accentColor": "Colore accento",
  "settings.screenshots": "Screenshot",
  "settings.diagnostics": "Diagnostica",
};
