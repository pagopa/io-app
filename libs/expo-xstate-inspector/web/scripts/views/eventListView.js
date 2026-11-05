const createEventItem = ({ time, event }) => {
  const item = document.createElement("li");
  item.textContent = `${time} ${event.type}`;
  item.title = JSON.stringify(event, null, 2);
  return item;
};

/** Lists the events received by the selected machine, newest first. */
export const createEventListView = container => ({
  render: events => container.replaceChildren(...events.map(createEventItem))
});
