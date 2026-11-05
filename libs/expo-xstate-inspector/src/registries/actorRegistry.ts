import type { AnyActor } from "xstate";

import type { ActorRegistry } from "../types/registry";

import { isStopped } from "../utils/snapshot";

/** Tracks running actors so they can be replayed to a newly connected page. */
export const createActorRegistry = (): ActorRegistry => {
  const actors = new Set<AnyActor>();
  const pruneStopped = () =>
    actors.forEach(actor => {
      if (isStopped(actor)) {
        actors.delete(actor);
      }
    });
  return {
    forEachRunning: callback => {
      pruneStopped();
      actors.forEach(callback);
    },
    register: actor => {
      pruneStopped();
      actors.add(actor);
    }
  };
};
