import { MAX_EVENTS_PER_ACTOR } from "../constants/limits.js";

const isMachine = actor => Boolean(actor?.definition?.states);

const isSettled = snapshot =>
  snapshot !== undefined && snapshot.status !== "active";

const reducers = {
  actor: (actor, { sessionId: _sessionId, ...details }) => ({
    ...actor,
    ...details
  }),
  snapshot: (actor, { snapshot, timestamp }) => ({
    ...actor,
    snapshot,
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
      const actor = actors.get(payload.sessionId) ?? { events: [] };
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
