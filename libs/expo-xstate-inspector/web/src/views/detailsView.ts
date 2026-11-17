import type { InspectedActor } from "../types/inspector";

import { createEventTableView } from "./eventTableView";
import { createJsonTreeView } from "./jsonTreeView";

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
