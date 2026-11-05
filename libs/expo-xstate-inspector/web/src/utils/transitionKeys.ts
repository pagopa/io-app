import { toNodeId } from "../builders/nodeIds.js";

// The app reports these with generated ids, e.g. `xstate.done.actor.<id>`,
// which the machine config does not know.
const GENERATED_EVENT_TYPES = [
  "xstate.done.actor",
  "xstate.done.state",
  "xstate.error.actor"
];

const toTrigger = (eventType: string) =>
  eventType.startsWith("xstate.after.")
    ? eventType.split(".").slice(0, 3).join(".")
    : (GENERATED_EVENT_TYPES.find(type => eventType.startsWith(`${type}.`)) ??
      eventType);

/**
 * Identifies a transition by its states and trigger, so the transitions taken
 * at runtime match the edges drawn from the machine config.
 */
export const transitionKey = (
  sourcePath: ReadonlyArray<string>,
  targetPath: ReadonlyArray<string>,
  eventType: string
) => `${toNodeId(sourcePath)}>${toNodeId(targetPath)}>${toTrigger(eventType)}`;
