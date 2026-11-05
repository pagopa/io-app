import {
  FIT_MARGIN,
  MAX_WHEEL_DELTA,
  MAX_ZOOM,
  MIN_ZOOM,
  WHEEL_ZOOM_SPEED
} from "../constants/zoom.js";
import { unionRect } from "../utils/rects.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const isOnControl = event => event.target.closest("button") !== null;

/**
 * Lets `canvas` be zoomed (ctrl/⌘ + wheel, pinch) and panned (drag, scroll)
 * inside `viewport`. Double-click fits it. While following, panning is off and
 * the elements returned by `findFocus` stay centred.
 */
export const bindPanZoom = (viewport, canvas, findFocus) => {
  const view = { following: false, scale: 1, x: 0, y: 0 };
  const listeners = new Set();
  const apply = () => {
    canvas.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  };
  const zoomAt = (factor, clientX, clientY) => {
    const { left, top } = viewport.getBoundingClientRect();
    const scale = clamp(view.scale * factor, MIN_ZOOM, MAX_ZOOM);
    const ratio = scale / view.scale;
    view.x = clientX - left - (clientX - left - view.x) * ratio;
    view.y = clientY - top - (clientY - top - view.y) * ratio;
    view.scale = scale;
    apply();
  };
  const centerFocus = () => {
    const focus = unionRect(findFocus());
    if (focus === undefined) {
      return;
    }
    const { left, top, width, height } = viewport.getBoundingClientRect();
    view.x += left + width / 2 - (focus.left + focus.width / 2);
    view.y += top + height / 2 - (focus.top + focus.height / 2);
    apply();
  };
  const setFollowing = following => {
    view.following = following;
    viewport.classList.toggle("following", following);
    listeners.forEach(listener => listener(following));
    if (following) {
      centerFocus();
    }
  };
  const zoomBy = factor => {
    const { left, top, width, height } = viewport.getBoundingClientRect();
    zoomAt(factor, left + width / 2, top + height / 2);
    if (view.following) {
      centerFocus();
    }
  };
  const fit = () => {
    const width = viewport.clientWidth - FIT_MARGIN * 2;
    const height = viewport.clientHeight - FIT_MARGIN * 2;
    view.scale = clamp(
      Math.min(1, width / canvas.offsetWidth, height / canvas.offsetHeight),
      MIN_ZOOM,
      MAX_ZOOM
    );
    view.x = FIT_MARGIN + (width - canvas.offsetWidth * view.scale) / 2;
    view.y = FIT_MARGIN;
    apply();
    if (view.following) {
      setFollowing(false);
    }
  };

  viewport.addEventListener(
    "wheel",
    event => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        const delta = clamp(event.deltaY, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA);
        zoomAt(
          Math.exp(-delta * WHEEL_ZOOM_SPEED),
          event.clientX,
          event.clientY
        );
        if (view.following) {
          centerFocus();
        }
        return;
      }
      if (view.following) {
        return;
      }
      view.x -= event.deltaX;
      view.y -= event.deltaY;
      apply();
    },
    { passive: false }
  );
  viewport.onpointerdown = event => {
    if (event.button !== 0 || isOnControl(event) || view.following) {
      return;
    }
    event.preventDefault();
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("panning");
  };
  viewport.onpointermove = event => {
    if (!viewport.hasPointerCapture(event.pointerId)) {
      return;
    }
    view.x += event.movementX;
    view.y += event.movementY;
    apply();
  };
  viewport.onlostpointercapture = () => viewport.classList.remove("panning");
  viewport.ondblclick = event => {
    if (!isOnControl(event)) {
      fit();
    }
  };

  new ResizeObserver(() => view.following && centerFocus()).observe(viewport);

  return {
    fit,
    isFollowing: () => view.following,
    onFollowingChange: listener => listeners.add(listener),
    setFollowing,
    /** Call after the canvas content changed; a new diagram is fitted. */
    update: ({ isNew }) => {
      if (view.following) {
        centerFocus();
      } else if (isNew) {
        fit();
      }
    },
    zoomBy
  };
};
