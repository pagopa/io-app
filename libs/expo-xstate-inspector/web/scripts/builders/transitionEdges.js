import { nameOf, toArray } from "../utils/stateNodes.js";
import { transitionKey } from "../utils/transitionKeys.js";
import { escapeLabel, toNodeId } from "./nodeIds.js";

// [label, XState event type, transitions]
const labelledTransitions = node => [
  ...Object.entries(node.on ?? {}).map(([type, transitions]) => [
    type,
    type,
    transitions
  ]),
  ...Object.entries(node.after ?? {}).map(([delay, transitions]) => [
    `after ${delay}`,
    `xstate.after.${delay}`,
    transitions
  ]),
  ["always", "", node.always],
  ["onDone", "xstate.done.state", node.onDone],
  ...toArray(node.invoke).flatMap(invoke => [
    [`done ${nameOf(invoke.src) ?? ""}`, "xstate.done.actor", invoke.onDone],
    [`error ${nameOf(invoke.src) ?? ""}`, "xstate.error.actor", invoke.onError]
  ])
];

/** Builds the Mermaid edges leaving the state node at `path`, with their keys. */
export const buildTransitionEdges = (node, path, resolveTarget) =>
  labelledTransitions(node).flatMap(([label, eventType, transitions]) =>
    toArray(transitions).flatMap(transition => {
      const { target, guard } =
        typeof transition === "string" ? { target: transition } : transition;
      const text = escapeLabel(guard ? `${label} [${nameOf(guard)}]` : label);
      return toArray(target)
        .map(targetName => resolveTarget(targetName, path))
        .filter(Boolean)
        .map(to => ({
          key: transitionKey(path, to, eventType),
          line: `  ${toNodeId(path)} --> ${toNodeId(to)} : ${text}`
        }));
    })
  );
