import type { StateValue } from "../types/inspector.js";

type ActivePaths = {
  leaves: Array<Array<string>>;
  parents: Array<Array<string>>;
};

/** Paths of the active atomic states (`leaves`) and of their ancestors. */
export const activePaths = (
  value: StateValue | undefined,
  path: Array<string> = []
): ActivePaths =>
  typeof value === "string"
    ? { leaves: [[...path, value]], parents: [] }
    : Object.entries(value ?? {}).reduce<ActivePaths>(
        (result, [key, child]) => {
          const nested = activePaths(child, [...path, key]);
          return {
            leaves: [...result.leaves, ...nested.leaves],
            parents: [...result.parents, [...path, key], ...nested.parents]
          };
        },
        { leaves: [], parents: [] }
      );
