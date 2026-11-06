import type { StateNodeConfig } from "../types/inspector.js";

import { listStateNodes } from "../utils/stateNodes.js";

export type TargetResolver = (
  target: string,
  sourcePath: Array<string>
) => Array<string> | undefined;

/** Resolves XState transition targets to state paths. */
export const createTargetResolver = (root: StateNodeConfig): TargetResolver => {
  const pathsById = new Map<string | undefined, Array<string>>([
    [root.id, []],
    ...listStateNodes(root)
      .filter(({ node }) => node.id)
      .map(({ node, path }): [string | undefined, Array<string>] => [
        node.id,
        path
      ])
  ]);
  return (target, sourcePath) => {
    if (target.startsWith("#")) {
      const [id, ...rest] = target.slice(1).split(".");
      const idPath = pathsById.get(id);
      return idPath && [...idPath, ...rest];
    }
    return target.startsWith(".")
      ? [...sourcePath, ...target.slice(1).split(".")]
      : [...sourcePath.slice(0, -1), ...target.split(".")];
  };
};
