import type { AnyActor } from "xstate";

export type ActorRegistry = {
  forEachRunning: (callback: (actor: AnyActor) => void) => void;
  register: (actor: AnyActor) => void;
};
