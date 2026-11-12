const isActorRef = (value: object) => "sessionId" in value && "send" in value;

const hasToJSON = (value: object): value is { toJSON: () => unknown } =>
  "toJSON" in value && typeof value.toJSON === "function";

/**
 * Converts a value to JSON-safe data. Functions become `{ type: name }`, as in
 * XState configs, and actor refs their session id.
 */
export const serializeValue = (
  value: unknown,
  ancestors: ReadonlyArray<object> = []
): unknown => {
  if (typeof value === "function") {
    return { type: value.name };
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }
  if (isActorRef(value)) {
    return { actor: (value as { sessionId: unknown }).sessionId };
  }
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (hasToJSON(value)) {
    return value.toJSON();
  }
  if (ancestors.includes(value)) {
    return "[Circular]";
  }
  const path = [...ancestors, value];
  return Array.isArray(value) || value instanceof Set
    ? Array.from(value, item => serializeValue(item, path))
    : Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          serializeValue(item, path)
        ])
      );
};
