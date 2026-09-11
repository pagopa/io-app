/**
 * Timeline view: renders the tab strip and the rows, then repaints whenever the
 * store changes. Holds no state of its own beyond the throttle.
 */
import { MAX_EVENTS, MAX_RETAINED_BYTES, RENDER_WINDOW } from "./constants.js";
import { escapeHtml, pretty } from "./format.js";
import { setExpanded, timelineStore } from "./store.js";

const timeline = /** @type {HTMLElement} */ (
  document.getElementById("timeline")
);
const tabs = /** @type {HTMLElement} */ (document.getElementById("tabs"));

let dirty = false;

/**
 * Tab shown, from the location hash, falling back to the first machine.
 *
 * @param {import("./store.js").TimelineState} state
 * @returns {string | undefined}
 */
const activeKey = state => {
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (hash && state.machines.has(hash)) {
    return hash;
  }
  const first = state.machines.keys().next();
  return first.done ? undefined : first.value;
};

/**
 * @param {import("./store.js").TimelineState} state
 * @param {import("./types").RecordedEvent} entry
 * @returns {boolean}
 */
const matches = (state, entry) =>
  state.filter === "" ||
  `${entry.type} ${entry.headline}`.toLowerCase().includes(state.filter);

/** @param {import("./store.js").TimelineState} state */
const renderTabs = state => {
  const current = activeKey(state);
  tabs.innerHTML = [...state.machines.values()]
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

/**
 * @param {import("./store.js").TimelineState} state
 * @param {import("./types").RecordedEvent} entry
 * @returns {string}
 */
const renderRow = (state, entry) => {
  const open = state.expanded.has(entry.id);
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

/** @param {import("./store.js").TimelineState} state */
const renderTimeline = state => {
  const current = activeKey(state);
  const machine =
    current === undefined ? undefined : state.machines.get(current);
  if (!machine) {
    timeline.innerHTML =
      '<p class="empty">Waiting for events. Open a flow in the app and the machines will show up here.</p>';
    return;
  }

  const filtered = machine.events.filter(entry => matches(state, entry));
  const hidden = Math.max(0, filtered.length - RENDER_WINDOW);
  const visible = hidden > 0 ? filtered.slice(-RENDER_WINDOW) : filtered;
  const droppedCount = state.dropped.get(machine.key) ?? 0;
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
    visible.map(entry => renderRow(state, entry)).join("") +
    `<p class="note">${filtered.length} event(s) for ${escapeHtml(
      machine.label
    )} (${escapeHtml(machine.rootId)})</p>`;
};

export const render = () => {
  dirty = false;
  const state = timelineStore.getState();
  renderTabs(state);
  renderTimeline(state);
};

export const schedule = () => {
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
    setExpanded(id, target.open);
  },
  true
);

window.addEventListener("hashchange", render);

// One subscription for the whole view: every store change repaints.
timelineStore.subscribe(schedule);
