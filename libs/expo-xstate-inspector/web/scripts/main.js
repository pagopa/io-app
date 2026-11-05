import { connectDevToolsClient } from "./clients/devToolsClient.js";
import { createInspectorController } from "./controllers/inspectorController.js";
import { createMermaidRenderer } from "./renderers/mermaidRenderer.js";
import { createActorStore } from "./stores/actorStore.js";
import { createSelectionStore } from "./stores/selectionStore.js";
import { createDetailsView } from "./views/detailsView.js";
import { createDiagramView } from "./views/diagramView.js";
import { createSidebarView } from "./views/sidebarView.js";

const element = id => document.getElementById(id);

const controller = createInspectorController({
  actors: createActorStore(),
  selection: createSelectionStore(),
  views: {
    details: createDetailsView({
      state: element("state"),
      context: element("context"),
      events: element("events")
    }),
    diagram: createDiagramView(element("diagram"), createMermaidRenderer()),
    sidebar: createSidebarView(element("actors"), sessionId =>
      controller.selectByUser(sessionId)
    )
  }
});

connectDevToolsClient({
  onMessage: controller.handleMessage,
  onClose: controller.handleDisconnect
});
