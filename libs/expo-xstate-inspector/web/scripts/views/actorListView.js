const createButton = ([sessionId, actor], selectedId, onSelect) => {
  const button = document.createElement("button");
  button.textContent = `${actor.name} (${sessionId})`;
  button.ariaCurrent = String(sessionId === selectedId);
  button.className = actor.snapshot?.status === "active" ? "" : "stopped";
  button.onclick = () => onSelect(sessionId);
  return button;
};

/** Lists the machines, letting the user pick one. */
export const createActorListView = (container, onSelect) => ({
  render: (machines, selectedId) =>
    container.replaceChildren(
      ...machines.map(machine => createButton(machine, selectedId, onSelect))
    )
});
