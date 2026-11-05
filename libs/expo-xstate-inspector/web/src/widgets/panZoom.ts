import {
  FIT_MARGIN,
  FOLLOW_FOCUS_RATIO,
  FOLLOW_MAX_ZOOM,
  MAX_WHEEL_DELTA,
  MAX_ZOOM,
  MIN_ZOOM,
  WHEEL_ZOOM_SPEED
} from "../constants/zoom.js";
import { unionRect } from "../utils/rects.js";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isOnControl = (event: Event) =>
  event.target instanceof Element && event.target.closest("button") !== null;

export type PanZoom = ReturnType<typeof bindPanZoom>;

/**
 * Lets `canvas` be zoomed (ctrl/⌘ + wheel, pinch) and panned (drag, scroll)
 * inside `viewport`. Double-click fits it. While following, panning is off and
 * the elements returned by `findFocus` stay centred.
 */
export const bindPanZoom = (
  viewport: HTMLElement,
  canvas: HTMLElement,
  findFocus: () => Iterable<Element>
) => {
  const view = { following: false, scale: 1, x: 0, y: 0 };
  const listeners = new Set<(following: boolean) => void>();
  const apply = () => {
    canvas.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  };
  const zoomAt = (factor: number, clientX: number, clientY: number) => {
    const { left, top } = viewport.getBoundingClientRect();
    const scale = clamp(view.scale * factor, MIN_ZOOM, MAX_ZOOM);
    const ratio = scale / view.scale;
    view.x = clientX - left - (clientX - left - view.x) * ratio;
    view.y = clientY - top - (clientY - top - view.y) * ratio;
    view.scale = scale;
    apply();
  };
  // Maps the focus to canvas coordinates through the rendered transform, which
  // may be mid-animation, rather than through `view`.
  const findFocusRect = () => {
    const focus = unionRect(findFocus());
    if (focus === undefined) {
      return undefined;
    }
    const rendered = new DOMMatrix(getComputedStyle(canvas).transform);
    const { left, top } = viewport.getBoundingClientRect();
    return {
      height: focus.height / rendered.d,
      width: focus.width / rendered.a,
      x: (focus.left + focus.width / 2 - left - rendered.e) / rendered.a,
      y: (focus.top + focus.height / 2 - top - rendered.f) / rendered.d
    };
  };
  const centerFocus = (zoomToFocus = false) => {
    const focus = findFocusRect();
    if (focus === undefined) {
      return;
    }
    const { width, height } = viewport.getBoundingClientRect();
    if (zoomToFocus) {
      view.scale = clamp(
        Math.min(width / focus.width, height / focus.height) *
          FOLLOW_FOCUS_RATIO,
        MIN_ZOOM,
        FOLLOW_MAX_ZOOM
      );
    }
    view.x = width / 2 - focus.x * view.scale;
    view.y = height / 2 - focus.y * view.scale;
    apply();
  };
  const setFollowing = (following: boolean) => {
    view.following = following;
    viewport.classList.toggle("following", following);
    listeners.forEach(listener => listener(following));
    if (following) {
      centerFocus(true);
    }
  };
  const zoomBy = (factor: number) => {
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
    onFollowingChange: (listener: (following: boolean) => void) =>
      listeners.add(listener),
    setFollowing,
    /** Call after the canvas content changed; a new diagram is fitted. */
    update: ({ isNew }: { isNew: boolean }) => {
      if (view.following) {
        centerFocus();
      } else if (isNew) {
        fit();
      }
    },
    zoomBy
  };
};
