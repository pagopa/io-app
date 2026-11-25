import type { AnyActor } from "xstate";

export type RawSnapshot = Record<string, unknown> | undefined;

// XState inspects new actors before initializing their snapshot.
export const readSnapshot = (actor: AnyActor) =>
  actor.getSnapshot() as RawSnapshot;

export const isStopped = (actor: AnyActor) => {
  const status = readSnapshot(actor)?.status;
  return status !== undefined && status !== "active";
};
