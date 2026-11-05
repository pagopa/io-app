/** Paths of the active atomic states (`leaves`) and of their ancestors. */
export const activePaths = (value, path = []) =>
  typeof value === "string"
    ? { leaves: [[...path, value]], parents: [] }
    : Object.entries(value ?? {}).reduce(
        (result, [key, child]) => {
          const nested = activePaths(child, [...path, key]);
          return {
            leaves: [...result.leaves, ...nested.leaves],
            parents: [...result.parents, [...path, key], ...nested.parents]
          };
        },
        { leaves: [], parents: [] }
      );
