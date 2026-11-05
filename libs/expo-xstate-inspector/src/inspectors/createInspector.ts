import type { InspectionEvent } from "xstate";

import type { ActorRegistry } from "../types/registry";
import type { InspectorTransport } from "../types/transport";

import {
  handleActor,
  handleEvent,
  handleSnapshot
} from "../handlers/inspectionHandlers";
import { serializeActor } from "../serializers/actor";

/** Creates an XState `inspect` observer streaming actors to `transport`. */
export const createInspector = (
  transport: InspectorTransport,
  registry: ActorRegistry
) => {
  const dependencies = { registry, transport };
  // The web page asks to replay the running actors whenever it connects.
  transport.onConnected(() =>
    registry.forEachRunning((actor, startedAt) =>
      transport.send("actor", serializeActor(actor, startedAt))
    )
  );
  return (event: InspectionEvent) => {
    switch (event.type) {
      case "@xstate.actor":
        return handleActor(event, dependencies);
      case "@xstate.event":
        return handleEvent(event, dependencies);
      case "@xstate.snapshot":
        return handleSnapshot(event, dependencies);
    }
  };
};
