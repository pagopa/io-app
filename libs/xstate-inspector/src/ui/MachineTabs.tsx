/**
 * The tab strip: one tab per machine, in the order the app registered them.
 */
import type { MachineTimeline } from "../types";

export interface MachineTabsProps {
  machines: ReadonlyMap<string, MachineTimeline>;
  onSelect: (key: string) => void;
  selected: string | undefined;
}

export const MachineTabs = ({
  machines,
  onSelect,
  selected
}: MachineTabsProps) => (
  <div className="tabs" id="tabs">
    {[...machines.values()].map(machine => (
      <button
        aria-selected={machine.key === selected}
        className="tab"
        data-key={machine.key}
        key={machine.key}
        onClick={() => onSelect(machine.key)}
        role="tab"
        type="button"
      >
        {machine.label}
        <span className="count">{machine.events.length}</span>
      </button>
    ))}
  </div>
);
