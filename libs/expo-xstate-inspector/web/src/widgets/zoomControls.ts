import type { IconSvgObject } from "@hugeicons/core-free-icons/types";

import {
  FullScreenIcon,
  Target02Icon,
  ZoomInIcon,
  ZoomOutIcon
} from "@hugeicons/core-free-icons";

import type { PanZoom } from "./panZoom";

import { ZOOM_STEP } from "../constants/zoom";
import { setButtonIcon } from "./iconButton";

const FOLLOW_TOOLTIP = "Follow active state (panning is disabled)";

/** Binds the zoom buttons of `toolbar`, picked by their `data-zoom`. */
export const bindZoomControls = (toolbar: HTMLElement, panZoom: PanZoom) => {
  const followButton = toolbar.querySelector('[data-zoom="follow"]');
  panZoom.onFollowingChange(following => {
    if (followButton) {
      followButton.ariaPressed = String(following);
      followButton.setAttribute(
        "title",
        following ? "Stop following active state" : FOLLOW_TOOLTIP
      );
    }
  });
  const actions: Record<
    string,
    {
      icon: IconSvgObject;
      label: string;
      onClick: () => void;
      tooltip?: string;
    }
  > = {
    fit: {
      icon: FullScreenIcon,
      label: "Fit diagram",
      onClick: panZoom.fit,
      tooltip: "Fit diagram (or double-click the canvas)"
    },
    follow: {
      icon: Target02Icon,
      label: "Follow active state",
      onClick: () => panZoom.setFollowing(!panZoom.isFollowing()),
      tooltip: FOLLOW_TOOLTIP
    },
    in: {
      icon: ZoomInIcon,
      label: "Zoom in",
      onClick: () => panZoom.zoomBy(ZOOM_STEP)
    },
    out: {
      icon: ZoomOutIcon,
      label: "Zoom out",
      onClick: () => panZoom.zoomBy(1 / ZOOM_STEP)
    }
  };
  toolbar.querySelectorAll<HTMLButtonElement>("[data-zoom]").forEach(button => {
    const action = actions[button.dataset.zoom ?? ""];
    if (action) {
      setButtonIcon(button, action.icon, action.label, action.tooltip);
    }
  });
  toolbar.onclick = event => {
    const zoom =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("button")?.dataset.zoom
        : undefined;
    if (zoom !== undefined) {
      actions[zoom]?.onClick();
    }
  };
};
