/**
 * Wire format to timeline entry: turns one raw inspection event into the row the
 * timeline renders, with the headline text built here rather than in the DOM.
 */
import { PREVIEW_LIMIT } from "./constants.js";
import {
  asRecord,
  asString,
  compact,
  errorLabel,
  keyOf,
  stateLabel
} from "./format.js";

/**
 * Normalizes one wire event into a renderable timeline entry.
 *
 * @param {unknown} raw
 * @param {number} size
 * @param {string | undefined} previousValue
 * @returns {import("./types").RecordedEvent}
 */
export const record = (raw, size, previousValue) => {
  const event = asRecord(raw) ?? {};
  const type = asString(event.type) ?? "unknown";
  const rootId = keyOf(asString(event.rootId));
  const sourceId = asString(event.sourceId);
  const body = asRecord(event.event);
  const snapshot = asRecord(event.snapshot) ?? {};
  const at = Date.now();

  if (type === "@xstate.actor") {
    const name = asString(event.name) ?? "actor";
    const parentId = asString(event.parentId);
    const status = asString(snapshot.status) ?? "unknown";
    const output = snapshot.output;
    const spawn = parentId ? `spawned by ${parentId}` : "registered";
    const outputText =
      output === undefined ? "" : ` · output ${compact(output, PREVIEW_LIMIT)}`;
    return {
      id: asString(event.id) ?? `${at}-${Math.random()}`,
      kind: "actor",
      type,
      rootId,
      headline: `${spawn}: ${name} · ${status}${outputText}`,
      at,
      size,
      payload: raw
    };
  }

  if (type === "@xstate.snapshot") {
    const eventType = asString(body?.type) ?? "unknown";
    const stateValue = stateLabel(snapshot.value);
    const transition =
      previousValue === undefined || previousValue === stateValue
        ? stateValue
        : `${previousValue} → ${stateValue}`;
    const failed = asString(snapshot.status) === "error";
    const output =
      snapshot.output === undefined
        ? ""
        : ` · output ${compact(snapshot.output, PREVIEW_LIMIT)}`;
    const error = failed ? ` · ${errorLabel(snapshot.error)}` : "";
    return {
      id: asString(event.id) ?? `${at}-${Math.random()}`,
      kind: failed ? "failure" : "snapshot",
      type,
      rootId,
      headline: `${transition} · after ${eventType}${output}${error}`,
      at,
      size,
      payload: raw
    };
  }

  if (type === "@xstate.event") {
    const eventType = asString(body?.type) ?? "unknown";
    const rest = { ...(body ?? {}) };
    delete rest.type;
    const payload =
      Object.keys(rest).length > 0 ? ` ${compact(rest, PREVIEW_LIMIT)}` : "";
    const origin = sourceId ? ` · from ${sourceId}` : "";
    return {
      id: asString(event.id) ?? `${at}-${Math.random()}`,
      kind: "event",
      type,
      rootId,
      sourceId,
      headline: `${eventType}${payload}${origin}`,
      at,
      size,
      payload: raw
    };
  }

  return {
    id: asString(event.id) ?? `${at}-${Math.random()}`,
    kind: "other",
    type,
    rootId,
    headline: compact(raw, PREVIEW_LIMIT),
    at,
    size,
    payload: raw
  };
};
