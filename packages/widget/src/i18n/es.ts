import type { Translations } from "./types.js";

export const es: Translations = {
  // Panel
  "panel.title": "Fix notes",
  "panel.ariaLabel": "Panel de fix notes de InstaFix",
  "panel.feedbackList": "Lista de fix notes",
  "panel.loading": "Cargando fix notes",
  "panel.close": "Cerrar panel",
  "panel.deleteAll": "Eliminar todo",
  "panel.deleteAllConfirmTitle": "Eliminar todo",
  "panel.deleteAllConfirmMessage": "¿Eliminar todas las fix notes de este proyecto? Esta acción no se puede deshacer.",
  "panel.deleteConfirmTitle": "Eliminar fix note",
  "panel.deleteConfirmMessage": "¿Eliminar esta fix note? Esta acción no se puede deshacer.",
  "panel.deleteConfirmBulkMessage": "¿Eliminar {count} fix note(s)? Esta acción no se puede deshacer.",
  "panel.search": "Buscar...",
  "panel.searchAria": "Buscar fix notes",
  "panel.filterAll": "Todos",
  "panel.loadError": "No se pudo cargar",
  "panel.retry": "Reintentar",
  "panel.empty": "Aún no hay fix notes",
  "panel.showMore": "Mostrar más",
  "panel.showLess": "Mostrar menos",
  "panel.resolve": "Resolver",
  "panel.reopen": "Reabrir",
  "panel.delete": "Eliminar",
  "panel.cancel": "Cancelar",
  "panel.confirmDelete": "Eliminar",
  "panel.loadMore": "Cargar más ({remaining} restantes)",
  "panel.openDashboard": "Abrir panel",

  // Status filter labels
  "panel.statusAll": "Todos",
  "panel.statusOpen": "Abierto",
  "panel.statusResolved": "Resuelto",
  "panel.statusInProgress": "En curso",
  "panel.statusWontFix": "No se corregirá",

  // Feedback type labels
  "type.label": "Tipo",
  "type.question": "Pregunta",
  "type.change": "Cambio",
  "type.bug": "Error",
  "type.other": "Otro",

  // Status segmented control label
  "status.label": "Estado",

  // Page scope segmented control
  "scope.label": "Ámbito",
  "scope.thisPage": "Esta página",
  "scope.thisType": "Este tipo",
  "scope.all": "Todas las páginas",

  // FAB toolbar
  "fab.hideTools": "Ocultar herramientas",
  "fab.showTools": "Mostrar herramientas",
  "fab.messages": "Mostrar barra lateral",
  "fab.annotate": "Crear nueva anotación",
  "fab.targeting": "Seleccionar elemento automáticamente",
  "fab.annotations": "Mostrar u ocultar marcadores",

  // Annotator
  "annotator.instruction":
    "Dibuja un rectángulo sobre el área que quieres comentar — o pulsa Intro para comentar el último elemento enfocado",
  "annotator.instantInstruction": "Comentar el punto seleccionado",
  "annotator.cancel": "Cancelar",
  "annotator.selectionCount":
    "{count} seleccionado(s) — arrastra de nuevo para añadir, o suelta sin Mayús para terminar",

  // Popup
  "popup.ariaLabel": "Formulario de fix notes",
  "popup.placeholder": "Describe tu fix note...",
  "popup.textareaAria": "Mensaje de fix note",
  "popup.submitHintMac": "⌘+Enter para enviar",
  "popup.submitHintOther": "Ctrl+Enter para enviar",
  "popup.cancel": "Cancelar",
  "popup.submit": "Enviar",
  "popup.draftRestored": "Borrador restaurado",
  "popup.discardDraft": "Descartar",
  "popup.clearMessage": "Borrar nota",
  "popup.undoClear": "Deshacer borrado",
  "popup.redoClear": "Rehacer borrado",
  "popup.copyContext": "Copiar prompt",
  "popup.copyContextCopied": "Copiado",
  "popup.copyContextFailed": "Error al copiar",

  // Identity modal
  "identity.title": "Identifícate",
  "identity.nameLabel": "Nombre",
  "identity.namePlaceholder": "Tu nombre",
  "identity.emailLabel": "Correo electrónico",
  "identity.emailPlaceholder": "tu@email.com",
  "identity.cancel": "Cancelar",
  "identity.submit": "Continuar",

  // Markers
  "marker.approximate": "Posición aproximada (confianza: {confidence}%)",
  "marker.aria": "Fix note #{number}: {type} — {message}",
  "marker.count": "{count} marcadores de feedback mostrados",

  // FAB badge
  "fab.badge": "{count} fix notes sin resolver",

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": "Fix note enviada correctamente",
  "feedback.error.message": "No se pudo enviar la fix note",
  "feedback.deleted.confirmation": "Fix note eliminada",

  // Badge
  "badge.count": "{count} fix notes sin resolver",

  // Bulk actions toolbar
  "bulk.selectAll": "Seleccionar todo",
  "bulk.selected": "{count} seleccionados",
  "bulk.resolve": "Resolver",
  "bulk.delete": "Eliminar",
  "bulk.deselect": "Deseleccionar",

  // Sort and group controls
  "sort.newest": "Más recientes",
  "sort.oldest": "Más antiguos",
  "sort.byType": "Por tipo",
  "sort.openFirst": "Abiertos primero",
  "sort.label": "Ordenar",
  "group.byPage": "Por página",
  "group.feedbacks": "{count} fix notes",

  // Stats bar
  "stats.open": "Abiertos",
  "stats.resolved": "Resueltos",
  "stats.bugs": "Errores",
  "stats.progress": "{percent}% resueltos",

  // Detail view
  "detail.back": "Atrás",
  "detail.title": "Fix note #{number}",
  "detail.status": "Estado",
  "detail.message": "Mensaje",
  "detail.editMessage": "Editar mensaje",
  "detail.saveMessage": "Guardar",
  "detail.screenshot": "Captura",
  "detail.screenshotAlt": "Captura del área anotada",
  "detail.metadata": "Detalles",
  "detail.annotation": "Anotación",
  "detail.page": "Página",
  "detail.author": "Autor",
  "detail.date": "Creado",
  "detail.viewport": "Viewport",
  "detail.browser": "Navegador",
  "detail.resolvedAt": "Resuelto el",
  "detail.closedAt": "Cerrado el",
  "detail.goToAnnotation": "Ir a la anotación",
  "detail.element": "Elemento",
  "detail.selector": "Selector",
  "detail.position": "Posición",
  "detail.targetFound": "Objetivo encontrado",
  "detail.targetApproximate": "Coincidencia aproximada (confianza del {confidence}%)",
  "detail.targetNotFound": "Objetivo no encontrado — reconecta abajo",
  "detail.reconnect": "Reconectar",
  "detail.reconnectPicking": "Haz clic en el elemento de la página…",
  "detail.reconnectCancel": "Cancelar",
  "detail.resolve": "Resolver",
  "detail.reopen": "Reabrir",
  "detail.delete": "Eliminar",
  "detail.diagnostics": "Diagnóstico",
  "detail.diagnostics.console": "Consola",
  "detail.diagnostics.network": "Red fallida",
  "detail.diagnostics.expand": "Mostrar diagnóstico",
  "detail.diagnostics.collapse": "Ocultar diagnóstico",
  "detail.diagnostics.noEntries": "Sin entradas",

  // Keyboard shortcuts overlay
  "shortcuts.title": "Atajos de teclado",
  "shortcuts.navigate": "Navegar fix notes",
  "shortcuts.resolve": "Resolver / Reabrir",
  "shortcuts.delete": "Eliminar",
  "shortcuts.search": "Buscar",
  "shortcuts.select": "Alternar selección",
  "shortcuts.help": "Mostrar atajos",
  "shortcuts.close": "Cerrar",
  "shortcuts.hint": "Atajos de teclado",

  // Export controls
  "export.label": "Exportar",
  "export.xlsx": "Exportar Excel",
  "export.json": "Exportar JSON",
  "export.failedHint": "La exportación falló — inténtalo de nuevo",

  // Copiar prompt
  "agent.copyButton": "Copiar prompt",
  "agent.scopeSelected": "{count} elemento(s) seleccionado(s)",
  "agent.scopeOpenPage": "Todos los elementos abiertos de esta página",
  "agent.handedOff": "Entregado",
  "agent.handedOffTitle": "El prompt de este elemento ya fue entregado a un agente",
  "agent.sendToAgent": "Al agente",
  "agent.sendToAgentFailed": "Entrega fallida — el servidor no la admite",
  "panel.deletedToast": "Eliminado",
  "panel.deleteUndo": "Deshacer",
  "detail.verifyFix": "Verificar corrección",
  "detail.verifyThen": "Al capturar",
  "detail.verifyNow": "Ir a la vista actual",
  "detail.verifyKeepResolved": "Corregido",
  "detail.verifyReopen": "Reabrir",
  "shortcuts.globalSection": "Global (en toda la página)",
  "shortcuts.globalPanel": "Abrir panel de feedback",
  "shortcuts.globalAnnotate": "Dibujar anotación",
  "shortcuts.globalTargeting": "Selección automática",
  "shortcuts.globalMarkers": "Alternar marcadores",
  "agent.previewTitle": "Copiar {count} elemento(s) como prompt",
  "agent.previewEmpty": "Nada que copiar todavía",
  "agent.copyAction": "Copiar",
  "agent.cancel": "Cancelar",
  "agent.copiedToast": "{count} elemento(s) copiado(s) al portapapeles",
  "agent.copyFailedHint": "La copia automática falló — selecciona el texto de abajo y cópialo manualmente",
  "agent.previewAria": "Vista previa Markdown para el agente de código",
  "detail.copyForAgent": "Copiar prompt",

  // Entrada de voz
  "voice.micLabel": "Usar entrada de voz",
  "voice.micLabelListening": "Detener entrada de voz",
  "voice.state.requestingPermission": "Solicitando acceso al micrófono…",
  "voice.state.listening": "Escuchando…",
  "voice.state.processing": "Procesando…",
  "voice.state.unsupported": "La entrada de voz no es compatible con este navegador",
  "voice.error.permissionDenied": "Acceso al micrófono denegado",
  "voice.error.noSpeech": "No se detectó voz",
  "voice.error.audioCapture": "Micrófono no disponible",
  "voice.error.network": "Error de red — inténtalo de nuevo",
  "voice.error.aborted": "Entrada de voz detenida",
  "voice.error.unknown": "Error en la entrada de voz",
  "voice.consent":
    "La entrada de voz usa el reconocimiento de voz de tu navegador — el audio puede ser procesado por tu navegador o sistema operativo.",

  // Recorrido de bienvenida
  "onboarding.step1Title": "Tus herramientas están listas",
  "onboarding.step1Body": "Los iconos junto al botón de InstaFix siempre están ahí — no hace falta hacer clic primero.",
  "onboarding.step2Title": "Selecciona cualquier cosa",
  "onboarding.step2Body": "Elige Anotar y luego haz clic o arrastra en la página para marcar lo que quieres comentar.",
  "onboarding.step3Title": "Copia para tu IA",
  "onboarding.step3Body":
    "Escribe o dicta una nota y usa «Copiar prompt» para pegar contexto listo en tu asistente de código.",
  "onboarding.next": "Siguiente",
  "onboarding.done": "Entendido",
  "onboarding.skip": "Omitir",
  "onboarding.progress": "{current}/{total}",

  // Selector de tamaño de destino (clic derecho)
  "popup.targetLabel": "Comentando sobre",
  "popup.targetElement": "Elemento",
  "popup.targetContainer": "Contenedor",
  "popup.legendLabel": "Objetivos numerados",

  // Vista previa multi-objetivo
  "annotator.targetBadgeAria": "Objetivo {number}",
  "annotator.targetPreviewAlwaysShow": "Mostrar siempre los contornos",
  "annotator.resolutionLabel": "Mostrando",
  "annotator.resolutionSummary": "Resumen",
  "annotator.resolutionDetail": "Detalle",

  // Settings panel
  "settings.title": "Configuración",
  "settings.theme": "Tema",
  "settings.themeLight": "Claro",
  "settings.themeDark": "Oscuro",
  "settings.themeAuto": "Automático",
  "settings.locale": "Idioma",
  "settings.position": "Posición",
  "settings.positionRight": "Derecha",
  "settings.positionLeft": "Izquierda",
  "settings.accentColor": "Color de acento",
  "settings.screenshots": "Capturas de pantalla",
  "settings.diagnostics": "Diagnósticos",
};
