import type { Translations } from "./types.js";

/** Italian translations (it-IT). */
export const it: Translations = {
  // Inbox
  "inbox.regionLabel": "Casella dei fix note",
  "inbox.listLabel": "Elenco fix note",
  "inbox.statusFilter": "Filtra per stato",
  "inbox.searchPlaceholder": "Cerca nei messaggi…",
  "inbox.searchAria": "Cerca fix note",
  "inbox.clearSearch": "Cancella ricerca",
  "inbox.resultsCount": "{count} fix note",
  "inbox.typeFilter": "Filtra per tipo",
  "inbox.typeAll": "Tutti i tipi",
  "inbox.project": "Progetto",
  "inbox.refresh": "Aggiorna",
  "inbox.loadMore": "Carica altro ({count})",
  "inbox.emptyTitle": "Nessuna fix note ancora",
  "inbox.emptySub": "Le fix note inviate dal widget arrivano qui.",
  "inbox.emptyFilteredTitle": "Niente qui",
  "inbox.emptyFilteredSub": "Nessuna fix note corrisponde a questo filtro.",
  "inbox.viewAll": "Mostra tutto",
  "inbox.inboxZeroTitle": "Tutto in ordine",
  "inbox.inboxZeroSub": "Tutte le fix note aperte sono state gestite.",
  "inbox.loadError": "Impossibile caricare le fix note",
  "inbox.retry": "Riprova",
  "inbox.cancel": "Annulla",
  "inbox.undo": "Annulla",
  "inbox.actionFailed": "Si è verificato un errore. Modifica annullata.",
  "inbox.copied": "Copiato",
  "inbox.markedAs": "Contrassegnato come {status}",
  "inbox.deleted": "Fix note eliminata",

  // Statuses
  "status.all": "Tutti",
  "status.open": "Aperto",
  "status.in_progress": "In corso",
  "status.resolved": "Risolto",
  "status.wont_fix": "Non verrà corretto",

  // Types
  "type.question": "Domanda",
  "type.change": "Modifica",
  "type.bug": "Bug",
  "type.other": "Altro",

  // Drawer
  "drawer.title": "Dettaglio fix note",
  "drawer.close": "Chiudi dettaglio",
  "drawer.openOnPage": "Apri sulla pagina",
  "drawer.status": "Stato",
  "drawer.author": "Autore",
  "drawer.page": "Pagina",
  "drawer.viewport": "Viewport",
  "drawer.submitted": "Inviato",
  "drawer.browser": "Browser",
  "drawer.anchor": "Ancora",
  "drawer.diagnostics": "Diagnostica",
  "drawer.showAllDiagnostics": "Mostra tutto ({count})",
  "drawer.hideAnnotation": "Nascondi annotazione",
  "drawer.showAnnotation": "Mostra annotazione",
  "drawer.screenshotAlt": "Schermata dell'area annotata",
  "drawer.zoomScreenshot": "Ingrandisci schermata",
  "drawer.noScreenshot": "Nessuna schermata per questa fix note",
  "drawer.delete": "Elimina fix note",
  "drawer.deleteConfirm": "Eliminare definitivamente? Questa azione non può essere annullata.",
  "drawer.deleteYes": "Elimina",

  // Keyboard hints
  "hints.navigate": "naviga",
  "hints.open": "apri",
  "hints.resolve": "risolvi",
  "hints.inProgress": "in corso",
  "hints.wontFix": "non verrà corretto",
  "hints.help": "scorciatoie",

  // Shortcuts overlay
  "shortcuts.title": "Scorciatoie da tastiera",
  "shortcuts.close": "Chiudi",

  // Relative time
  "time.now": "adesso",
  "time.minutes": "{n} min",
  "time.hours": "{n} h",
  "time.days": "{n} g",
  "time.weeks": "{n} sett.",
  "time.month": "{n} mese",
  "time.months": "{n} mesi",
  "time.year": "{n} anno",
  "time.years": "{n} anni",
};
