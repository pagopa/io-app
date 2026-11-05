import { buildStateDiagram } from "../builders/stateDiagram.js";

/** Draws the selected machine with `renderDiagram`, highlighting its state. */
export const createDiagramView = (container, renderDiagram) => ({
  render: async actor => {
    if (!actor?.definition?.states) {
      container.textContent = "No machine selected.";
      return;
    }
    try {
      const svg = await renderDiagram(
        buildStateDiagram(actor.definition, actor.snapshot?.value)
      );
      if (svg !== undefined) {
        container.innerHTML = svg;
      }
    } catch (error) {
      container.textContent = `Could not render the diagram: ${error.message}`;
    }
  },
  showMessage: text => {
    container.textContent = text;
  }
});
