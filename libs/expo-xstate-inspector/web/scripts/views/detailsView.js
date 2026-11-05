import { createEventTableView } from "./eventTableView.js";
import { createJsonTreeView } from "./jsonTreeView.js";

/** Shows the state, context and events of the selected machine. */
export const createDetailsView = ({ state, context, events }) => {
  const views = {
    state: createJsonTreeView(state),
    context: createJsonTreeView(context),
    events: createEventTableView(events)
  };
  return {
    render: actor => {
      views.state.render(actor?.snapshot?.value);
      views.context.render(actor?.snapshot?.context);
      views.events.render(actor?.events ?? []);
    }
  };
};
