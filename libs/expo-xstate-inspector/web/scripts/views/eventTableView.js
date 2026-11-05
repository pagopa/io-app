import { buildJsonNode } from "../builders/jsonNode.js";

const createCell = (...children) => {
  const cell = document.createElement("td");
  cell.append(...children);
  return cell;
};

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
    const tree = document.createElement("div");
    tree.className = "json-tree";
    tree.append(buildJsonNode(undefined, payload, [], expandedOf(entry)));
    const row = document.createElement("tr");
    row.append(createCell(entry.time), createCell(type), createCell(tree));
    return row;
  };
  return {
    render: events => container.replaceChildren(...events.map(createRow))
  };
};
