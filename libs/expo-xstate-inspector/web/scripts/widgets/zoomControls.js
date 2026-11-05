import { ZOOM_STEP } from "../constants/zoom.js";

/** Binds the zoom buttons of `toolbar`, picked by their `data-zoom`. */
export const bindZoomControls = (toolbar, panZoom) => {
  const actions = {
    fit: panZoom.fit,
    in: () => panZoom.zoomBy(ZOOM_STEP),
    out: () => panZoom.zoomBy(1 / ZOOM_STEP)
  };
  toolbar.onclick = event =>
    actions[event.target.closest("button")?.dataset.zoom]?.();
};
