import { createStore, type StateCreator } from "zustand/vanilla";

/**
 * Timeline state: one tab per machine, the retention counters, the filter and
 * the expanded rows. This module owns the tab bookkeeping — adoption, orphan
 * cleanup, retention — and every mutation goes through an action here.
 *
 * A tab and its event array are mutated in place, and `ingest` publishes an
 * empty update afterwards so React repaints: copying a tab with 20000 retained
 * events on every ingested event would allocate far more than the render the
 * copy exists to trigger.
 */
import type { MachineTimeline, TimelineState } from "../types";

import { MAX_EVENTS, MAX_RETAINED_BYTES } from "../constants";
import { toEntry } from "../lib/entry";
import { asRecord, asString, keyOf, stateLabel } from "../lib/format";

/**
 * Root actor session id (wire `rootId`) to the tab that owns it, so every event
 * of an actor lands in the tab its registration adopted.
 */
const roots = new Map<string, string>();

/**
 * Machine id to its tab, so a machine disposed and set up again overrides its
 * previous tab instead of opening a second one.
 */
const labels = new Map<string, string>();

/** Whether a tab holds more events than either cap allows. */
const overCap = (count: number, bytes: number): boolean =>
  count > MAX_EVENTS || (bytes > MAX_RETAINED_BYTES && count > 1);

/** The tab for a root actor, created on first sight. */
const machineFor = (
  machines: Map<string, MachineTimeline>,
  rootId: string
): MachineTimeline => {
  const key = roots.get(rootId) ?? rootId;
  const existing = machines.get(key);
  if (existing !== undefined) {
    return existing;
  }
  const created: MachineTimeline = {
    key,
    label: key,
    rootId,
    events: [],
    bytes: 0
  };
  machines.set(key, created);
  roots.set(rootId, key);
  return created;
};

const createTimelineState: StateCreator<TimelineState> = (set, get) => ({
  machines: new Map(),
  dropped: new Map(),
  expanded: new Set(),
  filter: "",
  version: 0,

  ingest: (raw, size) => {
    const { machines, dropped } = get();
    const event = asRecord(raw) ?? {};
    const type = asString(event.type);
    const root = keyOf(asString(event.rootId));
    const registration =
      type === "@xstate.actor" && asString(event.parentId) === undefined
        ? asString(event.name)
        : undefined;

    // A machine that was disposed and set up again registers with the same
    // machine id but a new session id. Take over its previous tab: the new
    // instance replaces the timeline rather than opening a second tab.
    const adoptedKey =
      registration === undefined ? undefined : labels.get(registration);
    const adopted =
      adoptedKey === undefined ? undefined : machines.get(adoptedKey);
    const machine = adopted ?? machineFor(machines, root);
    if (adopted !== undefined) {
      // A child actor can register before its root does, which opens a tab
      // keyed by the new session id. Adoption supersedes it.
      const orphan = roots.get(root);
      if (orphan !== undefined && orphan !== adopted.key) {
        machines.delete(orphan);
        dropped.delete(orphan);
      }
      if (adopted.rootId !== root) {
        adopted.rootId = root;
        adopted.events = [];
        adopted.bytes = 0;
        adopted.lastValue = undefined;
        dropped.delete(adopted.key);
      }
    } else if (registration !== undefined) {
      machine.label = registration;
      labels.set(registration, machine.key);
    }
    roots.set(root, machine.key);

    const snapshot = asRecord(event.snapshot);
    const entry = toEntry(raw, size, machine.lastValue);
    if (type === "@xstate.snapshot" && snapshot !== undefined) {
      machine.lastValue = stateLabel(snapshot.value);
    }

    machine.events.push(entry);
    machine.bytes += size;
    const retained = machine.events.length;
    while (overCap(machine.events.length, machine.bytes)) {
      const oldest = machine.events.shift();
      if (oldest === undefined) {
        break;
      }
      machine.bytes -= oldest.size;
    }
    const evicted = retained - machine.events.length;
    if (evicted > 0) {
      dropped.set(machine.key, (dropped.get(machine.key) ?? 0) + evicted);
    }

    // The tab was mutated in place, so no field of the state changed: publish an
    // empty update, which is what makes React repaint.
    set({});
  },

  clear: () => {
    roots.clear();
    labels.clear();
    set({
      machines: new Map(),
      dropped: new Map(),
      expanded: new Set()
    });
  },

  setFilter: value => {
    set({ filter: value });
  },

  /**
   * Records the open state of one row. The element can re-fire its own toggle,
   * so an unchanged row must not write state: that write would render again and
   * re-fire the same event.
   */
  setExpanded: (id, open) => {
    const { expanded } = get();
    const changed = open ? !expanded.has(id) : expanded.has(id);
    if (!changed) {
      return;
    }
    const next = new Set(expanded);
    if (open) {
      next.add(id);
    } else {
      next.delete(id);
    }
    set({ expanded: next });
  }
});

export const timelineStore = createStore<TimelineState>()(createTimelineState);

const actions = timelineStore.getState();

/** Appends one wire event to the timeline. */
export const ingest = actions.ingest;

/** Drops every machine, counter and expanded row. */
export const clear = actions.clear;

/** Filters the timeline by type, state or payload text. */
export const setFilter = actions.setFilter;

/** Opens or closes the detail of one row. */
export const setExpanded = actions.setExpanded;
