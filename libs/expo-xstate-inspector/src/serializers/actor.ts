import type { AnyActor } from "xstate";

import type { InspectorMessages } from "../types/messages";

import { readSnapshot } from "../utils/snapshot";
import { serializeSnapshot } from "./snapshot";
import { serializeValue } from "./value";

const readDefinition = (actor: AnyActor) => {
  const config: unknown = actor.logic.config;
  return typeof config === "object" && config !== null
    ? (config as { id?: string })
    : undefined;
};

export const serializeActor = (actor: AnyActor): InspectorMessages["actor"] => {
  const definition = readDefinition(actor);
  return {
    definition: serializeValue(definition),
    name: definition?.id ?? actor.id,
    sessionId: actor.sessionId,
    snapshot: serializeSnapshot(readSnapshot(actor))
  };
};
