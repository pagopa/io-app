/** Keeps the views in sync with the app messages and the user selection. */
export const createInspectorController = ({ actors, selection, views }) => {
  const renderActorList = () =>
    views.actorList.render(actors.machines(), selection.current());

  const select = (sessionId, { pin }) => {
    selection.select(sessionId, { pin });
    renderActorList();
    views.details.render(actors.get(sessionId));
    views.diagram.render(actors.get(sessionId));
  };

  return {
    handleDisconnect: () =>
      views.diagram.showMessage("Disconnected. Reload the page to reconnect."),
    handleMessage: (method, payload) => {
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
      if (sessionId !== selection.current()) {
        return;
      }
      views.details.render(actors.get(sessionId));
      // Events do not change the diagram, only the following snapshot does.
      if (method !== "event") {
        views.diagram.render(actors.get(sessionId));
      }
    },
    selectByUser: sessionId => select(sessionId, { pin: true })
  };
};
