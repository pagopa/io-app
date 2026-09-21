import { createStore, type StateCreator } from "zustand/vanilla";

import type {
  ActorNode,
  InspectorRuntime,
  MachineTimeline,
  TimelineState
} from "../types";

import { MAX_EVENTS, MAX_RETAINED_BYTES } from "../constants";
import { toEntry } from "../lib/entry";
import { asRecord, asString, keyOf, stateLabel } from "../lib/format";

const roots = new Map<string, string>();
const labels = new Map<string, string>();
let order: Array<{ id: string; key: string; size: number }> = [];
let retainedBytes = 0;

const resetBookkeeping = () => {
  roots.clear();
  labels.clear();
  order = [];
  retainedBytes = 0;
};

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
    actors: new Map(),
    bytes: 0,
    events: [],
    key,
    label: key,
    rootId
  };
  machines.set(key, created);
  roots.set(rootId, key);
  return created;
};

const discardMachineHistory = (machine: MachineTimeline) => {
  retainedBytes -= machine.bytes;
  order = order.filter(item => item.key !== machine.key);
  machine.actors.clear();
  machine.bytes = 0;
  machine.events.splice(0, machine.events.length);
  machine.lastValue = undefined;
};

const evictOldest = (
  machines: Map<string, MachineTimeline>,
  count: number
): number => {
  let evicted = 0;
  while (order.length > count || retainedBytes > MAX_RETAINED_BYTES) {
    const oldest = order.shift();
    if (oldest === undefined) {
      break;
    }
    const machine = machines.get(oldest.key);
    const index =
      machine?.events.findIndex(event => event.id === oldest.id) ?? -1;
    if (machine !== undefined && index >= 0) {
      machine.events.splice(index, 1);
      machine.bytes -= oldest.size;
      retainedBytes -= oldest.size;
      evicted += 1;
    }
  }
  return evicted;
};

const actorFrom = (event: Record<string, unknown>): ActorNode | undefined => {
  const id = asString(event.sessionId);
  if (id === undefined) {
    return undefined;
  }
  const snapshot = asRecord(event.snapshot) ?? {};
  return {
    id,
    name: asString(event.name) ?? id,
    parentId: asString(event.parentId),
    status: asString(snapshot.status) ?? "unknown",
    state: snapshot.value === undefined ? undefined : stateLabel(snapshot.value)
  };
};

const createTimelineState: StateCreator<TimelineState> = (set, get) => ({
  machines: new Map(),
  dropped: 0,
  expanded: new Set(),
  filter: "",
  runtime: undefined,

  ingest: (raw, size) => {
    const state = get();
    const event = asRecord(raw) ?? {};
    const type = asString(event.type);
    const root = keyOf(asString(event.rootId));
    const registration =
      type === "@xstate.actor" && asString(event.parentId) === undefined
        ? asString(event.name)
        : undefined;
    const adoptedKey =
      registration === undefined ? undefined : labels.get(registration);
    const adopted =
      adoptedKey === undefined ? undefined : state.machines.get(adoptedKey);
    const machine = adopted ?? machineFor(state.machines, root);

    if (adopted !== undefined && adopted.rootId !== root) {
      roots.delete(adopted.rootId);
      const orphanKey = roots.get(root);
      if (orphanKey !== undefined && orphanKey !== adopted.key) {
        const orphan = state.machines.get(orphanKey);
        if (orphan !== undefined) {
          discardMachineHistory(orphan);
        }
        state.machines.delete(orphanKey);
      }
      discardMachineHistory(adopted);
      adopted.rootId = root;
    }
    if (registration !== undefined) {
      machine.label = registration;
      labels.set(registration, machine.key);
    }
    roots.set(root, machine.key);

    if (type === "@xstate.actor") {
      const actor = actorFrom(event);
      if (actor !== undefined) {
        machine.actors.set(actor.id, actor);
      }
    }
    const entry = toEntry(raw, size, machine.lastValue);
    const snapshot = asRecord(event.snapshot);
    const sessionId = asString(event.sessionId);
    if (type === "@xstate.snapshot" && snapshot !== undefined) {
      machine.lastValue = stateLabel(snapshot.value);
      const actor =
        sessionId === undefined ? undefined : machine.actors.get(sessionId);
      if (actor !== undefined) {
        actor.status = asString(snapshot.status) ?? actor.status;
        actor.state = stateLabel(snapshot.value);
      }
    }

    machine.events.push(entry);
    machine.bytes += size;
    retainedBytes += size;
    order.push({ id: entry.id, key: machine.key, size });
    const evicted = evictOldest(state.machines, MAX_EVENTS);
    set({ dropped: state.dropped + evicted });
  },

  clear: () => {
    const runtime = get().runtime;
    resetBookkeeping();
    set({
      machines: new Map(),
      dropped: 0,
      expanded: new Set(),
      runtime
    });
  },

  reset: (runtime: InspectorRuntime | undefined, dropped: number) => {
    resetBookkeeping();
    set({
      machines: new Map(),
      dropped,
      expanded: new Set(),
      runtime
    });
  },

  setDropped: dropped => set({ dropped }),
  setFilter: filter => set({ filter }),

  setExpanded: (id, open) => {
    const expanded = get().expanded;
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

export const ingest = actions.ingest;
export const clear = actions.clear;
export const reset = actions.reset;
export const setDropped = actions.setDropped;
export const setFilter = actions.setFilter;
export const setExpanded = actions.setExpanded;
