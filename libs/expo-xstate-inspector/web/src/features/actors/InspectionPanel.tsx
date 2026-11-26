import { useState } from "react";

import type { ActorEntry, InspectedActor } from "../../shared/inspector/types";

import { JsonTree } from "../../shared/ui/json/JsonTree";
import { formatDuration, formatTime } from "./time";

type Props = {
  actor: InspectedActor | undefined;
  childActors: Array<ActorEntry>;
  selectedId: string | undefined;
};

const TABS = [
  { id: "context", label: "Context" },
  { id: "events", label: "Events" },
  { id: "child-actors", label: "Actors" }
];
const STATUS_LABELS: Record<string, string> = {
  active: "running",
  done: "done",
  error: "failed",
  stopped: "stopped"
};
const payload = ({ type: _type, ...data }: { type: string }) => data;
const actorData = ({ input, snapshot }: InspectedActor) =>
  Object.fromEntries(
    Object.entries({
      input,
      output: snapshot?.output,
      error: snapshot?.error
    }).filter(([, value]) => value !== undefined)
  );

export const InspectionPanel = ({ actor, selectedId, childActors }: Props) => {
  const [tab, setTab] = useState("context");

  return (
    <section id="panel">
      <div className="border-b border-divider px-4 py-2">
        <h2 className="text-sm font-semibold">Inspection</h2>
      </div>
      <div aria-label="Inspection views" id="tabs" role="tablist">
        {TABS.map(({ id, label }) => (
          <button
            aria-controls={`${id}-tab`}
            aria-selected={tab === id}
            id={`${id}-trigger`}
            key={id}
            onClick={() => setTab(id)}
            role="tab"
          >
            {label}
          </button>
        ))}
      </div>
      <div
        aria-labelledby="context-trigger"
        hidden={tab !== "context"}
        id="context-tab"
        role="tabpanel"
        tabIndex={0}
      >
        <JsonTree initiallyOpen toolbar value={actor?.snapshot?.context} />
      </div>
      <div
        aria-labelledby="events-trigger"
        className="table-panel"
        hidden={tab !== "events"}
        id="events-tab"
        role="tabpanel"
        tabIndex={0}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody id="events">
            {actor?.events.map(entry => (
              <tr key={`${selectedId}:${entry.id}`}>
                <td>{formatTime(entry.timestamp)}</td>
                <td>{entry.event.type}</td>
                <td>
                  <JsonTree value={payload(entry.event)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="table-empty empty-state">No events received yet.</p>
      </div>
      <div
        aria-labelledby="child-actors-trigger"
        className="table-panel"
        hidden={tab !== "child-actors"}
        id="child-actors-tab"
        role="tabpanel"
        tabIndex={0}
      >
        <table className="data-table child-actors-table">
          <thead>
            <tr>
              <th>Started</th>
              <th>Actor</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody id="child-actors">
            {childActors.map(([sessionId, child]) => {
              const label = child.src ?? child.name;
              const status = child.snapshot?.status ?? "active";
              return (
                <tr key={sessionId}>
                  <td>
                    {child.startedAt === undefined
                      ? ""
                      : formatTime(child.startedAt)}
                  </td>
                  <td>
                    <span className="actor-src">{label ?? ""}</span>
                    {child.id !== label && (
                      <span className="actor-meta">id: {child.id}</span>
                    )}
                    {child.systemId && (
                      <span className="actor-meta">
                        systemId: {child.systemId}
                      </span>
                    )}
                    <span className={`status status-${status}`}>
                      {STATUS_LABELS[status] ?? status}
                      {child.endedAt === undefined ||
                      child.startedAt === undefined
                        ? ""
                        : ` · ${formatDuration(child.endedAt - child.startedAt)}`}
                    </span>
                  </td>
                  <td>
                    <JsonTree initiallyOpen value={actorData(child)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="table-empty empty-state">No child actors to display.</p>
      </div>
    </section>
  );
};
