import { listStateNodes } from "../utils/stateNodes.js";
import { buildActiveStyles } from "./activeStyles.js";
import { buildStateDeclarations } from "./stateDeclarations.js";
import { createTargetResolver } from "./targetResolver.js";
import { buildTransitionEdges } from "./transitionEdges.js";

/** Builds a Mermaid `stateDiagram-v2` from a machine definition. */
export const buildStateDiagram = (definition, activeValue) => {
  const resolveTarget = createTargetResolver(definition);
  return [
    "stateDiagram-v2",
    ...buildStateDeclarations(definition),
    ...listStateNodes(definition).flatMap(({ node, path }) =>
      buildTransitionEdges(node, path, resolveTarget)
    ),
    ...buildActiveStyles(activeValue)
  ].join("\n");
};
