import type { AnyActor } from "xstate";

export type ActorRegistry = {
  forEachRunning: (
    callback: (actor: AnyActor, startedAt: number) => void
  ) => void;
  register: (actor: AnyActor, startedAt: number) => void;
};
