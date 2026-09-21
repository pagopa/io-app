import type { MachineTimeline, TimelineEntry } from "../types";

/**
 * The rows of the selected machine, filtered and windowed. The notes above the
 * footer report what the filter and the retention caps hide.
 */
import { MAX_EVENTS, MAX_RETAINED_BYTES, RENDER_WINDOW } from "../constants";
import { EventRow } from "./EventRow";

export interface TimelineProps {
  dropped: number;
  expanded: ReadonlySet<string>;
  filter: string;
  machine: MachineTimeline | undefined;
  onToggle: (id: string, open: boolean) => void;
}

const matches = (filter: string, entry: TimelineEntry): boolean =>
  filter === "" ||
  `${entry.type} ${entry.headline}`.toLowerCase().includes(filter);

export const Timeline = ({
  dropped,
  expanded,
  filter,
  machine,
  onToggle
}: TimelineProps) => {
  if (machine === undefined) {
    return (
      <main id="timeline">
        <p className="empty">
          {
            "Waiting for events. Open a flow in the app and the machines will show up here."
          }
        </p>
      </main>
    );
  }

  const matched = machine.events.filter(entry => matches(filter, entry));
  const hidden = Math.max(0, matched.length - RENDER_WINDOW);
  const rows = hidden > 0 ? matched.slice(-RENDER_WINDOW) : matched;
  const megabytes = Math.round(MAX_RETAINED_BYTES / (1024 * 1024));

  return (
    <main id="timeline">
      {hidden > 0 ? (
        <p className="note">
          {`${hidden} earlier event(s) hidden · use the filter to narrow the timeline`}
        </p>
      ) : null}
      {dropped > 0 ? (
        <p className="note">
          {`${dropped} event(s) dropped past the per-machine memory cap (${MAX_EVENTS} events or ${megabytes} MB)`}
        </p>
      ) : null}
      {matched.length === 0 ? (
        <p className="note">{"No event matches the current filter"}</p>
      ) : null}
      {rows.map(entry => (
        <EventRow
          entry={entry}
          key={entry.id}
          onToggle={onToggle}
          open={expanded.has(entry.id)}
        />
      ))}
      <p className="note">
        {`${matched.length} event(s) for ${machine.label} (${machine.rootId})`}
      </p>
    </main>
  );
};
