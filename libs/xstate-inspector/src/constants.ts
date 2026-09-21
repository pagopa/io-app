/**
 * Retention and rendering tunables.
 *
 * Gathered in one module because they are quoted back to the user: the timeline
 * note and the row window both repeat the numbers the store evicts at.
 */

/** Rows rendered below this are collapsed behind a count, to keep large flows cheap to paint. */
export const RENDER_WINDOW = 400;

/** Active-runtime event cap. Events beyond this are dropped, oldest first. */
export const MAX_EVENTS = 10000;

/** Active-runtime byte cap. Snapshot events repeat whole machine contexts. */
export const MAX_RETAINED_BYTES = 16 * 1024 * 1024;

/** Client and server reject incompatible envelope semantics. */
export const INSPECTOR_PROTOCOL_VERSION = 1;

/** Characters of payload kept for the inline preview of a row. */
export const PREVIEW_LIMIT = 180;

/** Characters kept in the expanded row detail. */
export const DETAIL_LIMIT = 20000;
