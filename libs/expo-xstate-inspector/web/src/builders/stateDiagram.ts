import type { StateNodeConfig, StateValue } from "../types/inspector.js";

import { listStateNodes } from "../utils/stateNodes.js";
import { buildActiveStyles } from "./activeStyles.js";
import { toNodeId } from "./nodeIds.js";
import { buildStateDeclarations } from "./stateDeclarations.js";
import { createTargetResolver } from "./targetResolver.js";
import { buildTransitionEdges } from "./transitionEdges.js";

/**
 * Builds a Mermaid `stateDiagram-v2` from a machine definition, highlighting
 * the active and `visited` state ids. `edgeKeys[n]` is the transition key of
 * the Mermaid edge `edge<n>`, undefined for initial and final edges.
 */
export const buildStateDiagram = (
  definition: StateNodeConfig,
  activeValue: StateValue | undefined,
  visited: Iterable<string> = []
) => {
  const resolveTarget = createTargetResolver(definition);
  const nodes = listStateNodes(definition);
  const declarations = buildStateDeclarations(definition);
  const edges = [{ node: definition, path: [] }, ...nodes].flatMap(
    ({ node, path }) => buildTransitionEdges(node, path, resolveTarget)
  );
  const compound = new Set(
    nodes.filter(({ node }) => node.states).map(({ path }) => toNodeId(path))
  );
  return {
    code: [
      "stateDiagram-v2",
      ...declarations,
      ...edges.map(({ line }) => line),
      ...buildActiveStyles(activeValue, visited, compound)
    ].join("\n"),
    // Mermaid numbers the edges in declaration order.
    edgeKeys: [
      ...declarations
        .filter(line => line.includes(" --> "))
        .map(() => undefined),
      ...edges.map(({ key }) => key)
    ]
  };
};
