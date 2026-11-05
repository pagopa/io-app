import { toNodeId } from "./nodeIds.js";

const collectActivePaths = (value, path = []) =>
  typeof value === "string"
    ? { leaves: [[...path, value]], parents: [] }
    : Object.entries(value ?? {}).reduce(
        (result, [key, child]) => {
          const nested = collectActivePaths(child, [...path, key]);
          return {
            leaves: [...result.leaves, ...nested.leaves],
            parents: [...result.parents, [...path, key], ...nested.parents]
          };
        },
        { leaves: [], parents: [] }
      );

const classLine = (paths, className) =>
  paths.length ? [`  class ${paths.map(toNodeId).join(",")} ${className}`] : [];

/** Highlights the states of an XState snapshot value. */
export const buildActiveStyles = value => {
  const { leaves, parents } = collectActivePaths(value);
  return [
    "  classDef active fill:#ffe58f,stroke:#d48806,stroke-width:3px",
    "  classDef activeParent stroke:#d48806,stroke-width:3px",
    ...classLine(leaves, "active"),
    ...classLine(parents, "activeParent")
  ];
};
