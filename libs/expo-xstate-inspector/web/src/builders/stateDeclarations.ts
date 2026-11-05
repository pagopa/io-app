import type { StateNodeConfig } from "../types/inspector.js";

import { escapeLabel, toNodeId } from "./nodeIds.js";

const initialPath = (node: StateNodeConfig, path: Array<string>) => {
  const initial =
    typeof node.initial === "string" ? node.initial : node.initial?.target;
  return initial && node.type !== "parallel"
    ? [...path, ...initial.split(".")]
    : undefined;
};

/** Builds the nested Mermaid state declarations below `node`. */
export const buildStateDeclarations = (
  node: StateNodeConfig,
  path: Array<string> = [],
  indent = "  "
): Array<string> => {
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
