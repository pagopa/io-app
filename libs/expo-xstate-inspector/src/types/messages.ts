/** Messages sent from the app to the web page, keyed by method. */
export type InspectorMessages = {
  actor: {
    definition: unknown;
    name: string;
    sessionId: string;
    snapshot: SerializedSnapshot | undefined;
  };
  event: { event: unknown; sessionId: string };
  snapshot: {
    sessionId: string;
    snapshot: SerializedSnapshot | undefined;
  };
};

export type InspectorMethod = keyof InspectorMessages;

export type SerializedSnapshot = {
  context: unknown;
  status: unknown;
  value: unknown;
};
