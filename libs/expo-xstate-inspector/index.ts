import type { AnyActor, InspectionEvent } from "xstate";

import { getDevToolsPluginClientAsync } from "expo/devtools";

const PLUGIN = "expo-xstate-inspector";

const actors = new Set<AnyActor>();

const client = __DEV__
  ? getDevToolsPluginClientAsync(PLUGIN).catch(() => undefined)
  : Promise.resolve(undefined);

// Functions become `{ type: name }`, as in XState configs, and actor refs their session id.
const serialize = (
  value: unknown,
  ancestors: ReadonlyArray<object> = []
): unknown => {
  if (typeof value === "function") {
    return { type: value.name };
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }
  if ("sessionId" in value && "send" in value) {
    return { actor: value.sessionId };
  }
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if ("toJSON" in value && typeof value.toJSON === "function") {
    return value.toJSON();
  }
  if (ancestors.includes(value)) {
    return "[Circular]";
  }
  const path = [...ancestors, value];
  return Array.isArray(value)
    ? value.map(item => serialize(item, path))
    : Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, serialize(item, path)])
      );
};

// XState inspects new actors before initializing their snapshot.
const getSnapshot = (actor: AnyActor) =>
  actor.getSnapshot() as Record<string, unknown> | undefined;

const serializeSnapshot = (snapshot: Record<string, unknown> | undefined) =>
  snapshot === undefined
    ? undefined
    : serialize({
        context: snapshot.context,
        status: snapshot.status,
        value: snapshot.value
      });

const send = (method: string, payload: unknown) =>
  void client.then(instance => {
    if (instance?.isConnected() === true) {
      instance.sendMessage(method, payload);
    }
  });

const sendActor = (actor: AnyActor) => {
  const config: unknown = actor.logic.config;
  const definition =
    typeof config === "object" && config !== null
      ? (config as { id?: string })
      : undefined;
  send("actor", {
    definition: serialize(definition),
    name: definition?.id ?? actor.id,
    sessionId: actor.sessionId,
    snapshot: serializeSnapshot(getSnapshot(actor))
  });
};

const pruneStoppedActors = () =>
  actors.forEach(actor => {
    const status = getSnapshot(actor)?.status;
    if (status !== undefined && status !== "active") {
      actors.delete(actor);
    }
  });

// The web page asks to replay the running actors whenever it connects.
void client.then(instance =>
  instance?.addMessageListener("connected", () => {
    pruneStoppedActors();
    actors.forEach(sendActor);
  })
);

const observe = (event: InspectionEvent) => {
  const { sessionId } = event.actorRef;
  switch (event.type) {
    case "@xstate.actor": {
      // Inspection events always carry actor instances.
      const actor = event.actorRef as AnyActor;
      pruneStoppedActors();
      actors.add(actor);
      return sendActor(actor);
    }
    case "@xstate.event":
      return send("event", { event: serialize(event.event), sessionId });
    case "@xstate.snapshot":
      return send("snapshot", {
        sessionId,
        snapshot: serializeSnapshot(
          event.snapshot as Record<string, unknown> | undefined
        )
      });
  }
};

/**
 * XState `inspect` option streaming actors to this Expo dev tools plugin.
 * Undefined in production.
 */
export const inspect = __DEV__ ? observe : undefined;
