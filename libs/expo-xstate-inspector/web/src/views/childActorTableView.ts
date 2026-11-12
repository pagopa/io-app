import type { ActorEntry, InspectedActor } from "../types/inspector.js";

import { buildJsonTree } from "../builders/jsonNode.js";
import { createCell, createSpan } from "../utils/dom.js";
import { formatDuration, formatTime } from "../utils/time.js";

const STATUS_LABELS: Record<string, string> = {
  active: "running",
  done: "done",
  error: "failed",
  stopped: "stopped"
};

const describeCall = ({ id, name, src, systemId }: InspectedActor) => {
  const label = src ?? name;
  return [
    createSpan("actor-src", label ?? ""),
    ...[id !== label && `id: ${id}`, systemId && `systemId: ${systemId}`]
      .filter((line): line is string => Boolean(line))
      .map(line => createSpan("actor-meta", line))
  ];
};

const describeStatus = ({ endedAt, snapshot, startedAt }: InspectedActor) => {
  const status = snapshot?.status ?? "active";
  const duration =
    endedAt === undefined || startedAt === undefined
      ? ""
      : ` · ${formatDuration(endedAt - startedAt)}`;
  return createSpan(
    `status status-${status}`,
    `${STATUS_LABELS[status] ?? status}${duration}`
  );
};

const describeData = ({ input, snapshot }: InspectedActor) =>
  Object.fromEntries(
    Object.entries({
      input,
      output: snapshot?.output,
      error: snapshot?.error
    }).filter(([, value]) => value !== undefined)
  );

/** Shows the actors invoked or spawned by the selected machine, newest first. */
export const createChildActorTableView = (container: Element) => {
  const expandedBySession = new Map<string, Set<string>>();
  const expandedOf = (sessionId: string) => {
    const expanded =
      expandedBySession.get(sessionId) ?? new Set([JSON.stringify([])]);
    expandedBySession.set(sessionId, expanded);
    return expanded;
  };
  const createRow = ([sessionId, actor]: ActorEntry) => {
    const row = document.createElement("tr");
    row.append(
      createCell(
        actor.startedAt === undefined ? "" : formatTime(actor.startedAt)
      ),
      createCell(...describeCall(actor), describeStatus(actor)),
      createCell(buildJsonTree(describeData(actor), expandedOf(sessionId)))
    );
    return row;
  };
  return {
    render: (children: Array<ActorEntry>) =>
      container.replaceChildren(...children.map(createRow))
  };
};
