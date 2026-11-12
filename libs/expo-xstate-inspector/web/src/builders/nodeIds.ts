export const toNodeId = (path: ReadonlyArray<string>) =>
  path.length ? "s_" + path.join("__").replace(/\W/g, "_") : "root";

/** Strips characters Mermaid reads as syntax. */
export const escapeLabel = (value: unknown) =>
  String(value).replace(/[:;#{}"]/g, " ");
