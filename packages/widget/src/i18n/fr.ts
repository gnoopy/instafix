import type { Translations } from "./types.js";

export const fr: Translations = {
  // Panel
  "panel.title": "Feedbacks",
  "panel.ariaLabel": "Panneau de feedback InstaFix",
  "panel.feedbackList": "Liste des feedbacks",
  "panel.loading": "Chargement des feedbacks",
  "panel.close": "Fermer le panneau",
  "panel.deleteAll": "Tout supprimer",
  "panel.deleteAllConfirmTitle": "Tout supprimer",
  "panel.deleteAllConfirmMessage": "Supprimer tous les feedbacks de ce projet ? Cette action est irr\u00e9versible.",
  "panel.deleteConfirmTitle": "Supprimer le feedback",
  "panel.deleteConfirmMessage": "Supprimer ce feedback ? Cette action est irr\u00e9versible.",
  "panel.deleteConfirmBulkMessage": "Supprimer {count} feedback(s) ? Cette action est irr\u00e9versible.",
  "panel.search": "Rechercher...",
  "panel.searchAria": "Rechercher dans les feedbacks",
  "panel.filterAll": "Tous",
  "panel.loadError": "Erreur de chargement",
  "panel.retry": "R\u00e9essayer",
  "panel.empty": "Aucun feedback pour le moment",
  "panel.showMore": "Voir plus",
  "panel.showLess": "Voir moins",
  "panel.resolve": "R\u00e9soudre",
  "panel.reopen": "Rouvrir",
  "panel.delete": "Supprimer",
  "panel.cancel": "Annuler",
  "panel.confirmDelete": "Supprimer",
  "panel.loadMore": "Voir plus ({remaining} restants)",

  // Status filter labels
  "panel.statusAll": "Tous",
  "panel.statusOpen": "Ouvert",
  "panel.statusResolved": "Résolu",
  "panel.statusInProgress": "En cours",
  "panel.statusWontFix": "Sans suite",

  // Feedback type labels
  "type.label": "Type",
  "type.question": "Question",
  "type.change": "Changement",
  "type.bug": "Bug",
  "type.other": "Autre",

  // Status segmented control label
  "status.label": "Statut",

  // Page scope segmented control
  "scope.label": "Portée",
  "scope.thisPage": "Cette page",
  "scope.thisType": "Ce type",
  "scope.all": "Toutes les pages",

  // FAB toolbar
  "fab.hideTools": "Masquer les outils",
  "fab.showTools": "Afficher les outils",
  "fab.messages": "Afficher la barre latérale",
  "fab.annotate": "Créer une nouvelle annotation",
  "fab.targeting": "Cibler un élément automatiquement",
  "fab.annotations": "Afficher ou masquer les marqueurs",

  // Annotator
  "annotator.instruction":
    "Tracez un rectangle sur la zone \u00e0 commenter \u2014 ou appuyez sur Entr\u00e9e pour commenter le dernier \u00e9l\u00e9ment actif",
  "annotator.instantInstruction": "Commenter l'endroit cliqu\u00e9",
  "annotator.cancel": "Annuler",
  "annotator.selectionCount":
    "{count} sélectionné(s) — faites glisser à nouveau pour ajouter, ou relâchez sans Maj pour terminer",

  // Popup
  "popup.ariaLabel": "Formulaire de feedback",
  "popup.placeholder": "D\u00e9crivez votre retour...",
  "popup.textareaAria": "Message de feedback",
  "popup.submitHintMac": "\u2318+Entr\u00e9e pour envoyer",
  "popup.submitHintOther": "Ctrl+Entr\u00e9e pour envoyer",
  "popup.cancel": "Annuler",
  "popup.submit": "Envoyer",
  "popup.draftRestored": "Brouillon restauré",
  "popup.discardDraft": "Abandonner",

  // Identity modal
  "identity.title": "Identifiez-vous",
  "identity.nameLabel": "Nom",
  "identity.namePlaceholder": "Votre nom",
  "identity.emailLabel": "Email",
  "identity.emailPlaceholder": "votre@email.com",
  "identity.cancel": "Annuler",
  "identity.submit": "Continuer",

  // Markers
  "marker.approximate": "Position approximative (confiance : {confidence}%)",
  "marker.aria": "Feedback n°{number} : {type} — {message}",
  "marker.count": "{count} marqueurs de feedback affichés",

  // FAB badge
  "fab.badge": "{count} feedbacks non résolus",

  // Accessibility — screen reader announcements
  "feedback.sent.confirmation": "Feedback envoyé avec succès",
  "feedback.error.message": "Échec de l'envoi du feedback",
  "feedback.deleted.confirmation": "Feedback supprimé",

  // Badge
  "badge.count": "{count} feedbacks non résolus",

  // Bulk actions toolbar
  "bulk.selectAll": "Tout sélectionner",
  "bulk.selected": "{count} sélectionné(s)",
  "bulk.resolve": "Résoudre",
  "bulk.delete": "Supprimer",
  "bulk.deselect": "Désélectionner",

  // Sort and group controls
  "sort.newest": "Plus récents",
  "sort.oldest": "Plus anciens",
  "sort.byType": "Par type",
  "sort.openFirst": "Ouverts d'abord",
  "sort.label": "Trier",
  "group.byPage": "Par page",
  "group.feedbacks": "{count} feedbacks",

  // Stats bar
  "stats.open": "Ouverts",
  "stats.resolved": "Résolus",
  "stats.bugs": "Bugs",
  "stats.progress": "{percent}% résolus",

  // Detail view
  "detail.back": "Retour",
  "detail.title": "Feedback n°{number}",
  "detail.status": "Statut",
  "detail.message": "Message",
  "detail.editMessage": "Modifier le message",
  "detail.saveMessage": "Enregistrer",
  "detail.screenshot": "Capture d'écran",
  "detail.screenshotAlt": "Capture d'écran de la zone annotée",
  "detail.metadata": "Détails",
  "detail.annotation": "Annotation",
  "detail.page": "Page",
  "detail.author": "Auteur",
  "detail.date": "Créé le",
  "detail.viewport": "Viewport",
  "detail.browser": "Navigateur",
  "detail.resolvedAt": "Résolu le",
  "detail.closedAt": "Clôturé le",
  "detail.goToAnnotation": "Aller à l'annotation",
  "detail.element": "Élément",
  "detail.selector": "Sélecteur",
  "detail.position": "Position",
  "detail.targetFound": "Cible trouvée",
  "detail.targetApproximate": "Correspondance approximative (confiance : {confidence}%)",
  "detail.targetNotFound": "Cible introuvable — reconnecter ci-dessous",
  "detail.reconnect": "Reconnecter",
  "detail.reconnectPicking": "Cliquez sur l'élément dans la page…",
  "detail.reconnectCancel": "Annuler",
  "detail.resolve": "Résoudre",
  "detail.reopen": "Rouvrir",
  "detail.delete": "Supprimer",
  "detail.diagnostics": "Diagnostics",
  "detail.diagnostics.console": "Console",
  "detail.diagnostics.network": "Réseau en échec",
  "detail.diagnostics.expand": "Afficher les diagnostics",
  "detail.diagnostics.collapse": "Masquer les diagnostics",
  "detail.diagnostics.noEntries": "Aucune entrée",

  // Keyboard shortcuts overlay
  "shortcuts.title": "Raccourcis clavier",
  "shortcuts.navigate": "Naviguer les feedbacks",
  "shortcuts.resolve": "Résoudre / Rouvrir",
  "shortcuts.delete": "Supprimer",
  "shortcuts.search": "Rechercher",
  "shortcuts.select": "Sélectionner",
  "shortcuts.help": "Raccourcis",
  "shortcuts.close": "Fermer",
  "shortcuts.hint": "Raccourcis clavier",

  // Export controls
  "export.label": "Exporter",
  "export.xlsx": "Exporter Excel",
  "export.json": "Exporter JSON",
  "export.failedHint": "L'export a échoué — veuillez réessayer",

  // Copier le prompt
  "agent.copyButton": "Copier le prompt",
  "agent.previewTitle": "Copier {count} élément(s) sous forme de prompt",
  "agent.previewEmpty": "Rien à copier pour le moment",
  "agent.copyAction": "Copier",
  "agent.cancel": "Annuler",
  "agent.copiedToast": "{count} élément(s) copié(s) dans le presse-papiers",
  "agent.copyFailedHint": "La copie automatique a échoué — sélectionnez le texte ci-dessous et copiez-le manuellement",
  "agent.previewAria": "Aperçu Markdown pour l'agent de codage",
  "detail.copyForAgent": "Copier le prompt",

  // Saisie vocale
  "voice.micLabel": "Utiliser la saisie vocale",
  "voice.micLabelListening": "Arrêter la saisie vocale",
  "voice.state.requestingPermission": "Demande d'accès au micro…",
  "voice.state.listening": "Écoute en cours…",
  "voice.state.processing": "Traitement…",
  "voice.state.unsupported": "La saisie vocale n'est pas prise en charge par ce navigateur",
  "voice.error.permissionDenied": "Accès au micro refusé",
  "voice.error.noSpeech": "Aucune parole détectée",
  "voice.error.audioCapture": "Micro indisponible",
  "voice.error.network": "Erreur réseau — réessayez",
  "voice.error.aborted": "Saisie vocale interrompue",
  "voice.error.unknown": "Échec de la saisie vocale",
  "voice.consent":
    "La saisie vocale utilise la reconnaissance vocale de votre navigateur — l'audio peut être traité par votre navigateur ou système.",

  // Visite guidée
  "onboarding.step1Title": "Vos outils sont prêts",
  "onboarding.step1Body":
    "Les icônes à côté du bouton InstaFix sont toujours là — pas besoin de cliquer dessus d'abord.",
  "onboarding.step2Title": "Sélectionnez n'importe quoi",
  "onboarding.step2Body":
    "Choisissez Annoter, puis cliquez ou faites glisser sur la page pour marquer ce dont vous voulez parler.",
  "onboarding.step3Title": "Copiez pour votre IA",
  "onboarding.step3Body":
    "Écrivez ou dictez une note, puis utilisez « Copier le prompt » pour coller un contexte prêt à l'emploi dans votre assistant de code.",
  "onboarding.next": "Suivant",
  "onboarding.done": "Compris",
  "onboarding.skip": "Ignorer",
  "onboarding.progress": "{current}/{total}",

  // Sélecteur de taille de cible (clic droit)
  "popup.targetLabel": "Commentaire sur",
  "popup.targetElement": "Élément",
  "popup.targetContainer": "Conteneur",
  "popup.legendLabel": "Cibles numérotées",

  // Aperçu multi-cible
  "annotator.targetBadgeAria": "Cible {number}",
  "annotator.targetPreviewAlwaysShow": "Toujours afficher les contours",
  "annotator.resolutionLabel": "Affichage",
  "annotator.resolutionSummary": "Résumé",
  "annotator.resolutionDetail": "Détail",

  // Settings panel
  "settings.title": "Paramètres",
  "settings.theme": "Thème",
  "settings.themeLight": "Clair",
  "settings.themeDark": "Sombre",
  "settings.themeAuto": "Auto",
  "settings.locale": "Langue",
  "settings.position": "Position",
  "settings.positionRight": "Droite",
  "settings.positionLeft": "Gauche",
  "settings.accentColor": "Couleur d'accent",
  "settings.screenshots": "Captures d'écran",
  "settings.diagnostics": "Diagnostics",
};
