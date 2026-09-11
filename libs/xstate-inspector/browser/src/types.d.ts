/**
 * Structural description of the events the inspector receives.
 *
 * Deliberately independent from `@statelyai/inspect`: the UI only needs the
 * shape of what arrives on the wire, so it does not pull the inspect library
 * and its transports into its bundle.
 */

export interface ActorInspectionEvent extends BaseEvent {
  definition?: string;
  name: string;
  parentId?: string;
  snapshot: InspectedSnapshot;
  type: "@xstate.actor";
}

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

/** Everything the UI knows about one root machine. */
export interface Machine {
  /** Retained wire characters, so a big-context flow cannot grow without bound. */
  bytes: number;
  events: Array<RecordedEvent>;
  key: string;
  label: string;
  lastValue?: string;
  rootId: string;
}

/** A single timeline entry, normalized for rendering. */
export interface RecordedEvent {
  at: number;
  headline: string;
  id: string;
  kind: "actor" | "event" | "failure" | "other" | "snapshot";
  payload: unknown;
  rootId: string;
  /** Wire size in characters, used to bound retained memory. */
  size: number;
  sourceId?: string;
  type: string;
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

/** Any other event the pipeline may forward, kept renderable instead of dropped. */
export interface UnknownInspectionEvent extends BaseEvent {
  [key: string]: unknown;
  type: string;
}

interface BaseEvent {
  _version: string;
  createdAt: string;
  id: string;
  rootId?: string;
  sessionId: string;
}
