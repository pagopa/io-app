const typeOf = value =>
  value === null ? "null" : Array.isArray(value) ? "array" : typeof value;

const span = (className, text) => {
  const element = document.createElement("span");
  element.className = className;
  element.textContent = text;
  return element;
};

const keyLabel = key =>
  key === undefined ? [] : [span("json-key", `${key}: `)];

const formatLeaf = value =>
  value === undefined ? "undefined" : JSON.stringify(value);

const formatPreview = (type, size) =>
  type === "array" ? `Array(${size})` : `Object(${size})`;

/**
 * Builds a collapsible element for `value`. Open nodes are tracked in
 * `expanded` by path, so they stay open when the tree is rebuilt.
 */
export const buildJsonNode = (key, value, path, expanded) => {
  const type = typeOf(value);
  const entries =
    type === "object" || type === "array" ? Object.entries(value) : [];
  if (!entries.length) {
    const row = document.createElement("div");
    row.append(...keyLabel(key), span(`json-${type}`, formatLeaf(value)));
    return row;
  }
  const id = JSON.stringify(path);
  const node = document.createElement("details");
  const summary = document.createElement("summary");
  summary.append(
    ...keyLabel(key),
    span("json-preview", formatPreview(type, entries.length))
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
