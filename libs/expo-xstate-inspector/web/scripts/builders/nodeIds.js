export const toNodeId = path =>
  path.length ? "s_" + path.join("__").replace(/\W/g, "_") : "root";

/** Strips characters Mermaid reads as syntax. */
export const escapeLabel = value => String(value).replace(/[:;#{}"]/g, " ");
