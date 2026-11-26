import type { AnyActor } from "xstate";

import type { ActorRegistry } from "../types/registry";

import { isStopped } from "../utils/snapshot";

/** Tracks running actors so they can be replayed to a newly connected page. */
export const createActorRegistry = (): ActorRegistry => {
  const startTimes = new Map<AnyActor, number>();
  const pruneStopped = () =>
    startTimes.forEach((_, actor) => {
      if (isStopped(actor)) {
        startTimes.delete(actor);
      }
    });
  return {
    forEachRunning: callback => {
      pruneStopped();
      startTimes.forEach((startedAt, actor) => callback(actor, startedAt));
    },
    register: (actor, startedAt) => {
      pruneStopped();
      startTimes.set(actor, startedAt);
    }
  };
};
