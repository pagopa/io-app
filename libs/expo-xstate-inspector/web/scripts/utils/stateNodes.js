export const toArray = value =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/** Name of a config reference, either a string or `{ type }`. */
export const nameOf = value =>
  typeof value === "string" ? value : value?.type;

/** Lists every descendant state node with its path from `node`. */
export const listStateNodes = (node, path = []) =>
  Object.entries(node.states ?? {}).flatMap(([key, child]) => [
    { node: child, path: [...path, key] },
    ...listStateNodes(child, [...path, key])
  ]);
