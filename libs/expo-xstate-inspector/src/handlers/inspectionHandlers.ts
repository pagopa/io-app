import type {
  AnyActor,
  InspectedActorEvent,
  InspectedEventEvent,
  InspectedSnapshotEvent
} from "xstate";

import type { ActorRegistry } from "../types/registry";
import type { InspectorTransport } from "../types/transport";
import type { RawSnapshot } from "../utils/snapshot";

import { serializeActor } from "../serializers/actor";
import { serializeSnapshot } from "../serializers/snapshot";
import { serializeValue } from "../serializers/value";

type Dependencies = {
  registry: ActorRegistry;
  transport: InspectorTransport;
};

export const handleActor = (
  event: InspectedActorEvent,
  { registry, transport }: Dependencies
) => {
  // Inspection events always carry actor instances.
  const actor = event.actorRef as AnyActor;
  registry.register(actor);
  transport.send("actor", serializeActor(actor));
};

export const handleEvent = (
  event: InspectedEventEvent,
  { transport }: Dependencies
) =>
  transport.send("event", {
    event: serializeValue(event.event),
    sessionId: event.actorRef.sessionId
  });

export const handleSnapshot = (
  event: InspectedSnapshotEvent,
  { transport }: Dependencies
) =>
  transport.send("snapshot", {
    sessionId: event.actorRef.sessionId,
    snapshot: serializeSnapshot(event.snapshot as RawSnapshot)
  });
