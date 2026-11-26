import type {
  InvokeConfig,
  StateNodeConfig,
  TransitionsConfig
} from "../../../shared/inspector/types";
import type { TargetResolver } from "./targetResolver";

import { escapeLabel, toNodeId } from "../../../shared/inspector/nodeIds";
import { transitionKey } from "../../../shared/inspector/transitionKeys";
import { nameOf, toArray } from "./stateNodes";

export type TransitionTrigger =
  | {
      actor: InvokeConfig;
      kind: "actorDone" | "actorError" | "actorSnapshot";
    }
  | { delay: string; kind: "after" }
  | { kind: "always" }
  | { kind: "event"; name: string }
  | { kind: "stateDone" };

type LabelledTransitions = [
  label: string,
  eventType: string,
  transitions: TransitionsConfig,
  trigger: TransitionTrigger
];

export const labelledTransitions = (
  node: StateNodeConfig
): Array<LabelledTransitions> => [
  ...Object.entries(node.on ?? {}).map(
    ([type, transitions]): LabelledTransitions => [
      type,
      type,
      transitions,
      { kind: "event", name: type }
    ]
  ),
  ...Object.entries(node.after ?? {}).map(
    ([delay, transitions]): LabelledTransitions => [
      `after ${delay}`,
      `xstate.after.${delay}`,
      transitions,
      { kind: "after", delay }
    ]
  ),
  ["always", "", node.always, { kind: "always" }],
  ["onDone", "xstate.done.state", node.onDone, { kind: "stateDone" }],
  ...toArray(node.invoke).flatMap((invoke): Array<LabelledTransitions> => [
    [
      `done ${nameOf(invoke.src) ?? ""}`,
      "xstate.done.actor",
      invoke.onDone,
      { actor: invoke, kind: "actorDone" }
    ],
    [
      `error ${nameOf(invoke.src) ?? ""}`,
      "xstate.error.actor",
      invoke.onError,
      { actor: invoke, kind: "actorError" }
    ],
    [
      `snapshot ${nameOf(invoke.src) ?? ""}`,
      "xstate.snapshot",
      invoke.onSnapshot,
      { actor: invoke, kind: "actorSnapshot" }
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
