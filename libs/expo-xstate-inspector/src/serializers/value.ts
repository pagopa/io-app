const isActorRef = (value: object) => "sessionId" in value && "send" in value;

const hasToJSON = (value: object): value is { toJSON: () => unknown } =>
  "toJSON" in value && typeof value.toJSON === "function";

type SerializationOptions = { includeGuardDetails?: boolean };

const serializeGuard = (
  value: unknown,
  ancestors: ReadonlyArray<object>,
  options: SerializationOptions
): unknown => {
  if (typeof value !== "function") {
    return serializeValue(value, ancestors, options);
  }
  if (ancestors.includes(value)) {
    return "[Circular]";
  }
  const path = [...ancestors, value];
  const guard = value as {
    guards?: ReadonlyArray<unknown>;
    stateValue?: unknown;
  };
  if (Array.isArray(guard.guards)) {
    return {
      type: value.name,
      guards: guard.guards.map(item => serializeGuard(item, path, options))
    };
  }
  if ("stateValue" in guard) {
    return {
      type: value.name,
      stateValue: serializeValue(guard.stateValue, path, options)
    };
  }
  const source = (() => {
    try {
      const text = Function.prototype.toString.call(value);
      return /\[(?:native code|bytecode)\]/.test(text) ? null : text;
    } catch {
      return null;
    }
  })();
  return { type: value.name, source };
};

/**
 * Converts a value to JSON-safe data. Functions become `{ type: name }`, as in
 * XState configs, and actor refs their session id.
 */
export const serializeValue = (
  value: unknown,
  ancestors: ReadonlyArray<object> = [],
  options: SerializationOptions = {}
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
    ? Array.from(value, item => serializeValue(item, path, options))
    : Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          options.includeGuardDetails === true && key === "guard"
            ? serializeGuard(item, path, options)
            : serializeValue(item, path, options)
        ])
      );
};
