import { listStateNodes } from "../utils/stateNodes.js";

/** Resolves XState transition targets to state paths. */
export const createTargetResolver = root => {
  const pathsById = Object.fromEntries([
    [root.id, []],
    ...listStateNodes(root)
      .filter(({ node }) => node.id)
      .map(({ node, path }) => [node.id, path])
  ]);
  return (target, sourcePath) => {
    if (target.startsWith("#")) {
      const [id, ...rest] = target.slice(1).split(".");
      return pathsById[id] && [...pathsById[id], ...rest];
    }
    return target.startsWith(".")
      ? [...sourcePath, ...target.slice(1).split(".")]
      : [...sourcePath.slice(0, -1), ...target.split(".")];
  };
};
