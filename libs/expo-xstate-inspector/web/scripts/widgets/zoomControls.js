import { ZOOM_STEP } from "../constants/zoom.js";

/** Binds the zoom buttons of `toolbar`, picked by their `data-zoom`. */
export const bindZoomControls = (toolbar, panZoom) => {
  const followButton = toolbar.querySelector('[data-zoom="follow"]');
  panZoom.onFollowingChange(following => {
    followButton.ariaPressed = String(following);
  });
  const actions = {
    fit: panZoom.fit,
    follow: () => panZoom.setFollowing(!panZoom.isFollowing()),
    in: () => panZoom.zoomBy(ZOOM_STEP),
    out: () => panZoom.zoomBy(1 / ZOOM_STEP)
  };
  toolbar.onclick = event =>
    actions[event.target.closest("button")?.dataset.zoom]?.();
};
