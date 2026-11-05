import { connectDevToolsClient } from "./clients/devToolsClient.js";
import { createInspectorController } from "./controllers/inspectorController.js";
import { createMermaidRenderer } from "./renderers/mermaidRenderer.js";
import { createActorStore } from "./stores/actorStore.js";
import { createSelectionStore } from "./stores/selectionStore.js";
import { createActorListView } from "./views/actorListView.js";
import { createChildActorTableView } from "./views/childActorTableView.js";
import { createDetailsView } from "./views/detailsView.js";
import { createDiagramView } from "./views/diagramView.js";
import { bindPanelResizer } from "./widgets/panelResizer.js";
import { bindPanZoom } from "./widgets/panZoom.js";
import { bindTabs } from "./widgets/tabs.js";
import { bindZoomControls } from "./widgets/zoomControls.js";

const element = id => document.getElementById(id);

bindTabs(element("tabs"));
bindPanelResizer(element("resizer"));
const panZoom = bindPanZoom(element("diagram"), element("diagram-canvas"), () =>
  element("diagram-canvas").querySelectorAll("g.active")
);
bindZoomControls(element("zoom-controls"), panZoom);

const controller = createInspectorController({
  actors: createActorStore(),
  selection: createSelectionStore(),
  views: {
    details: createDetailsView({
      state: element("state"),
      context: element("context"),
      events: element("events")
    }),
    childActors: createChildActorTableView(element("child-actors")),
    diagram: createDiagramView(
      element("diagram-canvas"),
      createMermaidRenderer(element("mermaid-sandbox")),
      panZoom
    ),
    actorList: createActorListView(element("actors"), sessionId =>
      controller.selectByUser(sessionId)
    )
  }
});

connectDevToolsClient({
  onMessage: controller.handleMessage,
  onClose: controller.handleDisconnect
});
