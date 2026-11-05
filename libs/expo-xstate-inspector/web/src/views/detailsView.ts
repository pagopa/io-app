import type { InspectedActor } from "../types/inspector.js";

import { createEventTableView } from "./eventTableView.js";
import { createJsonTreeView } from "./jsonTreeView.js";

type DetailsContainers = {
  context: Element;
  events: Element;
  state: Element;
};

/** Shows the state, context and events of the selected machine. */
export const createDetailsView = ({
  state,
  context,
  events
}: DetailsContainers) => {
  const views = {
    state: createJsonTreeView(state),
    context: createJsonTreeView(context),
    events: createEventTableView(events)
  };
  return {
    render: (actor: InspectedActor | undefined) => {
      views.state.render(actor?.snapshot?.value);
      views.context.render(actor?.snapshot?.context);
      views.events.render(actor?.events ?? []);
    }
  };
};
