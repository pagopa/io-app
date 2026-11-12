import type {
  InspectorMessages,
  InspectorMethod,
  SerializedSnapshot
} from "../../../src/types/messages";
import type {
  ActorEntry,
  EventEntry,
  InspectedActor,
  Snapshot,
  StateNodeConfig,
  StateValue
} from "../types/inspector.js";

import { toNodeId } from "../builders/nodeIds.js";
import { MAX_EVENTS_PER_ACTOR } from "../constants/limits.js";
import { activePaths } from "../utils/stateValue.js";
import { transitionKey } from "../utils/transitionKeys.js";

const isMachine = (actor: InspectedActor | undefined) =>
  Boolean(actor?.definition?.states);

const isSettled = (snapshot: Snapshot | undefined) =>
  snapshot !== undefined && snapshot.status !== "active";

const toSnapshot = (snapshot: SerializedSnapshot | undefined) =>
  snapshot as Snapshot | undefined;

const withVisited = (visited: Set<string>, value: StateValue | undefined) => {
  const { leaves, parents } = activePaths(value);
  return new Set([...visited, ...[...leaves, ...parents].map(toNodeId)]);
};

const reducers: {
  [M in InspectorMethod]: (
    actor: InspectedActor,
    payload: InspectorMessages[M]
  ) => InspectedActor;
} = {
  actor: (
    actor,
    { sessionId: _sessionId, definition, snapshot, ...details }
  ) => ({
    ...actor,
    ...details,
    definition: definition as StateNodeConfig | undefined,
    snapshot: toSnapshot(snapshot),
    visited: withVisited(actor.visited, toSnapshot(snapshot)?.value)
  }),
  microstep: (actor, { transitions, value }) => ({
    ...actor,
    taken: new Set([
      ...actor.taken,
      ...transitions.flatMap(({ eventType, source, targets }) =>
        targets.map(target => transitionKey(source, target, eventType))
      )
    ]),
    visited: withVisited(actor.visited, value as StateValue | undefined)
  }),
  snapshot: (actor, { snapshot, timestamp }) => ({
    ...actor,
    snapshot: toSnapshot(snapshot),
    visited: withVisited(actor.visited, toSnapshot(snapshot)?.value),
    endedAt:
      actor.endedAt ?? (isSettled(toSnapshot(snapshot)) ? timestamp : undefined)
  }),
  event: (actor, { event, timestamp }) => ({
    ...actor,
    events: [
      { timestamp, event: event as EventEntry["event"] },
      ...actor.events
    ].slice(0, MAX_EVENTS_PER_ACTOR)
  })
};

const isMethod = (method: string): method is InspectorMethod =>
  Object.hasOwn(reducers, method);

const hasSessionId = (payload: unknown): payload is { sessionId: string } =>
  typeof payload === "object" &&
  payload !== null &&
  "sessionId" in payload &&
  Boolean(payload.sessionId);

export type ActorStore = ReturnType<typeof createActorStore>;

/** Holds the actors reported by the app, keyed by session id. */
export const createActorStore = () => {
  const actors = new Map<string, InspectedActor>();
  return {
    /** Applies an app message, returning whether it was understood. */
    apply: (
      method: string,
      payload: unknown
    ): payload is { sessionId: string } => {
      if (!isMethod(method) || !hasSessionId(payload)) {
        return false;
      }
      const reduce = reducers[method] as (
        actor: InspectedActor,
        payload: unknown
      ) => InspectedActor;
      const actor = actors.get(payload.sessionId) ?? {
        events: [],
        taken: new Set(),
        visited: new Set()
      };
      actors.set(payload.sessionId, reduce(actor, payload));
      return true;
    },
    get: (sessionId: string | undefined) =>
      sessionId === undefined ? undefined : actors.get(sessionId),
    /** Actors invoked or spawned by `parentId`, newest first. */
    childrenOf: (parentId: string | undefined): Array<ActorEntry> =>
      [...actors.entries()]
        .filter(([, actor]) => actor.parentId === parentId)
        .sort(([, a], [, b]) => (b.startedAt ?? 0) - (a.startedAt ?? 0)),
    isMachine: (sessionId: string) => isMachine(actors.get(sessionId)),
    machines: (): Array<ActorEntry> =>
      [...actors.entries()].filter(([, actor]) => isMachine(actor))
  };
};
