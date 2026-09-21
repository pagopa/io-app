/**
 * The export is the artifact a developer attaches to a bug report, so its shape
 * is a contract: one block per machine, holding the raw wire events.
 */
import { clear, ingest, timelineStore } from "../../state/timeline";
import { buildExport } from "../export";

type Wire = Record<string, unknown>;

const wire = (id: string, extra: Record<string, unknown>): Wire => ({
  _version: "1.0.0",
  createdAt: "2026-01-01T00:00:00.000Z",
  id,
  sessionId: "session",
  rootId: "sessionA",
  ...extra
});

const actor = wire("e1", {
  type: "@xstate.actor",
  name: "eidMachine",
  snapshot: { status: "active", value: "idle" }
});

const event = wire("e2", {
  type: "@xstate.event",
  event: { type: "START", docId: "ABC123" }
});

it("exports runtime metadata and the raw events of every machine", () => {
  clear();
  [actor, event].forEach(entry => ingest(entry, JSON.stringify(entry).length));

  const { machines, dropped } = timelineStore.getState();
  const payload = buildExport(
    machines,
    dropped,
    { id: "runtime", appVersion: "1.0.0", platform: "ios" },
    new Date("2026-02-02T10:00:00.000Z")
  );

  expect(payload).toEqual({
    droppedEvents: 0,
    exportedAt: "2026-02-02T10:00:00.000Z",
    runtime: { id: "runtime", appVersion: "1.0.0", platform: "ios" },
    machines: [
      {
        key: "sessionA",
        label: "eidMachine",
        rootId: "sessionA",
        events: [actor, event]
      }
    ]
  });
});
