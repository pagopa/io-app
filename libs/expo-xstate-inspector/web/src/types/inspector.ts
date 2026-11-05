import type {
  InspectorMessages,
  SerializedSnapshot
} from "../../../src/types/messages";

export type ActorEntry = [sessionId: string, actor: InspectedActor];

/** A config reference, either a name or `{ type }`. */
export type ConfigRef = string | { type?: string };

export type EventEntry = {
  event: { [key: string]: unknown; type: string };
  timestamp: number;
};

/** An actor as known by the page; any message may be the first received. */
export type InspectedActor = Partial<
  Omit<InspectorMessages["actor"], "definition" | "sessionId" | "snapshot">
> & {
  definition?: StateNodeConfig;
  endedAt?: number;
  events: Array<EventEntry>;
  snapshot?: Snapshot;
  taken: Set<string>;
  visited: Set<string>;
};

export type InvokeConfig = {
  onDone?: TransitionsConfig;
  onError?: TransitionsConfig;
  src?: ConfigRef;
};

export type Snapshot = Omit<SerializedSnapshot, "status" | "value"> & {
  status: string;
  value: StateValue | undefined;
};

/** The JSON-serialized config of an XState state node. */
export type StateNodeConfig = {
  after?: Record<string, TransitionsConfig>;
  always?: TransitionsConfig;
  id?: string;
  initial?: string | { target?: string };
  invoke?: Array<InvokeConfig> | InvokeConfig;
  on?: Record<string, TransitionsConfig>;
  onDone?: TransitionsConfig;
  states?: Record<string, StateNodeConfig>;
  type?: string;
};

export type StateValue = string | { [key: string]: StateValue };

export type TransitionConfig =
  | string
  | { guard?: ConfigRef; target?: Array<string> | string };

export type TransitionsConfig =
  | Array<TransitionConfig>
  | TransitionConfig
  | undefined;
