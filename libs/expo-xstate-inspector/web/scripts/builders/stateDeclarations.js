import { nameOf } from "../utils/stateNodes.js";
import { escapeLabel, toNodeId } from "./nodeIds.js";

const initialPath = (node, path) => {
  const initial = nameOf(node.initial) ?? node.initial?.target;
  return initial && node.type !== "parallel"
    ? [...path, ...initial.split(".")]
    : undefined;
};

/** Builds the nested Mermaid state declarations below `node`. */
export const buildStateDeclarations = (node, path = [], indent = "  ") => {
  const children = Object.entries(node.states ?? {}).flatMap(
    ([key, child], index) => {
      const childPath = [...path, key];
      const id = toNodeId(childPath);
      return [
        ...(node.type === "parallel" && index > 0 ? [`${indent}--`] : []),
        `${indent}state "${escapeLabel(key)}" as ${id}`,
        ...(child.states
          ? [
              `${indent}state ${id} {`,
              ...buildStateDeclarations(child, childPath, `${indent}  `),
              `${indent}}`
            ]
          : []),
        ...(child.type === "final" ? [`${indent}${id} --> [*]`] : [])
      ];
    }
  );
  const initial = initialPath(node, path);
  return initial
    ? [`${indent}[*] --> ${toNodeId(initial)}`, ...children]
    : children;
};
