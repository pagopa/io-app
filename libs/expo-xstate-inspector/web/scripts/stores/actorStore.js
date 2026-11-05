import { MAX_EVENTS_PER_ACTOR } from "../constants/limits.js";

const isMachine = actor => Boolean(actor?.definition?.states);

const reducers = {
  actor: (actor, { name, definition, snapshot }) => ({
    ...actor,
    name,
    definition,
    snapshot
  }),
  snapshot: (actor, { snapshot }) => ({ ...actor, snapshot }),
  event: (actor, { event }) => ({
    ...actor,
    events: [
      { time: new Date().toLocaleTimeString(), event },
      ...actor.events
    ].slice(0, MAX_EVENTS_PER_ACTOR)
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
    isMachine: sessionId => isMachine(actors.get(sessionId)),
    machines: () =>
      [...actors.entries()].filter(([, actor]) => isMachine(actor))
  };
};
