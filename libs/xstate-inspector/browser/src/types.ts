/**
 * Wire format and view types.
 *
 * The wire half declares what the React Native bridge in `src/` forwards
 * through the middleware. The view half is what the UI renders after
 * `lib/entry.ts` has parsed one wire event.
 *
 * The wire declarations are documentation: the parser reads `unknown` and
 * narrows defensively, because a malformed frame must never break the page.
 */

export interface ActorInspectionEvent extends BaseEvent {
  name: string;
  parentId?: string;
  snapshot: InspectedSnapshot;
  type: "@xstate.actor";
}

export interface BaseEvent {
  _version: string;
  createdAt: string;
  id: string;
  rootId?: string;
  sessionId: string;
}

/** Which row style a timeline entry gets. */
export type EntryKind = "actor" | "event" | "failure" | "other" | "snapshot";

export interface EventInspectionEvent extends BaseEvent {
  event: Record<string, unknown> & { type: string };
  sourceId?: string;
  type: "@xstate.event";
}

export interface InspectedSnapshot {
  context?: unknown;
  error?: unknown;
  output?: unknown;
  status?: string;
  value?: unknown;
}

/** One machine tab: the events of a root actor, and the state value it last reported. */
export interface MachineTimeline {
  /** Retained wire characters, so a big-context flow cannot grow without bound. */
  bytes: number;
  events: Array<TimelineEntry>;
  key: string;
  label: string;
  lastValue?: string;
  rootId: string;
}

export interface SnapshotInspectionEvent extends BaseEvent {
  event: Record<string, unknown> & { type: string };
  snapshot: InspectedSnapshot;
  type: "@xstate.snapshot";
}

export type StatelyInspectionEvent =
  | ActorInspectionEvent
  | EventInspectionEvent
  | SnapshotInspectionEvent
  | UnknownInspectionEvent;

/** One timeline row, normalized from one wire event. */
export interface TimelineEntry {
  at: number;
  headline: string;
  id: string;
  kind: EntryKind;
  /** The wire event itself, shown in the row detail and included in the export. */
  payload: unknown;
  rootId: string;
  /** Wire size in characters, used to bound retained memory. */
  size: number;
  sourceId?: string;
  type: string;
}

export interface TimelineState {
  clear: () => void;
  /** Events evicted past the caps, per tab key. */
  dropped: Map<string, number>;
  /** Event ids whose detail is open. */
  expanded: Set<string>;
  /** Lowercased needle the timeline is filtered by. */
  filter: string;
  ingest: (raw: unknown, size: number) => void;
  /** Tabs, keyed by tab key. */
  machines: Map<string, MachineTimeline>;
  setExpanded: (id: string, open: boolean) => void;
  setFilter: (value: string) => void;
}

/** Any other event the relay may forward, kept renderable instead of dropped. */
export interface UnknownInspectionEvent extends BaseEvent {
  readonly [key: string]: unknown;
  type: string;
}
