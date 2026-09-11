/**
 * XState inspector UI.
 *
 * Loaded as a plain ES module: no bundler, no dependencies. Events are grouped
 * into one tab per machine: the tab is keyed by the machine id carried by the
 * `@xstate.actor` registration event, falling back to `rootId` before a
 * registration is seen. Setting the same machine up again in the app therefore
 * overrides its tab rather than opening a second one.
 *
 * The stream carries no history, so a reload starts from an empty timeline.
 *
 * @typedef {import("./types").RecordedEvent} RecordedEvent
 * @typedef {import("./types").Machine} Machine
 * @typedef {Record<string, unknown>} Loose
 */

/** Rows rendered below this are collapsed behind a count, to keep large flows cheap to paint. */
const RENDER_WINDOW = 400;

/** Per-machine event cap. Events beyond this are dropped, oldest first. */
const MAX_EVENTS = 20000;

/** Per-machine retained wire bytes. Snapshot events repeat whole machine contexts. */
const MAX_RETAINED_BYTES = 32 * 1024 * 1024;

/** Characters of payload kept for the inline preview of a row. */
const PREVIEW_LIMIT = 180;

/** Characters kept in the expanded row detail. */
const DETAIL_LIMIT = 20000;

const timeline = /** @type {HTMLElement} */ (
  document.getElementById("timeline")
);
const tabs = /** @type {HTMLElement} */ (document.getElementById("tabs"));
const connectionStatus = /** @type {HTMLElement} */ (
  document.getElementById("status")
);
const filterInput = /** @type {HTMLInputElement} */ (
  document.getElementById("filter")
);

/** @type {Map<string, Machine>} */
const machines = new Map();
/**
 * Root actor session id (wire `rootId`) to owning tab key, so every event of an
 * actor lands in the tab its registration adopted.
 *
 * @type {Map<string, string>}
 */
const roots = new Map();
/**
 * Machine id to owning tab key, so a machine disposed and set up again
 * overrides its previous tab instead of opening a second one.
 *
 * @type {Map<string, string>}
 */
const labels = new Map();
/** @type {Set<string>} */
const expanded = new Set();
/** @type {Map<string, number>} */
const dropped = new Map();
let needle = "";
let dirty = false;

/** @param {unknown} value @returns {string | undefined} */
const asString = value => (typeof value === "string" ? value : undefined);

/** @param {unknown} value @returns {Loose | undefined} */
const asRecord = value =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? /** @type {Loose} */ (value)
    : undefined;

/** @param {string} value @returns {string} */
const escapeHtml = value =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Renders a value as compact JSON, or as-is when it is a plain string.
 *
 * @param {unknown} value
 * @param {number} limit
 * @returns {string}
 */
const compact = (value, limit) => {
  if (typeof value === "string") {
    return value;
  }
  let text;
  try {
    text = JSON.stringify(value);
  } catch {
    text = String(value);
  }
  if (text === undefined) {
    return String(value);
  }
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

/** @param {unknown} value @returns {string} */
const pretty = value => {
  let text;
  try {
    text = JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }
  const safe = text === undefined ? String(value) : text;
  return safe.length > DETAIL_LIMIT
    ? `${safe.slice(0, DETAIL_LIMIT)}\n…`
    : safe;
};

/** @param {unknown} value @returns {string} */
const stateLabel = value => (value === undefined ? "—" : compact(value, 120));

/** @param {unknown} error @returns {string} */
const errorLabel = error => {
  const record = asRecord(error);
  return asString(record?.message) ?? compact(error, PREVIEW_LIMIT);
};

/** @param {string | undefined} rootId @returns {string} */
const keyOf = rootId => rootId ?? "unknown";

/** @param {string | undefined} rootId @returns {Machine} */
const machineFor = rootId => {
  const root = keyOf(rootId);
  const key = roots.get(root) ?? root;
  const existing = machines.get(key);
  if (existing) {
    return existing;
  }
  const created = {
    key,
    label: key,
    rootId: root,
    events: [],
    bytes: 0
  };
  machines.set(key, created);
  roots.set(root, key);
  return created;
};

/**
 * Normalizes one wire event into a renderable timeline entry.
 *
 * @param {unknown} raw
 * @param {number} size
 * @param {string | undefined} previousValue
 * @returns {RecordedEvent}
 */
const record = (raw, size, previousValue) => {
  const event = asRecord(raw) ?? {};
  const type = asString(event.type) ?? "unknown";
  const rootId = keyOf(asString(event.rootId));
  const sourceId = asString(event.sourceId);
  const body = asRecord(event.event);
  const snapshot = asRecord(event.snapshot) ?? {};
  const at = Date.now();

  if (type === "@xstate.actor") {
    const name = asString(event.name) ?? "actor";
    const parentId = asString(event.parentId);
    const status = asString(snapshot.status) ?? "unknown";
    const output = snapshot.output;
    const spawn = parentId ? `spawned by ${parentId}` : "registered";
    const outputText =
      output === undefined ? "" : ` · output ${compact(output, PREVIEW_LIMIT)}`;
    return {
      id: asString(event.id) ?? `${at}-${Math.random()}`,
      kind: "actor",
      type,
      rootId,
      headline: `${spawn}: ${name} · ${status}${outputText}`,
      at,
      size,
      payload: raw
    };
  }

  if (type === "@xstate.snapshot") {
    const eventType = asString(body?.type) ?? "unknown";
    const stateValue = stateLabel(snapshot.value);
    const transition =
      previousValue === undefined || previousValue === stateValue
        ? stateValue
        : `${previousValue} → ${stateValue}`;
    const failed = asString(snapshot.status) === "error";
    const output =
      snapshot.output === undefined
        ? ""
        : ` · output ${compact(snapshot.output, PREVIEW_LIMIT)}`;
    const error = failed ? ` · ${errorLabel(snapshot.error)}` : "";
    return {
      id: asString(event.id) ?? `${at}-${Math.random()}`,
      kind: failed ? "failure" : "snapshot",
      type,
      rootId,
      headline: `${transition} · after ${eventType}${output}${error}`,
      at,
      size,
      payload: raw
    };
  }

  if (type === "@xstate.event") {
    const eventType = asString(body?.type) ?? "unknown";
    const rest = { ...(body ?? {}) };
    delete rest.type;
    const payload =
      Object.keys(rest).length > 0 ? ` ${compact(rest, PREVIEW_LIMIT)}` : "";
    const origin = sourceId ? ` · from ${sourceId}` : "";
    return {
      id: asString(event.id) ?? `${at}-${Math.random()}`,
      kind: "event",
      type,
      rootId,
      sourceId,
      headline: `${eventType}${payload}${origin}`,
      at,
      size,
      payload: raw
    };
  }

  return {
    id: asString(event.id) ?? `${at}-${Math.random()}`,
    kind: "other",
    type,
    rootId,
    headline: compact(raw, PREVIEW_LIMIT),
    at,
    size,
    payload: raw
  };
};

/**
 * @param {unknown} raw
 * @param {number} size
 */
const ingest = (raw, size) => {
  const event = asRecord(raw) ?? {};
  const type = asString(event.type);
  const root = keyOf(asString(event.rootId));
  const registration =
    type === "@xstate.actor" && asString(event.parentId) === undefined
      ? asString(event.name)
      : undefined;

  // A machine that was disposed and set up again registers with the same
  // machine id but a new session id. Take over its previous tab: the new
  // instance replaces the timeline rather than opening a second tab.
  const adoptedKey = registration && labels.get(registration);
  const adopted =
    adoptedKey === undefined ? undefined : machines.get(adoptedKey);
  const machine = adopted ?? machineFor(root);
  if (adopted) {
    // A child actor can register before its root does, which opens a tab keyed
    // by the new session id. Adoption supersedes it.
    const orphan = roots.get(root);
    if (orphan !== undefined && orphan !== adopted.key) {
      machines.delete(orphan);
      dropped.delete(orphan);
    }
    if (adopted.rootId !== root) {
      adopted.rootId = root;
      adopted.events = [];
      adopted.bytes = 0;
      adopted.lastValue = undefined;
      dropped.delete(adopted.key);
    }
  } else if (registration !== undefined) {
    machine.label = registration;
    labels.set(registration, machine.key);
  }
  roots.set(root, machine.key);

  const snapshot = asRecord(event.snapshot);
  const entry = record(raw, size, machine.lastValue);
  if (type === "@xstate.snapshot" && snapshot) {
    machine.lastValue = stateLabel(snapshot.value);
  }

  machine.events.push(entry);
  machine.bytes += size;
  let evicted = 0;
  while (
    machine.events.length > MAX_EVENTS ||
    (machine.bytes > MAX_RETAINED_BYTES && machine.events.length > 1)
  ) {
    const oldest = machine.events.shift();
    if (oldest === undefined) {
      break;
    }
    machine.bytes -= oldest.size;
    evicted += 1;
  }
  if (evicted > 0) {
    dropped.set(machine.key, (dropped.get(machine.key) ?? 0) + evicted);
  }
  schedule();
};

/** @returns {string | undefined} */
const activeKey = () => {
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (hash && machines.has(hash)) {
    return hash;
  }
  const first = machines.keys().next();
  return first.done ? undefined : first.value;
};

/** @param {RecordedEvent} entry @returns {boolean} */
const matches = entry =>
  needle === "" ||
  `${entry.type} ${entry.headline}`.toLowerCase().includes(needle);

const renderTabs = () => {
  const current = activeKey();
  tabs.innerHTML = [...machines.values()]
    .map(
      machine =>
        `<button type="button" class="tab" role="tab" data-key="${escapeHtml(
          machine.key
        )}" aria-selected="${machine.key === current}">${escapeHtml(
          machine.label
        )}<span class="count">${machine.events.length}</span></button>`
    )
    .join("");
};

/** @param {RecordedEvent} entry @returns {string} */
const renderRow = entry => {
  const open = expanded.has(entry.id);
  return `<details class="row" data-id="${escapeHtml(entry.id)}"${
    open ? " open" : ""
  }>
    <summary>
      <span class="kind ${entry.kind}">${escapeHtml(entry.kind)}</span>
      <span class="headline">${escapeHtml(entry.headline)}</span>
      <span class="spacer"></span>
    </summary>
    ${open ? `<pre>${escapeHtml(pretty(entry.payload))}</pre>` : ""}
  </details>`;
};

const renderTimeline = () => {
  const current = activeKey();
  const machine = current === undefined ? undefined : machines.get(current);
  if (!machine) {
    timeline.innerHTML =
      '<p class="empty">Waiting for events. Open a flow in the app and the machines will show up here.</p>';
    return;
  }

  const filtered = machine.events.filter(matches);
  const hidden = Math.max(0, filtered.length - RENDER_WINDOW);
  const visible = hidden > 0 ? filtered.slice(-RENDER_WINDOW) : filtered;
  const droppedCount = dropped.get(machine.key) ?? 0;
  const notes = [
    hidden > 0
      ? `<p class="note">${hidden} earlier event(s) hidden · use the filter to narrow the timeline</p>`
      : "",
    droppedCount > 0
      ? `<p class="note">${droppedCount} event(s) dropped past the per-machine memory cap (${MAX_EVENTS} events or ${Math.round(MAX_RETAINED_BYTES / (1024 * 1024))} MB)</p>`
      : "",
    filtered.length === 0
      ? '<p class="note">No event matches the current filter</p>'
      : ""
  ].join("");

  timeline.innerHTML =
    notes +
    visible.map(renderRow).join("") +
    `<p class="note">${filtered.length} event(s) for ${escapeHtml(
      machine.label
    )} (${escapeHtml(machine.rootId)})</p>`;
};

const render = () => {
  dirty = false;
  renderTabs();
  renderTimeline();
};

const schedule = () => {
  if (dirty) {
    return;
  }
  dirty = true;
  let pendingFrame = 0;
  let pendingTimer = 0;
  const flush = () => {
    if (!dirty) {
      return;
    }
    if (pendingFrame) {
      window.cancelAnimationFrame(pendingFrame);
    }
    if (pendingTimer) {
      window.clearTimeout(pendingTimer);
    }
    render();
  };
  pendingFrame = window.requestAnimationFrame(flush);
  // Browsers throttle or stop animation frames in hidden tabs; the timer keeps
  // the timeline updating when the inspector is not the visible tab.
  pendingTimer = window.setTimeout(flush, 250);
};

const download = () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    machines: [...machines.values()].map(machine => ({
      key: machine.key,
      label: machine.label,
      rootId: machine.rootId,
      droppedEvents: dropped.get(machine.key) ?? 0,
      events: machine.events.map(entry => entry.payload)
    }))
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `xstate-inspector-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const clear = () => {
  machines.clear();
  roots.clear();
  labels.clear();
  expanded.clear();
  dropped.clear();
  render();
};

tabs.addEventListener("click", event => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  const tab = target.closest("button[data-key]");
  const key = tab instanceof HTMLElement ? tab.dataset.key : undefined;
  if (key) {
    window.location.hash = encodeURIComponent(key);
  }
});

timeline.addEventListener(
  "toggle",
  event => {
    const target = event.target;
    if (!(target instanceof HTMLDetailsElement)) {
      return;
    }
    const id = target.dataset.id;
    if (!id) {
      return;
    }
    const isOpen = target.open;
    const changed = isOpen ? !expanded.has(id) : expanded.has(id);
    if (isOpen) {
      expanded.add(id);
    } else {
      expanded.delete(id);
    }
    // Detail is rendered only for expanded rows, so the row has to be rebuilt.
    // Guarded on a real change: rebuilding the timeline can re-fire `toggle`.
    if (changed) {
      schedule();
    }
  },
  true
);

filterInput.addEventListener("input", () => {
  needle = filterInput.value.trim().toLowerCase();
  render();
});

/** @type {HTMLElement | null} */
const exportButton = document.getElementById("export");
exportButton?.addEventListener("click", download);

/** @type {HTMLElement | null} */
const clearButton = document.getElementById("clear");
clearButton?.addEventListener("click", clear);

window.addEventListener("hashchange", render);

const stream = new EventSource("stream");
stream.addEventListener("open", () => {
  connectionStatus.dataset.online = "true";
  connectionStatus.textContent = "connected";
});
stream.addEventListener("error", () => {
  connectionStatus.dataset.online = "false";
  connectionStatus.textContent = "reconnecting";
});
stream.addEventListener("message", message => {
  try {
    ingest(JSON.parse(message.data), message.data.length);
  } catch {
    // A malformed frame is dropped; the stream stays usable.
  }
});
window.addEventListener("beforeunload", () => stream.close());

render();

export {};
