/**
 * The inspector screen: connection status, machine tabs, toolbar and timeline.
 * It is the only component that subscribes to the timeline store; everything
 * below it renders from props.
 */
import { useSelectedTab } from "../state/useSelectedTab";
import { useStream } from "../state/useStream";
import { useTimeline } from "../state/useTimeline";
import { ActorTree } from "./ActorTree";
import { MachineTabs } from "./MachineTabs";
import { Timeline } from "./Timeline";
import { Toolbar } from "./Toolbar";

export const App = () => {
  const { machines, dropped, expanded, filter, setExpanded } = useTimeline();
  const stream = useStream();
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
            data-online={stream.status === "connected" ? "true" : "false"}
            id="status"
          >
            {stream.error ?? stream.status}
          </span>
          {stream.runtime === undefined ? null : (
            <span className="runtime">
              {`${stream.runtime.platform} · ${stream.runtime.appVersion}`}
            </span>
          )}
        </div>
        <MachineTabs
          machines={machines}
          onSelect={select}
          selected={selected}
        />
      </header>
      <Toolbar />
      <div className="workspace">
        {machine === undefined ? null : (
          <ActorTree actors={machine.actors} rootId={machine.rootId} />
        )}
        <Timeline
          dropped={dropped}
          expanded={expanded}
          filter={filter}
          machine={machine}
          onToggle={setExpanded}
        />
      </div>
    </>
  );
};
