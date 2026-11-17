import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ActorList } from "../features/actors/ActorList";
import { InspectionPanel } from "../features/actors/InspectionPanel";
import { createInspectorStore } from "../features/actors/inspectorStore";
import { Diagram } from "../features/diagram/Diagram";
import { connectDevToolsClient } from "./devtools/devToolsClient";
import { bindPanelResizer } from "./panelResizer";

export const App = () => {
  const [inspector] = useState(createInspectorStore);
  const state = useSyncExternalStore(
    inspector.subscribe,
    inspector.getSnapshot
  );
  const resizer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resizer.current) {
      bindPanelResizer(resizer.current);
    }
    return connectDevToolsClient({
      onMessage: inspector.handleMessage,
      onClose: inspector.handleDisconnect
    });
  }, [inspector]);

  return (
    <>
      <ActorList
        machines={state.machines}
        onSelect={inspector.select}
        selectedId={state.selectedId}
      />
      <Diagram actor={state.selected} disconnected={state.disconnected} />
      <div
        aria-label="Resize panel"
        aria-orientation="vertical"
        id="resizer"
        ref={resizer}
        role="separator"
      />
      <InspectionPanel
        actor={state.selected}
        childActors={state.children}
        selectedId={state.selectedId}
      />
    </>
  );
};
