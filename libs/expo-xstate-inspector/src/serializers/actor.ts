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

export const serializeActor = (
  actor: AnyActor,
  startedAt: number
): InspectorMessages["actor"] => {
  const definition = readDefinition(actor);
  return {
    definition: serializeValue(definition),
    id: actor.id,
    input: serializeValue(actor.options.input),
    name: definition?.id ?? actor.id,
    // XState exposes the parent only as `_parent`.
    // eslint-disable-next-line no-underscore-dangle
    parentId: actor._parent?.sessionId,
    sessionId: actor.sessionId,
    snapshot: serializeSnapshot(readSnapshot(actor)),
    // Inline logic has no name, only actors referenced by key do.
    src: typeof actor.src === "string" ? actor.src : undefined,
    startedAt,
    systemId: actor.systemId
  };
};
