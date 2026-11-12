import type { ConfigRef, StateNodeConfig } from "../types/inspector.js";

export const toArray = <T>(value: Array<T> | T | undefined): Array<T> =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/** Name of a config reference, either a string or `{ type }`. */
export const nameOf = (value: ConfigRef | undefined) =>
  typeof value === "string" ? value : value?.type;

/** Lists every descendant state node with its path from `node`. */
export const listStateNodes = (
  node: StateNodeConfig,
  path: Array<string> = []
): Array<{ node: StateNodeConfig; path: Array<string> }> =>
  Object.entries(node.states ?? {}).flatMap(([key, child]) => [
    { node: child, path: [...path, key] },
    ...listStateNodes(child, [...path, key])
  ]);
