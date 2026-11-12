import type { StateNodeConfig, TransitionsConfig } from "../types/inspector.js";
import type { TargetResolver } from "./targetResolver.js";

import { nameOf, toArray } from "../utils/stateNodes.js";
import { transitionKey } from "../utils/transitionKeys.js";
import { escapeLabel, toNodeId } from "./nodeIds.js";

type LabelledTransitions = [
  label: string,
  eventType: string,
  transitions: TransitionsConfig
];

export const labelledTransitions = (
  node: StateNodeConfig
): Array<LabelledTransitions> => [
  ...Object.entries(node.on ?? {}).map(
    ([type, transitions]): LabelledTransitions => [type, type, transitions]
  ),
  ...Object.entries(node.after ?? {}).map(
    ([delay, transitions]): LabelledTransitions => [
      `after ${delay}`,
      `xstate.after.${delay}`,
      transitions
    ]
  ),
  ["always", "", node.always],
  ["onDone", "xstate.done.state", node.onDone],
  ...toArray(node.invoke).flatMap((invoke): Array<LabelledTransitions> => [
    [`done ${nameOf(invoke.src) ?? ""}`, "xstate.done.actor", invoke.onDone],
    [`error ${nameOf(invoke.src) ?? ""}`, "xstate.error.actor", invoke.onError],
    [
      `snapshot ${nameOf(invoke.src) ?? ""}`,
      "xstate.snapshot",
      invoke.onSnapshot
    ]
  ])
];

/** Builds the Mermaid edges leaving the state node at `path`, with their keys. */
export const buildTransitionEdges = (
  node: StateNodeConfig,
  path: Array<string>,
  resolveTarget: TargetResolver
) =>
  labelledTransitions(node).flatMap(([label, eventType, transitions]) =>
    toArray(transitions).flatMap(transition => {
      const { target, guard } =
        typeof transition === "string"
          ? { target: transition, guard: undefined }
          : transition;
      const text = escapeLabel(guard ? `${label} [${nameOf(guard)}]` : label);
      return toArray(target)
        .map(targetName => resolveTarget(targetName, path))
        .filter(to => to !== undefined)
        .map(to => ({
          key: transitionKey(path, to, eventType),
          line: `  ${toNodeId(path)} --> ${toNodeId(to)} : ${text}`
        }));
    })
  );
