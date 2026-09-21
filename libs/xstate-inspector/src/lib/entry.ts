import type { EntryKind, TimelineEntry } from "../types";

/**
 * Wire format to timeline entry: turns one raw inspection event into the row
 * the timeline renders, with the headline text built here rather than in a
 * component.
 */
import { PREVIEW_LIMIT } from "../constants";
import {
  asRecord,
  asString,
  compact,
  errorLabel,
  keyOf,
  stateLabel
} from "./format";

/**
 * Normalizes one wire event into a renderable timeline entry.
 *
 * @param previousValue State value the tab reported before this event, so a
 * transition can be shown as `from → to`.
 */
export const toEntry = (
  raw: unknown,
  size: number,
  previousValue: string | undefined
): TimelineEntry => {
  const event = asRecord(raw) ?? {};
  const type = asString(event.type) ?? "unknown";
  const rootId = keyOf(asString(event.rootId));
  const sourceId = asString(event.sourceId);
  const body = asRecord(event.event);
  const snapshot = asRecord(event.snapshot) ?? {};
  const at = Date.now();
  const id = asString(event.id) ?? `${at}-${Math.random()}`;

  if (type === "@xstate.actor") {
    const name = asString(event.name) ?? "actor";
    const parentId = asString(event.parentId);
    const status = asString(snapshot.status) ?? "unknown";
    const output = snapshot.output;
    const spawn = parentId ? `spawned by ${parentId}` : "registered";
    const outputText =
      output === undefined ? "" : ` · output ${compact(output, PREVIEW_LIMIT)}`;
    return {
      id,
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
    const kind: EntryKind = failed ? "failure" : "snapshot";
    return {
      id,
      kind,
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
    const { type: _dropped, ...rest } = body ?? {};
    const payload =
      Object.keys(rest).length > 0 ? ` ${compact(rest, PREVIEW_LIMIT)}` : "";
    const origin = sourceId ? ` · from ${sourceId}` : "";
    return {
      id,
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
    id,
    kind: "other",
    type,
    rootId,
    headline: compact(raw, PREVIEW_LIMIT),
    at,
    size,
    payload: raw
  };
};
