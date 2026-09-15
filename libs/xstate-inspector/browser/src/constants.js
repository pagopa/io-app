/**
 * Retention and rendering tunables.
 *
 * Gathered in one module because they are quoted back to the user: the timeline
 * note and the row window both repeat the numbers the store evicts at.
 */

/** Rows rendered below this are collapsed behind a count, to keep large flows cheap to paint. */
export const RENDER_WINDOW = 400;

/** Per-machine event cap. Events beyond this are dropped, oldest first. */
export const MAX_EVENTS = 20000;

/** Per-machine retained wire bytes. Snapshot events repeat whole machine contexts. */
export const MAX_RETAINED_BYTES = 32 * 1024 * 1024;

/** Characters of payload kept for the inline preview of a row. */
export const PREVIEW_LIMIT = 180;

/** Characters kept in the expanded row detail. */
export const DETAIL_LIMIT = 20000;
