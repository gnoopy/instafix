import type { Translations } from "./types.js";

/** Brazilian Portuguese translations (pt-BR). */
export const pt: Translations = {
  // Panel
  "panel.title": "Feedbacks",
  "panel.ariaLabel": "Painel de feedback do InstaFix",
  "panel.feedbackList": "Lista de feedbacks",
  "panel.loading": "Carregando feedbacks",
  "panel.close": "Fechar painel",
  "panel.deleteAll": "Excluir tudo",
  "panel.deleteAllConfirmTitle": "Excluir tudo",
  "panel.deleteAllConfirmMessage": "Excluir todos os feedbacks deste projeto? Esta ação não pode ser desfeita.",
  "panel.deleteConfirmTitle": "Excluir feedback",
  "panel.deleteConfirmMessage": "Excluir este feedback? Esta ação não pode ser desfeita.",
  "panel.deleteConfirmBulkMessage": "Excluir {count} feedback(s)? Esta ação não pode ser desfeita.",
  "panel.search": "Pesquisar...",
  "panel.searchAria": "Pesquisar feedbacks",
  "panel.filterAll": "Todos",
  "panel.loadError": "Falha ao carregar",
  "panel.retry": "Tentar novamente",
  "panel.empty": "Nenhum feedback ainda",
  "panel.showMore": "Mostrar mais",
  "panel.showLess": "Mostrar menos",
  "panel.resolve": "Resolver",
  "panel.reopen": "Reabrir",
  "panel.delete": "Excluir",
  "panel.cancel": "Cancelar",
  "panel.confirmDelete": "Excluir",
  "panel.loadMore": "Carregar mais ({remaining} restantes)",

  // Status filter labels
  "panel.statusAll": "Todos",
  "panel.statusOpen": "Aberto",
  "panel.statusResolved": "Resolvido",
  "panel.statusInProgress": "Em andamento",
  "panel.statusWontFix": "Não será corrigido",

  // Feedback type labels
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
  "fab.annotate": "Criar nova anotação",
  "fab.annotations": "Exibir ou ocultar marcadores",

  // Annotator
  "annotator.instruction":
    "Desenhe um retângulo na área que deseja comentar — ou pressione Enter para comentar o último elemento em foco",
  "annotator.instantInstruction": "Comentar o ponto clicado",
  "annotator.cancel": "Cancelar",
  "annotator.selectionCount":
    "{count} selecionado(s) — arraste novamente para adicionar, ou solte sem Shift para concluir",

  // Popup
  "popup.ariaLabel": "Formulário de feedback",
  "popup.placeholder": "Descreva seu feedback...",
  "popup.textareaAria": "Mensagem de feedback",
  "popup.submitHintMac": "⌘+Enter para enviar",
  "popup.submitHintOther": "Ctrl+Enter para enviar",
  "popup.cancel": "Cancelar",
  "popup.submit": "Enviar",
  "popup.draftRestored": "Rascunho restaurado",
  "popup.discardDraft": "Descartar",

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
  "marker.aria": "Feedback #{number}: {type} — {message}",
  "marker.count": "{count} marcadores de feedback exibidos",

  // FAB badge
  "fab.badge": "{count} feedbacks não resolvidos",

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": "Feedback enviado com sucesso",
  "feedback.error.message": "Falha ao enviar feedback",
  "feedback.deleted.confirmation": "Feedback excluído",

  // Badge
  "badge.count": "{count} feedbacks não resolvidos",

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
  "group.feedbacks": "{count} feedbacks",

  // Stats bar
  "stats.open": "Abertos",
  "stats.resolved": "Resolvidos",
  "stats.bugs": "Bugs",
  "stats.progress": "{percent}% resolvidos",

  // Detail view
  "detail.back": "Voltar",
  "detail.title": "Feedback #{number}",
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
  "shortcuts.navigate": "Navegar feedbacks",
  "shortcuts.resolve": "Resolver / Reabrir",
  "shortcuts.delete": "Excluir",
  "shortcuts.search": "Buscar",
  "shortcuts.select": "Alternar seleção",
  "shortcuts.help": "Mostrar atalhos",
  "shortcuts.close": "Fechar",
  "shortcuts.hint": "Atalhos de teclado",

  // Export controls
  "export.label": "Exportar",
  "export.csv": "Exportar CSV",
  "export.json": "Exportar JSON",

  // Copiar para o Claude Code
  "agent.copyButton": "Copiar para o Claude Code",
  "agent.previewTitle": "Copiar {count} item(ns) para o Claude Code",
  "agent.previewEmpty": "Nada para copiar ainda",
  "agent.copyAction": "Copiar",
  "agent.cancel": "Cancelar",
  "agent.copiedToast": "{count} item(ns) copiado(s) para a área de transferência",
  "agent.copyFailedHint": "A cópia automática falhou — selecione o texto abaixo e copie manualmente",
  "agent.previewAria": "Pré-visualização em Markdown para o agente de código",
  "detail.copyForAgent": "Copiar para o Claude Code",

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
    'Escreva ou dite uma nota e use "Copiar para o Claude Code" para colar um contexto pronto no seu assistente de código.',
  "onboarding.next": "Próximo",
  "onboarding.done": "Entendi",
  "onboarding.skip": "Pular",
  "onboarding.progress": "{current}/{total}",

  // Seletor de tamanho do alvo (clique direito)
  "popup.targetLabel": "Comentando em",
  "popup.targetElement": "Elemento",
  "popup.targetContainer": "Contêiner",

  // Pré-visualização de múltiplos alvos
  "annotator.targetBadgeAria": "Alvo {number}",
  "annotator.targetPreviewAlwaysShow": "Sempre mostrar contornos",
};
