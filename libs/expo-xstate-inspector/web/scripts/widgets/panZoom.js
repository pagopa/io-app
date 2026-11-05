import {
  FIT_MARGIN,
  MAX_WHEEL_DELTA,
  MAX_ZOOM,
  MIN_ZOOM,
  WHEEL_ZOOM_SPEED
} from "../constants/zoom.js";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const isOnControl = event => event.target.closest("button") !== null;

/**
 * Lets `canvas` be zoomed (ctrl/⌘ + wheel, pinch) and panned (drag, scroll)
 * inside `viewport`. Double-click fits it.
 */
export const bindPanZoom = (viewport, canvas) => {
  const view = { scale: 1, x: 0, y: 0 };
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
        return;
      }
      view.x -= event.deltaX;
      view.y -= event.deltaY;
      apply();
    },
    { passive: false }
  );
  viewport.onpointerdown = event => {
    if (event.button !== 0 || isOnControl(event)) {
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

  return {
    fit,
    zoomBy: factor => {
      const { left, top, width, height } = viewport.getBoundingClientRect();
      zoomAt(factor, left + width / 2, top + height / 2);
    }
  };
};
