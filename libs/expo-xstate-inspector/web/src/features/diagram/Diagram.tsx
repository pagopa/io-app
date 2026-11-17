import {
  FullScreenIcon,
  Target02Icon,
  ZoomInIcon,
  ZoomOutIcon
} from "@hugeicons/core-free-icons";
import { useEffect, useRef, useState } from "react";

import type { InspectedActor } from "../../shared/inspector/types";

import { IconButton } from "../../shared/ui/IconButton";
import { createDiagramView } from "./diagramView";
import { createMermaidRenderer } from "./mermaidRenderer";
import { bindPanZoom, type PanZoom } from "./panZoom";
import { type SelectedState, StateDetails } from "./StateDetails";
import { ZOOM_STEP } from "./zoom";

type Props = {
  actor: InspectedActor | undefined;
  disconnected: boolean;
};

export const Diagram = ({ actor, disconnected }: Props) => {
  const viewport = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const sandbox = useRef<HTMLDivElement>(null);
  const diagram = useRef<ReturnType<typeof createDiagramView> | undefined>(
    undefined
  );
  const panZoom = useRef<PanZoom | undefined>(undefined);
  const [following, setFollowing] = useState(false);
  const [selectedState, setSelectedState] = useState<SelectedState>();

  useEffect(() => {
    const container = canvas.current;
    if (!viewport.current || !container || !sandbox.current) {
      return;
    }
    const zoom = bindPanZoom(
      viewport.current,
      container,
      () => container.querySelectorAll("g.active"),
      target => diagram.current?.selectAt(target)
    );
    panZoom.current = zoom;
    zoom.onFollowingChange(setFollowing);
    const view = createDiagramView(
      container,
      { render: setSelectedState },
      createMermaidRenderer(sandbox.current),
      zoom
    );
    diagram.current = view;
    return () => {
      view.destroy();
      zoom.destroy();
    };
  }, []);

  useEffect(() => {
    if (disconnected) {
      diagram.current?.showMessage(
        "Disconnected. Reload the page to reconnect."
      );
    } else if (actor) {
      void diagram.current?.render(actor);
    }
  }, [actor, disconnected]);

  return (
    <>
      <main aria-label="Machine diagram" id="diagram" ref={viewport}>
        <div
          id="diagram-canvas"
          onKeyDown={event => {
            if (
              (event.key === "Enter" || event.key === " ") &&
              event.target instanceof Element
            ) {
              event.preventDefault();
              diagram.current?.selectAt(event.target);
            }
          }}
          ref={canvas}
        >
          <p className="empty-state">Waiting for the app to connect...</p>
        </div>
        <div
          aria-label="Zoom"
          className="toolbar"
          id="zoom-controls"
          role="toolbar"
        >
          <IconButton
            icon={ZoomOutIcon}
            label="Zoom out"
            onClick={() => panZoom.current?.zoomBy(1 / ZOOM_STEP)}
          />
          <IconButton
            icon={ZoomInIcon}
            label="Zoom in"
            onClick={() => panZoom.current?.zoomBy(ZOOM_STEP)}
          />
          <IconButton
            icon={FullScreenIcon}
            label="Fit diagram"
            onClick={() => panZoom.current?.fit()}
            title="Fit diagram (or double-click the canvas)"
          />
          <IconButton
            icon={Target02Icon}
            label="Follow active state"
            onClick={() => panZoom.current?.setFollowing(!following)}
            pressed={following}
            title={
              following
                ? "Stop following active state"
                : "Follow active state (panning is disabled)"
            }
          />
        </div>
        <div aria-label="Diagram legend" className="diagram-legend" data-no-pan>
          <span>
            <i aria-hidden="true" className="legend-active" />
            Active state
          </span>
          <span>
            <i aria-hidden="true" className="legend-visited" />
            Visited state
          </span>
          <span className="legend-hint">Drag to pan. Pinch to zoom.</span>
        </div>
        <StateDetails
          onClose={() => diagram.current?.selectAt(null)}
          state={selectedState}
        />
      </main>
      <div aria-hidden="true" id="mermaid-sandbox" ref={sandbox} />
    </>
  );
};
