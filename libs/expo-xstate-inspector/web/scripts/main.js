import { connectDevToolsClient } from "./clients/devToolsClient.js";
import { createInspectorController } from "./controllers/inspectorController.js";
import { createMermaidRenderer } from "./renderers/mermaidRenderer.js";
import { createActorStore } from "./stores/actorStore.js";
import { createSelectionStore } from "./stores/selectionStore.js";
import { createActorListView } from "./views/actorListView.js";
import { createDetailsView } from "./views/detailsView.js";
import { createDiagramView } from "./views/diagramView.js";
import { bindPanelResizer } from "./widgets/panelResizer.js";
import { bindTabs } from "./widgets/tabs.js";

const element = id => document.getElementById(id);

bindTabs(element("tabs"));
bindPanelResizer(element("resizer"));

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
    actorList: createActorListView(element("actors"), sessionId =>
      controller.selectByUser(sessionId)
    )
  }
});

connectDevToolsClient({
  onMessage: controller.handleMessage,
  onClose: controller.handleDisconnect
});
