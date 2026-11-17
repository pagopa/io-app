import type { EventEntry } from "../types/inspector";

import { buildJsonTree } from "../builders/jsonNode";
import { createCell } from "../utils/dom";
import { formatTime } from "../utils/time";

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
