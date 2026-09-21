/** Render state derived defensively from raw Stately inspection events. */

export type ActorNode = {
  id: string;
  name: string;
  parentId?: string;
  state?: string;
  status: string;
};

export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error"
  | "waiting";

export type EntryKind = "actor" | "event" | "failure" | "other" | "snapshot";

export type InspectorRuntime = {
  appVersion: string;
  id: string;
  platform: string;
};

export type MachineTimeline = {
  actors: Map<string, ActorNode>;
  bytes: number;
  events: Array<TimelineEntry>;
  key: string;
  label: string;
  lastValue?: string;
  rootId: string;
};

export type TimelineEntry = {
  at: number;
  headline: string;
  id: string;
  kind: EntryKind;
  payload: unknown;
  rootId: string;
  sessionId?: string;
  size: number;
  sourceId?: string;
  type: string;
};

export type TimelineState = {
  clear: () => void;
  dropped: number;
  expanded: Set<string>;
  filter: string;
  ingest: (raw: unknown, size: number) => void;
  machines: Map<string, MachineTimeline>;
  reset: (runtime: InspectorRuntime | undefined, dropped: number) => void;
  runtime?: InspectorRuntime;
  setDropped: (count: number) => void;
  setExpanded: (id: string, open: boolean) => void;
  setFilter: (value: string) => void;
};
