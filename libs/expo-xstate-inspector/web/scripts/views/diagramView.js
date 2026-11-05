import { buildStateDiagram } from "../builders/stateDiagram.js";

/**
 * Draws the selected machine with `renderDiagram`, highlighting its state.
 * Snapshots that keep the same state do not redraw it.
 */
export const createDiagramView = (container, renderDiagram) => {
  const shown = { code: undefined };
  const showMessage = text => {
    shown.code = undefined;
    container.textContent = text;
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
        if (svg !== undefined) {
          container.innerHTML = svg;
        }
      } catch (error) {
        showMessage(`Could not render the diagram: ${error.message}`);
      }
    },
    showMessage
  };
};
