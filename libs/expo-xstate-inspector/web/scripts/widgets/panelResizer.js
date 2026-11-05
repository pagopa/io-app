import { MIN_PANE_WIDTH } from "../constants/limits.js";

/**
 * Lets `handle` be dragged to resize the panel on its right, keeping the pane
 * on its left visible.
 */
export const bindPanelResizer = handle => {
  handle.onpointerdown = event => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.classList.add("dragging");
  };
  handle.onpointermove = event => {
    if (!handle.hasPointerCapture(event.pointerId)) {
      return;
    }
    const width = Math.min(
      Math.max(
        innerWidth - event.clientX - handle.offsetWidth / 2,
        MIN_PANE_WIDTH
      ),
      innerWidth -
        handle.previousElementSibling.getBoundingClientRect().left -
        handle.offsetWidth -
        MIN_PANE_WIDTH
    );
    document.body.style.setProperty("--panel-width", `${width}px`);
  };
  handle.onlostpointercapture = () => handle.classList.remove("dragging");
};
