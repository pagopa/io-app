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
  const sidebarResizer = useRef<HTMLDivElement>(null);
  const panelResizer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unbindSidebar =
      sidebarResizer.current !== null
        ? bindPanelResizer(sidebarResizer.current, "left")
        : undefined;
    const unbindPanel =
      panelResizer.current !== null
        ? bindPanelResizer(panelResizer.current, "right")
        : undefined;
    const disconnect = connectDevToolsClient({
      onMessage: inspector.handleMessage,
      onClose: inspector.handleDisconnect
    });
    return () => {
      unbindSidebar?.();
      unbindPanel?.();
      disconnect();
    };
  }, [inspector]);

  return (
    <>
      <ActorList
        machines={state.machines}
        onSelect={inspector.select}
        selectedId={state.selectedId}
      />
      <div
        aria-controls="machine-list"
        aria-label="Resize machines sidebar"
        aria-orientation="vertical"
        className="resizer"
        ref={sidebarResizer}
        role="separator"
        tabIndex={0}
      />
      <Diagram actor={state.selected} disconnected={state.disconnected} />
      <div
        aria-controls="panel"
        aria-label="Resize inspection panel"
        aria-orientation="vertical"
        className="resizer"
        id="resizer"
        ref={panelResizer}
        role="separator"
        tabIndex={0}
      />
      <InspectionPanel
        actor={state.selected}
        childActors={state.children}
        selectedId={state.selectedId}
      />
    </>
  );
};
