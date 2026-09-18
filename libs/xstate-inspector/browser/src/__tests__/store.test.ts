/**
 * The store owns the tab bookkeeping — adoption, orphan cleanup, retention —
 * which the DOM is not needed to exercise.
 */
import { MAX_EVENTS } from "../constants.js";
import {
  clear,
  ingest,
  setExpanded,
  setFilter,
  timelineStore
} from "../store.js";

type Wire = Record<string, unknown>;

const wire = (
  id: string,
  rootId: string,
  extra: Record<string, unknown>
): Wire => ({
  _version: "1.0.0",
  createdAt: "2026-01-01T00:00:00.000Z",
  id,
  sessionId: "session",
  rootId,
  ...extra
});

const actor = (
  id: string,
  rootId: string,
  name: string,
  extra: Record<string, unknown> = {}
): Wire =>
  wire(id, rootId, {
    type: "@xstate.actor",
    name,
    snapshot: { status: "active", value: "idle" },
    ...extra
  });

const snapshot = (id: string, rootId: string, event: string): Wire =>
  wire(id, rootId, {
    type: "@xstate.snapshot",
    event: { type: event },
    snapshot: { status: "active", value: event.toLowerCase() }
  });

const feed = (events: Array<Wire>): void =>
  events.forEach(event => ingest(event, JSON.stringify(event).length));

const tabs = () =>
  [...timelineStore.getState().machines.values()].map(machine => ({
    key: machine.key,
    label: machine.label,
    rootId: machine.rootId,
    events: machine.events.length
  }));

beforeEach(() => {
  clear();
  setFilter("");
});

describe("timeline store", () => {
  it("opens one tab per machine, labelled by machine id", () => {
    feed([
      actor("a1", "rootA", "eidMachine"),
      snapshot("a2", "rootA", "START"),
      actor("b1", "rootB", "onboardingMachine")
    ]);

    expect(tabs()).toEqual([
      { key: "rootA", label: "eidMachine", rootId: "rootA", events: 2 },
      { key: "rootB", label: "onboardingMachine", rootId: "rootB", events: 1 }
    ]);
  });

  it("keeps every actor session of one machine in the same tab", () => {
    feed([
      actor("a1", "rootA", "eidMachine"),
      actor("a2", "rootA", "eidMachine", { parentId: "rootA" })
    ]);

    expect(tabs()).toEqual([
      { key: "rootA", label: "eidMachine", rootId: "rootA", events: 2 }
    ]);
  });

  it("takes over the tab when the same machine id is set up again", () => {
    feed([
      actor("a1", "firstSession", "eidMachine"),
      snapshot("a2", "firstSession", "START"),
      actor("a3", "secondSession", "eidMachine"),
      snapshot("a4", "secondSession", "START")
    ]);

    expect(tabs()).toEqual([
      {
        key: "firstSession",
        label: "eidMachine",
        rootId: "secondSession",
        events: 2
      }
    ]);
  });

  it("merges a child that registered before its root into the root tab", () => {
    feed([
      actor("a1", "rootSession", "eidMachine", { parentId: "unknownParent" }),
      actor("a2", "rootSession", "eidMachine")
    ]);

    expect(tabs()).toEqual([
      {
        key: "rootSession",
        label: "eidMachine",
        rootId: "rootSession",
        events: 2
      }
    ]);
  });

  it("drops the orphan tab when a root takes over a machine id", () => {
    feed([
      actor("a1", "firstSession", "eidMachine"),
      actor("a2", "secondSession", "someChild", { parentId: "unknownParent" }),
      actor("a3", "secondSession", "eidMachine")
    ]);

    expect(tabs()).toEqual([
      {
        key: "firstSession",
        label: "eidMachine",
        rootId: "secondSession",
        events: 1
      }
    ]);
  });

  it("evicts the oldest events past the cap and counts them", () => {
    const events = Array.from({ length: MAX_EVENTS + 2 }, (_, index) =>
      snapshot(`z${index}`, "rootA", "TICK")
    );
    feed(events);

    const machine = timelineStore.getState().machines.get("rootA");
    expect(machine?.events.length).toBe(MAX_EVENTS);
    expect(machine?.events[0].id).toBe("z2");
    expect(timelineStore.getState().dropped.get("rootA")).toBe(2);
  });

  it("ignores an expand toggle that does not change the row", () => {
    const before = timelineStore.getState().expanded;

    setExpanded("row", false);

    expect(timelineStore.getState().expanded).toBe(before);

    setExpanded("row", true);
    expect([...timelineStore.getState().expanded]).toEqual(["row"]);

    setExpanded("row", true);
    expect([...timelineStore.getState().expanded]).toEqual(["row"]);

    setExpanded("row", false);
    expect([...timelineStore.getState().expanded]).toEqual([]);
  });

  it("clears the timeline, the counters and the expanded rows", () => {
    feed([
      actor("a1", "rootA", "eidMachine"),
      snapshot("a2", "rootA", "START")
    ]);
    setExpanded("a2", true);

    clear();

    expect(timelineStore.getState().machines.size).toBe(0);
    expect(timelineStore.getState().dropped.size).toBe(0);
    expect(timelineStore.getState().expanded.size).toBe(0);
  });
});
