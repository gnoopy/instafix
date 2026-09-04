import type { Translations } from "./types.js";

/** Brazilian Portuguese translations (pt-BR). */
export const pt: Translations = {
  // Panel
  "panel.title": "Fix notes",
  "panel.ariaLabel": "Painel de fix notes do InstaFix",
  "panel.feedbackList": "Lista de fix notes",
  "panel.loading": "Carregando fix notes",
  "panel.close": "Fechar painel",
  "panel.deleteAll": "Excluir tudo",
  "panel.deleteAllConfirmTitle": "Excluir tudo",
  "panel.deleteAllConfirmMessage": "Excluir todas as fix notes deste projeto? Esta ação não pode ser desfeita.",
  "panel.deleteConfirmTitle": "Excluir fix note",
  "panel.deleteConfirmMessage": "Excluir esta fix note? Esta ação não pode ser desfeita.",
  "panel.deleteConfirmBulkMessage": "Excluir {count} fix note(s)? Esta ação não pode ser desfeita.",
  "panel.search": "Pesquisar...",
  "panel.searchAria": "Pesquisar fix notes",
  "panel.filterAll": "Todos",
  "panel.loadError": "Falha ao carregar",
  "panel.retry": "Tentar novamente",
  "panel.empty": "Nenhuma fix note ainda",
  "panel.showMore": "Mostrar mais",
  "panel.showLess": "Mostrar menos",
  "panel.resolve": "Resolver",
  "panel.reopen": "Reabrir",
  "panel.delete": "Excluir",
  "panel.cancel": "Cancelar",
  "panel.confirmDelete": "Excluir",
  "panel.loadMore": "Carregar mais ({remaining} restantes)",
  "panel.openDashboard": "Abrir painel",

  // Status filter labels
  "panel.statusAll": "Todos",
  "panel.statusOpen": "Aberto",
  "panel.statusResolved": "Resolvido",
  "panel.statusInProgress": "Em andamento",
  "panel.statusWontFix": "Não será corrigido",

  // Fix note type labels
  "type.label": "Tipo",
  "type.question": "Pergunta",
  "type.change": "Alteração",
  "type.bug": "Bug",
  "type.other": "Outro",

  // Status segmented control label
  "status.label": "Status",

  // Page scope segmented control
  "scope.label": "Escopo",
  "scope.thisPage": "Esta página",
  "scope.thisType": "Este tipo",
  "scope.all": "Todas as páginas",

  // FAB toolbar
  "fab.hideTools": "Ocultar ferramentas",
  "fab.showTools": "Mostrar ferramentas",
  "fab.messages": "Exibir barra lateral",
  "fab.annotate": "Selecionar área",
  "fab.targeting": "Selecionar elemento automaticamente",
  "fab.annotations": "Exibir ou ocultar marcadores",
  "fab.moveLeft": "Mover a barra para a esquerda",
  "fab.moveRight": "Mover a barra para a direita",

  // Annotator
  "annotator.instruction":
    "Desenhe um retângulo na área que deseja comentar — ou pressione Enter para comentar o último elemento em foco",
  "annotator.instantInstruction": "Comentar o ponto clicado",
  "annotator.cancel": "Cancelar",
  "annotator.selectionCount":
    "{count} selecionado(s) — arraste novamente para adicionar, ou solte sem Shift para concluir",

  // Popup
  "popup.ariaLabel": "Formulário de fix note",
  "popup.placeholder": "Descreva sua fix note...",
  "popup.textareaAria": "Mensagem de fix note",
  "popup.submitHintMac": "⌘+Enter para enviar",
  "popup.submitHintOther": "Ctrl+Enter para enviar",
  "popup.cancel": "Cancelar",
  "popup.submit": "Enviar",
  "popup.draftRestored": "Rascunho restaurado",
  "popup.discardDraft": "Descartar",
  "popup.clearMessage": "Limpar nota",
  "popup.undoClear": "Desfazer limpeza",
  "popup.redoClear": "Refazer limpeza",
  "popup.copyContext": "Copiar prompt",
  "popup.copyContextCopied": "Copiado",
  "popup.copyContextFailed": "Falha ao copiar",

  // Identity modal
  "identity.title": "Identifique-se",
  "identity.nameLabel": "Nome",
  "identity.namePlaceholder": "Seu nome",
  "identity.emailLabel": "E-mail",
  "identity.emailPlaceholder": "seu@email.com",
  "identity.cancel": "Cancelar",
  "identity.submit": "Continuar",

  // Markers
  "marker.approximate": "Posição aproximada (confiança: {confidence}%)",
  "marker.aria": "Fix note #{number}: {type} — {message}",
  "marker.count": "{count} marcadores de fix note exibidos",

  // FAB badge
  "fab.badge": "{count} fix notes não resolvidos",

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": "Fix note enviada com sucesso",
  "feedback.error.message": "Falha ao enviar fix note",
  "feedback.deleted.confirmation": "Fix note excluído",

  // Badge
  "badge.count": "{count} fix notes não resolvidos",

  // Bulk actions toolbar
  "bulk.selectAll": "Selecionar tudo",
  "bulk.selected": "{count} selecionados",
  "bulk.resolve": "Resolver",
  "bulk.delete": "Excluir",
  "bulk.deselect": "Desmarcar",

  // Sort and group controls
  "sort.newest": "Mais recentes",
  "sort.oldest": "Mais antigos",
  "sort.byType": "Por tipo",
  "sort.openFirst": "Abertos primeiro",
  "sort.label": "Ordenar",
  "group.byPage": "Por página",
  "group.feedbacks": "{count} fix notes",

  // Stats bar
  "stats.open": "Abertos",
  "stats.resolved": "Resolvidos",
  "stats.bugs": "Bugs",
  "stats.progress": "{percent}% resolvidos",

  // Detail view
  "detail.back": "Voltar",
  "detail.title": "Fix note #{number}",
  "detail.status": "Status",
  "detail.message": "Mensagem",
  "detail.editMessage": "Editar mensagem",
  "detail.saveMessage": "Salvar",
  "detail.screenshot": "Captura",
  "detail.screenshotAlt": "Captura da área anotada",
  "detail.metadata": "Detalhes",
  "detail.annotation": "Anotação",
  "detail.page": "Página",
  "detail.author": "Autor",
  "detail.date": "Criado",
  "detail.viewport": "Viewport",
  "detail.browser": "Navegador",
  "detail.resolvedAt": "Resolvido em",
  "detail.closedAt": "Fechado em",
  "detail.goToAnnotation": "Ir para anotação",
  "detail.element": "Elemento",
  "detail.selector": "Seletor",
  "detail.position": "Posição",
  "detail.targetFound": "Alvo encontrado",
  "detail.targetApproximate": "Correspondência aproximada ({confidence}% de confiança)",
  "detail.targetNotFound": "Alvo não encontrado — reconecte abaixo",
  "detail.reconnect": "Reconectar",
  "detail.reconnectPicking": "Clique no elemento da página…",
  "detail.reconnectCancel": "Cancelar",
  "detail.resolve": "Resolver",
  "detail.reopen": "Reabrir",
  "detail.delete": "Excluir",
  "detail.diagnostics": "Diagnóstico",
  "detail.diagnostics.console": "Console",
  "detail.diagnostics.network": "Rede com falha",
  "detail.diagnostics.expand": "Mostrar diagnóstico",
  "detail.diagnostics.collapse": "Ocultar diagnóstico",
  "detail.diagnostics.noEntries": "Sem entradas",

  // Keyboard shortcuts overlay
  "shortcuts.title": "Atalhos de teclado",
  "shortcuts.navigate": "Navegar fix notes",
  "shortcuts.resolve": "Resolver / Reabrir",
  "shortcuts.delete": "Excluir",
  "shortcuts.search": "Buscar",
  "shortcuts.select": "Alternar seleção",
  "shortcuts.help": "Mostrar atalhos",
  "shortcuts.close": "Fechar",
  "shortcuts.hint": "Atalhos de teclado",

  // Export controls
  "export.label": "Exportar",
  "export.xlsx": "Exportar Excel",
  "export.json": "Exportar JSON",
  "export.failedHint": "A exportação falhou — tente novamente",

  // Copiar prompt
  "agent.copyButton": "Copiar prompt",
  "agent.scopeSelected": "{count} item(ns) selecionado(s)",
  "agent.scopeOpenPage": "Todos os itens abertos desta página",
  "agent.handedOff": "Entregue",
  "agent.handedOffTitle": "O prompt deste item já foi entregue a um agente",
  "agent.sendToAgent": "Ao agente",
  "agent.sendToAgentFailed": "Falha na entrega — o servidor não oferece suporte",
  "panel.deletedToast": "Excluído",
  "panel.deleteUndo": "Desfazer",
  "detail.verifyFix": "Verificar correção",
  "detail.verifyThen": "No momento da captura",
  "detail.verifyNow": "Ir para a visão atual",
  "detail.verifyKeepResolved": "Corrigido",
  "detail.verifyReopen": "Reabrir",
  "shortcuts.globalSection": "Global (em toda a página)",
  "shortcuts.globalPanel": "Abrir painel de fix note",
  "shortcuts.globalAnnotate": "Desenhar anotação",
  "shortcuts.globalTargeting": "Seleção automática",
  "shortcuts.globalMarkers": "Alternar marcadores",
  "agent.previewTitle": "Copiar {count} item(ns) como prompt",
  "agent.previewEmpty": "Nada para copiar ainda",
  "agent.copyAction": "Copiar",
  "agent.cancel": "Cancelar",
  "agent.copiedToast": "{count} item(ns) copiado(s) para a área de transferência",
  "agent.copyFailedHint": "A cópia automática falhou — selecione o texto abaixo e copie manualmente",
  "agent.previewAria": "Pré-visualização em Markdown para o agente de código",
  "detail.copyForAgent": "Copiar prompt",

  // Entrada de voz
  "voice.micLabel": "Usar entrada de voz",
  "voice.micLabelListening": "Parar entrada de voz",
  "voice.state.requestingPermission": "Solicitando acesso ao microfone…",
  "voice.state.listening": "Ouvindo…",
  "voice.state.processing": "Processando…",
  "voice.state.unsupported": "Entrada de voz não é compatível com este navegador",
  "voice.error.permissionDenied": "Acesso ao microfone negado",
  "voice.error.noSpeech": "Nenhuma fala detectada",
  "voice.error.audioCapture": "Microfone indisponível",
  "voice.error.network": "Erro de rede — tente novamente",
  "voice.error.aborted": "Entrada de voz interrompida",
  "voice.error.unknown": "Falha na entrada de voz",
  "voice.consent":
    "A entrada de voz usa o reconhecimento de voz do seu navegador — o áudio pode ser processado pelo navegador ou sistema operacional.",

  // Tour de boas-vindas
  "onboarding.step1Title": "Suas ferramentas estão prontas",
  "onboarding.step1Body": "Os ícones ao lado do botão do InstaFix estão sempre ali — não precisa clicar antes.",
  "onboarding.step2Title": "Selecione qualquer coisa",
  "onboarding.step2Body": "Escolha Anotar e depois clique ou arraste na página para marcar o que você quer comentar.",
  "onboarding.step3Title": "Copie para sua IA",
  "onboarding.step3Body":
    'Escreva ou dite uma nota e use "Copiar prompt" para colar um contexto pronto no seu assistente de código.',
  "onboarding.next": "Próximo",
  "onboarding.done": "Entendi",
  "onboarding.skip": "Pular",
  "onboarding.progress": "{current}/{total}",

  // Seletor de tamanho do alvo (clique direito)
  "popup.targetLabel": "Comentando em",
  "popup.targetElement": "Elemento",
  "popup.targetContainer": "Contêiner",
  "popup.legendLabel": "Alvos numerados",

  // Pré-visualização de múltiplos alvos
  "annotator.targetBadgeAria": "Alvo {number}",
  "annotator.targetPreviewAlwaysShow": "Sempre mostrar contornos",
  "annotator.resolutionLabel": "Exibindo",
  "annotator.resolutionSummary": "Resumo",
  "annotator.resolutionDetail": "Detalhe",

  // Settings panel
  "settings.title": "Configurações",
  "settings.theme": "Tema",
  "settings.themeLight": "Claro",
  "settings.themeDark": "Escuro",
  "settings.themeAuto": "Automático",
  "settings.locale": "Idioma",
  "settings.position": "Posição",
  "settings.positionRight": "Direita",
  "settings.positionLeft": "Esquerda",
  "settings.accentColor": "Cor de destaque",
  "settings.screenshots": "Capturas de tela",
  "settings.diagnostics": "Diagnósticos",
};
