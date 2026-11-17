import "../styles/index.css";
import { connectDevToolsClient } from "./clients/devToolsClient";
import { createInspectorController } from "./controllers/inspectorController";
import { createMermaidRenderer } from "./renderers/mermaidRenderer";
import { createActorStore } from "./stores/actorStore";
import { createSelectionStore } from "./stores/selectionStore";
import { createActorListView } from "./views/actorListView";
import { createChildActorTableView } from "./views/childActorTableView";
import { createDetailsView } from "./views/detailsView";
import { createDiagramView } from "./views/diagramView";
import { createStateDetailsView } from "./views/stateDetailsView";
import { bindPanelResizer } from "./widgets/panelResizer";
import { bindPanZoom } from "./widgets/panZoom";
import { bindTabs } from "./widgets/tabs";
import { bindZoomControls } from "./widgets/zoomControls";

const element = (id: string) => {
  const found = document.getElementById(id);
  if (!found) {
    throw new Error(`Missing #${id} element`);
  }
  return found;
};

bindTabs(element("tabs"));
bindPanelResizer(element("resizer"));
const panZoom = bindPanZoom(
  element("diagram"),
  element("diagram-canvas"),
  () => element("diagram-canvas").querySelectorAll("g.active"),
  target => diagram.selectAt(target)
);
bindZoomControls(element("zoom-controls"), panZoom);

const stateDetails = createStateDetailsView(element("state-details"), () =>
  diagram.selectAt(null)
);
const diagram = createDiagramView(
  element("diagram-canvas"),
  stateDetails,
  createMermaidRenderer(element("mermaid-sandbox")),
  panZoom
);

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
    diagram,
    actorList: createActorListView(element("actors"), sessionId =>
      controller.selectByUser(sessionId)
    )
  }
});

connectDevToolsClient({
  onMessage: controller.handleMessage,
  onClose: controller.handleDisconnect
});
