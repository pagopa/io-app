import type { PanZoom } from "./panZoom.js";

import { ZOOM_STEP } from "../constants/zoom.js";

/** Binds the zoom buttons of `toolbar`, picked by their `data-zoom`. */
export const bindZoomControls = (toolbar: HTMLElement, panZoom: PanZoom) => {
  const followButton = toolbar.querySelector('[data-zoom="follow"]');
  panZoom.onFollowingChange(following => {
    if (followButton) {
      followButton.ariaPressed = String(following);
    }
  });
  const actions: Record<string, () => void> = {
    fit: panZoom.fit,
    follow: () => panZoom.setFollowing(!panZoom.isFollowing()),
    in: () => panZoom.zoomBy(ZOOM_STEP),
    out: () => panZoom.zoomBy(1 / ZOOM_STEP)
  };
  toolbar.onclick = event => {
    const zoom =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("button")?.dataset.zoom
        : undefined;
    if (zoom !== undefined) {
      actions[zoom]?.();
    }
  };
};
