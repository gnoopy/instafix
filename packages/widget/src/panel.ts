import {
  CLOSED_FEEDBACK_STATUSES,
  FEEDBACK_STATUSES,
  type FeedbackResponse,
  type FeedbackStatus,
  type FeedbackType,
  type InstaFixConfig,
  isClosedStatus,
  type PageScope,
} from "@instafix/core";
import { AgentCopyButton } from "./agent-copy.js";
import type { GetFeedbacksOptions, WidgetClient } from "./api-client.js";
import { SegmentedControl } from "./components/segmented-control.js";
import { PAGE_SIZE } from "./constants.js";
import { el, formatRelativeDate, parseSvg, setButtonLoading, setText } from "./dom-utils.js";
import type { EventBus, WidgetEvents } from "./events.js";
import { ExportButton } from "./export-utils.js";
import { isWidgetChrome } from "./focus-tracker.js";
import { getHandedOffAt, markHandedOff } from "./handoff-storage.js";
import { getStatusLabel, getTypeLabel, type TFunction, tWithParams } from "./i18n/index.js";
import {
  ICON_BUG,
  ICON_CHANGE,
  ICON_CHECK,
  ICON_CHEVRON_DOWN,
  ICON_CLOSE,
  ICON_DOT_OPEN,
  ICON_LAYERS,
  ICON_OTHER,
  ICON_QUESTION,
  ICON_SEARCH,
  ICON_TRASH,
  ICON_UNDO,
} from "./icons.js";
import type { MarkerManager } from "./markers.js";
import { BulkActions } from "./panel-bulk.js";
import { DetailView } from "./panel-detail.js";
import { createPageGroupHeader, groupFeedbacksByPage, PanelSortControls, sortFeedbacks } from "./panel-sort.js";
import { PanelStats } from "./panel-stats.js";
import { savePersistedSettings } from "./settings-storage.js";
import { SettingsView } from "./settings-view.js";
import { focusCardByIndex, getFocusedCardIndex, KeyboardShortcuts } from "./shortcuts.js";
import { getStatusBgColor, getStatusColor, getTypeBgColor, getTypeColor, type ThemeColors } from "./styles/theme.js";

/** Non-terminal statuses — complement of `CLOSED_FEEDBACK_STATUSES`; backs the panel's "Open" tab bucket. */
const OPEN_FEEDBACK_STATUSES: readonly FeedbackStatus[] = FEEDBACK_STATUSES.filter((s) => !isClosedStatus(s));

/**
 * Side panel (400px) with feedback history, filters, search, stats,
 * sort/group, bulk actions, export, detail view, and keyboard shortcuts.
 *
 * Lives inside the Shadow DOM.
 * Glassmorphism: glass background, staggered card animations,
 * loading states, resolve feedback with disabled state.
 */
export class Panel {
  private root: HTMLElement;
  private listContainer: HTMLElement;
  private searchInput: HTMLInputElement;
  private closeBtn: HTMLButtonElement;
  private deleteAllBtn: HTMLButtonElement;
  private activeFilters = new Set<string>(["all"]);
  private typeDropdownBtn!: HTMLButtonElement;
  private typeDropdownContainer!: HTMLElement;
  private typeDropdownMenu: HTMLElement | null = null;
  private typeDropdownOutsideHandler: ((e: MouseEvent) => void) | null = null;
  private statusSegmented!: SegmentedControl<"all" | FeedbackStatus>;
  private typeOptions!: ReadonlyArray<{ value: string; label: string; icon: string; color: string; bg: string }>;
  private feedbacks: FeedbackResponse[] = [];
  private currentPage = 1;
  private totalFeedbacks = 0;
  private isLoadingMore = false;
  private isOpen = false;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private loadController: AbortController | null = null;
  /** Tracks feedback IDs with in-flight mutations to prevent spam-click race conditions */
  private pendingMutations = new Set<string>();
  /** The feedback currently shown as "selected" in the list (marker click, card click) — re-applied by createCard across re-renders. */
  private selectedFeedbackId: string | null = null;
  /** Marker-click scroll target whose card wasn't in the DOM yet (the click opens the panel, which loads the list asynchronously) — consumed once by renderList(). */
  private pendingScrollFeedbackId: string | null = null;

  // New feature modules
  private readonly stats: PanelStats;
  private readonly sortControls: PanelSortControls;
  private readonly bulk: BulkActions;
  private readonly exportBtn: ExportButton;
  private readonly agentCopyBtn: AgentCopyButton;
  private readonly shortcuts: KeyboardShortcuts;
  private readonly detail: DetailView;
  private readonly settings: SettingsView | null;
  private readonly shadowRoot: ShadowRoot;

  // i18n: t is shared with all submodules.

  // Page scope — supplied by launcher so the panel can scope its results to
  // the current page (or template) and filter markers accordingly.
  private readonly getScope: () => PageScope;
  private readonly scopeAnnotationsByUrl: boolean;
  /** "this" = current url, "template" = url pattern, "all" = no scope filter */
  private scopeSegmented!: SegmentedControl<"this" | "template" | "all">;
  /** Cached initial scope value — applied after construction in `buildScopeSegmented`. */
  private readonly initialScopeFilter: "this" | "template" | "all" = "this";

  constructor(
    shadowRoot: ShadowRoot,
    private readonly colors: ThemeColors,
    private readonly bus: EventBus<WidgetEvents>,
    private readonly client: WidgetClient,
    private readonly projectName: string,
    private readonly markers: MarkerManager,
    private readonly t: TFunction,
    private readonly locale: string,
    pageScopeOptions?: { getScope: () => PageScope; scopeAnnotationsByUrl: boolean },
    private readonly settingsOptions?: {
      config: InstaFixConfig;
      onUpdateConfig: (partial: Partial<InstaFixConfig>) => void;
    },
  ) {
    this.shadowRoot = shadowRoot;
    this.getScope = pageScopeOptions?.getScope ?? (() => ({ url: window.location.pathname, urlPattern: null }));
    this.scopeAnnotationsByUrl = pageScopeOptions?.scopeAnnotationsByUrl ?? true;

    this.root = el("div", { class: "sp-panel" });
    this.root.setAttribute("role", "complementary");
    this.root.setAttribute("aria-label", this.t("panel.ariaLabel"));
    this.root.setAttribute("aria-hidden", "true");

    // --- Header ---
    const header = el("div", { class: "sp-panel-header" });
    const title = el("span", { class: "sp-panel-title" });
    setText(title, this.t("panel.title"));

    this.closeBtn = document.createElement("button");
    this.closeBtn.className = "sp-panel-close";
    this.closeBtn.setAttribute("aria-label", this.t("panel.close"));
    this.closeBtn.appendChild(parseSvg(ICON_CLOSE));
    this.closeBtn.addEventListener("click", () => this.close());

    this.deleteAllBtn = document.createElement("button");
    this.deleteAllBtn.className = "sp-btn-delete-all";
    this.deleteAllBtn.setAttribute("aria-label", this.t("panel.deleteAll"));
    this.deleteAllBtn.appendChild(parseSvg(ICON_TRASH));
    const deleteAllLabel = document.createElement("span");
    setText(deleteAllLabel, ` ${this.t("panel.deleteAll")}`);
    this.deleteAllBtn.appendChild(deleteAllLabel);
    this.deleteAllBtn.addEventListener("click", () => this.confirmDeleteAll());

    // Export button
    this.exportBtn = new ExportButton(colors, () => this.feedbacks, this.t);

    // "Copy for Claude Code" — selected items when a bulk selection is
    // active, otherwise a fresh fetch of every open item on the current page
    // (independent of whatever type/search filter the list view happens to
    // have active, so "copy what's unresolved here" is always accurate).
    this.agentCopyBtn = new AgentCopyButton(
      colors,
      {
        getFeedbacks: () => this.getFeedbacksForAgentCopy(),
        getContainer: () => this.shadowRoot,
        // The copy's coverage, spelled out in the preview — selected items
        // when a bulk selection is active, open-on-this-page otherwise.
        getScopeLabel: () =>
          this.bulk.hasSelection
            ? tWithParams(this.t, "agent.scopeSelected", { count: this.bulk.selectedIds.length })
            : this.t("agent.scopeOpenPage"),
        instructions: this.settingsOptions?.config.agentInstructions,
        // Successful copy = these items are now "in an agent's hands" —
        // badge them so nobody hands the same item off twice by accident.
        onCopied: (ids) => {
          markHandedOff(ids);
          this.renderList();
        },
      },
      this.t,
    );

    // Title + close live on their own row, just the two of them — the close
    // button must never compete for space with the (unbounded-growth) action
    // toolbar below it. A close button that can be pushed out of the visible
    // panel by an overflowing header is a real bug, not a cosmetic one: it's
    // the only other way (besides Escape / an outside click) to leave the
    // panel.
    const headerTop = el("div", { class: "sp-panel-header-top" });
    headerTop.appendChild(title);
    headerTop.appendChild(this.closeBtn);

    // Settings — an inline accordion pinned to the top of the panel body
    // (below the header, above the stats/list) so visitors can adjust
    // theme/locale/position/accent/feature toggles without a second sidebar
    // competing for space. Only wired when the launcher supplies
    // settingsOptions (always true via initInstaFix() — omitted only by
    // tests constructing Panel directly, in which case the "설정" row is
    // simply not rendered).
    this.settings = this.settingsOptions
      ? new SettingsView(this.t, this.settingsOptions.config, (patch) => {
          // Global scope, not per-page: a visitor's theme/locale/position/etc.
          // choice should hold across reloads and other pages of the host app,
          // not just for the remainder of this mount (see settings-storage.ts).
          savePersistedSettings(patch);
          this.settingsOptions?.onUpdateConfig(patch);
        })
      : null;

    // Secondary actions get their own row and wrap freely — safe to keep
    // growing (a future action button) without ever endangering the close
    // button above.
    const headerActions = el("div", { class: "sp-panel-header-actions" });
    headerActions.appendChild(this.agentCopyBtn.element);
    headerActions.appendChild(this.exportBtn.element);
    headerActions.appendChild(this.deleteAllBtn);

    header.appendChild(headerTop);
    header.appendChild(headerActions);

    // --- Stats ---
    this.stats = new PanelStats(colors, this.t);

    // --- Filters ---
    const filters = el("div", { class: "sp-filters" });

    // Search
    const searchWrap = el("div", { class: "sp-search-wrap" });
    const searchIcon = parseSvg(ICON_SEARCH);
    searchIcon.setAttribute("class", "sp-search-icon");
    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.className = "sp-search";
    this.searchInput.placeholder = this.t("panel.search");
    this.searchInput.setAttribute("aria-label", this.t("panel.searchAria"));
    this.searchInput.addEventListener("input", () => {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => this.loadFeedbacks().catch(() => {}), 200);
    });
    searchWrap.appendChild(searchIcon);
    searchWrap.appendChild(this.searchInput);

    // Filter bar (type dropdown + status segmented + scope segmented).
    // The scope control gives users a fast way to widen results to "this type
    // of page" or "all pages" when the host provides a route template.
    const filterBar = el("div", { class: "sp-filter-bar" });
    filterBar.appendChild(this.buildTypeDropdown());
    filterBar.appendChild(this.buildStatusSegmented());
    filterBar.appendChild(this.buildScopeSegmented());

    // Sort + group-by-page controls — they live in the header ACTION BAR's
    // spare right-hand space (next to copy/export/delete-all), not on their
    // own row under the filters: one less row of chrome above the list.
    this.sortControls = new PanelSortControls(colors, () => this.renderList(), this.t);
    this.sortControls.element.classList.add("sp-sort-controls--inline");
    headerActions.appendChild(this.sortControls.element);

    filters.appendChild(searchWrap);
    filters.appendChild(filterBar);

    // --- List ---
    this.listContainer = el("div", { class: "sp-list" });
    this.listContainer.setAttribute("role", "list");
    this.listContainer.setAttribute("aria-label", this.t("panel.feedbackList"));

    // --- Bulk Actions ---
    this.bulk = new BulkActions(
      colors,
      {
        onResolve: (ids) => this.bulkResolve(ids),
        onDelete: (ids) => this.bulkDelete(ids),
      },
      this.t,
    );
    this.bulk.setListContainer(this.listContainer);

    // --- Detail View ---
    this.detail = new DetailView(
      colors,
      {
        onBack: () => this.detail.hide(),
        onResolve: async (fb) => {
          try {
            // Client-facing binary action: closed statuses (resolved, wont_fix)
            // reopen, everything else (open, in_progress) resolves.
            const newResolved = !isClosedStatus(fb.status);
            await this.client.resolveFeedback(fb.id, newResolved);
            await this.loadFeedbacks();
            this.detail.hide();
          } catch (error) {
            // Surface the failure to the host (config.onError) like the list
            // and bulk paths do, then rethrow so DetailView restores its
            // buttons and stays open.
            this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
            throw error;
          }
        },
        onDelete: async (fb) => {
          const confirmed = await this.showConfirmDialog(
            this.t("panel.deleteConfirmTitle"),
            this.t("panel.deleteConfirmMessage"),
          );
          if (!confirmed) throw new Error("Delete cancelled");

          try {
            await this.client.deleteFeedback(fb.id);
            this.bus.emit("feedback:deleted", fb.id);
            await this.loadFeedbacks();
            this.detail.hide();
          } catch (error) {
            this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
            throw error;
          }
        },
        onGoToAnnotation: (fb) => {
          if (fb.annotations.length > 0) {
            const ann = fb.annotations[0];
            if (!ann) return;
            window.scrollTo({ left: ann.scrollX, top: ann.scrollY, behavior: "smooth" });
            this.markers.pinHighlight(fb);
          }
        },
        // Only offered when the client can reach a server outbox (HTTP mode
        // with @instafix/adapter-fs) — client-side stores have no terminal
        // on the other end.
        ...(this.client.handoffFeedback
          ? {
              onHandoff: async (fb: FeedbackResponse) => {
                const ok = (await this.client.handoffFeedback?.(fb.id)) ?? false;
                if (ok) {
                  markHandedOff([fb.id]);
                  this.renderList();
                }
                return ok;
              },
            }
          : {}),
        onEditMessage: async (fb, message) => {
          try {
            const updated = await this.client.updateFeedbackMessage(fb.id, fb.status, message);
            await this.loadFeedbacks();
            const idx = this.feedbacks.findIndex((f) => f.id === updated.id);
            const current = idx >= 0 ? this.feedbacks[idx] : undefined;
            if (current) {
              this.detail.show(current, idx + 1);
            } else {
              this.detail.hide();
            }
          } catch (error) {
            this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
            throw error;
          }
        },
        onReconnect: async (fb, annotations) => {
          try {
            const updated = await this.client.updateFeedbackAnnotations(fb.id, fb.status, annotations);
            await this.loadFeedbacks();
            const idx = this.feedbacks.findIndex((f) => f.id === updated.id);
            const current = idx >= 0 ? this.feedbacks[idx] : undefined;
            if (current) {
              this.detail.show(current, idx + 1);
            } else {
              this.detail.hide();
            }
          } catch (error) {
            this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
            throw error;
          }
        },
      },
      this.t,
      locale,
      () => this.shadowRoot,
    );

    // --- Keyboard Shortcuts ---
    this.shortcuts = new KeyboardShortcuts(
      colors,
      {
        onNavigate: (dir) => {
          const idx = getFocusedCardIndex(this.listContainer);
          focusCardByIndex(this.listContainer, dir === "down" ? idx + 1 : idx - 1);
        },
        onResolve: () => {
          const fb = this.getFocusedFeedback();
          if (fb && !this.pendingMutations.has(fb.id)) {
            const card = this.listContainer.querySelector<HTMLElement>(`[data-feedback-id="${CSS.escape(fb.id)}"]`);
            const btn = card?.querySelector<HTMLButtonElement>('[data-action="resolve"]');
            if (btn) this.toggleResolve(fb, btn).catch(() => {});
          }
        },
        onDelete: () => {
          const fb = this.getFocusedFeedback();
          if (fb && !this.pendingMutations.has(fb.id)) {
            const card = this.listContainer.querySelector<HTMLElement>(`[data-feedback-id="${CSS.escape(fb.id)}"]`);
            const btn = card?.querySelector<HTMLButtonElement>('[data-action="delete"]');
            if (btn) this.deleteFeedback(fb, btn).catch(() => {});
          }
        },
        onFocusSearch: () => this.searchInput.focus(),
        onToggleSelect: () => {
          const fb = this.getFocusedFeedback();
          if (fb) this.bulk.toggle(fb.id);
        },
      },
      this.t,
    );

    // --- Assemble DOM ---
    this.root.appendChild(header);
    if (this.settings) this.root.appendChild(this.settings.element);
    this.root.appendChild(this.stats.element);
    this.root.appendChild(filters);
    this.root.appendChild(this.listContainer);
    this.root.appendChild(this.bulk.barElement);
    this.root.appendChild(this.detail.element);
    this.root.appendChild(this.shortcuts.helpOverlay);
    this.root.appendChild(this.shortcuts.hintButton);
    shadowRoot.appendChild(this.root);

    // --- Event delegation on listContainer ---

    this.onListClick = (e: Event) => {
      const target = e.target as Element;

      // Bulk checkbox clicks are handled by BulkActions, skip
      if (target.closest(".sp-bulk-checkbox")) return;

      // Action buttons (expand, resolve, delete)
      const actionEl = target.closest<HTMLElement>("[data-action]");
      if (actionEl) {
        e.stopPropagation();
        const card = actionEl.closest<HTMLElement>(".sp-card");
        if (!card) return;
        const feedbackId = card.dataset.feedbackId;
        const feedback = this.feedbacks.find((f) => f.id === feedbackId);
        if (!feedback) return;

        const action = actionEl.dataset.action;
        if (action === "expand") {
          const message = card.querySelector<HTMLElement>(".sp-card-message");
          if (!message) return;
          const isExpanded = message.classList.toggle("sp-card-message--expanded");
          setText(actionEl, isExpanded ? this.t("panel.showLess") : this.t("panel.showMore"));
          actionEl.setAttribute("aria-expanded", String(isExpanded));
        } else if (action === "resolve") {
          if (this.pendingMutations.has(feedback.id)) return;
          const btn = actionEl as HTMLButtonElement;
          this.toggleResolve(feedback, btn).catch(() => {});
        } else if (action === "delete") {
          if (this.pendingMutations.has(feedback.id)) return;
          const btn = actionEl as HTMLButtonElement;
          this.deleteFeedback(feedback, btn).catch(() => {});
        }
        return;
      }

      // Card click → open detail view + reveal the on-page region, so
      // "selecting" an item in the list is answered by "here's where that
      // lives on the page" (G8), not just the detail panel. focusFeedback
      // scrolls the marker into view AND pins the outline — an outline
      // drawn on a region scrolled off-screen answers nothing. Feedbacks
      // with no resolvable marker on this page fall back to a plain pin
      // (harmless no-op render when there's nothing to outline).
      const card = target.closest<HTMLElement>(".sp-card");
      if (card) {
        const feedbackId = card.dataset.feedbackId;
        const feedback = this.feedbacks.find((f) => f.id === feedbackId);
        if (feedback) {
          const number = this.feedbacks.indexOf(feedback) + 1;
          this.setSelectedCard(feedback.id);
          this.detail.show(feedback, number);
          if (!this.markers.focusFeedback(feedback.id)) {
            this.markers.pinHighlight(feedback);
          }
        }
      }
    };
    this.listContainer.addEventListener("click", this.onListClick);

    this.onListKeydown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key !== "Enter" && ke.key !== " ") return;
      const target = ke.target as Element;
      const card = target.closest<HTMLElement>(".sp-card");
      // Only activate if the card itself is focused, not a button inside it
      if (!card || target !== card) return;
      ke.preventDefault();
      const feedbackId = card.dataset.feedbackId;
      const feedback = this.feedbacks.find((f) => f.id === feedbackId);
      if (feedback) {
        const number = this.feedbacks.indexOf(feedback) + 1;
        this.setSelectedCard(feedback.id);
        this.detail.show(feedback, number);
        // Same reveal-the-region behavior as the pointer path above.
        if (!this.markers.focusFeedback(feedback.id)) {
          this.markers.pinHighlight(feedback);
        }
      }
    };
    this.listContainer.addEventListener("keydown", this.onListKeydown);

    // mouseover/mouseout bubble (unlike mouseenter/mouseleave), enabling delegation
    this.onListMouseover = (e: Event) => {
      const target = (e as MouseEvent).target as Element;
      const card = target.closest<HTMLElement>(".sp-card");
      if (!card) return;
      const feedbackId = card.dataset.feedbackId;
      const feedback = this.feedbacks.find((f) => f.id === feedbackId);
      if (!feedback) return;
      // Pulse the on-page marker AND preview its outline — the pulse alone
      // (pre-existing) draws the eye to a dot that may be small/offscreen;
      // the outline actually shows the region it covers (G8).
      this.markers.highlight(feedback.id);
      this.markers.previewHighlight(feedback);
    };
    this.listContainer.addEventListener("mouseover", this.onListMouseover);

    this.onListMouseout = (e: Event) => {
      const target = (e as MouseEvent).relatedTarget as Element | null;
      // Only clear highlight when leaving all cards (relatedTarget is outside listContainer)
      if (target && this.listContainer.contains(target)) return;
      this.markers.previewHighlight(null);
    };
    this.listContainer.addEventListener("mouseout", this.onListMouseout);

    // Events
    this.bus.on("panel:toggle", (open) => {
      open ? this.open() : this.close();
    });

    // Keyboard handling: Escape to close + focus trap
    shadowRoot.addEventListener("keydown", (e) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Escape" && this.isOpen) {
        // If the settings accordion or detail view is open, close it instead
        if (this.settings?.isExpanded) {
          this.settings.collapse();
          return;
        }
        if (this.detail.isVisible) {
          this.detail.hide();
          return;
        }
        this.close();
        return;
      }
      if (ke.key === "Tab" && this.isOpen) {
        // Filter out non-tabbable elements: those hidden via `display: none`
        // (either on themselves or any ancestor up to this.root) and elements
        // explicitly disabled. Without this filter, the trap can jump to a
        // button inside a closed detail view and effectively swallow the Tab
        // key. We use a walk of style.display rather than `offsetParent`
        // because the latter is unreliable in jsdom (always null without
        // layout) and breaks unit tests.
        const isVisible = (el: HTMLElement): boolean => {
          let cur: HTMLElement | null = el;
          while (cur && cur !== this.root) {
            if (cur.style.display === "none") return false;
            cur = cur.parentElement;
          }
          return true;
        };
        const focusable = Array.from(
          this.root.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => isVisible(el) && !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        const active = (shadowRoot as ShadowRoot).activeElement;
        if (ke.shiftKey && active === first) {
          ke.preventDefault();
          last.focus();
        } else if (!ke.shiftKey && active === last) {
          ke.preventDefault();
          first.focus();
        }
      }
    });

    // Listen for marker clicks
    this.onMarkerClick = ((e: CustomEvent) => {
      this.scrollToFeedback(e.detail.feedbackId);
    }) as EventListener;
    document.addEventListener("sp-marker-click", this.onMarkerClick);

    // Click outside the panel closes it — the FAB's own radial menu already
    // does this (see fab.ts), and a non-modal drawer that only closes via a
    // button/Escape is easy to get stuck in if that button is ever hidden or
    // hard to reach. Two checks, in order: `this.root.contains(target)` for
    // anything within the panel's own subtree (cards, the confirm dialog,
    // which shares this root) — checked directly rather than through
    // `isWidgetChrome` so this doesn't depend on the shadow host actually
    // being a `<instafix-widget>` element; then `isWidgetChrome` for our
    // OTHER UI that lives elsewhere (the popup composer, tooltip, FAB).
    this.onDocumentClick = (e: MouseEvent) => {
      if (!this.isOpen) return;
      // `e.target` is retargeted to the shadow host for any listener outside
      // the shadow tree — checking `this.root.contains(e.target)` would
      // therefore never match a click that originated inside the panel's own
      // shadow-DOM content. `composedPath()` carries the real, un-retargeted
      // path (same trick `fab.ts` uses for its own outside-click handling).
      const path = e.composedPath();
      if (path.includes(this.root)) return;
      const originalTarget = path[0];
      if (originalTarget instanceof Element && isWidgetChrome(originalTarget)) return;
      this.close();
    };
    document.addEventListener("click", this.onDocumentClick);
  }

  private onMarkerClick: EventListener;
  private onDocumentClick: (e: MouseEvent) => void;
  private onListClick: (e: Event) => void;
  private onListKeydown: (e: Event) => void;
  private onListMouseover: (e: Event) => void;
  private onListMouseout: (e: Event) => void;

  async open(): Promise<void> {
    if (this.isOpen) return;
    this.isOpen = true;
    this.root.classList.add("sp-panel--open");
    this.root.setAttribute("aria-hidden", "false");
    this.bus.emit("open");
    this.shortcuts.enable(this.shadowRoot);
    await this.loadFeedbacks();
    // Move focus into the panel (search input or close button)
    requestAnimationFrame(() => {
      if (this.searchInput) {
        this.searchInput.focus();
      } else {
        this.closeBtn.focus();
      }
    });
  }

  close(): void {
    if (!this.isOpen) return;
    this.flushPendingDeletes();
    this.isOpen = false;
    this.root.classList.remove("sp-panel--open");
    this.root.setAttribute("aria-hidden", "true");
    this.bus.emit("close");
    this.shortcuts.disable();
    this.detail.hide();
    this.settings?.collapse();
    // Restore focus to the FAB
    const fab = (this.root.getRootNode() as ShadowRoot).querySelector<HTMLButtonElement>(".sp-fab");
    fab?.focus();
  }

  private showLoading(): void {
    this.listContainer.replaceChildren();
    const loading = el("div", { class: "sp-loading" });
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-live", "polite");
    loading.setAttribute("aria-label", this.t("panel.loading"));
    const spinner = el("div", { class: "sp-spinner" });
    loading.appendChild(spinner);
    this.listContainer.appendChild(loading);
  }

  private showError(): void {
    this.listContainer.replaceChildren();
    const empty = el("div", { class: "sp-empty" });
    empty.setAttribute("role", "status");
    empty.setAttribute("aria-live", "polite");
    const text = el("div", { class: "sp-empty-text" });
    setText(text, this.t("panel.loadError"));
    const retryBtn = document.createElement("button");
    retryBtn.className = "sp-btn-ghost";
    retryBtn.style.marginTop = "8px";
    setText(retryBtn, this.t("panel.retry"));
    retryBtn.addEventListener("click", () => this.loadFeedbacks().catch(() => {}));
    empty.appendChild(text);
    empty.appendChild(retryBtn);
    this.listContainer.appendChild(empty);
  }

  /**
   * Map a status tab value to the bucket of statuses it represents. The panel's
   * binary tabs use bucket semantics (matching markers / FAB badge / stats):
   * "open" covers open + in_progress, "resolved" covers resolved + wont_fix,
   * and "all" applies no status filter. Returns `undefined` when unfiltered.
   */
  private statusBucket(tab: "all" | FeedbackStatus): readonly FeedbackStatus[] | undefined {
    if (tab === "all") return undefined;
    return isClosedStatus(tab) ? CLOSED_FEEDBACK_STATUSES : OPEN_FEEDBACK_STATUSES;
  }

  private async loadFeedbacks(): Promise<void> {
    // Cancel any in-flight request to prevent stale responses from overwriting newer results
    this.loadController?.abort();
    this.loadController = new AbortController();
    const { signal } = this.loadController;

    // Reset to page 1 on fresh load (filter/search change)
    this.currentPage = 1;

    const search = this.searchInput.value.trim() || undefined;
    const typeFilter = this.activeFilters.has("all") ? undefined : (Array.from(this.activeFilters)[0] as FeedbackType);
    const statuses = this.statusBucket(this.statusSegmented.value);

    const scope = this.getScope();
    // Refresh scope-filter button visibility based on current scope (SPA nav).
    this.syncScopeAvailability();
    const currentScope = this.scopeSegmented.value;
    const options: GetFeedbacksOptions & { page: number; limit: number } = {
      page: 1,
      limit: PAGE_SIZE,
    };
    if (typeFilter) options.type = typeFilter;
    if (statuses) options.statuses = statuses;
    if (search) options.search = search;
    if (currentScope === "this") {
      options.url = scope.url;
    } else if (currentScope === "template" && scope.urlPattern) {
      options.urlPattern = scope.urlPattern;
    }

    // Only show spinner on first load (empty list) — otherwise keep current content visible
    const hasContent = this.feedbacks.length > 0;
    if (!hasContent) this.showLoading();

    try {
      const { feedbacks, total } = await this.client.getFeedbacks(this.projectName, options);
      if (signal.aborted) return; // Stale response — a newer request superseded this one
      this.feedbacks = feedbacks;
      this.totalFeedbacks = total;
      this.stats.update(feedbacks, total);
      this.bulk.reset();
      this.renderList();
      // Markers always render only the current-URL slice — even when the panel
      // shows a wider scope ("template" or "all"), markers stay strictly local
      // so the user never sees out-of-context dots on the page.
      const markerFeedbacks = this.scopeAnnotationsByUrl ? feedbacks.filter((f) => f.url === scope.url) : feedbacks;
      this.markers.render(markerFeedbacks);
    } catch (error) {
      if (signal.aborted) return; // Expected abort, not a real error
      if (!hasContent) this.showError();
      this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Feedbacks to hand to "Copy for Claude Code": the bulk selection when one
   * is active, otherwise every open (open/in_progress) item on the current
   * page — fetched fresh so it's accurate regardless of the list's active
   * type/search filter or pagination state.
   */
  private async getFeedbacksForAgentCopy(): Promise<FeedbackResponse[]> {
    if (this.bulk.hasSelection) {
      const ids = new Set(this.bulk.selectedIds);
      return this.feedbacks.filter((f) => ids.has(f.id));
    }
    const scope = this.getScope();
    try {
      const { feedbacks } = await this.client.getFeedbacks(this.projectName, {
        url: scope.url,
        statuses: OPEN_FEEDBACK_STATUSES,
        page: 1,
        limit: 100,
      });
      return feedbacks;
    } catch (error) {
      this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private async loadMoreFeedbacks(): Promise<void> {
    if (this.isLoadingMore) return;
    this.isLoadingMore = true;

    // Capture current controller — if loadFeedbacks() runs while we're in-flight,
    // it replaces the controller, signaling that our results are stale.
    const controller = this.loadController;

    const nextPage = this.currentPage + 1;
    const search = this.searchInput.value.trim() || undefined;
    const typeFilter = this.activeFilters.has("all") ? undefined : (Array.from(this.activeFilters)[0] as FeedbackType);
    const statuses = this.statusBucket(this.statusSegmented.value);

    const scope = this.getScope();
    const currentScope = this.scopeSegmented.value;
    const options: GetFeedbacksOptions & { page: number; limit: number } = {
      page: nextPage,
      limit: PAGE_SIZE,
    };
    if (typeFilter) options.type = typeFilter;
    if (statuses) options.statuses = statuses;
    if (search) options.search = search;
    if (currentScope === "this") {
      options.url = scope.url;
    } else if (currentScope === "template" && scope.urlPattern) {
      options.urlPattern = scope.urlPattern;
    }

    // Show spinner on the "Load more" button
    const loadMoreBtn = this.listContainer.querySelector<HTMLButtonElement>(".sp-btn-load-more");
    let restoreBtn: (() => void) | undefined;
    if (loadMoreBtn) restoreBtn = setButtonLoading(loadMoreBtn);

    try {
      const { feedbacks, total } = await this.client.getFeedbacks(this.projectName, options);
      if (controller !== this.loadController) return; // Filter/search changed — discard stale page
      this.currentPage = nextPage;
      this.totalFeedbacks = total;
      this.feedbacks = [...this.feedbacks, ...feedbacks];
      this.stats.update(this.feedbacks, total);
      this.renderList();
      const markerFeedbacks = this.scopeAnnotationsByUrl
        ? this.feedbacks.filter((f) => f.url === scope.url)
        : this.feedbacks;
      this.markers.render(markerFeedbacks);
    } catch (error) {
      if (restoreBtn) restoreBtn();
      this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.isLoadingMore = false;
    }
  }

  private renderList(): void {
    this.listContainer.replaceChildren();

    if (this.feedbacks.length === 0) {
      const empty = el("div", { class: "sp-empty" });
      empty.setAttribute("role", "status");
      empty.setAttribute("aria-live", "polite");
      const emptyText = el("div", { class: "sp-empty-text" });
      setText(emptyText, this.t("panel.empty"));
      empty.appendChild(emptyText);
      this.listContainer.appendChild(empty);
      return;
    }

    // Apply sorting
    const sorted = sortFeedbacks(this.feedbacks, this.sortControls.sortMode);

    // Select all bar
    const feedbackIds = sorted.map((f) => f.id);
    const selectAllBar = this.bulk.createSelectAllBar(feedbackIds, this.t("bulk.selectAll"));
    this.listContainer.appendChild(selectAllBar);

    if (this.sortControls.groupByPage) {
      // Group by page rendering
      const groups = groupFeedbacksByPage(sorted);
      let globalIndex = 0;
      for (const [pagePath, groupFeedbacks] of groups) {
        const groupHeader = createPageGroupHeader(pagePath, groupFeedbacks.length, this.colors);
        this.listContainer.appendChild(groupHeader);

        const groupContent = el("div", { class: "sp-group-content" });
        for (const feedback of groupFeedbacks) {
          const card = this.createCard(feedback, globalIndex + 1);
          card.style.setProperty("--sp-card-i", String(globalIndex));
          groupContent.appendChild(card);
          globalIndex++;
        }
        this.listContainer.appendChild(groupContent);
      }
    } else {
      // Flat list rendering
      sorted.forEach((feedback, index) => {
        const card = this.createCard(feedback, index + 1);
        card.style.setProperty("--sp-card-i", String(index));
        this.listContainer.appendChild(card);
      });
    }

    // "Load more" button when there are remaining feedbacks
    const remaining = this.totalFeedbacks - this.feedbacks.length;
    if (remaining > 0) {
      const loadMoreWrap = el("div", { class: "sp-load-more-wrap" });
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.className = "sp-btn-ghost sp-btn-load-more";
      setText(loadMoreBtn, tWithParams(this.t, "panel.loadMore", { remaining }));
      loadMoreBtn.addEventListener("click", () => this.loadMoreFeedbacks().catch(() => {}));
      loadMoreWrap.appendChild(loadMoreBtn);
      this.listContainer.appendChild(loadMoreWrap);
    }

    // A marker click may have requested a scroll before this render existed.
    // One-shot: if the target still isn't in this list (filtered out, other
    // page scope), it's dropped rather than re-armed — a stale target must
    // not hijack scrolling on some later, unrelated render.
    if (this.pendingScrollFeedbackId) {
      const target = this.pendingScrollFeedbackId;
      this.pendingScrollFeedbackId = null;
      const card = this.listContainer.querySelector<HTMLElement>(`[data-feedback-id="${CSS.escape(target)}"]`);
      if (card) {
        // Deferred a frame — the cards were just appended and need layout
        // before scrollIntoView can compute a position.
        requestAnimationFrame(() => this.scrollToFeedback(target));
      }
    }
  }

  private createCard(feedback: FeedbackResponse, number: number): HTMLElement {
    // Closed = terminal (resolved, wont_fix): muted card + "Reopen" action.
    const isResolved = isClosedStatus(feedback.status);
    const typeColor = getTypeColor(feedback.type, this.colors);

    const card = el("div", {
      class: `sp-card ${isResolved ? "sp-card--resolved" : ""}${
        feedback.id === this.selectedFeedbackId ? " sp-card--selected" : ""
      }`,
    });
    card.setAttribute("role", "listitem");
    card.setAttribute("tabindex", "0");
    card.setAttribute(
      "aria-label",
      `Feedback #${number}: ${getTypeLabel(feedback.type, this.t)} — ${feedback.message.slice(0, 80)}`,
    );
    card.dataset.feedbackId = feedback.id;

    // Color bar
    const bar = el("div", { class: "sp-card-bar" });
    bar.style.background = isResolved ? "#9ca3af" : typeColor;

    // Body
    const body = el("div", { class: "sp-card-body" });

    // Header: checkbox + #number + badge + date
    const header = el("div", { class: "sp-card-header" });

    // Bulk checkbox — inline in the header row
    const checkbox = this.bulk.createCheckbox(feedback.id);
    header.appendChild(checkbox);

    const num = el("span", { class: "sp-card-number" });
    setText(num, `#${number}`);

    const badge = el("span", { class: "sp-badge" });
    const typeBg = getTypeBgColor(feedback.type, this.colors);
    badge.style.background = typeBg;
    badge.style.color = typeColor;
    setText(badge, getTypeLabel(feedback.type, this.t));

    // Status badge — renders the record's actual status (open, in_progress,
    // resolved, wont_fix) even though panel actions stay binary.
    const statusBadge = el("span", { class: "sp-badge sp-badge--status" });
    statusBadge.dataset.status = feedback.status;
    statusBadge.style.background = getStatusBgColor(feedback.status, this.colors);
    statusBadge.style.color = getStatusColor(feedback.status, this.colors);
    setText(statusBadge, getStatusLabel(feedback.status, this.t));

    const date = el("span", { class: "sp-card-date" });
    setText(date, formatRelativeDate(feedback.createdAt, this.locale));

    header.appendChild(num);
    header.appendChild(badge);
    header.appendChild(statusBadge);

    // "이미 에이전트에 넘긴 항목" 표시 — 같은 건을 두 번 발주하는 사고와
    // "이거 보냈던가?" 하는 기억 의존을 없앤다 (handoff-storage.ts).
    const handedOffAt = getHandedOffAt(feedback.id);
    if (handedOffAt) {
      const handed = el("span", { class: "sp-card-handed" });
      setText(handed, `⇥ ${this.t("agent.handedOff")} · ${formatRelativeDate(handedOffAt, this.locale)}`);
      handed.title = this.t("agent.handedOffTitle");
      header.appendChild(handed);
    }

    header.appendChild(date);

    // Message
    const message = el("div", { class: "sp-card-message" });
    setText(message, feedback.message);

    // Expand button
    const expandBtn = document.createElement("button");
    expandBtn.className = "sp-card-expand";
    expandBtn.dataset.action = "expand";
    setText(expandBtn, this.t("panel.showMore"));
    expandBtn.style.display = "none";
    expandBtn.setAttribute("aria-expanded", "false");

    // Check if text is clamped (after render)
    requestAnimationFrame(() => {
      if (message.scrollHeight > message.clientHeight) {
        expandBtn.style.display = "block";
      }
    });

    // Footer: resolve button
    const footer = el("div", { class: "sp-card-footer" });

    const resolveBtn = document.createElement("button");
    resolveBtn.className = "sp-btn-resolve";
    resolveBtn.dataset.action = "resolve";
    if (isResolved) {
      resolveBtn.appendChild(parseSvg(ICON_UNDO));
      const span = document.createElement("span");
      setText(span, ` ${this.t("panel.reopen")}`);
      resolveBtn.appendChild(span);
    } else {
      resolveBtn.appendChild(parseSvg(ICON_CHECK));
      const span = document.createElement("span");
      setText(span, ` ${this.t("panel.resolve")}`);
      resolveBtn.appendChild(span);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "sp-btn-delete";
    deleteBtn.dataset.action = "delete";
    deleteBtn.appendChild(parseSvg(ICON_TRASH));
    const deleteBtnLabel = document.createElement("span");
    setText(deleteBtnLabel, ` ${this.t("panel.delete")}`);
    deleteBtn.appendChild(deleteBtnLabel);

    footer.appendChild(resolveBtn);
    footer.appendChild(deleteBtn);

    body.appendChild(header);
    body.appendChild(message);
    body.appendChild(expandBtn);
    body.appendChild(footer);

    card.appendChild(bar);
    card.appendChild(body);

    return card;
  }

  // ---------------------------------------------------------------------------
  // Bulk operations
  // ---------------------------------------------------------------------------

  private async bulkResolve(ids: string[]): Promise<void> {
    try {
      await Promise.all(ids.map((id) => this.client.resolveFeedback(id, true)));
      await this.loadFeedbacks();
    } catch (error) {
      this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private async bulkDelete(ids: string[]): Promise<void> {
    // G7 "확인 절차" — a confirm step for every delete path (single card,
    // bulk, detail view) since deletion has no undo. A cancelled confirm
    // throws WITHOUT emitting feedback:error (it isn't a failure) so the
    // bulk bar's catch just restores its buttons and keeps the selection.
    const confirmed = await this.showConfirmDialog(
      this.t("panel.deleteConfirmTitle"),
      tWithParams(this.t, "panel.deleteConfirmBulkMessage", { count: ids.length }),
    );
    if (!confirmed) throw new Error("Bulk delete cancelled");

    try {
      await Promise.all(ids.map((id) => this.client.deleteFeedback(id)));
      for (const id of ids) this.bus.emit("feedback:deleted", id);
      await this.loadFeedbacks();
    } catch (error) {
      this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Existing methods (preserved)
  // ---------------------------------------------------------------------------

  private async confirmDeleteAll(): Promise<void> {
    const confirmed = await this.showConfirmDialog(
      this.t("panel.deleteAllConfirmTitle"),
      this.t("panel.deleteAllConfirmMessage"),
    );
    if (!confirmed) return;

    this.deleteAllBtn.disabled = true;
    try {
      await this.client.deleteAllFeedbacks(this.projectName);
      this.bus.emit("feedback:all-deleted");
      await this.loadFeedbacks();
    } catch (error) {
      this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.deleteAllBtn.disabled = false;
    }
  }

  private showConfirmDialog(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const backdrop = el("div", { class: "sp-confirm-backdrop" });

      const titleId = `sp-confirm-title-${Date.now()}`;
      const messageId = `sp-confirm-msg-${Date.now()}`;

      const dialog = el("div", { class: "sp-confirm-dialog" });
      dialog.setAttribute("role", "alertdialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", titleId);
      dialog.setAttribute("aria-describedby", messageId);

      const titleEl = el("div", { class: "sp-confirm-title" });
      titleEl.id = titleId;
      setText(titleEl, title);

      const messageEl = el("div", { class: "sp-confirm-message" });
      messageEl.id = messageId;
      setText(messageEl, message);

      const btnRow = el("div", { class: "sp-confirm-actions" });

      const cancelBtn = document.createElement("button");
      cancelBtn.type = "button";
      cancelBtn.className = "sp-btn-ghost";
      setText(cancelBtn, this.t("panel.cancel"));

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className = "sp-btn-danger";
      setText(confirmBtn, this.t("panel.confirmDelete"));

      let closed = false;
      const close = (result: boolean) => {
        if (closed) return;
        closed = true;
        backdrop.removeEventListener("keydown", onKeydown);
        backdrop.style.opacity = "0";
        dialog.style.transform = "translateY(8px) scale(0.97)";
        setTimeout(() => {
          backdrop.remove();
          resolve(result);
        }, 200);
      };

      // Focus trap: Tab cycles between cancel and confirm
      const onKeydown = (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === "Escape") {
          close(false);
          return;
        }
        if (ke.key === "Tab") {
          ke.preventDefault();
          const active = (backdrop.getRootNode() as ShadowRoot).activeElement;
          if (active === cancelBtn) {
            confirmBtn.focus();
          } else {
            cancelBtn.focus();
          }
        }
      };
      backdrop.addEventListener("keydown", onKeydown);

      cancelBtn.addEventListener("click", () => close(false));
      confirmBtn.addEventListener("click", () => close(true));
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) close(false);
      });

      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(confirmBtn);
      dialog.appendChild(titleEl);
      dialog.appendChild(messageEl);
      dialog.appendChild(btnRow);
      backdrop.appendChild(dialog);

      this.root.getRootNode() instanceof ShadowRoot
        ? (this.root.getRootNode() as ShadowRoot).appendChild(backdrop)
        : this.root.appendChild(backdrop);

      requestAnimationFrame(() => {
        backdrop.style.opacity = "1";
        dialog.style.transform = "translateY(0) scale(1)";
        cancelBtn.focus();
      });
    });
  }

  /**
   * Single-card delete: optimistic hide + a 5-second UNDO toast instead of a
   * confirm dialog — faster than a dialog for the common case, and safer:
   * a mis-click is reversible for 5s rather than guarded by a prompt people
   * click through on autopilot. The actual API delete only fires when the
   * grace period lapses; UNDO cancels it and the card reappears. Bulk
   * delete and delete-all keep their dialogs (multi-item destruction still
   * deserves a deliberate stop).
   */
  private async deleteFeedback(feedback: FeedbackResponse, _btn: HTMLButtonElement): Promise<void> {
    if (this.pendingDeletes.has(feedback.id)) return;
    this.pendingMutations.add(feedback.id);

    const card = this.listContainer.querySelector<HTMLElement>(`[data-feedback-id="${CSS.escape(feedback.id)}"]`);
    if (card) card.style.display = "none";

    const timer = setTimeout(() => {
      this.pendingDeletes.delete(feedback.id);
      this.hideUndoToast();
      this.client
        .deleteFeedback(feedback.id)
        .then(() => {
          this.bus.emit("feedback:deleted", feedback.id);
          return this.loadFeedbacks();
        })
        .catch((error) => {
          if (card) card.style.display = "";
          this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
        })
        .finally(() => {
          this.pendingMutations.delete(feedback.id);
        });
    }, 5000);

    this.pendingDeletes.set(feedback.id, {
      timer,
      undo: () => {
        clearTimeout(timer);
        this.pendingDeletes.delete(feedback.id);
        this.pendingMutations.delete(feedback.id);
        if (card) card.style.display = "";
      },
    });
    this.showUndoToast();
  }

  /** Deferred single-card deletes still inside their UNDO window. */
  private pendingDeletes = new Map<string, { timer: ReturnType<typeof setTimeout>; undo: () => void }>();
  private undoToast: HTMLElement | null = null;

  private showUndoToast(): void {
    this.hideUndoToast();
    const toast = el("div", { class: "sp-undo-toast" });
    const label = el("span");
    setText(label, this.t("panel.deletedToast"));
    const undoBtn = document.createElement("button");
    undoBtn.className = "sp-undo-toast-btn";
    setText(undoBtn, this.t("panel.deleteUndo"));
    undoBtn.addEventListener("click", () => {
      // Undo the most recent pending delete — the one this toast announced.
      const last = [...this.pendingDeletes.values()].pop();
      last?.undo();
      this.hideUndoToast();
    });
    toast.appendChild(label);
    toast.appendChild(undoBtn);
    this.root.appendChild(toast);
    this.undoToast = toast;
  }

  private hideUndoToast(): void {
    this.undoToast?.remove();
    this.undoToast = null;
  }

  /**
   * Flush every delete still inside its UNDO window — called on panel close
   * and destroy, so a deferred delete can never be silently lost when the
   * UI goes away before its 5 seconds are up.
   */
  private flushPendingDeletes(): void {
    for (const [id, pending] of this.pendingDeletes) {
      clearTimeout(pending.timer);
      // Promise.resolve wrapper: this runs during teardown — even a client
      // that throws synchronously or returns a non-promise must not be able
      // to break destroy() halfway.
      Promise.resolve()
        .then(() => this.client.deleteFeedback(id))
        .then(() => this.bus.emit("feedback:deleted", id))
        .catch(() => {});
      this.pendingMutations.delete(id);
    }
    this.pendingDeletes.clear();
    this.hideUndoToast();
  }

  private async toggleResolve(feedback: FeedbackResponse, btn: HTMLButtonElement): Promise<void> {
    this.pendingMutations.add(feedback.id);
    const restore = setButtonLoading(btn);
    try {
      // Closed statuses (resolved, wont_fix) reopen; open/in_progress resolve.
      const newResolved = !isClosedStatus(feedback.status);
      await this.client.resolveFeedback(feedback.id, newResolved);
      await this.loadFeedbacks();
    } catch (error) {
      restore();
      this.bus.emit("feedback:error", error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.pendingMutations.delete(feedback.id);
    }
  }

  private buildTypeDropdown(): HTMLElement {
    this.typeOptions = [
      {
        value: "all",
        label: this.t("panel.filterAll"),
        icon: ICON_LAYERS,
        color: this.colors.accent,
        bg: this.colors.accentLight,
      },
      {
        value: "question",
        label: this.t("type.question"),
        icon: ICON_QUESTION,
        color: this.colors.typeQuestion,
        bg: this.colors.typeQuestionBg,
      },
      {
        value: "change",
        label: this.t("type.change"),
        icon: ICON_CHANGE,
        color: this.colors.typeChange,
        bg: this.colors.typeChangeBg,
      },
      {
        value: "bug",
        label: this.t("type.bug"),
        icon: ICON_BUG,
        color: this.colors.typeBug,
        bg: this.colors.typeBugBg,
      },
      {
        value: "other",
        label: this.t("type.other"),
        icon: ICON_OTHER,
        color: this.colors.typeOther,
        bg: this.colors.typeOtherBg,
      },
    ];

    this.typeDropdownContainer = el("div", { class: "sp-filter-dropdown" });

    this.typeDropdownBtn = document.createElement("button");
    this.typeDropdownBtn.type = "button";
    this.typeDropdownBtn.className = "sp-filter-dropdown-btn";
    this.typeDropdownBtn.setAttribute("aria-haspopup", "listbox");
    this.typeDropdownBtn.setAttribute("aria-expanded", "false");
    this.renderTypeDropdownTrigger();

    this.typeDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.typeDropdownMenu) this.closeTypeDropdown();
      else this.openTypeDropdown();
    });

    this.typeDropdownContainer.appendChild(this.typeDropdownBtn);
    return this.typeDropdownContainer;
  }

  private renderTypeDropdownTrigger(): void {
    const active = this.typeOptions.find((o) => this.activeFilters.has(o.value)) ?? this.typeOptions[0];
    if (!active) return;

    this.typeDropdownBtn.replaceChildren();
    this.typeDropdownBtn.style.setProperty("--sp-chip-color", active.color);
    this.typeDropdownBtn.style.setProperty("--sp-chip-bg", active.bg);
    this.typeDropdownBtn.dataset.filter = active.value;
    this.typeDropdownBtn.classList.toggle("sp-filter-dropdown-btn--filtered", active.value !== "all");
    this.typeDropdownBtn.setAttribute("aria-label", `${this.t("type.label")}: ${active.label}`);

    const iconWrap = el("span", { class: "sp-filter-dropdown-btn__icon" });
    iconWrap.appendChild(parseSvg(active.icon));
    this.typeDropdownBtn.appendChild(iconWrap);

    const labelWrap = el("span", { class: "sp-filter-dropdown-btn__label" });
    const prefix = el("span", { class: "sp-filter-dropdown-btn__prefix" });
    setText(prefix, this.t("type.label"));
    const value = el("span", { class: "sp-filter-dropdown-btn__value" });
    setText(value, active.label);
    labelWrap.appendChild(prefix);
    labelWrap.appendChild(value);
    this.typeDropdownBtn.appendChild(labelWrap);

    const chevron = el("span", { class: "sp-filter-dropdown-btn__chevron" });
    chevron.appendChild(parseSvg(ICON_CHEVRON_DOWN));
    this.typeDropdownBtn.appendChild(chevron);
  }

  private openTypeDropdown(): void {
    this.typeDropdownMenu = el("div", { class: "sp-filter-dropdown-menu" });
    this.typeDropdownMenu.setAttribute("role", "listbox");
    this.typeDropdownMenu.setAttribute("aria-label", this.t("type.label"));
    this.typeDropdownBtn.setAttribute("aria-expanded", "true");

    for (const option of this.typeOptions) {
      const item = document.createElement("button");
      item.type = "button";
      const isActive = this.activeFilters.has(option.value);
      item.className = `sp-filter-dropdown-option${isActive ? " sp-filter-dropdown-option--active" : ""}`;
      item.style.setProperty("--sp-chip-color", option.color);
      item.style.setProperty("--sp-chip-bg", option.bg);
      item.dataset.filter = option.value;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(isActive));

      const iconWrap = el("span", { class: "sp-filter-dropdown-option__icon" });
      iconWrap.appendChild(parseSvg(option.icon));
      item.appendChild(iconWrap);

      const labelEl = el("span", { class: "sp-filter-dropdown-option__label" });
      setText(labelEl, option.label);
      item.appendChild(labelEl);

      if (isActive) {
        const checkWrap = el("span", { class: "sp-filter-dropdown-option__check" });
        checkWrap.appendChild(parseSvg(ICON_CHECK));
        item.appendChild(checkWrap);
      }

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectTypeFilter(option.value);
      });

      this.typeDropdownMenu.appendChild(item);
    }

    this.typeDropdownContainer.appendChild(this.typeDropdownMenu);

    requestAnimationFrame(() => {
      this.typeDropdownOutsideHandler = (e: MouseEvent) => {
        if (this.typeDropdownMenu && !this.typeDropdownContainer.contains(e.target as Node)) {
          this.closeTypeDropdown();
        }
      };
      document.addEventListener("click", this.typeDropdownOutsideHandler, true);
    });

    this.typeDropdownMenu.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeTypeDropdown();
        this.typeDropdownBtn.focus();
      }
    });
  }

  private closeTypeDropdown(): void {
    if (this.typeDropdownMenu) {
      this.typeDropdownMenu.remove();
      this.typeDropdownMenu = null;
    }
    this.typeDropdownBtn.setAttribute("aria-expanded", "false");
    if (this.typeDropdownOutsideHandler) {
      document.removeEventListener("click", this.typeDropdownOutsideHandler, true);
      this.typeDropdownOutsideHandler = null;
    }
  }

  private selectTypeFilter(value: string): void {
    this.activeFilters.clear();
    this.activeFilters.add(value);
    this.renderTypeDropdownTrigger();
    this.closeTypeDropdown();
    this.loadFeedbacks().catch(() => {});
  }

  private buildStatusSegmented(): HTMLElement {
    this.statusSegmented = new SegmentedControl<"all" | FeedbackStatus>({
      options: [
        {
          value: "all",
          label: this.t("panel.statusAll"),
          icon: ICON_LAYERS,
          color: this.colors.accent,
          bg: this.colors.accentLight,
        },
        {
          value: "open",
          label: this.t("panel.statusOpen"),
          icon: ICON_DOT_OPEN,
          color: this.colors.statusOpen,
          bg: this.colors.statusOpenBg,
        },
        {
          value: "resolved",
          label: this.t("panel.statusResolved"),
          icon: ICON_CHECK,
          color: this.colors.statusResolved,
          bg: this.colors.statusResolvedBg,
        },
      ],
      value: "all",
      onChange: () => {
        this.loadFeedbacks().catch(() => {});
      },
      ariaLabel: this.t("status.label"),
      datasetKey: "statusFilter",
      modifierPrefix: "sp-segmented__btn--",
    });

    return this.statusSegmented.element;
  }

  /**
   * Build the page-scope segmented control: "this page / this type / all".
   * The "this type" button is hidden when the current scope has no urlPattern
   * (host did not provide one for this route). Visibility is refreshed on
   * every `loadFeedbacks` so SPA navigation stays consistent.
   */
  private buildScopeSegmented(): HTMLElement {
    this.scopeSegmented = new SegmentedControl<"this" | "template" | "all">({
      options: [
        { value: "this", label: this.t("scope.thisPage") },
        { value: "template", label: this.t("scope.thisType") },
        { value: "all", label: this.t("scope.all") },
      ],
      value: this.initialScopeFilter,
      onChange: () => {
        this.loadFeedbacks().catch(() => {});
      },
      ariaLabel: this.t("scope.label"),
      datasetKey: "scopeFilter",
      modifierPrefix: "sp-segmented__btn--scope-",
      extraClass: "sp-segmented--scope",
    });

    // Initial visibility — "this type" only meaningful when scope has urlPattern
    this.syncScopeAvailability();
    return this.scopeSegmented.element;
  }

  /**
   * Hide the "this type" button when the current scope has no urlPattern, and
   * fall back to "this page" if it was the active selection. Called on every
   * `loadFeedbacks` so SPA navigation stays consistent.
   */
  private syncScopeAvailability(): void {
    if (!this.scopeSegmented) return;
    const scope = this.getScope();
    const showTemplate = !!scope.urlPattern;
    this.scopeSegmented.setOptionVisible("template", showTemplate);
    if (!showTemplate && this.scopeSegmented.value === "template") {
      this.scopeSegmented.select("this");
    }
  }

  /** Get the focused feedback (for keyboard shortcuts) */
  private getFocusedFeedback(): FeedbackResponse | undefined {
    const idx = getFocusedCardIndex(this.listContainer);
    if (idx < 0) return undefined;
    const card = this.listContainer.querySelectorAll<HTMLElement>(".sp-card")[idx];
    if (!card) return undefined;
    return this.feedbacks.find((f) => f.id === card.dataset.feedbackId);
  }

  /** Mark one card as the current selection (selection-colored ring), clearing any previous one. */
  private setSelectedCard(feedbackId: string | null): void {
    this.selectedFeedbackId = feedbackId;
    for (const selected of this.listContainer.querySelectorAll(".sp-card--selected")) {
      selected.classList.remove("sp-card--selected");
    }
    if (!feedbackId) return;
    const card = this.listContainer.querySelector<HTMLElement>(`[data-feedback-id="${CSS.escape(feedbackId)}"]`);
    card?.classList.add("sp-card--selected");
  }

  scrollToFeedback(feedbackId: string): void {
    this.setSelectedCard(feedbackId);
    const escapedId = CSS.escape(feedbackId);
    const card = this.listContainer.querySelector<HTMLElement>(`[data-feedback-id="${escapedId}"]`);
    if (!card) {
      // A marker click opens the panel and fires this synchronously, while
      // the list is still loading — remember the target so renderList()
      // finishes the scroll once the card actually exists.
      this.pendingScrollFeedbackId = feedbackId;
      return;
    }
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("sp-anim-flash");
    card.addEventListener(
      "animationend",
      () => {
        card.classList.remove("sp-anim-flash");
      },
      { once: true },
    );
  }

  /** Refresh the panel after a new feedback is submitted */
  async refresh(): Promise<void> {
    if (this.isOpen) {
      await this.loadFeedbacks();
    }
  }

  /** Whether the panel is currently open — used by the launcher to coordinate marker refreshes. */
  get isCurrentlyOpen(): boolean {
    return this.isOpen;
  }

  /** Whether the settings accordion is expanded — the launcher restores this across an `updateConfig()` remount. */
  get isSettingsExpanded(): boolean {
    return this.settings?.isExpanded ?? false;
  }

  /** Re-expand the settings accordion — used by the launcher right after an `updateConfig()` remount. */
  expandSettings(): void {
    this.settings?.expand();
  }

  destroy(): void {
    this.flushPendingDeletes();
    this.loadController?.abort();
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.listContainer.removeEventListener("click", this.onListClick);
    this.listContainer.removeEventListener("keydown", this.onListKeydown);
    this.listContainer.removeEventListener("mouseover", this.onListMouseover);
    this.listContainer.removeEventListener("mouseout", this.onListMouseout);
    document.removeEventListener("sp-marker-click", this.onMarkerClick);
    document.removeEventListener("click", this.onDocumentClick);
    this.closeTypeDropdown();
    this.sortControls.destroy();
    this.bulk.destroy();
    this.exportBtn.destroy();
    this.agentCopyBtn.destroy();
    this.shortcuts.destroy();
    this.detail.destroy();
    this.settings?.destroy();
    this.root.remove();
  }
}
