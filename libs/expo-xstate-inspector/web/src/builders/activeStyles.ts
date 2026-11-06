import type { StateValue } from "../types/inspector.js";

import { activePaths } from "../utils/stateValue.js";
import { toNodeId } from "./nodeIds.js";

const classLine = (ids: Array<string>, className: string) =>
  ids.length ? [`  class ${ids.join(",")} ${className}`] : [];

/**
 * Highlights the states of an XState snapshot value, and apart from them the
 * `visited` state ids. `compound` holds the ids of states with children.
 */
export const buildActiveStyles = (
  value: StateValue | undefined,
  visited: Iterable<string>,
  compound: ReadonlySet<string>
) => {
  const { leaves, parents } = activePaths(value);
  const active = new Set([...leaves, ...parents].map(toNodeId));
  const past = [...visited].filter(id => !active.has(id));
  return [
    "  classDef visited fill:var(--color-visited-background),stroke:var(--color-visited-border),color:var(--color-text),stroke-width:2px",
    "  classDef visitedParent stroke:var(--color-visited-border),stroke-width:2px",
    "  classDef active fill:var(--color-active-background),stroke:var(--color-active-border),color:var(--color-text),stroke-width:3px",
    "  classDef activeParent stroke:var(--color-active-border),stroke-width:3px",
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
