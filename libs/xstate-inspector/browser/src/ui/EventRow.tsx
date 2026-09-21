/**
 * One timeline row. Memoized because the timeline repaints on every ingested
 * event, while a row only changes when its own entry or its open state does.
 */
import { memo } from "react";

import type { TimelineEntry } from "../types";

import { pretty } from "../lib/format";

export interface EventRowProps {
  entry: TimelineEntry;
  onToggle: (id: string, open: boolean) => void;
  open: boolean;
}

export const EventRow = memo(({ entry, onToggle, open }: EventRowProps) => (
  <details
    className="row"
    data-id={entry.id}
    onToggle={event => onToggle(entry.id, event.currentTarget.open)}
    open={open}
  >
    <summary>
      <span className={`kind ${entry.kind}`}>{entry.kind}</span>
      <span className="headline">{entry.headline}</span>
      <span className="spacer" />
    </summary>
    {open ? <pre>{pretty(entry.payload)}</pre> : null}
  </details>
));
