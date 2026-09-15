/**
 * XState inspector UI entry point.
 *
 * Wires the toolbar, the export and clear actions and the SSE stream to the
 * store; the timeline itself lives in `view.js` and repaints on its own.
 *
 * The stream carries no history, so a reload starts from an empty timeline.
 */
import { clear, ingest, setFilter, timelineStore } from "./store.js";
import { render } from "./view.js";

const connectionStatus = /** @type {HTMLElement} */ (
  document.getElementById("status")
);
const filterInput = /** @type {HTMLInputElement} */ (
  document.getElementById("filter")
);

const download = () => {
  const { machines, dropped } = timelineStore.getState();
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

filterInput.addEventListener("input", () => {
  setFilter(filterInput.value.trim().toLowerCase());
});

/** @type {HTMLElement | null} */
const exportButton = document.getElementById("export");
exportButton?.addEventListener("click", download);

/** @type {HTMLElement | null} */
const clearButton = document.getElementById("clear");
clearButton?.addEventListener("click", clear);

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
