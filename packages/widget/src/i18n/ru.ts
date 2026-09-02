import type { Translations } from "./types.js";

export const ru: Translations = {
  // Panel
  "panel.title": "Обратная связь",
  "panel.ariaLabel": "Панель обратной связи InstaFix",
  "panel.feedbackList": "Список отзывов",
  "panel.loading": "Загрузка отзывов",
  "panel.close": "Закрыть панель",
  "panel.deleteAll": "Удалить всё",
  "panel.deleteAllConfirmTitle": "Удалить всё",
  "panel.deleteAllConfirmMessage": "Удалить все отзывы этого проекта? Это действие необратимо.",
  "panel.deleteConfirmTitle": "Удалить отзыв",
  "panel.deleteConfirmMessage": "Удалить этот отзыв? Это действие необратимо.",
  "panel.deleteConfirmBulkMessage": "Удалить {count} отзыв(ов)? Это действие необратимо.",
  "panel.search": "Поиск...",
  "panel.searchAria": "Поиск по отзывам",
  "panel.filterAll": "Все",
  "panel.loadError": "Ошибка загрузки",
  "panel.retry": "Повторить",
  "panel.empty": "Пока нет отзывов",
  "panel.showMore": "Показать больше",
  "panel.showLess": "Показать меньше",
  "panel.resolve": "Решено",
  "panel.reopen": "Открыть заново",
  "panel.delete": "Удалить",
  "panel.cancel": "Отмена",
  "panel.confirmDelete": "Удалить",
  "panel.loadMore": "Показать ещё ({remaining} осталось)",

  // Status filter labels
  "panel.statusAll": "Все",
  "panel.statusOpen": "Открыт",
  "panel.statusResolved": "Решён",
  "panel.statusInProgress": "В работе",
  "panel.statusWontFix": "Не будет исправлено",

  // Feedback type labels
  "type.label": "Тип",
  "type.question": "Вопрос",
  "type.change": "Улучшение",
  "type.bug": "Баг",
  "type.other": "Другое",

  // Status segmented control label
  "status.label": "Статус",

  // Page scope segmented control
  "scope.label": "Область",
  "scope.thisPage": "Эта страница",
  "scope.thisType": "Этот тип",
  "scope.all": "Все страницы",

  // FAB toolbar
  "fab.hideTools": "Скрыть инструменты",
  "fab.showTools": "Показать инструменты",
  "fab.messages": "Показать панель",
  "fab.annotate": "Создать аннотацию",
  "fab.targeting": "Автовыбор элемента",
  "fab.annotations": "Показать или скрыть метки",

  // Annotator
  "annotator.instruction":
    "Выделите область для комментария — или нажмите Enter, чтобы прокомментировать последний активный элемент",
  "annotator.instantInstruction": "Комментарий к выбранной точке",
  "annotator.cancel": "Отмена",
  "annotator.selectionCount":
    "Выбрано: {count} — перетащите ещё раз, чтобы добавить, или отпустите без Shift, чтобы завершить",

  // Popup
  "popup.ariaLabel": "Форма обратной связи",
  "popup.placeholder": "Опишите проблему или предложение...",
  "popup.textareaAria": "Сообщение",
  "popup.submitHintMac": "⌘+Enter — отправить",
  "popup.submitHintOther": "Ctrl+Enter — отправить",
  "popup.cancel": "Отмена",
  "popup.submit": "Отправить",
  "popup.draftRestored": "Черновик восстановлен",
  "popup.discardDraft": "Отклонить",
  "popup.copyContext": "Копировать промпт",
  "popup.copyContextCopied": "Скопировано",
  "popup.copyContextFailed": "Не удалось скопировать",

  // Identity modal
  "identity.title": "Представьтесь",
  "identity.nameLabel": "Имя",
  "identity.namePlaceholder": "Ваше имя",
  "identity.emailLabel": "Email",
  "identity.emailPlaceholder": "ваш@email.com",
  "identity.cancel": "Отмена",
  "identity.submit": "Продолжить",

  // Markers
  "marker.approximate": "Приблизительная позиция (точность: {confidence}%)",
  "marker.aria": "Отзыв #{number}: {type} — {message}",
  "marker.count": "Отображено маркеров отзывов: {count}",

  // FAB badge
  "fab.badge": "Нерешённых отзывов: {count}",

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": "Отзыв успешно отправлен",
  "feedback.error.message": "Не удалось отправить отзыв",
  "feedback.deleted.confirmation": "Отзыв удалён",

  // Badge
  "badge.count": "Нерешённых отзывов: {count}",

  // Bulk actions toolbar
  "bulk.selectAll": "Выбрать все",
  "bulk.selected": "Выбрано: {count}",
  "bulk.resolve": "Решить",
  "bulk.delete": "Удалить",
  "bulk.deselect": "Снять выбор",

  // Sort and group controls
  "sort.newest": "Сначала новые",
  "sort.oldest": "Сначала старые",
  "sort.byType": "По типу",
  "sort.openFirst": "Сначала открытые",
  "sort.label": "Сортировка",
  "group.byPage": "По странице",
  "group.feedbacks": "Отзывов: {count}",

  // Stats bar
  "stats.open": "Открытые",
  "stats.resolved": "Решённые",
  "stats.bugs": "Баги",
  "stats.progress": "Решено: {percent}%",

  // Detail view
  "detail.back": "Назад",
  "detail.title": "Отзыв #{number}",
  "detail.status": "Статус",
  "detail.message": "Сообщение",
  "detail.editMessage": "Изменить сообщение",
  "detail.saveMessage": "Сохранить",
  "detail.screenshot": "Скриншот",
  "detail.screenshotAlt": "Скриншот выделенной области",
  "detail.metadata": "Детали",
  "detail.annotation": "Аннотация",
  "detail.page": "Страница",
  "detail.author": "Автор",
  "detail.date": "Создан",
  "detail.viewport": "Viewport",
  "detail.browser": "Браузер",
  "detail.resolvedAt": "Решён",
  "detail.closedAt": "Закрыт",
  "detail.goToAnnotation": "Перейти к аннотации",
  "detail.element": "Элемент",
  "detail.selector": "Селектор",
  "detail.position": "Позиция",
  "detail.targetFound": "Цель найдена",
  "detail.targetApproximate": "Приблизительное совпадение (уверенность {confidence}%)",
  "detail.targetNotFound": "Цель не найдена — переподключите ниже",
  "detail.reconnect": "Переподключить",
  "detail.reconnectPicking": "Нажмите на элемент на странице…",
  "detail.reconnectCancel": "Отмена",
  "detail.resolve": "Решить",
  "detail.reopen": "Открыть заново",
  "detail.delete": "Удалить",
  "detail.diagnostics": "Диагностика",
  "detail.diagnostics.console": "Консоль",
  "detail.diagnostics.network": "Сетевые ошибки",
  "detail.diagnostics.expand": "Показать диагностику",
  "detail.diagnostics.collapse": "Скрыть диагностику",
  "detail.diagnostics.noEntries": "Нет записей",

  // Keyboard shortcuts overlay
  "shortcuts.title": "Горячие клавиши",
  "shortcuts.navigate": "Навигация по отзывам",
  "shortcuts.resolve": "Решить / Переоткрыть",
  "shortcuts.delete": "Удалить",
  "shortcuts.search": "Поиск",
  "shortcuts.select": "Переключить выбор",
  "shortcuts.help": "Показать клавиши",
  "shortcuts.close": "Закрыть",
  "shortcuts.hint": "Горячие клавиши",

  // Export controls
  "export.label": "Экспорт",
  "export.xlsx": "Экспорт в Excel",
  "export.json": "Экспорт в JSON",
  "export.failedHint": "Не удалось экспортировать — попробуйте ещё раз",

  // Копировать промпт
  "agent.copyButton": "Копировать промпт",
  "agent.scopeSelected": "Выбрано: {count}",
  "agent.scopeOpenPage": "Все открытые элементы этой страницы",
  "agent.handedOff": "Передано",
  "agent.handedOffTitle": "Промпт этого элемента уже передан агенту",
  "agent.sendToAgent": "Агенту",
  "agent.sendToAgentFailed": "Передача не удалась — сервер её не поддерживает",
  "panel.deletedToast": "Удалено",
  "panel.deleteUndo": "Отменить",
  "detail.verifyFix": "Проверить исправление",
  "detail.verifyThen": "На момент захвата",
  "detail.verifyNow": "К текущему виду",
  "detail.verifyKeepResolved": "Исправлено",
  "detail.verifyReopen": "Открыть заново",
  "shortcuts.globalSection": "Глобально (в любом месте страницы)",
  "shortcuts.globalPanel": "Открыть панель отзывов",
  "shortcuts.globalAnnotate": "Нарисовать аннотацию",
  "shortcuts.globalTargeting": "Автовыбор элемента",
  "shortcuts.globalMarkers": "Переключить маркеры",
  "agent.previewTitle": "Копировать {count} элемент(ов) как промпт",
  "agent.previewEmpty": "Пока нечего копировать",
  "agent.copyAction": "Копировать",
  "agent.cancel": "Отмена",
  "agent.copiedToast": "{count} элемент(ов) скопировано в буфер обмена",
  "agent.copyFailedHint": "Не удалось скопировать автоматически — выделите текст ниже и скопируйте вручную",
  "agent.previewAria": "Предпросмотр Markdown для агента",
  "detail.copyForAgent": "Копировать промпт",

  // Голосовой ввод
  "voice.micLabel": "Голосовой ввод",
  "voice.micLabelListening": "Остановить голосовой ввод",
  "voice.state.requestingPermission": "Запрос доступа к микрофону…",
  "voice.state.listening": "Слушаю…",
  "voice.state.processing": "Обработка…",
  "voice.state.unsupported": "Голосовой ввод не поддерживается этим браузером",
  "voice.error.permissionDenied": "Доступ к микрофону запрещён",
  "voice.error.noSpeech": "Речь не обнаружена",
  "voice.error.audioCapture": "Микрофон недоступен",
  "voice.error.network": "Ошибка сети — попробуйте снова",
  "voice.error.aborted": "Голосовой ввод остановлен",
  "voice.error.unknown": "Сбой голосового ввода",
  "voice.consent":
    "Голосовой ввод использует распознавание речи вашего браузера — звук может обрабатываться браузером или ОС.",

  // Ознакомительный тур
  "onboarding.step1Title": "Инструменты уже готовы",
  "onboarding.step1Body": "Значки рядом с кнопкой InstaFix видны всегда — нажимать на неё не нужно.",
  "onboarding.step2Title": "Выделите что угодно",
  "onboarding.step2Body":
    "Выберите «Аннотация», затем щёлкните или перетащите на странице, чтобы отметить то, о чём хотите рассказать.",
  "onboarding.step3Title": "Скопируйте для ИИ",
  "onboarding.step3Body":
    "Напишите или продиктуйте заметку, затем нажмите «Копировать промпт», чтобы вставить готовый контекст в вашего ИИ-ассистента.",
  "onboarding.next": "Далее",
  "onboarding.done": "Понятно",
  "onboarding.skip": "Пропустить",
  "onboarding.progress": "{current}/{total}",

  // Выбор размера цели (правый клик)
  "popup.targetLabel": "Комментарий к",
  "popup.targetElement": "Элемент",
  "popup.targetContainer": "Контейнер",
  "popup.legendLabel": "Пронумерованные цели",

  // Предпросмотр нескольких целей
  "annotator.targetBadgeAria": "Цель {number}",
  "annotator.targetPreviewAlwaysShow": "Всегда показывать контуры",
  "annotator.resolutionLabel": "Показ",
  "annotator.resolutionSummary": "Сводка",
  "annotator.resolutionDetail": "Детали",

  // Settings panel
  "settings.title": "Настройки",
  "settings.theme": "Тема",
  "settings.themeLight": "Светлая",
  "settings.themeDark": "Тёмная",
  "settings.themeAuto": "Авто",
  "settings.locale": "Язык",
  "settings.position": "Позиция",
  "settings.positionRight": "Справа",
  "settings.positionLeft": "Слева",
  "settings.accentColor": "Акцентный цвет",
  "settings.screenshots": "Скриншоты",
  "settings.diagnostics": "Диагностика",
};
