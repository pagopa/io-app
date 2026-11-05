const toJson = value => JSON.stringify(value, null, 2) ?? "";

const createEventItem = ({ time, event }) => {
  const item = document.createElement("li");
  item.textContent = `${time} ${event.type}`;
  item.title = toJson(event);
  return item;
};

/** Shows the state, context and events of the selected machine. */
export const createDetailsView = ({ state, context, events }) => ({
  render: actor => {
    state.textContent = toJson(actor?.snapshot?.value);
    context.textContent = toJson(actor?.snapshot?.context);
    events.replaceChildren(...(actor?.events ?? []).map(createEventItem));
  }
});
