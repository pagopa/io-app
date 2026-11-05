import { activePaths } from "../utils/stateValue.js";
import { toNodeId } from "./nodeIds.js";

const classLine = (ids, className) =>
  ids.length ? [`  class ${ids.join(",")} ${className}`] : [];

/**
 * Highlights the states of an XState snapshot value, and apart from them the
 * `visited` state ids. `compound` holds the ids of states with children.
 */
export const buildActiveStyles = (value, visited, compound) => {
  const { leaves, parents } = activePaths(value);
  const active = new Set([...leaves, ...parents].map(toNodeId));
  const past = [...visited].filter(id => !active.has(id));
  return [
    "  classDef visited fill:#e6f4ff,stroke:#1677ff,stroke-width:2px",
    "  classDef visitedParent stroke:#1677ff,stroke-width:2px",
    "  classDef active fill:#ffe58f,stroke:#d48806,stroke-width:3px",
    "  classDef activeParent stroke:#d48806,stroke-width:3px",
    ...classLine(
      past.filter(id => !compound.has(id)),
      "visited"
    ),
    ...classLine(
      past.filter(id => compound.has(id)),
      "visitedParent"
    ),
    ...classLine(leaves.map(toNodeId), "active"),
    ...classLine(parents.map(toNodeId), "activeParent")
  ];
};
