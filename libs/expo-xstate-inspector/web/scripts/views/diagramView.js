import { buildStateDiagram } from "../builders/stateDiagram.js";

/**
 * Draws the selected machine with `renderDiagram`, highlighting its state.
 * Snapshots that keep the same state do not redraw it; `viewport` is told
 * whether a new machine is shown.
 */
export const createDiagramView = (container, renderDiagram, viewport) => {
  const shown = { code: undefined, definition: undefined };
  const showMessage = text => {
    shown.code = undefined;
    shown.definition = undefined;
    container.textContent = text;
    viewport.update({ isNew: true });
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
        const isNew = actor.definition !== shown.definition;
        shown.definition = actor.definition;
        viewport.update({ isNew });
      } catch (error) {
        showMessage(`Could not render the diagram: ${error.message}`);
      }
    },
    showMessage
  };
};
