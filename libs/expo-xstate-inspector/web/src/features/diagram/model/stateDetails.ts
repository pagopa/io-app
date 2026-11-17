import type {
  ConfigRef,
  GuardConfig,
  InvokeConfig,
  StateNodeConfig
} from "../../../shared/inspector/types";

import { nameOf, toArray } from "./stateNodes";
import { labelledTransitions, type TransitionTrigger } from "./transitionEdges";

type ActorDetails = { id: string | undefined; source: string };
type TransitionDetails = {
  actions: Array<string>;
  guard: string | undefined;
  targets: Array<string>;
};
type TriggerDetails = {
  actorId?: string;
  label: string;
  value?: string;
};

const names = (refs: Array<ConfigRef> | ConfigRef | undefined) =>
  toArray(refs).map(ref => nameOf(ref) || "(anonymous)");

const describeActor = (actor: InvokeConfig): ActorDetails => ({
  id: actor.id,
  source: nameOf(actor.src) || "(inline actor)"
});

const describeGuard = (guard: GuardConfig): string => {
  if (typeof guard === "string") {
    return guard || "(anonymous)";
  }
  const name = nameOf(guard) || "(anonymous)";
  if (Array.isArray(guard.guards)) {
    const conditions = guard.guards.map(describeGuard);
    if (conditions.length <= 1 && !conditions[0]?.includes("\n")) {
      return `${name}(${conditions.join("")})`;
    }
    return `${name}(\n  ${conditions
      .map(condition => condition.replaceAll("\n", "\n  "))
      .join(",\n  ")}\n)`;
  }
  if (guard.stateValue !== undefined) {
    return `${name}(${JSON.stringify(guard.stateValue)})`;
  }
  if (typeof guard.source === "string") {
    return guard.source;
  }
  if (guard.source === null) {
    return name === "(anonymous)" || name === "guard"
      ? "(inline guard; source unavailable)"
      : `${name} (source unavailable)`;
  }
  return guard.params === undefined
    ? name
    : `${name}(${JSON.stringify(guard.params)})`;
};

const describeTrigger = (trigger: TransitionTrigger): TriggerDetails => {
  switch (trigger.kind) {
    case "actorDone":
    case "actorError":
    case "actorSnapshot": {
      const actor = describeActor(trigger.actor);
      return {
        actorId: actor.id,
        label:
          trigger.kind === "actorDone"
            ? "Actor completes"
            : trigger.kind === "actorError"
              ? "Actor fails"
              : "Actor snapshot",
        value: actor.source
      };
    }
    case "after":
      return {
        label: "After",
        value: /^\d+(\.\d+)?$/.test(trigger.delay)
          ? `${trigger.delay} ms`
          : trigger.delay
      };
    case "always":
      return { label: "Automatic" };
    case "event":
      return { label: "Event", value: trigger.name };
    case "stateDone":
      return { label: "State completes" };
  }
};

/** Describes the configured behavior of a state, not its execution history. */
export const describeState = (node: StateNodeConfig) => {
  const initialTarget =
    typeof node.initial === "string" ? node.initial : node.initial?.target;
  const initialActions = names(
    typeof node.initial === "object" ? node.initial.actions : undefined
  );
  return {
    actors: toArray(node.invoke).map(describeActor),
    entryActions: names(node.entry),
    exitActions: names(node.exit),
    initial:
      initialTarget !== undefined || initialActions.length
        ? { actions: initialActions, target: initialTarget }
        : undefined,
    transitions: labelledTransitions(node).flatMap(
      ([, , transitions, trigger]) => {
        const options: Array<TransitionDetails> = toArray(transitions).map(
          transition => {
            const { target, guard, actions } =
              typeof transition === "string"
                ? { target: transition, guard: undefined, actions: undefined }
                : transition;
            return {
              actions: names(actions),
              guard: guard === undefined ? undefined : describeGuard(guard),
              targets: toArray(target)
            };
          }
        );
        return options.length
          ? [{ options, trigger: describeTrigger(trigger) }]
          : [];
      }
    )
  };
};
