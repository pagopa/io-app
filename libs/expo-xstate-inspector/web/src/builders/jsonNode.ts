import { createSpan } from "../utils/dom.js";

const typeOf = (value: unknown) =>
  value === null ? "null" : Array.isArray(value) ? "array" : typeof value;

const keyLabel = (key: string | undefined) =>
  key === undefined ? [] : [createSpan("json-key", `${key}: `)];

const formatLeaf = (value: unknown) =>
  value === undefined ? "undefined" : JSON.stringify(value);

const formatPreview = (type: string, size: number) =>
  type === "array" ? `Array(${size})` : `Object(${size})`;

/**
 * Builds a collapsible element for `value`. Open nodes are tracked in
 * `expanded` by path, so they stay open when the tree is rebuilt.
 */
export const buildJsonNode = (
  key: string | undefined,
  value: unknown,
  path: Array<string>,
  expanded: Set<string>
): HTMLElement => {
  const type = typeOf(value);
  const entries =
    type === "object" || type === "array"
      ? Object.entries(value as object)
      : [];
  if (!entries.length) {
    const row = document.createElement("div");
    row.append(...keyLabel(key), createSpan(`json-${type}`, formatLeaf(value)));
    return row;
  }
  const id = JSON.stringify(path);
  const node = document.createElement("details");
  const summary = document.createElement("summary");
  summary.append(
    ...keyLabel(key),
    createSpan("json-preview", formatPreview(type, entries.length))
  );
  node.open = expanded.has(id);
  node.ontoggle = () => (node.open ? expanded.add(id) : expanded.delete(id));
  node.append(
    summary,
    ...entries.map(([childKey, child]) =>
      buildJsonNode(childKey, child, [...path, childKey], expanded)
    )
  );
  return node;
};

/** Builds a standalone JSON tree for `value`. */
export const buildJsonTree = (value: unknown, expanded: Set<string>) => {
  const tree = document.createElement("div");
  tree.className = "json-tree";
  tree.append(buildJsonNode(undefined, value, [], expanded));
  return tree;
};
