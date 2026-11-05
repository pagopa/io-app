import { nameOf, toArray } from "../utils/stateNodes.js";
import { escapeLabel, toNodeId } from "./nodeIds.js";

const labelledTransitions = node => [
  ...Object.entries(node.on ?? {}),
  ...Object.entries(node.after ?? {}).map(([delay, transitions]) => [
    `after ${delay}`,
    transitions
  ]),
  ["always", node.always],
  ["onDone", node.onDone],
  ...toArray(node.invoke).flatMap(invoke => [
    [`done ${nameOf(invoke.src) ?? ""}`, invoke.onDone],
    [`error ${nameOf(invoke.src) ?? ""}`, invoke.onError]
  ])
];

/** Builds the Mermaid edges leaving the state node at `path`. */
export const buildTransitionEdges = (node, path, resolveTarget) =>
  labelledTransitions(node).flatMap(([label, transitions]) =>
    toArray(transitions).flatMap(transition => {
      const { target, guard } =
        typeof transition === "string" ? { target: transition } : transition;
      const text = escapeLabel(guard ? `${label} [${nameOf(guard)}]` : label);
      return toArray(target)
        .map(targetName => resolveTarget(targetName, path))
        .filter(Boolean)
        .map(to => `  ${toNodeId(path)} --> ${toNodeId(to)} : ${text}`);
    })
  );
