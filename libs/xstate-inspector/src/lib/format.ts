/**
 * Value helpers shared by the entry parser and the UI: every place that turns an
 * unknown payload into text.
 */
import { DETAIL_LIMIT, PREVIEW_LIMIT } from "../constants";

export const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

export const asRecord = (
  value: unknown
): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

/**
 * Renders a value as compact JSON, or as-is when it is a plain string.
 *
 * @param limit Characters kept before the text is cut off.
 */
export const compact = (value: unknown, limit: number): string => {
  if (typeof value === "string") {
    return value;
  }
  const text = stringify(value);
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

/** Renders a value as indented JSON for the row detail. */
export const pretty = (value: unknown): string => {
  const text = stringify(value, 2);
  return text.length > DETAIL_LIMIT
    ? `${text.slice(0, DETAIL_LIMIT)}\n…`
    : text;
};

/** The state value of a snapshot, as the timeline shows it. */
export const stateLabel = (value: unknown): string =>
  value === undefined ? "—" : compact(value, 120);

/** The message of a snapshot error, falling back to the error itself. */
export const errorLabel = (error: unknown): string => {
  const record = asRecord(error);
  return asString(record?.message) ?? compact(error, PREVIEW_LIMIT);
};

/** The tab key an actor session belongs to. */
export const keyOf = (rootId: string | undefined): string =>
  rootId ?? "unknown";

/** JSON that survives a value JSON cannot represent: circular, BigInt, or a throwing getter. */
const stringify = (value: unknown, space?: number): string => {
  try {
    const text = JSON.stringify(value, null, space);
    if (text === undefined) {
      return String(value);
    }
    return text;
  } catch {
    return String(value);
  }
};
