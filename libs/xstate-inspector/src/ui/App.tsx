/**
 * The inspector screen: connection status, machine tabs, toolbar and timeline.
 * It is the only component that subscribes to the timeline store; everything
 * below it renders from props.
 */
import { useSelectedTab } from "../state/useSelectedTab";
import { useStream } from "../state/useStream";
import { useTimeline } from "../state/useTimeline";
import { MachineTabs } from "./MachineTabs";
import { Timeline } from "./Timeline";
import { Toolbar } from "./Toolbar";

export const App = () => {
  const { machines, dropped, expanded, filter, setExpanded } = useTimeline();
  const status = useStream();
  const { select, selected } = useSelectedTab([...machines.keys()]);
  const machine = selected === undefined ? undefined : machines.get(selected);

  return (
    <>
      <header>
        <div className="bar">
          <h1>{"XState inspector"}</h1>
          <span className="spacer" />
          <span
            className="status"
            data-online={status === "connected" ? "true" : "false"}
            id="status"
          >
            {status}
          </span>
        </div>
        <MachineTabs
          machines={machines}
          onSelect={select}
          selected={selected}
        />
      </header>
      <Toolbar />
      <Timeline
        dropped={machine === undefined ? 0 : (dropped.get(machine.key) ?? 0)}
        expanded={expanded}
        filter={filter}
        machine={machine}
        onToggle={setExpanded}
      />
    </>
  );
};
