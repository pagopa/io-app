import { buildJsonTree } from "../builders/jsonNode.js";
import { createCell } from "../utils/dom.js";
import { formatTime } from "../utils/time.js";

/** Shows the events received by the selected machine, newest first. */
export const createEventTableView = container => {
  // Entries are kept by the store, so open payload nodes survive re-renders.
  const expandedByEntry = new WeakMap();
  const expandedOf = entry => {
    if (!expandedByEntry.has(entry)) {
      expandedByEntry.set(entry, new Set());
    }
    return expandedByEntry.get(entry);
  };
  const createRow = entry => {
    const { type, ...payload } = entry.event;
    const row = document.createElement("tr");
    row.append(
      createCell(formatTime(entry.timestamp)),
      createCell(type),
      createCell(buildJsonTree(payload, expandedOf(entry)))
    );
    return row;
  };
  return {
    render: events => container.replaceChildren(...events.map(createRow))
  };
};
