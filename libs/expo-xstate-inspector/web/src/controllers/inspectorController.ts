import type { ActorStore } from "../stores/actorStore.js";
import type { SelectionStore } from "../stores/selectionStore.js";
import type { createActorListView } from "../views/actorListView.js";
import type { createChildActorTableView } from "../views/childActorTableView.js";
import type { createDetailsView } from "../views/detailsView.js";
import type { createDiagramView } from "../views/diagramView.js";

type Dependencies = {
  actors: ActorStore;
  selection: SelectionStore;
  views: {
    actorList: ReturnType<typeof createActorListView>;
    childActors: ReturnType<typeof createChildActorTableView>;
    details: ReturnType<typeof createDetailsView>;
    diagram: ReturnType<typeof createDiagramView>;
  };
};

/** Keeps the views in sync with the app messages and the user selection. */
export const createInspectorController = ({
  actors,
  selection,
  views
}: Dependencies) => {
  const renderActorList = () =>
    views.actorList.render(actors.machines(), selection.current());

  const renderChildActors = () =>
    views.childActors.render(actors.childrenOf(selection.current()));

  const select = (sessionId: string, { pin }: { pin: boolean }) => {
    selection.select(sessionId, { pin });
    renderActorList();
    renderChildActors();
    views.details.render(actors.get(sessionId));
    void views.diagram.render(actors.get(sessionId));
  };

  return {
    handleDisconnect: () =>
      views.diagram.showMessage("Disconnected. Reload the page to reconnect."),
    handleMessage: (method: string, payload: unknown) => {
      if (!actors.apply(method, payload)) {
        return;
      }
      const { sessionId } = payload;
      if (
        method === "actor" &&
        selection.follows() &&
        actors.isMachine(sessionId)
      ) {
        select(sessionId, { pin: false });
        return;
      }
      renderActorList();
      if (
        method !== "event" &&
        selection.current() !== undefined &&
        actors.get(sessionId)?.parentId === selection.current()
      ) {
        renderChildActors();
      }
      if (sessionId !== selection.current()) {
        return;
      }
      views.details.render(actors.get(sessionId));
      // Events do not change the diagram, only the following snapshot does.
      if (method !== "event") {
        void views.diagram.render(actors.get(sessionId));
      }
    },
    selectByUser: (sessionId: string) => select(sessionId, { pin: true })
  };
};
