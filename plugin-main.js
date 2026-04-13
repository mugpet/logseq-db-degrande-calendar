(() => {
const FALLBACK_PLUGIN_VERSION = "0.1.4";
const PAGEBAR_ITEM_KEY = "degrande-calendar-weekbar";
const TOOLBAR_ITEM_KEY = "degrande-calendar-toggle";
const PAGEBAR_ROOT_ID = "degrande-calendar-pagebar";
const FALLBACK_ROOT_ID = "degrande-calendar-inline-bar";
const TOOLBAR_TOGGLE_ID = "degrande-calendar-toolbar-toggle";
const MAIN_CONTENT_CONTAINER_ID = "main-content-container";
const PAGEBAR_REGISTRY_KEY = "__degrandeCalendarRegisteredPagebars";
const HOST_SESSION_KEY = "__degrandeCalendarHostSession";
const COMMAND_REGISTRY_KEY = "__degrandeCalendarRegisteredCommands";
const HOST_OBSERVER_KEY = "__degrandeCalendarHostObserver";
const ROOT_BINDING_KEY = "__degrandeCalendarBound";
const ROOT_REFS_KEY = "__degrandeCalendarRefs";
const STYLE_RESOURCE = "custom.css";
const PREVIEW_ROOT_ID = "degrande-calendar-preview-popup";

const DAY_NAME_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const DAY_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { day: "numeric" });
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const RANGE_MONTH_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const RANGE_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { day: "numeric" });
const RANGE_MONTH_DAY_YEAR_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const MAX_MONTH_BUTTONS = 31;
const MAX_MONTH_WEEK_ROWS = 6;
const FIRST_DAY_CHOICES = [
  "Sunday",
  "Monday",
];
const VIEW_MODE_CHOICES = [
  "Week",
  "Month",
];
const VISIBILITY_MODE_CHOICES = [
  "Everywhere",
  "Only journals and day pages",
];
const SETTINGS_SCHEMA = [
  {
    key: "firstDayOfWeek",
    type: "enum",
    title: "First day of week",
    description: "Choose which weekday the calendar should treat as the start of the week.",
    default: "Monday",
    enumChoices: FIRST_DAY_CHOICES,
    enumPicker: "select",
  },
  {
    key: "calendarView",
    type: "enum",
    title: "Calendar view",
    description: "Remember the last selected calendar view.",
    default: "Week",
    enumChoices: VIEW_MODE_CHOICES,
    enumPicker: "select",
  },
  {
    key: "calendarVisibility",
    type: "enum",
    title: "Calendar visibility",
    description: "Choose whether the calendar shows everywhere or only in journals and day pages.",
    default: "Everywhere",
    enumChoices: VISIBILITY_MODE_CHOICES,
    enumPicker: "select",
  },
];

const state = {
  route: { path: "", template: "" },
  currentPage: null,
  currentJournalDate: null,
  visibleWeekStart: null,
  visibleMonthStart: null,
  firstDayOfWeek: 1,
  visibilityMode: "everywhere",
  lastSidebarPreviewId: null,
  today: startOfLocalDay(new Date()),
  isVisible: false,
  renderTimer: null,
  layoutTimer: null,
  syncToken: 0,
  pendingAnimationDirection: 0,
  navigationToken: 0,
  freezeObserverUntil: 0,
  isDbGraph: false,
  preferredDateFormat: null,
  journalPresence: {},
  journalPages: {},
  journalPresenceToken: 0,
  domSyncTimer: null,
  previewShowTimer: null,
  previewHideTimer: null,
  previewRoot: null,
  previewReactRoot: null,
  previewReactMount: null,
  previewActiveDayKey: null,
  previewRequestToken: 0,
  viewMode: "week",
  calendarExpanded: true,
};

function getPluginVersion() {
  return document
    .querySelector('meta[name="degrande-calendar-version"]')
    ?.getAttribute("content")
    || FALLBACK_PLUGIN_VERSION;
}

const PLUGIN_VERSION = getPluginVersion();

function getHostWindow() {
  try {
    return top || window;
  } catch (_error) {
    return window;
  }
}

function getHostDocument() {
  try {
    return getHostWindow().document || document;
  } catch (_error) {
    return document;
  }
}

function startOfLocalDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value, amount) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return startOfLocalDay(date);
}

function addWeeks(value, amount) {
  return addDays(value, amount * 7);
}

function addMonths(value, amount) {
  const date = startOfLocalDay(value);
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  return startOfLocalDay(date);
}

function startOfWeek(value) {
  const date = startOfLocalDay(value);
  const weekday = date.getDay();
  const firstDay = state.firstDayOfWeek;
  let distanceToWeekStart = firstDay - weekday;

  if (distanceToWeekStart > 0) {
    distanceToWeekStart -= 7;
  }

  return addDays(date, distanceToWeekStart);
}

function normalizeFirstDayOfWeek(value) {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    const fromLabel = FIRST_DAY_CHOICES.findIndex((choice) => choice.toLowerCase() === normalized);

    if (fromLabel >= 0) {
      return fromLabel;
    }
  }

  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 6) {
    return parsed;
  }

  return 1;
}

function applyPluginSettings(settings) {
  state.firstDayOfWeek = normalizeFirstDayOfWeek(settings?.firstDayOfWeek);
  state.viewMode = settings?.calendarView === "Month" ? "month" : "week";
  state.visibilityMode = settings?.calendarVisibility === "Only journals and day pages"
    ? "journals-only"
    : "everywhere";
}

function startOfMonth(value) {
  const date = startOfLocalDay(value);
  date.setDate(1);
  return date;
}

function endOfMonth(value) {
  const date = startOfMonth(value);
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return startOfLocalDay(date);
}

function isSameDay(left, right) {
  return Boolean(left && right)
    && left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function isDateWithinWeek(value, weekStart) {
  if (!value || !weekStart) {
    return false;
  }

  const date = startOfLocalDay(value);
  const weekEnd = addDays(weekStart, 6);
  return date >= weekStart && date <= weekEnd;
}

function isSameMonth(left, right) {
  return Boolean(left && right)
    && left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth();
}

function getIsoWeekNumber(value) {
  const date = startOfLocalDay(value);
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - weekday);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function isConfiguredFirstDayOfWeek(date) {
  return startOfLocalDay(date).getDay() === state.firstDayOfWeek;
}

function getDisplayedWeekNumber(date) {
  const weekStart = startOfWeek(date);
  const referenceDate = state.firstDayOfWeek === 0
    ? addDays(weekStart, 1)
    : weekStart;

  return getIsoWeekNumber(referenceDate);
}

function getMonthGridColumnStart(date) {
  const normalizedDate = startOfLocalDay(date);
  return ((normalizedDate.getDay() - state.firstDayOfWeek + 7) % 7) + 1;
}

function getMonthGridRow(date, monthStart) {
  const columnStart = getMonthGridColumnStart(monthStart);
  const dayOffset = startOfLocalDay(date).getDate() - 1;
  return Math.floor((columnStart - 1 + dayOffset) / 7) + 1;
}

function getMonthGridColumn(date, monthStart) {
  const columnStart = getMonthGridColumnStart(monthStart);
  const dayOffset = startOfLocalDay(date).getDate() - 1;
  return ((columnStart - 1 + dayOffset) % 7) + 2;
}

function getMonthWeekRowCount(monthStart) {
  const firstColumn = getMonthGridColumnStart(monthStart);
  const totalDays = endOfMonth(monthStart).getDate();
  return Math.ceil((firstColumn - 1 + totalDays) / 7);
}

function dateFromJournalDay(journalDay) {
  if (typeof journalDay !== "number" || Number.isNaN(journalDay)) {
    return null;
  }

  const raw = String(journalDay);

  if (raw.length !== 8) {
    return null;
  }

  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6)) - 1;
  const day = Number(raw.slice(6, 8));
  return startOfLocalDay(new Date(year, month, day));
}

function resolveJournalDate(page) {
  if (!page) {
    return null;
  }

  if (page["journal?"] === true || typeof page.journalDay === "number") {
    return dateFromJournalDay(page.journalDay) || null;
  }

  return null;
}

function getOrdinalDay(value) {
  const remainderTen = value % 10;
  const remainderHundred = value % 100;

  if (remainderTen === 1 && remainderHundred !== 11) {
    return `${value}st`;
  }

  if (remainderTen === 2 && remainderHundred !== 12) {
    return `${value}nd`;
  }

  if (remainderTen === 3 && remainderHundred !== 13) {
    return `${value}rd`;
  }

  return `${value}th`;
}

function formatJournalTitleWithPattern(date, pattern) {
  const normalizedDate = startOfLocalDay(date);
  const weekdayLong = new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(normalizedDate);
  const weekdayShort = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(normalizedDate);
  const dayNumber = normalizedDate.getDate();
  const replacements = {
    yyyy: String(normalizedDate.getFullYear()),
    yy: String(normalizedDate.getFullYear()).slice(-2),
    MMMM: new Intl.DateTimeFormat(undefined, { month: "long" }).format(normalizedDate),
    MMM: new Intl.DateTimeFormat(undefined, { month: "short" }).format(normalizedDate),
    MM: String(normalizedDate.getMonth() + 1).padStart(2, "0"),
    M: String(normalizedDate.getMonth() + 1),
    do: getOrdinalDay(dayNumber),
    dd: String(dayNumber).padStart(2, "0"),
    d: String(dayNumber),
    EEEE: weekdayLong,
    EEE: weekdayShort,
    EE: weekdayShort.slice(0, 2),
    E: weekdayShort,
  };

  return pattern.replace(/yyyy|yy|MMMM|MMM|MM|M|do|dd|d|EEEE|EEE|EE|E/g, (token) => replacements[token] || token);
}

async function ensureUserDateFormat() {
  if (state.preferredDateFormat) {
    return state.preferredDateFormat;
  }

  try {
    const userConfigs = await logseq.App.getUserConfigs();
    state.preferredDateFormat = userConfigs?.preferredDateFormat || null;
  } catch (error) {
    console.warn("[Degrande Calendar] Failed to read user date format", error);
  }

  return state.preferredDateFormat;
}

async function resolveJournalPageIdentity(date) {
  const preferredDateFormat = await ensureUserDateFormat();

  if (!preferredDateFormat) {
    return startOfLocalDay(date).toISOString().slice(0, 10);
  }

  return formatJournalTitleWithPattern(date, preferredDateFormat);
}

function formatLocalIsoDate(date) {
  const normalizedDate = startOfLocalDay(date);
  const year = String(normalizedDate.getFullYear());
  const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
  const day = String(normalizedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPageUuid(page) {
  return page?.uuid || page?.["block/uuid"] || null;
}

function getPageNavigationTargets(page) {
  return [
    getPageUuid(page),
    page?.name,
    page?.originalName,
    page?.title,
    page?.["block/name"],
    page?.["block/title"],
  ].filter(Boolean);
}

async function findJournalPageByDate(date) {
  const journalDay = toJournalDayNumber(date);

  try {
    const result = await logseq.DB.datascriptQuery(`
      [:find (pull ?p [*])
       :where
       [?p :block/journal-day ${journalDay}]]
    `);
    const pages = (result || []).flat().filter(Boolean);
    return pages[0] || null;
  } catch (error) {
    console.warn("[Degrande Calendar] Failed to query journal page by day", error);
    return null;
  }
}

async function ensureJournalPageForDate(date) {
  const existingPage = await findJournalPageByDate(date);

  if (getPageUuid(existingPage)) {
    return existingPage;
  }

  try {
    const page = await logseq.Editor.createJournalPage(date);

    if (getPageUuid(page)) {
      return page;
    }
  } catch (error) {
    console.warn("[Degrande Calendar] createJournalPage failed, trying ISO fallback", error);
  }

  const queriedPage = await findJournalPageByDate(date);

  if (getPageUuid(queriedPage)) {
    return queriedPage;
  }

  const isoDate = formatLocalIsoDate(date);
  let page = await logseq.Editor.getPage(isoDate);

  if (!page) {
    page = await logseq.Editor.createPage(isoDate, {}, {
      journal: true,
      redirect: false,
    });
  }

  if (getPageUuid(page)) {
    return page;
  }

  const postCreatePage = await findJournalPageByDate(date);

  if (!getPageUuid(postCreatePage)) {
    throw new Error("Journal page could not be resolved for navigation");
  }

  return postCreatePage;
}

async function refreshVisibleWeekJournalPresence() {
  if (!state.visibleWeekStart) {
    state.journalPresence = {};
    state.journalPages = {};
    queueRender();
    return;
  }

  const token = ++state.journalPresenceToken;
  const visibleWeekDates = getVisibleDates();

  try {
    const weekStartNumber = toJournalDayNumber(visibleWeekDates[0]);
    const weekEndNumber = toJournalDayNumber(visibleWeekDates[visibleWeekDates.length - 1]);
    const result = await logseq.DB.datascriptQuery(`
      [:find (pull ?p [*])
       :where
       [?p :block/journal-day ?d]
       [(>= ?d ${weekStartNumber})]
       [(<= ?d ${weekEndNumber})]]
    `);

    if (token !== state.journalPresenceToken) {
      return;
    }

    const pages = (result || []).flat().filter(Boolean);
    const journalPages = Object.fromEntries(
      pages
        .map((page) => {
          const journalDay = page?.["journal-day"] ?? page?.journalDay ?? page?.[":block/journal-day"];

          if (typeof journalDay !== "number") {
            return null;
          }

          const date = dateFromJournalDay(journalDay);

          if (!date) {
            return null;
          }

          return [getDayKey(date), page];
        })
        .filter(Boolean)
    );

    state.journalPages = journalPages;
    state.journalPresence = Object.fromEntries(
      visibleWeekDates.map((date) => [
        getDayKey(date),
        Boolean(journalPages[getDayKey(date)]),
      ])
    );
    queueRender();
    return;
  } catch (error) {
    console.warn("[Degrande Calendar] Failed to query visible-week journal presence", error);
  }

  if (token !== state.journalPresenceToken) {
    return;
  }

  state.journalPresence = Object.fromEntries(
    visibleWeekDates.map((date) => [getDayKey(date), false])
  );
  state.journalPages = {};
  queueRender();
}

function clearPreviewShowTimer() {
  if (state.previewShowTimer) {
    clearTimeout(state.previewShowTimer);
    state.previewShowTimer = null;
  }
}

function clearPreviewHideTimer() {
  if (state.previewHideTimer) {
    clearTimeout(state.previewHideTimer);
    state.previewHideTimer = null;
  }
}

function ensurePreviewRoot() {
  const hostDocument = getHostDocument();
  let root = hostDocument.getElementById(PREVIEW_ROOT_ID);

  if (!root) {
    root = hostDocument.createElement("div");
    root.id = PREVIEW_ROOT_ID;
    root.className = "ls-preview-popup dgc-preview-popup is-hidden";
    root.addEventListener("mouseenter", () => {
      clearPreviewHideTimer();
    });
    root.addEventListener("mouseleave", () => {
      scheduleHidePreview();
    });
    hostDocument.body.appendChild(root);
  }

  state.previewRoot = root;
  return root;
}

function getPreviewDependencies() {
  const experiments = logseq.Experiments;
  return {
    React: experiments?.React,
    ReactDOM: experiments?.ReactDOM,
    Editor: experiments?.Components?.Editor,
    jsxToClj: experiments?.Utils?.jsxToClj,
    toClj: experiments?.Utils?.toClj,
    toKeyword: experiments?.Utils?.toKeyword,
  };
}

function getInternalBlockPageComponent() {
  const hostWindow = getHostWindow();
  const stateApi = hostWindow?.frontend?.state;
  const { toKeyword } = getPreviewDependencies();

  if (typeof stateApi?.get_component !== "function" || typeof toKeyword !== "function") {
    return null;
  }

  try {
    return stateApi.get_component(toKeyword("block/page-cp"));
  } catch (error) {
    console.warn("[Degrande Calendar] Failed to read internal page-ref component", error);
    return null;
  }
}

function clearNativePreviewSlot(slot) {
  if (!slot) {
    return;
  }

  if (slot.__dgcReactRoot && typeof slot.__dgcReactRoot.unmount === "function") {
    slot.__dgcReactRoot.unmount();
  }

  slot.__dgcReactRoot = null;
  slot.innerHTML = "";
}

function mountNativePreviewSlot(slot, page) {
  const pageRefCp = getInternalBlockPageComponent();
  const { React, ReactDOM, jsxToClj, toClj } = getPreviewDependencies();

  if (!slot || !page || !pageRefCp || !React || !ReactDOM || !jsxToClj || !toClj) {
    clearNativePreviewSlot(slot);
    return false;
  }

  const pageData = toClj({
    "db/id": page?.id ?? page?.["db/id"] ?? null,
    "block/uuid": page?.uuid ?? page?.["block/uuid"] ?? null,
    "block/name": page?.name ?? page?.originalName ?? page?.["block/name"] ?? null,
    "block/title": page?.originalName ?? page?.name ?? page?.title ?? page?.["block/title"] ?? null,
  });
  const config = jsxToClj({ "disable-click": true });
  const NativeRef = () => pageRefCp(config, pageData);

  try {
    if (typeof ReactDOM.createRoot === "function") {
      if (!slot.__dgcReactRoot) {
        slot.__dgcReactRoot = ReactDOM.createRoot(slot);
      }

      slot.__dgcReactRoot.render(React.createElement(NativeRef));
      return true;
    }

    if (typeof ReactDOM.render === "function") {
      ReactDOM.render(React.createElement(NativeRef), slot);
      return true;
    }
  } catch (error) {
    console.warn("[Degrande Calendar] Failed to mount native preview ref", error);
  }

  clearNativePreviewSlot(slot);
  return false;
}

function renderInternalNativePreviewPage(root, pageIdentifier) {
  const hostWindow = getHostWindow();
  const stateApi = hostWindow?.frontend?.state;
  const getPageCp = stateApi?.get_page_blocks_cp;
  const getCurrentRepo = stateApi?.get_current_repo;
  const { React, ReactDOM, jsxToClj } = getPreviewDependencies();

  if (!React || !ReactDOM || !jsxToClj || typeof getPageCp !== "function" || typeof getCurrentRepo !== "function" || !root || !pageIdentifier) {
    return false;
  }

  const pageCp = getPageCp();

  if (typeof pageCp !== "function") {
    return false;
  }

  let mount = state.previewReactMount;

  if (!mount || mount.parentElement !== root) {
    root.innerHTML = "";
    mount = root.ownerDocument.createElement("div");
    mount.className = "dgc-preview-mount";
    root.appendChild(mount);
    state.previewReactMount = mount;
    state.previewReactRoot = null;
  }

  const previewProps = {
    repo: getCurrentRepo(),
    sidebar: false,
    preview: true,
    "page-name": String(pageIdentifier),
    "scroll-container": root,
  };

  const NativePreview = () => pageCp(jsxToClj(previewProps));

  try {
    const element = React.createElement(NativePreview);

    if (typeof ReactDOM.createRoot === "function") {
      if (!state.previewReactRoot) {
        state.previewReactRoot = ReactDOM.createRoot(mount);
      }

      state.previewReactRoot.render(element);
      root.className = "ls-preview-popup dgc-preview-popup is-native";
      return true;
    }

    if (typeof ReactDOM.render === "function") {
      ReactDOM.render(element, mount);
      root.className = "ls-preview-popup dgc-preview-popup is-native";
      return true;
    }
  } catch (error) {
    console.warn("[Degrande Calendar] Failed to render internal native preview", error);
  }

  return false;
}

function renderNativePreviewPage(root, pageIdentifier) {
  if (renderInternalNativePreviewPage(root, pageIdentifier)) {
    return true;
  }

  const { React, ReactDOM, Editor } = getPreviewDependencies();

  if (!React || !ReactDOM || !Editor || !root || !pageIdentifier) {
    return false;
  }

  let mount = state.previewReactMount;

  if (!mount || mount.parentElement !== root) {
    root.innerHTML = "";
    mount = root.ownerDocument.createElement("div");
    mount.className = "dgc-preview-mount";
    root.appendChild(mount);
    state.previewReactMount = mount;
    state.previewReactRoot = null;
  }

  const element = React.createElement(
    "div",
    {
      className: "tippy-wrapper as-page",
      tabIndex: -1,
      style: {
        width: "100%",
        textAlign: "left",
        fontWeight: 500,
        paddingBottom: "64px",
      },
    },
    React.createElement(Editor, { page: String(pageIdentifier) })
  );

  try {
    if (typeof ReactDOM.createRoot === "function") {
      if (!state.previewReactRoot) {
        state.previewReactRoot = ReactDOM.createRoot(mount);
      }

      state.previewReactRoot.render(element);
      root.className = "ls-preview-popup dgc-preview-popup is-native";
      return true;
    }

    if (typeof ReactDOM.render === "function") {
      ReactDOM.render(element, mount);
      root.className = "ls-preview-popup dgc-preview-popup is-native";
      return true;
    }
  } catch (error) {
    console.warn("[Degrande Calendar] Failed to render native preview", error);
  }

  return false;
}

function renderFallbackPreviewPage(root, pageTitle, previewLines) {
  if (!root) {
    return;
  }

  if (state.previewReactRoot && typeof state.previewReactRoot.unmount === "function") {
    state.previewReactRoot.unmount();
    state.previewReactRoot = null;
  }

  state.previewReactMount = null;
  root.className = "ls-preview-popup dgc-preview-popup is-fallback";
  root.innerHTML = `
    <div class="tippy-wrapper as-page dgc-preview-card" tabindex="-1">
      <div class="dgc-preview-head">
        <div class="dgc-preview-title">${escapeHtml(pageTitle)}</div>
        <div class="dgc-preview-chip-row"><span class="dgc-preview-chip"># Journal</span></div>
      </div>
      <div class="dgc-preview-body">
        ${previewLines.length
          ? previewLines.map(({ text, depth }) => `<div class="dgc-preview-line" style="padding-left:${Math.min(depth, 4) * 16}px">${escapeHtml(text)}</div>`).join("")
          : '<div class="dgc-preview-empty">No journal content yet.</div>'}
      </div>
    </div>
  `;
}

function hidePreview() {
  clearPreviewShowTimer();
  clearPreviewHideTimer();
  state.previewRequestToken += 1;
  state.previewActiveDayKey = null;

  if (state.previewRoot) {
    state.previewRoot.classList.add("is-hidden");
  }
}

function scheduleHidePreview(delay = 300) {
  clearPreviewHideTimer();
  state.previewHideTimer = setTimeout(() => {
    state.previewHideTimer = null;
    hidePreview();
  }, delay);
}

function positionPreviewRoot(root, triggerElement) {
  if (!root || !triggerElement) {
    return;
  }

  const hostWindow = getHostWindow();
  const triggerRect = triggerElement.getBoundingClientRect();
  const rootWidth = Math.min(600, Math.max(360, Math.round(hostWindow.innerWidth * 0.42)));
  const left = Math.max(12, Math.min(triggerRect.left - 20, hostWindow.innerWidth - rootWidth - 12));
  const top = Math.max(12, Math.min(triggerRect.bottom + 8, hostWindow.innerHeight - 160));

  root.style.width = `${rootWidth}px`;
  root.style.left = `${Math.round(left)}px`;
  root.style.top = `${Math.round(top)}px`;
}

async function showPreviewForDay(triggerElement, date) {
  const dayKey = getDayKey(date);
  const page = state.journalPages[dayKey];
  const requestToken = ++state.previewRequestToken;

  if (!page) {
    hidePreview();
    return;
  }

  const pageIdentifier = page?.uuid || page?.name || page?.originalName;
  const root = ensurePreviewRoot();

  if (!pageIdentifier || !root) {
    hidePreview();
    return;
  }

  let blockTree = [];
  const pageTitle = page?.originalName || page?.name || page?.title || FULL_DATE_FORMATTER.format(date);

  if (!renderNativePreviewPage(root, String(pageIdentifier))) {
    try {
      blockTree = await logseq.Editor.getPageBlocksTree(String(pageIdentifier)) || [];
    } catch (error) {
      console.warn("[Degrande Calendar] Failed to load preview blocks", error);
    }

    if (requestToken !== state.previewRequestToken) {
      return;
    }

    const previewLines = flattenPreviewBlocks(blockTree);
    renderFallbackPreviewPage(root, pageTitle, previewLines);
  }

  if (requestToken !== state.previewRequestToken) {
    return;
  }

  if (requestToken !== state.previewRequestToken) {
    hidePreview();
    return;
  }

  state.previewActiveDayKey = dayKey;
  positionPreviewRoot(root, triggerElement);
  root.classList.remove("is-hidden");
}

function schedulePreviewForDay(triggerElement, date) {
  const dayKey = getDayKey(date);

  clearPreviewHideTimer();

  if (state.previewActiveDayKey === dayKey) {
    return;
  }

  clearPreviewShowTimer();
  state.previewShowTimer = setTimeout(() => {
    state.previewShowTimer = null;
    void showPreviewForDay(triggerElement, date);
  }, 1000);
}

function inferRouteFromLocation() {
  try {
    const locationLike = getHostWindow().location;
    const hash = `${locationLike?.hash || ""}`;
    return {
      path: hash,
      template: hash,
    };
  } catch (_error) {
    return { path: "", template: "" };
  }
}

function isJournalsRoute(route) {
  const inferredRoute = inferRouteFromLocation();
  const combined = `${route?.template || ""} ${route?.path || ""} ${inferredRoute.template || ""} ${inferredRoute.path || ""}`.toLowerCase();
  return combined.includes("journals");
}

function hasJournalTitlesInView() {
  const hostDocument = getHostDocument();
  return Boolean(hostDocument.querySelector("#journals .journal-title, .journal-item .journal-title"));
}

function hasJournalsViewInDom() {
  const hostDocument = getHostDocument();
  return Boolean(
    hostDocument.querySelector(
      "#journals, .cp__page-inner-wrap.is-journals, .page.is-journals, [data-page='Journals']"
    )
  );
}

function isJournalVisibilityContext() {
  return Boolean(
    state.currentJournalDate
    || isJournalsRoute(state.route)
    || hasJournalTitlesInView()
    || hasJournalsViewInDom()
  );
}

function shouldShowCalendarForCurrentContext() {
  if (state.visibilityMode === "everywhere") {
    return true;
  }

  return isJournalVisibilityContext();
}

function scheduleDomContextSync() {
  if (state.domSyncTimer) {
    clearTimeout(state.domSyncTimer);
  }

  state.domSyncTimer = setTimeout(() => {
    state.domSyncTimer = null;
    void syncFromCurrentContext({ alignWeekToSelection: true });
  }, 60);
}

function updateToolbarToggleUi() {
  const hostDocument = getHostDocument();
  const button = hostDocument.getElementById(TOOLBAR_TOGGLE_ID);

  if (!button) {
    return;
  }

  const label = state.calendarExpanded ? "Hide calendar" : "Show calendar";
  button.setAttribute("title", label);
  button.setAttribute("aria-label", label);
  button.classList.toggle("is-active", state.calendarExpanded);
}

function formatWeekLabel(weekStart) {
  const weekEnd = addDays(weekStart, 6);

  if (weekStart.getFullYear() === weekEnd.getFullYear() && weekStart.getMonth() === weekEnd.getMonth()) {
    return `${RANGE_MONTH_DAY_FORMATTER.format(weekStart)}-${RANGE_DAY_FORMATTER.format(weekEnd)}`;
  }

  if (weekStart.getFullYear() === weekEnd.getFullYear()) {
    return `${RANGE_MONTH_DAY_FORMATTER.format(weekStart)} - ${RANGE_MONTH_DAY_FORMATTER.format(weekEnd)}`;
  }

  return `${RANGE_MONTH_DAY_YEAR_FORMATTER.format(weekStart)} - ${RANGE_MONTH_DAY_YEAR_FORMATTER.format(weekEnd)}`;
}

function getVisibleWeekDates() {
  return Array.from({ length: 7 }, (_value, index) => addDays(state.visibleWeekStart, index));
}

function getVisibleMonthDates() {
  const monthStart = state.visibleMonthStart || startOfMonth(state.currentJournalDate || state.visibleWeekStart || state.today);
  const totalDays = endOfMonth(monthStart).getDate();
  return Array.from({ length: totalDays }, (_value, index) => addDays(monthStart, index));
}

function getVisibleDates() {
  return state.viewMode === "month" ? getVisibleMonthDates() : getVisibleWeekDates();
}

function getVisibleLabelDate() {
  if (state.viewMode === "month") {
    return state.visibleMonthStart || startOfMonth(state.currentJournalDate || state.visibleWeekStart || state.today);
  }

  return state.currentJournalDate || state.visibleWeekStart || state.today;
}

function formatCurrentRangeLabel() {
  return state.viewMode === "month"
    ? MONTH_LABEL_FORMATTER.format(getVisibleLabelDate())
    : formatWeekLabel(state.visibleWeekStart);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function flattenPreviewBlocks(blocks, result = [], depth = 0) {
  for (const block of blocks || []) {
    if (result.length >= 8) {
      break;
    }

    const text = `${block?.content || block?.title || ""}`.trim();

    if (text) {
      result.push({ text, depth });
    }

    if (Array.isArray(block?.children) && result.length < 8) {
      flattenPreviewBlocks(block.children, result, depth + 1);
    }
  }

  return result;
}

function getDayKey(date) {
  return startOfLocalDay(date).toISOString().slice(0, 10);
}

function toJournalDayNumber(date) {
  const normalizedDate = startOfLocalDay(date);
  const year = normalizedDate.getFullYear();
  const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
  const day = String(normalizedDate.getDate()).padStart(2, "0");
  return Number(`${year}${month}${day}`);
}

function getMainContentContainer() {
  return getHostDocument().getElementById(MAIN_CONTENT_CONTAINER_ID);
}

function getMainContentLayoutTarget() {
  const mainContentContainer = getMainContentContainer();

  if (!mainContentContainer) {
    return null;
  }

  return mainContentContainer.querySelector(".cp__sidebar-main-content > div:first-child")
    || mainContentContainer.querySelector(".cp__sidebar-main-content")
    || mainContentContainer;
}

function getCalendarRoots() {
  const hostDocument = getHostDocument();
  return [PAGEBAR_ROOT_ID, FALLBACK_ROOT_ID]
    .map((id) => hostDocument.getElementById(id))
    .filter(Boolean);
}

function setTextContentIfChanged(element, value) {
  if (!element) {
    return;
  }

  const nextValue = value == null ? "" : String(value);

  if (element.textContent !== nextValue) {
    element.textContent = nextValue;
  }
}

function setAttributeIfChanged(element, name, value) {
  if (!element) {
    return;
  }

  if (value == null || value === "") {
    if (element.hasAttribute(name)) {
      element.removeAttribute(name);
    }
    return;
  }

  const nextValue = String(value);

  if (element.getAttribute(name) !== nextValue) {
    element.setAttribute(name, nextValue);
  }
}

function setDatasetIfChanged(element, key, value) {
  if (!element) {
    return;
  }

  const nextValue = value == null ? "" : String(value);

  if (element.dataset[key] !== nextValue) {
    element.dataset[key] = nextValue;
  }
}

function setHtmlIfChanged(element, html) {
  if (!element) {
    return;
  }

  const nextValue = html == null ? "" : String(html);

  if (element.innerHTML !== nextValue) {
    element.innerHTML = nextValue;
  }
}

function getViewToggleButtonState() {
  if (state.viewMode === "month") {
    return {
      label: "Switch to week view",
      icon: '<span class="dgc-toggle-icon" aria-hidden="true">☷</span>',
    };
  }

  return {
    label: "Switch to month view",
    icon: '<span class="dgc-toggle-icon" aria-hidden="true">▦</span>',
  };
}

function queueLayoutUpdate() {
  if (state.layoutTimer) {
    clearTimeout(state.layoutTimer);
  }

  state.layoutTimer = setTimeout(() => {
    state.layoutTimer = null;

    getCalendarRoots().forEach((root) => {
      if (root?.dataset.mountMode === "fallback" && !root.classList.contains("is-hidden")) {
        updateFallbackRootLayout(root);
      }
    });
  }, 16);
}

function nodeToManagedElement(node) {
  if (!node) {
    return null;
  }

  if (node.nodeType === 1) {
    return node;
  }

  return node.parentElement || null;
}

function isManagedCalendarElement(element) {
  return Boolean(
    element?.closest?.(
      `#${PAGEBAR_ROOT_ID}, #${FALLBACK_ROOT_ID}, #${PREVIEW_ROOT_ID}, #${TOOLBAR_TOGGLE_ID}`
    )
  );
}

function isManagedCalendarMutation(mutation) {
  const targetElement = nodeToManagedElement(mutation?.target);

  if (isManagedCalendarElement(targetElement)) {
    return true;
  }

  const changedNodes = [
    ...(mutation?.addedNodes || []),
    ...(mutation?.removedNodes || []),
  ];

  return changedNodes.length > 0
    && changedNodes.every((node) => isManagedCalendarElement(nodeToManagedElement(node)));
}

function hasRelevantHostMutation(mutations) {
  return mutations.some((mutation) => !isManagedCalendarMutation(mutation));
}

function buildDayButtonTemplate(index) {
  return `
    <button class="dgc-day" type="button" data-role="day-button-${index}" aria-pressed="false">
      <span class="dgc-day-name" data-role="day-name-${index}"></span>
      <span class="dgc-day-week" data-role="day-week-${index}"></span>
      <span class="dgc-day-date" data-role="day-date-${index}"></span>
      <span class="dgc-day-meta" data-role="day-meta-${index}"></span>
    </button>
  `;
}

function buildMonthDayButtonTemplate(index) {
  return `
    <button class="dgc-day dgc-month-day" type="button" data-role="month-day-button-${index}" aria-pressed="false">
      <span class="dgc-day-name" data-role="month-day-name-${index}"></span>
      <span class="dgc-day-week" data-role="month-day-week-${index}"></span>
      <span class="dgc-day-date" data-role="month-day-date-${index}"></span>
      <span class="dgc-day-meta" data-role="month-day-meta-${index}"></span>
    </button>
  `;
}

function buildMonthHeaderCellTemplate(index) {
  return `<div class="dgc-month-header-cell" data-role="month-header-${index}"></div>`;
}

function buildMonthWeekBoxTemplate(index) {
  return `<div class="dgc-month-week-box is-hidden" data-role="month-week-box-${index}"></div>`;
}

function buildCalendarTemplate({ mountMode, rootId }) {
  return `
    <section id="${rootId}" class="dgc-pagebar ${mountMode === "fallback" ? "dgc-pagebar-inline" : ""} is-hidden" data-mount-mode="${mountMode}" aria-label="Degrande Calendar week bar">
      <div class="dgc-shell">
        <div class="dgc-weekframe">
          <div class="dgc-day-strip" data-role="week-strip">
            ${Array.from({ length: 7 }, (_value, index) => buildDayButtonTemplate(index)).join("")}
          </div>
          <div class="dgc-month-header" data-role="month-header-row">
            ${Array.from({ length: 8 }, (_value, index) => buildMonthHeaderCellTemplate(index)).join("")}
          </div>
          <div class="dgc-month-grid" data-role="month-grid">
            ${Array.from({ length: MAX_MONTH_WEEK_ROWS }, (_value, index) => buildMonthWeekBoxTemplate(index)).join("")}
            ${Array.from({ length: MAX_MONTH_BUTTONS }, (_value, index) => buildMonthDayButtonTemplate(index)).join("")}
          </div>
        </div>
        <div class="dgc-footer">
          <div class="dgc-footer-spacer" aria-hidden="true"></div>
          <div class="dgc-range" data-role="week-label"></div>
          <div class="dgc-actions" role="group" aria-label="Week navigation">
            <button class="dgc-toggle" type="button" data-action="toggle-view" data-role="view-toggle" aria-label="Switch to month view" title="Switch to month view">
              <span class="dgc-toggle-icon" aria-hidden="true">▦</span>
            </button>
            <button class="dgc-nav" type="button" data-action="prev-week" aria-label="Previous period">
              <span class="dgc-nav-icon" aria-hidden="true">&#8592;</span>
            </button>
            <button class="dgc-today" type="button" data-action="today">Today</button>
            <button class="dgc-nav" type="button" data-action="next-week" aria-label="Next period">
              <span class="dgc-nav-icon" aria-hidden="true">&#8594;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function getRootRefs(root) {
  if (!root) {
    return null;
  }

  if (root[ROOT_REFS_KEY]) {
    return root[ROOT_REFS_KEY];
  }

  const refs = {
    weekLabel: root.querySelector('[data-role="week-label"]'),
    contextLabel: root.querySelector('[data-role="context-label"]'),
    viewToggle: root.querySelector('[data-role="view-toggle"]'),
    weekStrip: root.querySelector('[data-role="week-strip"]'),
    monthHeaderRow: root.querySelector('[data-role="month-header-row"]'),
    monthGrid: root.querySelector('[data-role="month-grid"]'),
    dayButtons: Array.from({ length: 7 }, (_value, index) => root.querySelector(`[data-role="day-button-${index}"]`)),
    dayNames: Array.from({ length: 7 }, (_value, index) => root.querySelector(`[data-role="day-name-${index}"]`)),
    dayWeeks: Array.from({ length: 7 }, (_value, index) => root.querySelector(`[data-role="day-week-${index}"]`)),
    dayDates: Array.from({ length: 7 }, (_value, index) => root.querySelector(`[data-role="day-date-${index}"]`)),
    dayMetas: Array.from({ length: 7 }, (_value, index) => root.querySelector(`[data-role="day-meta-${index}"]`)),
    monthHeaderCells: Array.from({ length: 8 }, (_value, index) => root.querySelector(`[data-role="month-header-${index}"]`)),
    monthWeekBoxes: Array.from({ length: MAX_MONTH_WEEK_ROWS }, (_value, index) => root.querySelector(`[data-role="month-week-box-${index}"]`)),
    monthDayButtons: Array.from({ length: MAX_MONTH_BUTTONS }, (_value, index) => root.querySelector(`[data-role="month-day-button-${index}"]`)),
    monthDayNames: Array.from({ length: MAX_MONTH_BUTTONS }, (_value, index) => root.querySelector(`[data-role="month-day-name-${index}"]`)),
    monthDayWeeks: Array.from({ length: MAX_MONTH_BUTTONS }, (_value, index) => root.querySelector(`[data-role="month-day-week-${index}"]`)),
    monthDayDates: Array.from({ length: MAX_MONTH_BUTTONS }, (_value, index) => root.querySelector(`[data-role="month-day-date-${index}"]`)),
    monthDayMetas: Array.from({ length: MAX_MONTH_BUTTONS }, (_value, index) => root.querySelector(`[data-role="month-day-meta-${index}"]`)),
  };

  root[ROOT_REFS_KEY] = refs;
  return refs;
}

function isDuplicateRegistrationError(error) {
  return /already exist/i.test(String(error?.message || error || ""));
}

function registerPagebarItemSafely(config) {
  const hostWindow = getHostWindow();
  const registeredPagebars = hostWindow[PAGEBAR_REGISTRY_KEY] || (hostWindow[PAGEBAR_REGISTRY_KEY] = new Set());

  if (registeredPagebars.has(config.key)) {
    return false;
  }

  try {
    logseq.App.registerUIItem("pagebar", config);
  } catch (error) {
    if (isDuplicateRegistrationError(error)) {
      registeredPagebars.add(config.key);
      return false;
    }

    throw error;
  }

  registeredPagebars.add(config.key);
  return true;
}

function bindRootEvents(root) {
  if (!root || root[ROOT_BINDING_KEY]) {
    return;
  }

  root.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action], [data-date-value]");

    if (!actionTarget || !root.contains(actionTarget)) {
      return;
    }

    const { action } = actionTarget.dataset;

    if (action === "prev-week") {
      shiftVisibleRange(-1);
      return;
    }

    if (action === "next-week") {
      shiftVisibleRange(1);
      return;
    }

    if (action === "toggle-view") {
      toggleViewMode();
      return;
    }

    if (action === "today") {
      void openJournalForDate(new Date());
      return;
    }

    const dateValue = Number(actionTarget.dataset.dateValue);
    const pageId = actionTarget.dataset.pageId;

    if (event.shiftKey && pageId) {
      event.preventDefault();
      openPageInSidebar(pageId);
      return;
    }

    if (Number.isFinite(dateValue)) {
      void openJournalForDate(new Date(dateValue));
    }
  });

  root[ROOT_BINDING_KEY] = true;
}

function openPageInSidebar(pageId) {
  if (!pageId || state.lastSidebarPreviewId === pageId) {
    if (pageId) {
      logseq.App.setRightSidebarVisible?.(true);
    }
    return;
  }

  state.lastSidebarPreviewId = pageId;
  logseq.Editor.openInRightSidebar(pageId);
}

function findFallbackAnchor() {
  const mainContentContainer = getMainContentContainer();

  if (mainContentContainer?.parentNode) {
    return {
      parent: mainContentContainer.parentNode,
      before: mainContentContainer,
    };
  }

  const hostDocument = getHostDocument();
  const mainElement = hostDocument.querySelector("main");

  if (mainElement) {
    return { parent: mainElement, before: mainElement.firstChild };
  }

  return null;
}

function ensureFallbackRoot() {
  const hostDocument = getHostDocument();
  const anchor = findFallbackAnchor();

  if (!anchor?.parent) {
    return null;
  }

  let root = hostDocument.getElementById(FALLBACK_ROOT_ID);

  if (!root) {
    const wrapper = hostDocument.createElement("div");
    wrapper.innerHTML = buildCalendarTemplate({ mountMode: "fallback", rootId: FALLBACK_ROOT_ID }).trim();
    root = wrapper.firstElementChild;
  }

  if (!root) {
    return null;
  }

  if (root.parentNode !== anchor.parent || root.nextSibling !== anchor.before) {
    anchor.parent.insertBefore(root, anchor.before || null);
  }

  bindRootEvents(root);
  return root;
}

function clearFallbackLayout() {
  const mainContentContainer = getMainContentContainer();

  if (!mainContentContainer) {
    return;
  }

  mainContentContainer.removeAttribute("data-dgc-sibling-offset");
  mainContentContainer.style.removeProperty("--dgc-sibling-offset");
}

function updateFallbackRootLayout(root) {
  const mainContentContainer = getMainContentContainer();
  const layoutTarget = getMainContentLayoutTarget();

  if (!root || !mainContentContainer || !layoutTarget) {
    clearFallbackLayout();
    return;
  }

  const mainRect = mainContentContainer.getBoundingClientRect();
  const width = Math.max(320, Math.round(mainRect.width));
  const left = Math.round(mainRect.left);
  const top = Math.max(0, Math.round(mainRect.top));

  const nextLeft = `${left}px`;
  const nextTop = `${top}px`;
  const nextWidth = `${width}px`;

  if (root.style.left !== nextLeft) {
    root.style.left = nextLeft;
  }

  if (root.style.top !== nextTop) {
    root.style.top = nextTop;
  }

  if (root.style.width !== nextWidth) {
    root.style.width = nextWidth;
  }

  const shell = getRootRefs(root)?.weekStrip?.closest(".dgc-shell") || root.querySelector(".dgc-shell");
  const offset = Math.max(0, Math.ceil((shell?.offsetHeight || 0) + 18));

  mainContentContainer.setAttribute("data-dgc-sibling-offset", "true");
  const nextOffset = `${offset}px`;

  if (mainContentContainer.style.getPropertyValue("--dgc-sibling-offset") !== nextOffset) {
    mainContentContainer.style.setProperty("--dgc-sibling-offset", nextOffset);
  }
}

function bindHostObserver() {
  const hostWindow = getHostWindow();

  if (hostWindow[HOST_OBSERVER_KEY]) {
    return;
  }

  const hostDocument = getHostDocument();

  if (!hostDocument?.body || typeof MutationObserver !== "function") {
    return;
  }

  const observer = new MutationObserver((mutations) => {
    if (!hasRelevantHostMutation(mutations || [])) {
      return;
    }

    if (Date.now() < state.freezeObserverUntil) {
      return;
    }

    if (!state.isVisible && shouldShowCalendarForCurrentContext()) {
      scheduleDomContextSync();
      return;
    }

    if (state.isVisible) {
      ensureFallbackRoot();
      queueLayoutUpdate();
    }
  });

  observer.observe(hostDocument.body, {
    childList: true,
    subtree: true,
  });

  hostDocument.addEventListener("scroll", queueLayoutUpdate, true);
  hostWindow.addEventListener("resize", queueLayoutUpdate);

  hostWindow[HOST_OBSERVER_KEY] = observer;
}

function registerCommandPaletteSafely(config, handler) {
  const hostWindow = getHostWindow();
  const registeredCommands = hostWindow[COMMAND_REGISTRY_KEY] || (hostWindow[COMMAND_REGISTRY_KEY] = new Set());

  if (registeredCommands.has(config.key)) {
    return false;
  }

  try {
    logseq.App.registerCommandPalette(config, handler);
  } catch (error) {
    if (isDuplicateRegistrationError(error)) {
      registeredCommands.add(config.key);
      return false;
    }

    throw error;
  }

  registeredCommands.add(config.key);
  return true;
}

async function loadWorkspaceCss() {
  const cssUrl = typeof logseq.resolveResourceFullUrl === "function"
    ? logseq.resolveResourceFullUrl(STYLE_RESOURCE)
    : `./${STYLE_RESOURCE}`;
  const response = await fetch(cssUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Unable to load ${STYLE_RESOURCE} (${response.status})`);
  }

  return response.text();
}

async function installStyles() {
  try {
    const cssText = await loadWorkspaceCss();
    logseq.provideStyle(cssText);
  } catch (error) {
    console.error("[Degrande Calendar] Failed to load styles", error);
  }
}

function queueRender() {
  if (state.renderTimer) {
    clearTimeout(state.renderTimer);
  }

  state.renderTimer = setTimeout(() => {
    state.renderTimer = null;
    renderWeekBar();
  }, 16);
}

function animateWeekStrip(root, direction) {
  if (!direction) {
    return;
  }

  const strip = root.querySelector('[data-role="week-strip"]');

  if (!strip) {
    return;
  }

  strip.classList.remove("is-animating-forward", "is-animating-backward");
  void strip.offsetWidth;
  strip.classList.add(direction > 0 ? "is-animating-forward" : "is-animating-backward");
}

function renderWeekBar() {
  const roots = [];
  const pagebarRoot = getHostDocument().getElementById(PAGEBAR_ROOT_ID);

  if (pagebarRoot) {
    bindRootEvents(pagebarRoot);
    roots.push(pagebarRoot);
  }

  const fallbackRoot = state.isVisible ? ensureFallbackRoot() : getHostDocument().getElementById(FALLBACK_ROOT_ID);

  if (fallbackRoot) {
    roots.push(fallbackRoot);
  }

  if (!state.isVisible) {
    clearFallbackLayout();
    hidePreview();
  }

  if (!roots.length) {
    return;
  }

  const hasFallbackRoot = roots.some((root) => root.dataset.mountMode === "fallback");
  updateToolbarToggleUi();

  roots.forEach((root) => {
    const refs = getRootRefs(root);
    const shouldShowRoot = Boolean(
      state.isVisible
      && state.calendarExpanded
      && state.visibleWeekStart
      && !(hasFallbackRoot && root.dataset.mountMode === "pagebar")
    );

    root.classList.toggle("is-hidden", !shouldShowRoot);

    if (!shouldShowRoot) {
      if (root.dataset.mountMode === "fallback") {
        clearFallbackLayout();
      }

      return;
    }

    const weekDates = getVisibleWeekDates();
    const monthDates = getVisibleMonthDates();
    const activeDate = state.currentJournalDate;
    const isCurrentWeek = isDateWithinWeek(state.today, state.visibleWeekStart);
    const visibleMonthDate = getVisibleLabelDate();

    if (refs?.weekLabel) {
      setTextContentIfChanged(refs.weekLabel, formatCurrentRangeLabel());
    }

    if (refs?.viewToggle) {
      const toggleState = getViewToggleButtonState();
      setHtmlIfChanged(refs.viewToggle, toggleState.icon);
      setAttributeIfChanged(refs.viewToggle, "aria-label", toggleState.label);
      setAttributeIfChanged(refs.viewToggle, "title", toggleState.label);
    }

    root.classList.toggle("is-month-view", state.viewMode === "month");
    root.classList.toggle("is-week-view", state.viewMode === "week");

    if (refs?.weekStrip) {
      refs.weekStrip.classList.toggle("is-hidden", state.viewMode !== "week" || !state.calendarExpanded);
    }

    if (refs?.monthHeaderRow) {
      refs.monthHeaderRow.classList.toggle("is-hidden", state.viewMode !== "month" || !state.calendarExpanded);
      for (let index = 0; index < 8; index += 1) {
        const monthHeaderCell = refs.monthHeaderCells[index];

        if (monthHeaderCell) {
          if (index === 0) {
            setTextContentIfChanged(monthHeaderCell, "Week");
          } else {
            const headerDate = addDays(startOfWeek(state.visibleMonthStart || state.today), index - 1);
            setTextContentIfChanged(monthHeaderCell, DAY_NAME_FORMATTER.format(headerDate));
          }
        }
      }
    }

    if (refs?.monthGrid) {
      refs.monthGrid.classList.toggle("is-hidden", state.viewMode !== "month" || !state.calendarExpanded);

      const monthStart = state.visibleMonthStart || startOfMonth(state.today);
      const visibleMonthWeekCount = getMonthWeekRowCount(monthStart);

      for (let index = 0; index < MAX_MONTH_WEEK_ROWS; index += 1) {
        const monthWeekBox = refs.monthWeekBoxes[index];

        if (!monthWeekBox) {
          continue;
        }

        if (index < visibleMonthWeekCount) {
          const weekStart = addDays(startOfWeek(monthStart), index * 7);
          monthWeekBox.classList.remove("is-hidden");
          setTextContentIfChanged(monthWeekBox, String(getDisplayedWeekNumber(weekStart)));
          monthWeekBox.style.setProperty("--dgc-month-week-row", String(index + 1));
        } else {
          monthWeekBox.classList.add("is-hidden");
          setTextContentIfChanged(monthWeekBox, "");
          monthWeekBox.style.removeProperty("--dgc-month-week-row");
        }
      }
    }

    if (refs?.contextLabel) {
      if (activeDate && (state.viewMode === "month" ? isSameMonth(activeDate, visibleMonthDate) : isDateWithinWeek(activeDate, state.visibleWeekStart))) {
        setTextContentIfChanged(refs.contextLabel, `Viewing ${FULL_DATE_FORMATTER.format(activeDate)}`);
      } else if (isCurrentWeek) {
        setTextContentIfChanged(refs.contextLabel, "Current week in journals");
      } else {
        setTextContentIfChanged(refs.contextLabel, "Click a day to open it. Shift+click a journal day to open it in the right sidebar");
      }
    }

    weekDates.forEach((date, index) => {
      const button = refs.dayButtons[index];
      const dayName = refs.dayNames[index];
      const dayWeek = refs.dayWeeks[index];
      const dayDate = refs.dayDates[index];
      const dayMeta = refs.dayMetas[index];
      const isActive = Boolean(activeDate && isSameDay(activeDate, date));
      const isToday = isSameDay(state.today, date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const hasJournal = Boolean(state.journalPresence[getDayKey(date)]);
      const journalPage = state.journalPages[getDayKey(date)] || null;
      const journalPageId = String(journalPage?.uuid || journalPage?.id || "");

      if (dayName) {
        setTextContentIfChanged(dayName, DAY_NAME_FORMATTER.format(date));
      }

      if (dayWeek) {
        setTextContentIfChanged(dayWeek, index === 0 ? `W${getDisplayedWeekNumber(date)}` : "");
      }

      if (dayDate) {
        setTextContentIfChanged(dayDate, DAY_DATE_FORMATTER.format(date));
      }

      if (dayMeta) {
        setTextContentIfChanged(dayMeta, hasJournal ? "•" : "");
        delete dayMeta.dataset.previewPageId;
        dayMeta.removeAttribute("role");
        dayMeta.removeAttribute("tabindex");
        dayMeta.removeAttribute("aria-label");
        dayMeta.removeAttribute("title");
      }

      if (button) {
        button.classList.toggle("is-active", isActive);
        button.classList.toggle("has-journal", hasJournal);
        button.classList.toggle("is-today", isToday);
        button.classList.toggle("is-weekend", isWeekend);
        setAttributeIfChanged(button, "aria-pressed", String(isActive));
        setAttributeIfChanged(button, "aria-label", FULL_DATE_FORMATTER.format(date));
        setDatasetIfChanged(button, "dateValue", date.getTime());
        setDatasetIfChanged(button, "pageId", hasJournal ? journalPageId : "");
        button.onmouseenter = null;
        button.onmouseleave = null;
      }
    });

    monthDates.forEach((date, index) => {
      const button = refs.monthDayButtons[index];
      const dayName = refs.monthDayNames[index];
      const dayWeek = refs.monthDayWeeks[index];
      const dayDate = refs.monthDayDates[index];
      const dayMeta = refs.monthDayMetas[index];
      const isActive = Boolean(activeDate && isSameDay(activeDate, date));
      const isToday = isSameDay(state.today, date);
      const hasJournal = Boolean(state.journalPresence[getDayKey(date)]);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const journalPage = state.journalPages[getDayKey(date)] || null;
      const journalPageId = String(journalPage?.uuid || journalPage?.id || "");

      if (dayName) {
        setTextContentIfChanged(dayName, DAY_NAME_FORMATTER.format(date).slice(0, 2));
      }

      if (dayWeek) {
        setTextContentIfChanged(dayWeek, isConfiguredFirstDayOfWeek(date) ? `W${getDisplayedWeekNumber(date)}` : "");
      }

      if (dayDate) {
        setTextContentIfChanged(dayDate, DAY_DATE_FORMATTER.format(date));
      }

      if (dayMeta) {
        setTextContentIfChanged(dayMeta, hasJournal ? "•" : "");
        delete dayMeta.dataset.previewPageId;
        dayMeta.removeAttribute("role");
        dayMeta.removeAttribute("tabindex");
        dayMeta.removeAttribute("aria-label");
        dayMeta.removeAttribute("title");
      }

      if (button) {
        button.classList.remove("is-hidden");
        button.classList.toggle("is-month-grid-start", index === 0);
        button.classList.toggle("is-active", isActive);
        button.classList.toggle("has-journal", hasJournal);
        button.classList.toggle("is-today", isToday);
        button.classList.toggle("is-weekend", isWeekend);
        button.style.setProperty("--dgc-month-grid-start", String(getMonthGridColumnStart(date)));
        button.style.setProperty("--dgc-month-grid-column", String(getMonthGridColumn(date, state.visibleMonthStart || startOfMonth(date))));
        button.style.setProperty("--dgc-month-grid-row", String(getMonthGridRow(date, state.visibleMonthStart || startOfMonth(date))));
        setAttributeIfChanged(button, "aria-pressed", String(isActive));
        setAttributeIfChanged(button, "aria-label", FULL_DATE_FORMATTER.format(date));
        setDatasetIfChanged(button, "dateValue", date.getTime());
        setDatasetIfChanged(button, "pageId", hasJournal ? journalPageId : "");
        button.classList.remove("is-outside-month");
        button.onmouseenter = null;
        button.onmouseleave = null;
      }
    });

    for (let index = monthDates.length; index < MAX_MONTH_BUTTONS; index += 1) {
      const button = refs.monthDayButtons[index];
      const dayMeta = refs.monthDayMetas[index];

      if (!button) {
        continue;
      }

      button.classList.add("is-hidden");
      button.classList.remove("is-month-grid-start");
      button.style.removeProperty("--dgc-month-grid-start");
      button.style.removeProperty("--dgc-month-grid-column");
      button.style.removeProperty("--dgc-month-grid-row");
      setDatasetIfChanged(button, "dateValue", "");
      setDatasetIfChanged(button, "pageId", "");
      button.onmouseenter = null;
      button.onmouseleave = null;

      if (dayMeta) {
        delete dayMeta.dataset.previewPageId;
        dayMeta.removeAttribute("role");
        dayMeta.removeAttribute("tabindex");
        dayMeta.removeAttribute("aria-label");
        dayMeta.removeAttribute("title");
      }
    }

    if (state.viewMode === "week" && state.calendarExpanded) {
      animateWeekStrip(root, state.pendingAnimationDirection);
    }

    if (root.dataset.mountMode === "fallback") {
      updateFallbackRootLayout(root);
    }
  });

  state.pendingAnimationDirection = 0;
}

async function syncFromCurrentContext(options = {}) {
  const syncToken = ++state.syncToken;
  state.today = startOfLocalDay(new Date());

  let currentPage = null;

  try {
    currentPage = await logseq.Editor.getCurrentPage();
  } catch (error) {
    console.error("[Degrande Calendar] Failed to read current page", error);
  }

  if (syncToken !== state.syncToken) {
    return;
  }

  state.currentPage = currentPage;
  state.currentJournalDate = resolveJournalDate(currentPage);
  state.isVisible = shouldShowCalendarForCurrentContext();

  if (!state.visibleWeekStart || options.alignWeekToSelection || (state.currentJournalDate && !isDateWithinWeek(state.currentJournalDate, state.visibleWeekStart))) {
    state.visibleWeekStart = startOfWeek(state.currentJournalDate || state.today);
  }

  if (!state.visibleMonthStart || options.alignWeekToSelection || (state.currentJournalDate && !isSameMonth(state.currentJournalDate, state.visibleMonthStart))) {
    state.visibleMonthStart = startOfMonth(state.currentJournalDate || state.today);
  }

  void refreshVisibleWeekJournalPresence();
  queueRender();
}

async function openJournalForDate(value) {
  const date = startOfLocalDay(value);
  const nextWeekStart = startOfWeek(date);
  const navigationToken = ++state.navigationToken;

  if (state.visibleWeekStart && nextWeekStart.getTime() !== state.visibleWeekStart.getTime()) {
    state.pendingAnimationDirection = nextWeekStart > state.visibleWeekStart ? 1 : -1;
  } else {
    state.pendingAnimationDirection = 0;
  }

  state.currentJournalDate = date;
  state.isVisible = true;
  state.visibleWeekStart = nextWeekStart;
  state.visibleMonthStart = startOfMonth(date);
  state.journalPresence[getDayKey(date)] = true;
  state.freezeObserverUntil = Date.now() + 240;
  void refreshVisibleWeekJournalPresence();
  queueRender();

  try {
    const page = await ensureJournalPageForDate(date);

    if (navigationToken !== state.navigationToken) {
      return;
    }

    state.currentPage = page;
    const navigationTargets = Array.from(new Set(getPageNavigationTargets(page)));
    let navigationError = null;
    let navigated = false;

    for (const target of navigationTargets) {
      try {
        logseq.App.pushState("page", { name: String(target) });
        navigated = true;
        break;
      } catch (error) {
        navigationError = error;
      }
    }

    if (!navigated) {
      throw navigationError || new Error("Journal page navigation failed");
    }
  } catch (error) {
    console.error("[Degrande Calendar] Failed to open journal page", error);
    await logseq.UI.showMsg("Unable to open that journal page", "error", { timeout: 2500 });
    state.freezeObserverUntil = 0;
    void syncFromCurrentContext({ alignWeekToSelection: true });
    return;
  }
}

function shiftVisibleWeek(direction) {
  state.visibleWeekStart = addWeeks(state.visibleWeekStart || startOfWeek(state.today), direction);
  state.pendingAnimationDirection = direction;
  void refreshVisibleWeekJournalPresence();
  queueRender();
}

function shiftVisibleMonth(direction) {
  const anchor = state.visibleMonthStart || startOfMonth(state.currentJournalDate || state.visibleWeekStart || state.today);
  state.visibleMonthStart = addMonths(anchor, direction);
  state.visibleWeekStart = startOfWeek(state.visibleMonthStart);
  state.pendingAnimationDirection = 0;
  void refreshVisibleWeekJournalPresence();
  queueRender();
}

function shiftVisibleRange(direction) {
  if (state.viewMode === "month") {
    shiftVisibleMonth(direction);
    return;
  }

  shiftVisibleWeek(direction);
}

function toggleViewMode() {
  state.viewMode = state.viewMode === "month" ? "week" : "month";
  if (state.viewMode === "month") {
    state.visibleMonthStart = startOfMonth(state.currentJournalDate || state.visibleWeekStart || state.today);
    state.visibleWeekStart = startOfWeek(state.visibleMonthStart);
  }
  if (typeof logseq.updateSettings === "function") {
    logseq.updateSettings({
      calendarView: state.viewMode === "month" ? "Month" : "Week",
    });
  }
  state.pendingAnimationDirection = 0;
  void refreshVisibleWeekJournalPresence();
  queueRender();
}

function toggleCalendarExpanded() {
  state.calendarExpanded = !state.calendarExpanded;
  hidePreview();
  queueRender();
}

function registerToolbarItemSafely(config) {
  const hostWindow = getHostWindow();
  const registeredPagebars = hostWindow[PAGEBAR_REGISTRY_KEY] || (hostWindow[PAGEBAR_REGISTRY_KEY] = new Set());

  if (registeredPagebars.has(config.key)) {
    return false;
  }

  try {
    logseq.App.registerUIItem("toolbar", config);
  } catch (error) {
    if (isDuplicateRegistrationError(error)) {
      registeredPagebars.add(config.key);
      return false;
    }

    throw error;
  }

  registeredPagebars.add(config.key);
  return true;
}

function getDateAtIndex(index) {
  return addDays(state.visibleWeekStart || startOfWeek(state.today), index);
}

function registerCommands(pluginId) {
  registerCommandPaletteSafely(
    {
      key: `${pluginId}/open-today-journal`,
      label: "Degrande Calendar: open today",
    },
    () => {
      void openJournalForDate(new Date());
    }
  );

  registerCommandPaletteSafely(
    {
      key: `${pluginId}/previous-week`,
      label: "Degrande Calendar: show previous week",
    },
    () => {
      shiftVisibleRange(-1);
    }
  );

  registerCommandPaletteSafely(
    {
      key: `${pluginId}/next-week`,
      label: "Degrande Calendar: show next week",
    },
    () => {
      shiftVisibleRange(1);
    }
  );

  registerCommandPaletteSafely(
    {
      key: `${pluginId}/open-settings`,
      label: "Degrande Calendar: open settings",
    },
    () => {
      if (typeof logseq.showSettingsUI === "function") {
        logseq.showSettingsUI();
      }
    }
  );
}

function bindAppEvents() {
  if (typeof logseq.App.onRouteChanged === "function") {
    logseq.App.onRouteChanged((route) => {
      state.freezeObserverUntil = 0;
      state.route = route || { path: "", template: "" };
      void syncFromCurrentContext({ alignWeekToSelection: true });
    });
  }

  if (typeof logseq.App.onThemeModeChanged === "function") {
    logseq.App.onThemeModeChanged(() => {
      queueRender();
    });
  }

  if (typeof logseq.App.onTodayJournalCreated === "function") {
    logseq.App.onTodayJournalCreated(() => {
      state.today = startOfLocalDay(new Date());
      queueRender();
    });
  }
}

async function main() {
  console.info(`[Degrande Calendar] Starting v${PLUGIN_VERSION}`);

  const isDbGraph = await logseq.App.checkCurrentIsDbGraph();
  state.isDbGraph = Boolean(isDbGraph);

  if (!isDbGraph) {
    await logseq.UI.showMsg("Degrande Calendar currently targets Logseq DB graphs only.", "warning", { timeout: 3200 });
    return;
  }

  const pluginId = logseq.baseInfo.id;
  const hostWindow = getHostWindow();
  const hostSession = hostWindow[HOST_SESSION_KEY] || (hostWindow[HOST_SESSION_KEY] = {});

  if (typeof logseq.useSettingsSchema === "function") {
    logseq.useSettingsSchema(SETTINGS_SCHEMA);
  }

  applyPluginSettings(logseq.settings || {});

  if (typeof logseq.onSettingsChanged === "function") {
    logseq.onSettingsChanged((newSettings) => {
      applyPluginSettings(newSettings || {});
      void syncFromCurrentContext({ alignWeekToSelection: true });
    });
  }

  await installStyles();
  await ensureUserDateFormat();
  logseq.provideModel({
    toggleCalendarToolbar() {
      toggleCalendarExpanded();
    },
  });
  registerToolbarItemSafely({
    key: TOOLBAR_ITEM_KEY,
    template: `
      <a class="button" id="${TOOLBAR_TOGGLE_ID}" data-on-click="toggleCalendarToolbar" title="Hide calendar" aria-label="Hide calendar">
        <i class="ti ti-calendar-event"></i>
      </a>
    `,
  });
  registerPagebarItemSafely({
    key: PAGEBAR_ITEM_KEY,
    template: buildCalendarTemplate({ mountMode: "pagebar", rootId: PAGEBAR_ROOT_ID }),
  });
  bindHostObserver();
  registerCommands(pluginId);
  bindAppEvents();
  await syncFromCurrentContext({ alignWeekToSelection: true });
  scheduleDomContextSync();

  if (!hostSession[pluginId]) {
    hostSession[pluginId] = {
      version: PLUGIN_VERSION,
      activatedAt: Date.now(),
    };
  }

  console.info(`[Degrande Calendar] Active v${PLUGIN_VERSION}`);
}

window.__degrandeCalendarMain = main;
})();