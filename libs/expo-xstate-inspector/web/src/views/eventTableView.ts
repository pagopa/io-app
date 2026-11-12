import type { EventEntry } from "../types/inspector.js";

import { buildJsonTree } from "../builders/jsonNode.js";
import { createCell } from "../utils/dom.js";
import { formatTime } from "../utils/time.js";

/** Shows the events received by the selected machine, newest first. */
export const createEventTableView = (container: Element) => {
  // Entries are kept by the store, so open payload nodes survive re-renders.
  const expandedByEntry = new WeakMap<EventEntry, Set<string>>();
  const expandedOf = (entry: EventEntry) => {
    const expanded = expandedByEntry.get(entry) ?? new Set<string>();
    expandedByEntry.set(entry, expanded);
    return expanded;
  };
  const createRow = (entry: EventEntry) => {
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
    render: (events: Array<EventEntry>) =>
      container.replaceChildren(...events.map(createRow))
  };
};
