import { toNodeId } from "../builders/nodeIds.js";
import { MAX_EVENTS_PER_ACTOR } from "../constants/limits.js";
import { activePaths } from "../utils/stateValue.js";
import { transitionKey } from "../utils/transitionKeys.js";

const isMachine = actor => Boolean(actor?.definition?.states);

const isSettled = snapshot =>
  snapshot !== undefined && snapshot.status !== "active";

const withVisited = (visited, value) => {
  const { leaves, parents } = activePaths(value);
  return new Set([...visited, ...[...leaves, ...parents].map(toNodeId)]);
};

const reducers = {
  actor: (actor, { sessionId: _sessionId, ...details }) => ({
    ...actor,
    ...details,
    visited: withVisited(actor.visited, details.snapshot?.value)
  }),
  microstep: (actor, { transitions, value }) => ({
    ...actor,
    taken: new Set([
      ...actor.taken,
      ...transitions.flatMap(({ eventType, source, targets }) =>
        targets.map(target => transitionKey(source, target, eventType))
      )
    ]),
    visited: withVisited(actor.visited, value)
  }),
  snapshot: (actor, { snapshot, timestamp }) => ({
    ...actor,
    snapshot,
    visited: withVisited(actor.visited, snapshot?.value),
    endedAt: actor.endedAt ?? (isSettled(snapshot) ? timestamp : undefined)
  }),
  event: (actor, { event, timestamp }) => ({
    ...actor,
    events: [{ timestamp, event }, ...actor.events].slice(
      0,
      MAX_EVENTS_PER_ACTOR
    )
  })
};

/** Holds the actors reported by the app, keyed by session id. */
export const createActorStore = () => {
  const actors = new Map();
  return {
    /** Applies an app message, returning whether it was understood. */
    apply: (method, payload) => {
      const reduce = reducers[method];
      if (!reduce || !payload?.sessionId) {
        return false;
      }
      const actor = actors.get(payload.sessionId) ?? {
        events: [],
        taken: new Set(),
        visited: new Set()
      };
      actors.set(payload.sessionId, reduce(actor, payload));
      return true;
    },
    get: sessionId => actors.get(sessionId),
    /** Actors invoked or spawned by `parentId`, newest first. */
    childrenOf: parentId =>
      [...actors.entries()]
        .filter(([, actor]) => actor.parentId === parentId)
        .sort(([, a], [, b]) => b.startedAt - a.startedAt),
    isMachine: sessionId => isMachine(actors.get(sessionId)),
    machines: () =>
      [...actors.entries()].filter(([, actor]) => isMachine(actor))
  };
};
