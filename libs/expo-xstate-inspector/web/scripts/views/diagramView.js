import { buildStateDiagram } from "../builders/stateDiagram.js";

/**
 * Draws the selected machine with `renderDiagram`, highlighting its state.
 * Snapshots that keep the same state do not redraw it; a new machine is fitted
 * in `viewport`, while state changes keep the user zoom.
 */
export const createDiagramView = (container, renderDiagram, viewport) => {
  const shown = { code: undefined, definition: undefined };
  const showMessage = text => {
    shown.code = undefined;
    shown.definition = undefined;
    container.textContent = text;
    viewport.fit();
  };
  return {
    render: async actor => {
      if (!actor?.definition?.states) {
        showMessage("No machine selected.");
        return;
      }
      try {
        const code = buildStateDiagram(actor.definition, actor.snapshot?.value);
        if (code === shown.code) {
          return;
        }
        shown.code = code;
        const svg = await renderDiagram(code);
        if (svg === undefined) {
          return;
        }
        container.innerHTML = svg;
        if (actor.definition !== shown.definition) {
          shown.definition = actor.definition;
          viewport.fit();
        }
      } catch (error) {
        showMessage(`Could not render the diagram: ${error.message}`);
      }
    },
    showMessage
  };
};
