import { buildJsonTree } from "../builders/jsonNode.js";
import { createCell, createSpan } from "../utils/dom.js";
import { formatDuration, formatTime } from "../utils/time.js";

const STATUS_LABELS = {
  active: "running",
  done: "done",
  error: "failed",
  stopped: "stopped"
};

const describeCall = ({ id, name, src, systemId }) => {
  const label = src ?? name;
  return [
    createSpan("actor-src", label),
    ...[id !== label && `id: ${id}`, systemId && `systemId: ${systemId}`]
      .filter(Boolean)
      .map(line => createSpan("actor-meta", line))
  ];
};

const describeStatus = ({ endedAt, snapshot, startedAt }) => {
  const status = snapshot?.status ?? "active";
  const duration =
    endedAt === undefined ? "" : ` · ${formatDuration(endedAt - startedAt)}`;
  return createSpan(
    `status status-${status}`,
    `${STATUS_LABELS[status] ?? status}${duration}`
  );
};

const describeData = ({ input, snapshot }) =>
  Object.fromEntries(
    Object.entries({
      input,
      output: snapshot?.output,
      error: snapshot?.error
    }).filter(([, value]) => value !== undefined)
  );

/** Shows the actors invoked or spawned by the selected machine, newest first. */
export const createChildActorTableView = container => {
  const expandedBySession = new Map();
  const expandedOf = sessionId => {
    if (!expandedBySession.has(sessionId)) {
      expandedBySession.set(sessionId, new Set([JSON.stringify([])]));
    }
    return expandedBySession.get(sessionId);
  };
  const createRow = ([sessionId, actor]) => {
    const row = document.createElement("tr");
    row.append(
      createCell(formatTime(actor.startedAt)),
      createCell(...describeCall(actor), describeStatus(actor)),
      createCell(buildJsonTree(describeData(actor), expandedOf(sessionId)))
    );
    return row;
  };
  return {
    render: children => container.replaceChildren(...children.map(createRow))
  };
};
