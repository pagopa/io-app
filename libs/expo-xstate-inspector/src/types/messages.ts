/** Messages sent from the app to the web page, keyed by method. */
export type InspectorMessages = {
  actor: {
    definition: unknown;
    id: string;
    input: unknown;
    name: string;
    parentId: string | undefined;
    sessionId: string;
    snapshot: SerializedSnapshot | undefined;
    src: string | undefined;
    startedAt: number;
    systemId: string | undefined;
  };
  event: { event: unknown; sessionId: string; timestamp: number };
  snapshot: {
    sessionId: string;
    snapshot: SerializedSnapshot | undefined;
    timestamp: number;
  };
};

export type InspectorMethod = keyof InspectorMessages;

export type SerializedSnapshot = {
  context: unknown;
  error: unknown;
  output: unknown;
  status: unknown;
  value: unknown;
};
