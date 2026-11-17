import type { ActorEntry } from "../types/inspector";

const createButton = (
  [sessionId, actor]: ActorEntry,
  selectedId: string | undefined,
  onSelect: (sessionId: string) => void
) => {
  const button = document.createElement("button");
  const name = document.createElement("span");
  name.className = "machine-name";
  name.textContent = actor.name ?? sessionId;
  const session = document.createElement("span");
  session.className = "machine-session";
  session.textContent = sessionId;
  button.append(name, session);
  button.ariaCurrent = String(sessionId === selectedId);
  button.className =
    actor.snapshot?.status === "active"
      ? "machine-button"
      : "machine-button stopped";
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
