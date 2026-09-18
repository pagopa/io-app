/**
 * Value helpers shared by the wire normalizer and the renderer: every place that
 * turns an unknown payload into text the timeline can show.
 *
 * @typedef {Record<string, unknown>} Loose
 */
import { DETAIL_LIMIT, PREVIEW_LIMIT } from "./constants.js";

/** @param {unknown} value @returns {string | undefined} */
export const asString = value =>
  typeof value === "string" ? value : undefined;

/** @param {unknown} value @returns {Loose | undefined} */
export const asRecord = value =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? /** @type {Loose} */ (value)
    : undefined;

/** @param {string} value @returns {string} */
export const escapeHtml = value =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Renders a value as compact JSON, or as-is when it is a plain string.
 *
 * @param {unknown} value
 * @param {number} limit
 * @returns {string}
 */
export const compact = (value, limit) => {
  if (typeof value === "string") {
    return value;
  }
  let text;
  try {
    text = JSON.stringify(value);
  } catch {
    text = String(value);
  }
  if (text === undefined) {
    return String(value);
  }
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};

/** @param {unknown} value @returns {string} */
export const pretty = value => {
  let text;
  try {
    text = JSON.stringify(value, null, 2);
  } catch {
    text = String(value);
  }
  const safe = text === undefined ? String(value) : text;
  return safe.length > DETAIL_LIMIT
    ? `${safe.slice(0, DETAIL_LIMIT)}\n…`
    : safe;
};

/** @param {unknown} value @returns {string} */
export const stateLabel = value =>
  value === undefined ? "—" : compact(value, 120);

/** @param {unknown} error @returns {string} */
export const errorLabel = error => {
  const record = asRecord(error);
  return asString(record?.message) ?? compact(error, PREVIEW_LIMIT);
};

/** @param {string | undefined} rootId @returns {string} */
export const keyOf = rootId => rootId ?? "unknown";
