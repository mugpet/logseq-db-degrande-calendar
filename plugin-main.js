(() => {
const FALLBACK_PLUGIN_VERSION = "0.1.29";
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
const RUNTIME_STYLE_ELEMENT_ID = "degrande-calendar-runtime-style";
const MAIN_UI_INLINE_STYLE = {
  position: "fixed",
  top: "0",
  right: "0",
  bottom: "0",
  left: "0",
  zIndex: 999,
  width: "100vw",
  height: "100vh",
  maxWidth: "100vw",
  maxHeight: "100vh",
  overflow: "hidden",
  background: "transparent",
};

const DAY_NAME_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const DAY_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { day: "numeric" });
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const RANGE_MONTH_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const RANGE_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { day: "numeric" });
const RANGE_MONTH_DAY_YEAR_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const MAX_MONTH_WEEK_ROWS = 6;
const MAX_MONTH_BUTTONS = MAX_MONTH_WEEK_ROWS * 7;
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
const DOCK_MODE_CHOICES = [
  "Above content",
  "Right sidebar",
];
const CALENDAR_COLOR_TARGETS = [
  {
    key: "selectedDay",
    label: "Selected Day",
    subtitle: "Applied to the active day in week and month view.",
    settings: {
      mode: "selectedDayColorMode",
      token: "selectedDayPresetToken",
      color: "selectedDayColor",
      alpha: "selectedDayAlpha",
    },
  },
  {
    key: "today",
    label: "Today",
    subtitle: "Applied to today's non-active highlight treatment.",
    settings: {
      mode: "todayColorMode",
      token: "todayPresetToken",
      color: "todayColor",
      alpha: "todayAlpha",
    },
  },
  {
    key: "weekend",
    label: "Weekend",
    subtitle: "Applied to non-active weekend days in week and month view.",
    settings: {
      mode: "weekendColorMode",
      token: "weekendPresetToken",
      color: "weekendColor",
      alpha: "weekendAlpha",
    },
  },
];
const CALENDAR_COLOR_TARGET_MAP = Object.fromEntries(CALENDAR_COLOR_TARGETS.map((target) => [target.key, target]));
const CALENDAR_COLOR_PRESETS = [
  { token: "red", label: "Red", group: "preset", swatch: "#ef4444", cssValue: "#ef4444", previewColor: "#ef4444" },
  { token: "orange", label: "Orange", group: "preset", swatch: "#fb923c", cssValue: "#fb923c", previewColor: "#fb923c" },
  { token: "yellow", label: "Yellow", group: "preset", swatch: "#eab308", cssValue: "#eab308", previewColor: "#eab308" },
  { token: "green", label: "Green", group: "preset", swatch: "#22c55e", cssValue: "#22c55e", previewColor: "#22c55e" },
  { token: "teal", label: "Teal", group: "preset", swatch: "#14b8a6", cssValue: "#14b8a6", previewColor: "#14b8a6" },
  { token: "blue", label: "Blue", group: "preset", swatch: "#1f7ae0", cssValue: "#1f7ae0", previewColor: "#1f7ae0" },
  { token: "indigo", label: "Indigo", group: "preset", swatch: "#6366f1", cssValue: "#6366f1", previewColor: "#6366f1" },
  { token: "purple", label: "Purple", group: "preset", swatch: "#a855f7", cssValue: "#a855f7", previewColor: "#a855f7" },
  { token: "pink", label: "Pink", group: "preset", swatch: "#ec4899", cssValue: "#ec4899", previewColor: "#ec4899" },
  { token: "grey", label: "Grey", group: "preset", swatch: "#9ca3af", cssValue: "#9ca3af", previewColor: "#9ca3af" },
  { token: "mint", label: "Mint", group: "preset", swatch: "#34d399", cssValue: "#34d399", previewColor: "#34d399" },
  { token: "rose", label: "Rose", group: "preset", swatch: "#f43f5e", cssValue: "#f43f5e", previewColor: "#f43f5e" },
  { token: "amber", label: "Amber", group: "preset", swatch: "#f59e0b", cssValue: "#f59e0b", previewColor: "#f59e0b" },
  { token: "sky", label: "Sky", group: "preset", swatch: "#38bdf8", cssValue: "#38bdf8", previewColor: "#38bdf8" },
  { token: "lime", label: "Lime", group: "preset", swatch: "#84cc16", cssValue: "#84cc16", previewColor: "#84cc16" },
  { token: "slate", label: "Slate", group: "preset", swatch: "#64748b", cssValue: "#64748b", previewColor: "#64748b" },
  { token: "acc-app-accent", label: "Logseq Accent", group: "accent", swatch: "var(--ls-active-primary-color, var(--ls-link-text-color, #10b981))", cssValue: "var(--ls-active-primary-color, var(--ls-link-text-color, #10b981))", previewColor: "#10b981" },
  { token: "acc-lt-blue", label: "Accent Lt Blue", group: "accent", swatch: "#b0c7ea", cssValue: "#8aa6d3", previewColor: "#8aa6d3" },
  { token: "acc-coral", label: "Accent Coral", group: "accent", swatch: "#f49e8c", cssValue: "#de7c68", previewColor: "#de7c68" },
  { token: "acc-salmon", label: "Accent Salmon", group: "accent", swatch: "#f49898", cssValue: "#de7a7a", previewColor: "#de7a7a" },
  { token: "acc-rose", label: "Accent Rose", group: "accent", swatch: "#f68fbb", cssValue: "#d96798", previewColor: "#d96798" },
  { token: "acc-blush", label: "Accent Blush", group: "accent", swatch: "#e992cc", cssValue: "#d16ead", previewColor: "#d16ead" },
  { token: "acc-lilac", label: "Accent Lilac", group: "accent", swatch: "#e09bec", cssValue: "#c372d3", previewColor: "#c372d3" },
  { token: "acc-lavender", label: "Accent Lavender", group: "accent", swatch: "#c69ee4", cssValue: "#aa7cd1", previewColor: "#aa7cd1" },
  { token: "acc-indigo", label: "Accent Indigo", group: "accent", swatch: "#866cee", cssValue: "#6d51d9", previewColor: "#6d51d9" },
  { token: "acc-periwinkle", label: "Accent Periwinkle", group: "accent", swatch: "#93a2f7", cssValue: "#7889e4", previewColor: "#7889e4" },
  { token: "acc-sky", label: "Accent Sky", group: "accent", swatch: "#71b2f7", cssValue: "#4a90de", previewColor: "#4a90de" },
  { token: "acc-cyan", label: "Accent Cyan", group: "accent", swatch: "#7acee1", cssValue: "#4caec5", previewColor: "#4caec5" },
  { token: "acc-teal", label: "Accent Teal", group: "accent", swatch: "#7ecdbe", cssValue: "#59af9c", previewColor: "#59af9c" },
  { token: "acc-sage", label: "Accent Sage", group: "accent", swatch: "#9fd2af", cssValue: "#7eb390", previewColor: "#7eb390" },
  { token: "acc-apricot", label: "Accent Apricot", group: "accent", swatch: "#fca877", cssValue: "#df8a57", previewColor: "#df8a57" },
];
const CALENDAR_COLOR_PRESET_MAP = Object.fromEntries(CALENDAR_COLOR_PRESETS.map((preset) => [preset.token, preset]));
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
  {
    key: "selectedDayColor",
    type: "string",
    title: "Selected day custom color",
    description: "Internal custom color for the selected-day styling.",
    default: "#10b981",
  },
  {
    key: "selectedDayColorMode",
    type: "enum",
    title: "Selected day color source",
    description: "Internal source for selected-day color styling.",
    default: "preset",
    enumChoices: ["custom", "preset"],
    enumPicker: "select",
  },
  {
    key: "selectedDayPresetToken",
    type: "string",
    title: "Selected day preset token",
    description: "Internal preset token for selected-day styling.",
    default: "acc-app-accent",
  },
  {
    key: "selectedDayAlpha",
    type: "string",
    title: "Selected day opacity",
    description: "Internal opacity for selected-day styling.",
    default: "100",
  },
  {
    key: "todayColor",
    type: "string",
    title: "Today custom color",
    description: "Internal custom color for today's styling.",
    default: "#10b981",
  },
  {
    key: "todayColorMode",
    type: "enum",
    title: "Today color source",
    description: "Internal source for today's styling.",
    default: "preset",
    enumChoices: ["custom", "preset"],
    enumPicker: "select",
  },
  {
    key: "todayPresetToken",
    type: "string",
    title: "Today preset token",
    description: "Internal preset token for today's styling.",
    default: "acc-app-accent",
  },
  {
    key: "todayAlpha",
    type: "string",
    title: "Today opacity",
    description: "Internal opacity for today's styling.",
    default: "32",
  },
  {
    key: "weekendColor",
    type: "string",
    title: "Weekend custom color",
    description: "Internal custom color for weekend styling.",
    default: "#10b981",
  },
  {
    key: "weekendColorMode",
    type: "enum",
    title: "Weekend color source",
    description: "Internal source for weekend styling.",
    default: "preset",
    enumChoices: ["custom", "preset"],
    enumPicker: "select",
  },
  {
    key: "weekendPresetToken",
    type: "string",
    title: "Weekend preset token",
    description: "Internal preset token for weekend styling.",
    default: "acc-app-accent",
  },
  {
    key: "weekendAlpha",
    type: "string",
    title: "Weekend opacity",
    description: "Internal opacity for weekend styling.",
    default: "10",
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
  dockMode: "content",
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
  monthGridMinimized: false,
  selectedDayColorMode: "preset",
  selectedDayPresetToken: "acc-app-accent",
  selectedDayColor: "#10b981",
  selectedDayAlpha: 100,
  todayColorMode: "preset",
  todayPresetToken: "acc-app-accent",
  todayColor: "#10b981",
  todayAlpha: 32,
  weekendColorMode: "preset",
  weekendPresetToken: "acc-app-accent",
  weekendColor: "#10b981",
  weekendAlpha: 10,
  panelMounted: false,
  lastRuntimeStyleText: "",
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

function getHostThemeMode() {
  const hostDocument = getHostDocument();
  const root = hostDocument?.documentElement;
  const body = hostDocument?.body;
  const explicitTheme = String(root?.dataset?.theme || body?.dataset?.theme || "").trim().toLowerCase();

  if (explicitTheme === "dark" || explicitTheme === "light") {
    return explicitTheme;
  }

  if (
    root?.classList?.contains("dark-theme")
    || root?.classList?.contains("theme-dark")
    || body?.classList?.contains("dark-theme")
    || body?.classList?.contains("theme-dark")
  ) {
    return "dark";
  }

  return "light";
}

function syncCalendarPanelTheme() {
  const themeMode = getHostThemeMode();
  const root = document.documentElement;
  const body = document.body;

  if (!root || !body) {
    return;
  }

  root.dataset.theme = themeMode;
  body.dataset.theme = themeMode;
  root.classList.toggle("dark-theme", themeMode === "dark");
  root.classList.toggle("theme-dark", themeMode === "dark");
  root.classList.toggle("light-theme", themeMode !== "dark");
  root.classList.toggle("theme-light", themeMode !== "dark");
  body.classList.toggle("dark-theme", themeMode === "dark");
  body.classList.toggle("theme-dark", themeMode === "dark");
  body.classList.toggle("light-theme", themeMode !== "dark");
  body.classList.toggle("theme-light", themeMode !== "dark");
  const hostAccent = getHostAccentCssValue();
  root.style.setProperty("--ls-active-primary-color", hostAccent);
  root.style.setProperty("--ls-link-text-color", hostAccent);
}

function sanitizeHexColor(value, fallback = "#10b981") {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    return `#${normalized.slice(1).split("").map((character) => `${character}${character}`).join("")}`.toLowerCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized.toLowerCase();
  }

  return fallback;
}

function normalizeAlphaPercent(value, fallback = 100) {
  const parsed = Number(value);

  if (Number.isFinite(parsed)) {
    return Math.min(100, Math.max(0, Math.round(parsed)));
  }

  return fallback;
}

function isHexColorValue(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return /^#[0-9a-fA-F]{6}$/.test(normalized) || /^#[0-9a-fA-F]{3}$/.test(normalized);
}

function parseColorString(value) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    return null;
  }

  const hex = normalized.toLowerCase();

  if (/^#[0-9a-f]{3}$/.test(hex)) {
    return {
      r: parseInt(`${hex[1]}${hex[1]}`, 16),
      g: parseInt(`${hex[2]}${hex[2]}`, 16),
      b: parseInt(`${hex[3]}${hex[3]}`, 16),
      a: 1,
    };
  }

  if (/^#[0-9a-f]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
      a: 1,
    };
  }

  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/i);

  if (!rgbMatch) {
    return null;
  }

  const parts = rgbMatch[1].split(",").map((part) => part.trim());

  if (parts.length < 3) {
    return null;
  }

  return {
    r: Math.min(255, Math.max(0, Number(parts[0]) || 0)),
    g: Math.min(255, Math.max(0, Number(parts[1]) || 0)),
    b: Math.min(255, Math.max(0, Number(parts[2]) || 0)),
    a: parts.length >= 4 ? Math.min(1, Math.max(0, Number(parts[3]) || 0)) : 1,
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((component) => Math.round(component).toString(16).padStart(2, "0")).join("")}`;
}

function colorStringToHex(value, fallback = "#10b981") {
  const parsed = parseColorString(value);
  return parsed ? rgbToHex(parsed) : fallback;
}

function getHostAccentCssValue() {
  const hostDocument = getHostDocument();
  const targets = [hostDocument?.documentElement, hostDocument?.body].filter(Boolean);

  for (const target of targets) {
    const computed = getHostWindow()?.getComputedStyle?.(target);

    if (!computed) {
      continue;
    }

    const activePrimary = computed.getPropertyValue("--ls-active-primary-color").trim();

    if (activePrimary) {
      return activePrimary;
    }

    const linkText = computed.getPropertyValue("--ls-link-text-color").trim();

    if (linkText) {
      return linkText;
    }
  }

  return "#10b981";
}

function getResolvedPresetCssValue(value) {
  const preset = typeof value === "string" ? getCalendarColorPreset(value) : value;

  if (!preset) {
    return "#10b981";
  }

  if (preset.token === "acc-app-accent") {
    return getHostAccentCssValue();
  }

  return preset.cssValue || preset.previewColor || "#10b981";
}

function getCalendarPresetCssValue(value) {
  return getResolvedPresetCssValue(value);
}

function getResolvedPresetPreviewHex(value) {
  const preset = typeof value === "string" ? getCalendarColorPreset(value) : value;

  if (!preset) {
    return "#10b981";
  }

  if (preset.token === "acc-app-accent") {
    return colorStringToHex(getHostAccentCssValue());
  }

  return sanitizeHexColor(preset.previewColor || preset.cssValue || "#10b981");
}

function applyAlphaToCssColor(colorCssValue, alphaPercent) {
  const normalizedAlpha = normalizeAlphaPercent(alphaPercent, 100);

  if (normalizedAlpha >= 100) {
    return colorCssValue;
  }

  if (normalizedAlpha <= 0) {
    return "transparent";
  }

  return `color-mix(in srgb, ${colorCssValue} ${normalizedAlpha}%, transparent)`;
}

function getCalendarColorPreset(token) {
  return CALENDAR_COLOR_PRESET_MAP[String(token || "").trim()] || null;
}

function getCalendarColorTargetConfig(targetKey) {
  return CALENDAR_COLOR_TARGET_MAP[String(targetKey || "").trim()] || null;
}

function getCalendarColorState(targetKey) {
  const target = getCalendarColorTargetConfig(targetKey);

  if (!target) {
    return null;
  }

  return {
    mode: state[target.settings.mode],
    token: state[target.settings.token],
    color: state[target.settings.color],
    alpha: normalizeAlphaPercent(state[target.settings.alpha]),
  };
}

function getResolvedCalendarBaseCssValue(targetKey) {
  const targetState = getCalendarColorState(targetKey);

  if (!targetState) {
    return "#10b981";
  }

  if (targetState.mode === "preset") {
    return getCalendarPresetCssValue(targetState.token);
  }

  return sanitizeHexColor(targetState.color);
}

function getResolvedCalendarColorCssValue(targetKey) {
  const targetState = getCalendarColorState(targetKey);

  if (!targetState) {
    return "#10b981";
  }

  if (targetState.mode === "preset") {
    return applyAlphaToCssColor(getResolvedPresetCssValue(targetState.token), targetState.alpha);
  }

  return applyAlphaToCssColor(sanitizeHexColor(targetState.color), targetState.alpha);
}

function getResolvedCalendarColorPreview(targetKey) {
  const targetState = getCalendarColorState(targetKey);

  if (!targetState) {
    return "#10b981";
  }

  if (targetState.mode === "preset") {
    return getResolvedPresetPreviewHex(targetState.token);
  }

  return sanitizeHexColor(targetState.color);
}

function getReadableTextColor(colorValue) {
  const hex = sanitizeHexColor(colorValue);
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  const brightness = ((red * 299) + (green * 587) + (blue * 114)) / 1000;
  return brightness >= 150 ? "#0f172a" : "#f8fafc";
}

function getReadableTextColorForTarget(targetKey) {
  const previewColor = parseColorString(getResolvedCalendarColorPreview(targetKey));
  const alpha = (getCalendarColorState(targetKey)?.alpha ?? 100) / 100;
  const background = getHostThemeMode() === "dark"
    ? { r: 15, g: 23, b: 42, a: 1 }
    : { r: 248, g: 250, b: 255, a: 1 };

  if (!previewColor) {
    return getHostThemeMode() === "dark" ? "#f8fafc" : "#0f172a";
  }

  const effectiveAlpha = Math.min(1, Math.max(0, (previewColor.a ?? 1) * alpha));
  const blended = {
    r: background.r + ((previewColor.r - background.r) * effectiveAlpha),
    g: background.g + ((previewColor.g - background.g) * effectiveAlpha),
    b: background.b + ((previewColor.b - background.b) * effectiveAlpha),
  };

  return getReadableTextColor(rgbToHex(blended));
}

function getCalendarColorSelectionLabel(targetKey) {
  const target = getCalendarColorTargetConfig(targetKey);
  const targetState = getCalendarColorState(targetKey);

  if (!target || !targetState) {
    return "Color";
  }

  if (targetState.mode === "preset") {
    const preset = getCalendarColorPreset(targetState.token);
    return `${target.label} · ${preset ? preset.label : "Preset"} · ${normalizeAlphaPercent(targetState.alpha)}%`;
  }

  return `${target.label} · Custom ${sanitizeHexColor(targetState.color)} · ${normalizeAlphaPercent(targetState.alpha)}%`;
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

function normalizeCalendarDockMode(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "right sidebar" || normalized === "sidebar") {
    return "sidebar";
  }

  return "content";
}

function applyPluginSettings(settings) {
  state.firstDayOfWeek = normalizeFirstDayOfWeek(settings?.firstDayOfWeek);
  state.viewMode = settings?.calendarView === "Month" ? "month" : "week";
  state.visibilityMode = settings?.calendarVisibility === "Only journals and day pages"
    ? "journals-only"
    : "everywhere";
  state.dockMode = normalizeCalendarDockMode(settings?.calendarDock);
  state.calendarExpanded = true;
  state.selectedDayColorMode = settings?.selectedDayColorMode === "preset" && getCalendarColorPreset(settings?.selectedDayPresetToken)
    ? "preset"
    : "custom";
  state.selectedDayPresetToken = getCalendarColorPreset(settings?.selectedDayPresetToken)?.token || "acc-app-accent";
  state.selectedDayColor = sanitizeHexColor(settings?.selectedDayColor);
  state.selectedDayAlpha = normalizeAlphaPercent(settings?.selectedDayAlpha, 100);
  state.todayColorMode = settings?.todayColorMode === "preset" && getCalendarColorPreset(settings?.todayPresetToken)
    ? "preset"
    : "custom";
  state.todayPresetToken = getCalendarColorPreset(settings?.todayPresetToken)?.token || "acc-app-accent";
  state.todayColor = sanitizeHexColor(settings?.todayColor);
  state.todayAlpha = normalizeAlphaPercent(settings?.todayAlpha, 32);
  state.weekendColorMode = settings?.weekendColorMode === "preset" && getCalendarColorPreset(settings?.weekendPresetToken)
    ? "preset"
    : "custom";
  state.weekendPresetToken = getCalendarColorPreset(settings?.weekendPresetToken)?.token || "acc-app-accent";
  state.weekendColor = sanitizeHexColor(settings?.weekendColor);
  state.weekendAlpha = normalizeAlphaPercent(settings?.weekendAlpha, 10);
}

function persistPluginSetting(partialSettings) {
  if (typeof logseq.updateSettings !== "function") {
    return;
  }

  try {
    logseq.updateSettings(partialSettings);
  } catch (error) {
    console.error("[Degrande Calendar] Failed to persist settings", error);
  }
}

function setFirstDayOfWeekSetting(nextValue) {
  const normalized = FIRST_DAY_CHOICES.includes(nextValue) ? nextValue : "Monday";
  state.firstDayOfWeek = normalizeFirstDayOfWeek(normalized);
  persistPluginSetting({ firstDayOfWeek: normalized });
  void syncFromCurrentContext({ alignWeekToSelection: true });
}

function setCalendarViewSetting(nextValue) {
  const normalized = nextValue === "Month" ? "Month" : "Week";
  state.viewMode = normalized === "Month" ? "month" : "week";
  persistPluginSetting({ calendarView: normalized });
  queueRender();
}

function setCalendarVisibilitySetting(nextValue) {
  const normalized = nextValue === "Only journals and day pages"
    ? "Only journals and day pages"
    : "Everywhere";
  state.visibilityMode = normalized === "Only journals and day pages" ? "journals-only" : "everywhere";
  persistPluginSetting({ calendarVisibility: normalized });
  void syncFromCurrentContext({ alignWeekToSelection: true });
}

function setCalendarDockSetting(nextValue) {
  const normalizedMode = normalizeCalendarDockMode(nextValue);
  const normalizedLabel = normalizedMode === "sidebar" ? DOCK_MODE_CHOICES[1] : DOCK_MODE_CHOICES[0];

  state.dockMode = normalizedMode;
  persistPluginSetting({ calendarDock: normalizedLabel });

  if (normalizedMode === "sidebar") {
    logseq.App.setRightSidebarVisible?.(true);
  }

  hidePreview();
  ensureFallbackRoot();
  queueLayoutUpdate();
  queueRender();
}

function toggleCalendarDockSetting() {
  setCalendarDockSetting(state.dockMode === "sidebar" ? "content" : "sidebar");
}

function setCalendarPresetColor(targetKey, token) {
  const target = getCalendarColorTargetConfig(targetKey);
  const preset = getCalendarColorPreset(token);

  if (!target || !preset) {
    return;
  }

  state[target.settings.mode] = "preset";
  state[target.settings.token] = preset.token;

  persistPluginSetting({
    [target.settings.mode]: "preset",
    [target.settings.token]: preset.token,
  });

  syncCalendarRuntimeStyle();
  syncCalendarSettingsPanel();
  queueRender();
}

function setCalendarCustomColor(targetKey, colorValue) {
  const target = getCalendarColorTargetConfig(targetKey);

  if (!target) {
    return;
  }

  const normalized = sanitizeHexColor(colorValue);
  state[target.settings.mode] = "custom";
  state[target.settings.color] = normalized;

  persistPluginSetting({
    [target.settings.mode]: "custom",
    [target.settings.color]: normalized,
  });

  syncCalendarRuntimeStyle();
  syncCalendarSettingsPanel();
  queueRender();
}

function setCalendarColorAlpha(targetKey, alphaValue) {
  const target = getCalendarColorTargetConfig(targetKey);

  if (!target) {
    return;
  }

  const normalized = normalizeAlphaPercent(alphaValue, 100);
  state[target.settings.alpha] = normalized;

  persistPluginSetting({
    [target.settings.alpha]: String(normalized),
  });

  syncCalendarRuntimeStyle();
  syncCalendarSettingsPanel();
  queueRender();
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

function getMonthGridStartDate(monthStart) {
  return startOfWeek(monthStart);
}

function getMonthGridRow(date, monthStart) {
  const normalizedDate = startOfLocalDay(date);
  const gridStart = getMonthGridStartDate(monthStart);
  const dayOffset = Math.round((normalizedDate.getTime() - gridStart.getTime()) / 86400000);
  return Math.floor(dayOffset / 7) + 1;
}

function getMonthGridColumn(date, monthStart) {
  const normalizedDate = startOfLocalDay(date);
  const gridStart = getMonthGridStartDate(monthStart);
  const dayOffset = Math.round((normalizedDate.getTime() - gridStart.getTime()) / 86400000);
  return (dayOffset % 7) + 2;
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

  const label = "Open Degrande Calendar settings";
  button.setAttribute("title", label);
  button.setAttribute("aria-label", label);
  button.classList.toggle("is-active", Boolean(logseq.isMainUIVisible));
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
  const gridStart = getMonthGridStartDate(monthStart);
  const totalDays = getMonthWeekRowCount(monthStart) * 7;
  return Array.from({ length: totalDays }, (_value, index) => addDays(gridStart, index));
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

function getCalendarPresetDisplayColor(value) {
  const preset = typeof value === "string" ? getCalendarColorPreset(value) : value;
  return getCalendarPresetCssValue(preset);
}

function buildCalendarPresetButtons(targetKey, group) {
  return CALENDAR_COLOR_PRESETS
    .filter((preset) => preset.group === group)
    .map((preset) => {
      const targetState = getCalendarColorState(targetKey);
      const isActive = targetState?.mode === "preset" && targetState.token === preset.token;
      const isSpecial = preset.token === "acc-app-accent";

      return `
        <button
          class="dgc-settings-swatch${isActive ? " is-active" : ""}${isSpecial ? " is-special" : ""}"
          type="button"
          data-action="set-calendar-preset"
          data-target-key="${targetKey}"
          data-value="${preset.token}"
          title="${escapeHtml(preset.label)}"
          aria-label="Set ${escapeHtml(getCalendarColorTargetConfig(targetKey)?.label || "calendar")} color to ${escapeHtml(preset.label)}"
          style="--dgc-settings-swatch-color:${getCalendarPresetDisplayColor(preset)};"
        >${isSpecial ? "A" : ""}</button>
      `;
    })
    .join("");
}

function buildCalendarColorSection(targetKey) {
  const target = getCalendarColorTargetConfig(targetKey);

  if (!target) {
    return "";
  }

  return `
    <section class="dgc-settings-card">
      <div class="dgc-settings-card-head">
        <div>
          <p class="dgc-settings-card-eyebrow">Color</p>
          <h2>${escapeHtml(target.label)}</h2>
          <p class="dgc-settings-card-copy">${escapeHtml(target.subtitle)}</p>
        </div>
        <span class="dgc-settings-pill" data-role="${target.key}-label">${escapeHtml(getCalendarColorSelectionLabel(target.key))}</span>
      </div>
      <div class="dgc-settings-palette-group">
        <div class="dgc-settings-palette-label">Preset colors</div>
        <div class="dgc-settings-swatch-grid">
          ${buildCalendarPresetButtons(target.key, "preset")}
        </div>
      </div>
      <div class="dgc-settings-palette-group">
        <div class="dgc-settings-palette-label">Accent colors</div>
        <div class="dgc-settings-swatch-grid dgc-settings-swatch-grid-wide">
          ${buildCalendarPresetButtons(target.key, "accent")}
        </div>
      </div>
      <div class="dgc-settings-color-row">
        <input class="dgc-settings-color-input" type="color" data-setting="${target.key}-color" value="${escapeHtml(getResolvedCalendarColorPreview(target.key))}">
        <input class="dgc-settings-text-input" type="text" inputmode="text" data-setting="${target.key}-hex" value="${escapeHtml(getResolvedCalendarColorPreview(target.key))}" placeholder="#10b981">
      </div>
      <label class="dgc-settings-alpha-field">
        <span>Opacity</span>
        <div class="dgc-settings-alpha-row">
          <input class="dgc-settings-alpha-range" type="range" min="0" max="100" step="1" data-setting="${target.key}-alpha" value="${getCalendarColorState(target.key)?.alpha ?? 100}">
          <strong data-role="${target.key}-alpha-value">${getCalendarColorState(target.key)?.alpha ?? 100}%</strong>
        </div>
      </label>
    </section>
  `;
}

function buildCalendarSettingsPanelMarkup() {
  return `
    <div class="dgc-settings-shell">
      <section class="dgc-settings-window" aria-label="Degrande Calendar settings panel">
        <header class="dgc-settings-header">
          <div>
            <p class="dgc-settings-eyebrow">Logseq DB Calendar</p>
            <div class="dgc-settings-title-row">
              <h1>Degrande Calendar</h1>
              <span class="dgc-settings-version">v${escapeHtml(PLUGIN_VERSION)}</span>
            </div>
            <p class="dgc-settings-subtitle">Tune calendar behavior plus selected-day and today colors. Changes apply directly to the graph.</p>
          </div>
          <div class="dgc-settings-header-actions">
            <button class="dgc-settings-button dgc-settings-button-secondary" type="button" data-action="close-panel">Close</button>
          </div>
        </header>
        <div class="dgc-settings-main">
          <section class="dgc-settings-card">
            <div class="dgc-settings-card-head">
              <div>
                <p class="dgc-settings-card-eyebrow">Behavior</p>
                <h2>Calendar controls</h2>
                <p class="dgc-settings-card-copy">These replace the old toolbar toggle behavior and keep the pagebar always available.</p>
              </div>
            </div>
            <div class="dgc-settings-field-grid">
              <label class="dgc-settings-field">
                <span>First day of week</span>
                <select class="dgc-settings-select" data-setting="firstDayOfWeek">
                  ${FIRST_DAY_CHOICES.map((choice) => `<option value="${escapeHtml(choice)}">${escapeHtml(choice)}</option>`).join("")}
                </select>
              </label>
              <label class="dgc-settings-field">
                <span>Default view</span>
                <select class="dgc-settings-select" data-setting="calendarView">
                  ${VIEW_MODE_CHOICES.map((choice) => `<option value="${escapeHtml(choice)}">${escapeHtml(choice)}</option>`).join("")}
                </select>
              </label>
              <label class="dgc-settings-field dgc-settings-field-wide">
                <span>Visibility</span>
                <select class="dgc-settings-select" data-setting="calendarVisibility">
                  ${VISIBILITY_MODE_CHOICES.map((choice) => `<option value="${escapeHtml(choice)}">${escapeHtml(choice)}</option>`).join("")}
                </select>
              </label>
            </div>
            <div class="dgc-settings-preview-strip">
              <button class="dgc-settings-preview-day is-selected" type="button" tabindex="-1" aria-hidden="true">
                <span class="dgc-settings-preview-name">Wed</span>
                <span class="dgc-settings-preview-date">14</span>
                <span class="dgc-settings-preview-meta">•</span>
              </button>
              <button class="dgc-settings-preview-day is-today" type="button" tabindex="-1" aria-hidden="true">
                <span class="dgc-settings-preview-name">Thu</span>
                <span class="dgc-settings-preview-date">15</span>
                <span class="dgc-settings-preview-meta">•</span>
              </button>
              <button class="dgc-settings-preview-day is-weekend" type="button" tabindex="-1" aria-hidden="true">
                <span class="dgc-settings-preview-name">Sat</span>
                <span class="dgc-settings-preview-date">17</span>
                <span class="dgc-settings-preview-meta">•</span>
              </button>
            </div>
          </section>
          ${CALENDAR_COLOR_TARGETS.map((target) => buildCalendarColorSection(target.key)).join("")}
        </div>
      </section>
    </div>
  `;
}

function syncCalendarSettingsPanel() {
  if (!state.panelMounted) {
    return;
  }

  syncCalendarPanelTheme();

  const firstDaySelect = document.querySelector("[data-setting='firstDayOfWeek']");
  const viewSelect = document.querySelector("[data-setting='calendarView']");
  const visibilitySelect = document.querySelector("[data-setting='calendarVisibility']");

  if (firstDaySelect) {
    firstDaySelect.value = FIRST_DAY_CHOICES[state.firstDayOfWeek] || "Monday";
  }

  if (viewSelect) {
    viewSelect.value = state.viewMode === "month" ? "Month" : "Week";
  }

  if (visibilitySelect) {
    visibilitySelect.value = state.visibilityMode === "journals-only" ? "Only journals and day pages" : "Everywhere";
  }

  CALENDAR_COLOR_TARGETS.forEach((target) => {
    const previewColor = getResolvedCalendarColorPreview(target.key);
    const label = document.querySelector(`[data-role='${target.key}-label']`);
    const colorInput = document.querySelector(`[data-setting='${target.key}-color']`);
    const hexInput = document.querySelector(`[data-setting='${target.key}-hex']`);
    const alphaInput = document.querySelector(`[data-setting='${target.key}-alpha']`);
    const alphaValue = document.querySelector(`[data-role='${target.key}-alpha-value']`);
    const targetState = getCalendarColorState(target.key);

    if (label) {
      label.textContent = getCalendarColorSelectionLabel(target.key);
    }

    if (colorInput) {
      colorInput.value = previewColor;
    }

    if (hexInput && hexInput !== document.activeElement) {
      hexInput.value = previewColor;
    }

    if (alphaInput) {
      alphaInput.value = String(targetState?.alpha ?? 100);
    }

    if (alphaValue) {
      alphaValue.textContent = `${targetState?.alpha ?? 100}%`;
    }

    document.querySelectorAll(`[data-action='set-calendar-preset'][data-target-key='${target.key}']`).forEach((button) => {
      button.style.setProperty("--dgc-settings-swatch-color", getCalendarPresetDisplayColor(button.dataset.value));
      button.classList.toggle("is-active", targetState?.mode === "preset" && targetState.token === button.dataset.value);
    });
  });

  document.documentElement.style.setProperty("--dgc-panel-selected-preview", getResolvedCalendarColorCssValue("selectedDay"));
  document.documentElement.style.setProperty("--dgc-panel-selected-text", getReadableTextColorForTarget("selectedDay"));
  document.documentElement.style.setProperty("--dgc-panel-today-preview", getResolvedCalendarColorCssValue("today"));
  document.documentElement.style.setProperty("--dgc-panel-today-text", getReadableTextColorForTarget("today"));
  document.documentElement.style.setProperty("--dgc-panel-weekend-preview", getResolvedCalendarColorCssValue("weekend"));
  document.documentElement.style.setProperty("--dgc-panel-weekend-text", getReadableTextColorForTarget("weekend"));
}

function mountCalendarSettingsPanel() {
  if (state.panelMounted) {
    return;
  }

  const app = document.getElementById("app");

  if (!app) {
    throw new Error("Missing #app root for Degrande Calendar settings panel");
  }

  app.innerHTML = buildCalendarSettingsPanelMarkup();
  syncCalendarPanelTheme();

  app.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");

    if (!actionTarget) {
      return;
    }

    if (actionTarget.dataset.action === "close-panel") {
      closeCalendarSettings();
      return;
    }

    if (actionTarget.dataset.action === "set-calendar-preset") {
      setCalendarPresetColor(actionTarget.dataset.targetKey, actionTarget.dataset.value);
    }
  });

  app.addEventListener("change", (event) => {
    const target = event.target;

    if (target.matches("[data-setting='firstDayOfWeek']")) {
      setFirstDayOfWeekSetting(target.value);
      syncCalendarSettingsPanel();
      return;
    }

    if (target.matches("[data-setting='calendarView']")) {
      setCalendarViewSetting(target.value);
      syncCalendarSettingsPanel();
      return;
    }

    if (target.matches("[data-setting='calendarVisibility']")) {
      setCalendarVisibilitySetting(target.value);
      syncCalendarSettingsPanel();
      return;
    }

    CALENDAR_COLOR_TARGETS.forEach((colorTarget) => {
      if (target.matches(`[data-setting='${colorTarget.key}-color']`)) {
        setCalendarCustomColor(colorTarget.key, target.value);
      }

      if (target.matches(`[data-setting='${colorTarget.key}-alpha']`)) {
        setCalendarColorAlpha(colorTarget.key, target.value);
      }

      if (target.matches(`[data-setting='${colorTarget.key}-hex']`)) {
        if (isHexColorValue(target.value)) {
          const normalized = sanitizeHexColor(target.value);
          target.value = normalized;
          setCalendarCustomColor(colorTarget.key, normalized);
        } else {
          target.value = getResolvedCalendarColorPreview(colorTarget.key);
        }
      }
    });

    syncCalendarSettingsPanel();
  });

  app.addEventListener("input", (event) => {
    const target = event.target;

    CALENDAR_COLOR_TARGETS.forEach((colorTarget) => {
      if (target.matches(`[data-setting='${colorTarget.key}-color']`)) {
        setCalendarCustomColor(colorTarget.key, target.value);
      }

      if (target.matches(`[data-setting='${colorTarget.key}-alpha']`)) {
        setCalendarColorAlpha(colorTarget.key, target.value);
      }

      if (target.matches(`[data-setting='${colorTarget.key}-hex']`) && isHexColorValue(target.value)) {
        setCalendarCustomColor(colorTarget.key, target.value.trim());
      }
    });

    syncCalendarSettingsPanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && logseq.isMainUIVisible) {
      closeCalendarSettings();
    }
  });

  state.panelMounted = true;
  syncCalendarSettingsPanel();
}

function openCalendarSettings() {
  if (!state.panelMounted) {
    mountCalendarSettingsPanel();
  }

  syncCalendarPanelTheme();
  logseq.setMainUIInlineStyle(MAIN_UI_INLINE_STYLE);
  logseq.showMainUI({ autoFocus: true });
  updateToolbarToggleUi();
  syncCalendarSettingsPanel();
}

function closeCalendarSettings() {
  logseq.setMainUIInlineStyle({});
  logseq.hideMainUI({ restoreEditingCursor: true });
  updateToolbarToggleUi();
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

function getDockToggleButtonState() {
  if (state.dockMode === "sidebar") {
    return {
      label: "Move calendar above content",
      icon: '<span class="dgc-toggle-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M4 9h16"></path></svg></span>',
    };
  }

  return {
    label: "Move calendar to right sidebar",
    icon: '<span class="dgc-toggle-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M16 4v16"></path></svg></span>',
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
    <section id="${rootId}" class="dgc-pagebar is-hidden" data-mount-mode="${mountMode}" aria-label="Degrande Calendar week bar">
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
            <button class="dgc-toggle" type="button" data-action="toggle-dock" data-role="dock-toggle" aria-label="Move calendar to right sidebar" title="Move calendar to right sidebar">
              <span class="dgc-toggle-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M16 4v16"></path></svg></span>
            </button>
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
            <button class="dgc-toggle" type="button" data-action="toggle-month-minimize" data-role="month-minimize-btn" aria-label="Toggle calendar days" title="Toggle calendar days">
              <span class="dgc-toggle-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s ease; transform: rotate(0deg);"><polyline points="18 15 12 9 6 15"></polyline></svg></span>
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
    dockToggle: root.querySelector('[data-role="dock-toggle"]'),
    viewToggle: root.querySelector('[data-role="view-toggle"]'),
    monthMinimizeBtn: root.querySelector('[data-role="month-minimize-btn"]'),
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

    if (action === "toggle-dock") {
      toggleCalendarDockSetting();
      return;
    }

    if (action === "toggle-month-minimize") {
      state.monthGridMinimized = !state.monthGridMinimized;
      hidePreview();
      queueRender();
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

function findContentFallbackAnchor() {
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

function getRightSidebarLayoutTarget() {
  const hostDocument = getHostDocument();

  return hostDocument.querySelector(".cp__right-sidebar .sidebar-item-list")
    || hostDocument.querySelector(".cp__right-sidebar .sidebar-item-list-wrap")
    || hostDocument.querySelector(".cp__right-sidebar .cp__right-sidebar-scroll")
    || hostDocument.querySelector(".cp__right-sidebar")
    || hostDocument.querySelector("[data-testid='right-sidebar']");
}

function findSidebarFallbackAnchor() {
  let sidebarTarget = getRightSidebarLayoutTarget();

  if (!sidebarTarget) {
    logseq.App.setRightSidebarVisible?.(true);
    sidebarTarget = getRightSidebarLayoutTarget();
  }

  if (!sidebarTarget) {
    return null;
  }

  return {
    parent: sidebarTarget,
    before: sidebarTarget.firstChild || null,
  };
}

function findFallbackAnchor() {
  return state.dockMode === "sidebar"
    ? findSidebarFallbackAnchor()
    : findContentFallbackAnchor();
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

function clearFallbackLayout(root = getHostDocument().getElementById(FALLBACK_ROOT_ID)) {
  const mainContentContainer = getMainContentContainer();

  if (root) {
    root.style.removeProperty("left");
    root.style.removeProperty("top");
    root.style.removeProperty("width");
  }

  if (!mainContentContainer) {
    return;
  }

  mainContentContainer.removeAttribute("data-dgc-sibling-offset");
  mainContentContainer.style.removeProperty("--dgc-sibling-offset");
}

function updateFallbackRootLayout(root) {
  if (state.dockMode !== "content") {
    clearFallbackLayout(root);
    return;
  }

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
      queueRender();
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

function syncCalendarRuntimeStyle() {
  const hostDocument = getHostDocument();
  const selectedAccent = getResolvedCalendarColorCssValue("selectedDay");
  const selectedText = getReadableTextColorForTarget("selectedDay");
  const todayAccent = getResolvedCalendarColorCssValue("today");
  const todayText = getReadableTextColorForTarget("today");
  const weekendAccent = getResolvedCalendarColorCssValue("weekend");
  const weekendText = getReadableTextColorForTarget("weekend");
  const runtimeStyle = `
    :root {
      --dgc-selected-accent-override: ${selectedAccent};
      --dgc-selected-text-override: ${selectedText};
      --dgc-today-accent-override: ${todayAccent};
      --dgc-today-bg-override: ${todayAccent};
      --dgc-today-text-override: ${todayText};
      --dgc-weekend-accent-override: ${weekendAccent};
      --dgc-weekend-bg-override: ${weekendAccent};
      --dgc-weekend-text-override: ${weekendText};
      --dgc-today-month-border-override: ${todayText};
    }
  `;

  if (runtimeStyle === state.lastRuntimeStyleText) {
    return;
  }

  try {
    let styleElement = hostDocument.getElementById(RUNTIME_STYLE_ELEMENT_ID);

    if (!styleElement) {
      styleElement = hostDocument.createElement("style");
      styleElement.id = RUNTIME_STYLE_ELEMENT_ID;
      (hostDocument.head || hostDocument.documentElement).appendChild(styleElement);
    }

    styleElement.textContent = runtimeStyle;
  } catch (error) {
    if (typeof logseq.provideStyle === "function") {
      logseq.provideStyle(runtimeStyle);
    } else {
      console.error("[Degrande Calendar] Failed to apply runtime color style", error);
    }
  }

  state.lastRuntimeStyleText = runtimeStyle;
}

function queueRender() {
  if (state.renderTimer) {
    clearTimeout(state.renderTimer);
  }

  state.renderTimer = setTimeout(() => {
    state.renderTimer = null;
    syncCalendarRuntimeStyle();
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
    const isFallbackRoot = root.dataset.mountMode === "fallback";
    const shouldShowRoot = Boolean(
      state.isVisible
      && state.calendarExpanded
      && state.visibleWeekStart
      && (
        isFallbackRoot
          || (state.dockMode !== "sidebar" && !hasFallbackRoot)
      )
    );

    setDatasetIfChanged(root, "dockMode", isFallbackRoot ? state.dockMode : "pagebar");
    root.classList.toggle("dgc-pagebar-inline", isFallbackRoot && state.dockMode === "content");
    root.classList.toggle("dgc-pagebar-sidebar", isFallbackRoot && state.dockMode === "sidebar");

    root.classList.toggle("is-hidden", !shouldShowRoot);

    if (!shouldShowRoot) {
      if (isFallbackRoot) {
        clearFallbackLayout(root);
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

    if (refs?.dockToggle) {
      const toggleState = getDockToggleButtonState();
      setHtmlIfChanged(refs.dockToggle, toggleState.icon);
      setAttributeIfChanged(refs.dockToggle, "aria-label", toggleState.label);
      setAttributeIfChanged(refs.dockToggle, "title", toggleState.label);
      refs.dockToggle.classList.toggle("is-active", state.dockMode === "sidebar");
    }

    root.classList.toggle("is-month-view", state.viewMode === "month");
    root.classList.toggle("is-week-view", state.viewMode === "week");
    root.classList.toggle("is-minimized", state.monthGridMinimized);

    if (refs?.weekStrip) {
      refs.weekStrip.classList.toggle("is-hidden", state.viewMode !== "week" || !state.calendarExpanded || state.monthGridMinimized);
    }

    if (refs?.monthHeaderRow) {
      refs.monthHeaderRow.classList.toggle("is-hidden", state.viewMode !== "month" || !state.calendarExpanded || state.monthGridMinimized);
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

    if (refs?.monthMinimizeBtn) {
      refs.monthMinimizeBtn.classList.toggle("is-minimized", state.monthGridMinimized);
      const svg = refs.monthMinimizeBtn.querySelector("svg");
      if (svg) {
        svg.style.transform = state.monthGridMinimized ? "rotate(180deg)" : "rotate(0deg)";
      }
    }

    if (refs?.monthGrid) {
      refs.monthGrid.classList.toggle("is-hidden", state.viewMode !== "month" || !state.calendarExpanded || state.monthGridMinimized);

      const monthStart = state.visibleMonthStart || startOfMonth(state.today);
      const visibleMonthWeekCount = getMonthWeekRowCount(monthStart);
      refs.monthGrid.style.setProperty("--dgc-month-visible-days", String(monthDates.length));

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
      const visibleMonthStart = state.visibleMonthStart || startOfMonth(date);
      const isActive = Boolean(activeDate && isSameDay(activeDate, date));
      const isToday = isSameDay(state.today, date);
      const hasJournal = Boolean(state.journalPresence[getDayKey(date)]);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isOutsideMonth = !isSameMonth(date, visibleMonthStart);
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
        button.classList.toggle("is-outside-month", isOutsideMonth);
        button.style.setProperty("--dgc-month-grid-start", String(getMonthGridColumnStart(date)));
        button.style.setProperty("--dgc-month-grid-column", String(getMonthGridColumn(date, visibleMonthStart)));
        button.style.setProperty("--dgc-month-grid-row", String(getMonthGridRow(date, visibleMonthStart)));
        setAttributeIfChanged(button, "aria-pressed", String(isActive));
        setAttributeIfChanged(button, "aria-label", FULL_DATE_FORMATTER.format(date));
        setDatasetIfChanged(button, "dateValue", date.getTime());
        setDatasetIfChanged(button, "pageId", hasJournal ? journalPageId : "");
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

    if (isFallbackRoot) {
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
      openCalendarSettings();
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
      syncCalendarRuntimeStyle();
      syncCalendarSettingsPanel();
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
    try {
      logseq.useSettingsSchema(SETTINGS_SCHEMA);
    } catch (error) {
      console.error("[Degrande Calendar] Failed to register settings schema", error);
    }
  }

  try {
    applyPluginSettings(logseq.settings || {});
  } catch (error) {
    console.error("[Degrande Calendar] Failed to apply stored settings", error);
  }

  if (typeof logseq.onSettingsChanged === "function") {
    logseq.onSettingsChanged((newSettings) => {
      try {
        applyPluginSettings(newSettings || {});
        syncCalendarRuntimeStyle();
        syncCalendarSettingsPanel();
      } catch (error) {
        console.error("[Degrande Calendar] Failed to apply changed settings", error);
      }
      void syncFromCurrentContext({ alignWeekToSelection: true });
    });
  }

  logseq.provideModel({
    openCalendarSettings() {
      openCalendarSettings();
    },
  });
  registerToolbarItemSafely({
    key: TOOLBAR_ITEM_KEY,
    template: `
      <a class="button" id="${TOOLBAR_TOGGLE_ID}" data-on-click="openCalendarSettings" title="Open Degrande Calendar settings" aria-label="Open Degrande Calendar settings">
        <i class="ti ti-calendar-event"></i>
      </a>
    `,
  });

  await installStyles();

  try {
    syncCalendarRuntimeStyle();
  } catch (error) {
    console.error("[Degrande Calendar] Failed to sync runtime style", error);
  }

  await ensureUserDateFormat();
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
