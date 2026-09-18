/**
 * Timeline state, held in one zustand store: one `Machine` per tab, the
 * retention counters, the filter and the expanded rows. Every mutation goes
 * through an action here, so the view only has to subscribe to repaint.
 *
 * @typedef {import("./types").Machine} Machine
 *
 * @typedef {object} TimelineState
 * @property {Map<string, Machine>} machines Tabs, keyed by tab key.
 * @property {Map<string, number>} dropped Events evicted past the caps, per tab key.
 * @property {Set<string>} expanded Event ids whose detail is open.
 * @property {string} filter Lowercased needle the timeline is filtered by.
 * @property {number} version Bumped by the in-place mutations below, which is
 * what tells zustand subscribers that the timeline changed.
 * @property {(raw: unknown, size: number) => void} ingest
 * @property {() => void} clear
 * @property {(value: string) => void} setFilter
 * @property {(id: string, open: boolean) => void} setExpanded
 */
import { createStore } from "zustand/vanilla";
import { MAX_EVENTS, MAX_RETAINED_BYTES } from "./constants.js";
import { asRecord, asString, keyOf, stateLabel } from "./format.js";
import { record } from "./wire.js";

/**
 * Root actor session id (wire `rootId`) to owning tab key, so every event of an
 * actor lands in the tab its registration adopted.
 *
 * @type {Map<string, string>}
 */
const roots = new Map();

/**
 * Machine id to owning tab key, so a machine disposed and set up again
 * overrides its previous tab instead of opening a second one.
 *
 * @type {Map<string, string>}
 */
const labels = new Map();

/**
 * @param {Map<string, Machine>} machines
 * @param {string | undefined} rootId
 * @returns {Machine}
 */
const machineFor = (machines, rootId) => {
  const root = keyOf(rootId);
  const key = roots.get(root) ?? root;
  const existing = machines.get(key);
  if (existing) {
    return existing;
  }
  const created = {
    key,
    label: key,
    rootId: root,
    events: [],
    bytes: 0
  };
  machines.set(key, created);
  roots.set(root, key);
  return created;
};

/** @type {import("zustand/vanilla").StateCreator<TimelineState, [], []>} */
const createTimelineState = (set, get) => ({
  machines: new Map(),
  dropped: new Map(),
  expanded: new Set(),
  filter: "",
  version: 0,

  /**
   * Adds one wire event to its machine tab, adopting the tab of a
   * re-registered machine and evicting the oldest events past the caps.
   *
   * The events and the tab map are mutated in place: copying a machine with
   * 20000 retained events on every frame would cost more than the render the
   * copy exists to trigger, so `version` carries the change instead.
   */
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
    const adoptedKey = registration && labels.get(registration);
    const adopted =
      adoptedKey === undefined ? undefined : machines.get(adoptedKey);
    const machine = adopted ?? machineFor(machines, root);
    if (adopted) {
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
    const entry = record(raw, size, machine.lastValue);
    if (type === "@xstate.snapshot" && snapshot) {
      machine.lastValue = stateLabel(snapshot.value);
    }

    machine.events.push(entry);
    machine.bytes += size;
    let evicted = 0;
    while (
      machine.events.length > MAX_EVENTS ||
      (machine.bytes > MAX_RETAINED_BYTES && machine.events.length > 1)
    ) {
      const oldest = machine.events.shift();
      if (oldest === undefined) {
        break;
      }
      machine.bytes -= oldest.size;
      evicted += 1;
    }
    if (evicted > 0) {
      dropped.set(machine.key, (dropped.get(machine.key) ?? 0) + evicted);
    }

    set({ version: get().version + 1 });
  },

  clear: () => {
    roots.clear();
    labels.clear();
    set({
      machines: new Map(),
      dropped: new Map(),
      expanded: new Set(),
      version: get().version + 1
    });
  },

  setFilter: value => {
    set({ filter: value });
  },

  /**
   * Records the open state of one row. Called from the `toggle` event, which a
   * rebuild can re-fire, so an unchanged row must not write state: that write
   * would render again and re-fire the same event.
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

export const timelineStore = createStore(createTimelineState);

const actions = timelineStore.getState();

/** Appends one wire event to the timeline. */
export const ingest = actions.ingest;

/** Drops every machine, counter and expanded row. */
export const clear = actions.clear;

/** Filters the timeline by type, state or payload text. */
export const setFilter = actions.setFilter;

/** Opens or closes the detail of one row. */
export const setExpanded = actions.setExpanded;
