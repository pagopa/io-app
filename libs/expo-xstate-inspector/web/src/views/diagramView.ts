import type { DiagramRenderer } from "../renderers/mermaidRenderer.js";
import type { InspectedActor } from "../types/inspector.js";
import type { PanZoom } from "../widgets/panZoom.js";

import { buildStateDiagram } from "../builders/stateDiagram.js";
import { markTakenEdges } from "../utils/svgEdges.js";

/**
 * Draws the selected machine with `renderDiagram`, highlighting its state and
 * the path taken to it. Snapshots that change neither do not redraw it;
 * `viewport` is told whether a new machine is shown.
 */
export const createDiagramView = (
  container: HTMLElement,
  renderDiagram: DiagramRenderer,
  viewport: Pick<PanZoom, "update">
) => {
  const shown: { code?: string; definition?: InspectedActor["definition"] } =
    {};
  const showMessage = (text: string) => {
    shown.code = undefined;
    shown.definition = undefined;
    container.textContent = text;
    viewport.update({ isNew: true });
  };
  return {
    render: async (actor: InspectedActor | undefined) => {
      if (!actor?.definition?.states) {
        showMessage("No machine selected.");
        return;
      }
      try {
        const { code, edgeKeys } = buildStateDiagram(
          actor.definition,
          actor.snapshot?.value,
          actor.visited
        );
        const taken = edgeKeys.flatMap((key, index) =>
          key !== undefined && actor.taken.has(key) ? [index] : []
        );
        const drawing = `${code}\n${taken.join(",")}`;
        if (drawing === shown.code) {
          return;
        }
        shown.code = drawing;
        const svg = await renderDiagram(code);
        if (svg === undefined) {
          return;
        }
        container.innerHTML = svg;
        markTakenEdges(container, taken);
        const isNew = actor.definition !== shown.definition;
        shown.definition = actor.definition;
        viewport.update({ isNew });
      } catch (error) {
        showMessage(
          `Could not render the diagram: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },
    showMessage
  };
};
