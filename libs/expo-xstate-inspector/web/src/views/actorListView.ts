import type { ActorEntry } from "../types/inspector.js";

const createButton = (
  [sessionId, actor]: ActorEntry,
  selectedId: string | undefined,
  onSelect: (sessionId: string) => void
) => {
  const button = document.createElement("button");
  button.textContent = `${actor.name} (${sessionId})`;
  button.ariaCurrent = String(sessionId === selectedId);
  button.className = actor.snapshot?.status === "active" ? "" : "stopped";
  button.onclick = () => onSelect(sessionId);
  return button;
};

/** Lists the machines, letting the user pick one. */
export const createActorListView = (
  container: Element,
  onSelect: (sessionId: string) => void
) => ({
  render: (machines: Array<ActorEntry>, selectedId: string | undefined) =>
    container.replaceChildren(
      ...machines.map(machine => createButton(machine, selectedId, onSelect))
    )
});
