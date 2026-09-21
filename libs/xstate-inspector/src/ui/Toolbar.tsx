/**
 * Filter, export and clear.
 *
 * It never subscribes to the timeline: the filter input keeps what the user
 * typed, and the export reads the store when the button is pressed.
 */
import { buildExport } from "../lib/export";
import { clear, setFilter, timelineStore } from "../state/timeline";

export const Toolbar = () => {
  const onExport = () => {
    const { machines, dropped } = timelineStore.getState();
    const now = new Date();
    const blob = new Blob(
      [JSON.stringify(buildExport(machines, dropped, now), null, 2)],
      {
        type: "application/json"
      }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `xstate-inspector-${now.getTime()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="toolbar">
      <input
        aria-label="Filter events"
        autoComplete="off"
        id="filter"
        onChange={event =>
          setFilter(event.currentTarget.value.trim().toLowerCase())
        }
        placeholder="filter by type, state or payload text"
        type="search"
      />
      <button id="export" onClick={onExport} type="button">
        {"Export JSON"}
      </button>
      <button id="clear" onClick={clear} type="button">
        {"Clear"}
      </button>
    </div>
  );
};
